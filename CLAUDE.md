# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The imported `AGENTS.md` above is the canonical rulebook: product truth, MCP conventions, UI tokens, ship workflow. This file adds only what AGENTS.md does not cover.

## Commands

```bash
npm run dev                                   # scripts/dev.mjs: server.js on :4000 + next dev on :3000
npm test                                      # node --test test/**/*.test.mjs
node --test test/gateway.test.mjs             # single test file
node --test --test-name-pattern="lookalike" test/gateway.test.mjs   # single test by name
npm run lint                                  # eslint (ignores out/, .next/, native shells)
npm run build                                 # next build --webpack (static export → out/) + scripts/hostinger-build.mjs
npm start                                     # node server.js: serves out/ + /api/* + /mcp
```

`npm run dev:vinext`, Cloudflare/D1/Drizzle files (`vite.config.ts`, `db/`, `drizzle/`, `.openai/`, `examples/d1/`) and the vinext half of `README.md` are leftovers from the upstream starter scaffold. The product path does not use them.

## Architecture

The engine is plain Node ESM (`.mjs`) and owns all decision logic. The Next app is a static-export client that only calls the API.

**Decision pipeline** (`engine/gateway.mjs` `analyze()`):
1. `engine/xcfs.mjs` `reduce(body)` turns a tool-call request into named path invariants (Arabic strings like `أداة إرسال`, `بيانات حساسة`) plus kept graph nodes.
2. `engine/memory.mjs` `matchByInvariants()` Jaccard-matches invariants against the org's fingerprints (`MATCH_THRESHOLD = 0.6`).
3. Match + risky invariants → `INTERVENE`. Otherwise OpenAI is used if `OPENAI_API_KEY` is set, and the rules `fallback()` is used if it is not (or if the call fails).
4. An `INTERVENE` with no existing match auto-stores a new fingerprint. Every decision is recorded as a telemetry event (`engine/telemetry.mjs`).

Invariant and fingerprint strings are Arabic and are compared literally. Renaming one in `xcfs.mjs` breaks seed matches in `memory.mjs`.

**Harness vs fingerprint compare** (the `/architecture` judge proof) lives in `engine/ops-agent.mjs` (`harnessDecision`, `causalCut`, `redactSensitive`, `runOpsAgent`). Case fixtures live in `engine/fixtures/`.

**State**: `engine/persist.mjs` is a JSON file at `data/causaseal-state.json`, bucketed per `orgId` (default `demo`), with a module-level cache. It falls back to seeds when the file is missing. Tests set `CAUSASEAL_STATE_PATH` to a temp file and call `resetPersistCache()`. Do this in any new test that touches memory or telemetry.

**Three channels, one engine**: HTTP (`server.js` → engine), MCP (`connectors/mcp-server.mjs`), and SDK (`connectors/sdk.mjs`) all go through `connectors/service.mjs`, which calls the engine in-process and validates `orgId` (`/^[A-Za-z0-9_-]{1,64}$/`). Put new connector-facing behavior in `service.mjs`, not in the individual transports. `server.js` is a raw `node:http` server, not Express, even though Hostinger's panel preset is "Express".

**Frontend**: `next.config.ts` sets `output: "export"`. There are no server components with data, route handlers, or middleware in production. In dev, Next rewrites `/api/*` and `/mcp` to `:4000`. The client goes through `lib/api/` (`NEXT_PUBLIC_API_BASE` for Capacitor/Electron builds that call the hosted API). Pages live under `app/(dashboard)/`. Bilingual strings use `lib/i18n.ts` and inline `ar ? … : …`.

## Ship workflow

AGENTS.md summarizes it, and `.cursor/rules/*.mdc` are binding for this repo. After finished durable work:
1. Make granular English `type(scope): why` commits on `main`.
2. Cut a dated `## [X.Y.Z] - YYYY-MM-DD` in `CHANGELOG.md` (Keep a Changelog sections only), bump `package.json`, and refresh the compare links (`aboalrejalai/causaseal`).
3. Commit `chore(release): cut X.Y.Z`, tag `vX.Y.Z`, then `git push origin main --tags`.

Don't wait to be told "release". No branches or PRs.
