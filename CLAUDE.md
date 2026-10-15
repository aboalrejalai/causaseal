# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` (imported above) is the source of truth for product rules, MCP conventions, UI rules and the ship workflow. Everything below adds detail it doesn't cover. Don't copy rules from there into here.

## Commands

```bash
npm run dev                     # scripts/dev.mjs: server.js on :4000 + next dev on :3000
npm test                        # node --test test/**/*.test.mjs
node --test test/gateway.test.mjs                                   # one file
node --test --test-name-pattern="jaccard" test/gateway.test.mjs     # one test by name
npm run lint                    # eslint (ignores out/, .next/, electron/, mobile shells)
npx tsc --noEmit                # typecheck UI/lib
npm run build                   # next build --webpack (output: export → out/) + scripts/hostinger-build.mjs check
npm start                       # node server.js: serves out/ + /api/* + /mcp
```

Ports can be overridden with `API_PORT` / `WEB_PORT` for `npm run dev`. `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) turns on the model path in the gateway. Without them, the deterministic rules engine runs. Tests don't need them.

## Architecture

**One engine, three channels.** Everything goes through `engine/`, which is plain ESM (`.mjs`) with no framework:

- `server.js`: a raw `http.createServer` with hand-written `pathname === …` routing (not Express). It calls the engine for `/api/*`, builds a fresh stateless MCP server and transport for each `/mcp` request, and serves `out/` for everything else.
- `connectors/service.mjs`: the in-process call surface over the same engine. It handles `orgId` validation, pagination and the 25k character limit. `connectors/mcp-server.mjs` (MCP tools) calls it in-process. New connector features belong in `service.mjs` first, then get exposed as MCP tools. `connectors/sdk.mjs` (`beforeTool`) is the partner client: it POSTs over HTTP to `/api/gateway/intercept` and borrows only `redactSensitive` from `service.mjs`.
- The React UI never imports the engine. It calls `/api/*` through `lib/api/client.ts`. `lib/api/base.ts` puts `NEXT_PUBLIC_API_BASE` in front of each path for Capacitor/Electron shells, and leaves it empty when the API is same-origin. In dev, the `rewrites` in `next.config.ts` proxy `/api` and `/mcp` to :4000. A static export ignores those rewrites, which is why production needs `server.js`.

**Decision pipeline** (`engine/gateway.mjs` `analyze()`):
1. `xcfs.reduce(body)`: `deriveInvariants` turns the request shape into Arabic invariant labels. The inputs are `tool` ∈ `SEND_TOOLS`, `sensitiveData`, `trustedDestination === false`, a directive verb in the retrieved text that the prompt doesn't contain, and `elevatedPrivilege`. These Arabic strings are the matching keys used everywhere (memory, `causalCut` priority, tests), so treat them as identifiers.
2. `memory.matchByInvariants` runs a Jaccard match (≥ `MATCH_THRESHOLD`) against the org's fingerprints and reports when a match crosses environments (dev/enterprise/cloud).
3. A memory match on a risky path returns INTERVENE. Otherwise the gateway tries the OpenAI path (Responses API with a strict JSON schema), and if that's unavailable or fails it falls back to `fallback()` structural rules.
4. An INTERVENE without a memory match automatically stores a new fingerprint, so memory learns from blocks.
5. The result is recorded through `telemetry.recordEvent` and `rememberAnalysis`.

`engine/ops-agent.mjs` wraps the gateway for the "agent run" demo. `harnessDecision()` is the deliberately naive per-call harness the product gets compared against. `causalCut()` names the edge to sever. `redactSensitive()` produces the safe body that gets delivered in place of the original. The four `/architecture` judge cases are fixtures in `engine/fixtures/novel-leak.mjs`.

**State.** `engine/persist.mjs` keeps a JSON file at `data/causaseal-state.json` (gitignored), keyed per org, and falls back to seeds in `memory.mjs` and `telemetry.mjs`. It's cached in module scope. Tests set `CAUSASEAL_STATE_PATH` to a temp file before dynamically importing the engine, then call `resetPersistCache()` / `resetTelemetryCache()`. Follow that pattern in new tests, or they will write to the real state file. `db/`, `drizzle/`, `examples/d1/` and the vinext/Cloudflare files (`vite.config.ts`, `.openai/`, `app/chatgpt-auth.ts`, `scripts/sites-env.*`) come from the upstream starter scaffold and aren't on the product path.

**Contracts.** Zod schemas live once in `engine/contracts.mjs`. `lib/contracts.ts` re-exports them and infers the TS types from them. Change a shape in the engine file, not in a parallel TS type.

**UI.** Routes under `app/(dashboard)/<page>/page.tsx` are thin wrappers that render a `components/causaseal/<page>-view.tsx`. Copy goes through `lib/i18n.ts` (`ar` and `en` keys) plus the language provider. Navigation is in `lib/nav.ts`, connector catalog copy in `lib/connectors.ts`, and `/architecture` copy in `lib/architecture.ts`. The app must stay static-exportable, so no server components that depend on request data, and no route handlers under `app/`.
