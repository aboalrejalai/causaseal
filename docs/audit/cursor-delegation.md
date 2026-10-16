# Audit remediation — Cursor agent brief

Source of findings: [`2026-10-16-findings.md`](./2026-10-16-findings.md) (149 raw, **unverified** findings against `main` @ `9f05d44`, v0.10.10).

Seven agents, one workstream each. Every workstream's files are chosen to keep overlap low. Where two workstreams touch the same file, the merge order below says which one goes first.

## Rules for every agent

1. **Branch from `main`**, one branch per PR: `cursor/audit/<workstream>-<short-topic>`. Open as many PRs as the workstream needs (one coherent fix per PR). **Never merge, never push to `main`, never force-push.** The owner reviews and merges.
2. **Reproduce before fixing.** Each finding is a raw audit output. Reproduce it on `main` first (node script, `curl` against `server.js`, or MCP client). If it does not reproduce, or it is intended design, skip it and say so in the PR body.
3. **Do not touch** `CHANGELOG.md`, the `version` in `package.json`, or the `<!-- BEGIN:nextjs-agent-rules -->` block in `AGENTS.md`. Do not run `next dev` (it rewrites `AGENTS.md`).
4. **Product rules** (see `AGENTS.md`):
   - `MATCH_THRESHOLD` stays 0.6.
   - `/mcp` stays without auth.
   - Tool names stay `causaseal_*`, with English `title` and descriptions written Arabic first, then English.
   - The UI stays bilingual (`ar ? … : …`).
   - The four `/architecture` harness-vs-fingerprint cases (mutated, known leak, lookalike, partial) must keep their documented outcomes. Add a test that pins them if you touch the engine.
5. **Tests use a temp state file**: set `CAUSASEAL_STATE_PATH` before importing the engine, then call `resetPersistCache()` (see `test/gateway.test.mjs`).
6. **Before every push, all of these must pass:** `npm test`, `npx tsc --noEmit`, `npm run lint`, plus `npm run build` if you touched `app/`, `components/`, `lib/`, config files or `package.json`. The 2 baseline lint errors belong to workstream 6.
7. **Commits:** English conventional commits (`fix(server): …`), granular, and each body explains why.
8. **PR body (English)** has these sections, in order:
   - Summary
   - Problems fixed (each finding ID, root cause, impact)
   - Changes (per file)
   - Verification (exact commands and results, before/after reproduction)
   - Behaviour changes / risk
   - Out of scope
   - Suggested CHANGELOG entry
   - Merge notes (overlapping PRs)

## Suggested model per agent

The models are the owner's choice; this is only a suggestion. For backend logic and security (WS1–WS4), use a high-reasoning model. For mechanical, wide-but-shallow work (WS5–WS7), a fast model or `auto` is enough.

| WS | Workstream | Suggested |
| --- | --- | --- |
| 1 | Security boundary (HTTP/service input validation) | high-reasoning |
| 2 | Decision engine correctness (X-CFS + gateway) | high-reasoning |
| 3 | Memory, persistence, telemetry | high-reasoning |
| 4 | MCP + SDK connectors | high-reasoning |
| 5 | Dependencies, scaffold, repo hygiene | auto / fast |
| 6 | UI runtime + API client | auto / fast |
| 7 | i18n + accessibility | auto / fast |

## Merge order and overlaps

1. **WS1 first.** It owns input validation in `server.js` and `connectors/service.mjs`.
2. **WS5 early.** It is the only workstream allowed to touch `package.json` / `package-lock.json`. It covers the `next` critical CVE and removing the dead scaffold.
3. **WS2 and WS3** both touch `engine/gateway.mjs`:
   - WS3 owns `rememberAnalysis`/`lastAnalysis` per-org scoping.
   - WS2 owns decision logic.
   - Merge WS2 first, then WS3 rebases.
4. **WS4 after WS1.** It routes `server.js` handlers through `service.mjs` (F-079, F-091), so it rebases on WS1.
5. **WS6 and WS7** both touch `components/causaseal/*`:
   - WS6 owns effects, data and API calls.
   - WS7 owns copy, `lang`/`dir` and ARIA.
   - Merge WS6 first.

---

## WS1 — Security boundary

**Findings:** F-001, F-002, F-005, F-012, F-016, F-020, F-050, F-057, F-080, F-081, F-117, F-118, F-125, F-138

**Goal:** every external input is validated once, at the boundary, with the same rules on HTTP, MCP and SDK paths.

- **orgId:** a single validator (`^[A-Za-z0-9_-]{1,64}$`) that also rejects `__proto__`, `constructor` and `prototype`, applied on every `server.js` route. Store per-org maps with `Object.create(null)` or a `Map`.
- **Incident bodies:** validate against `IncidentInputSchema` on `/api/analyze`, `/api/gateway/intercept` and `/api/agent/run`. Reject string booleans with a 400 instead of coercing them.
- **Fingerprint POST:** validate it with `FingerprintSchema` before `storeFingerprint`.
- **`server.js` hardening:**
  - Cap the request body size (413).
  - Handle a `null` JSON body.
  - Return 400 (not 500 plus a stack trace) for malformed percent-encoding.
  - Return 405 for GET/DELETE `/mcp`.
  - Answer bad JSON on `/mcp` with a JSON-RPC `-32700` error.
  - Make CORS consistent and allow `X-Causaseal-Channel`.
  - Add a Host/Origin guard on `/mcp` as the SDK README advises. Keep it permissive enough that the public demo URL works.
  - Remove the absolute path from `/healthz`.
- **Tests:** add `test/server.test.mjs`, which starts `server.js` on a random port with a temp state file, and covers each case above.

## WS2 — Decision engine correctness

**Findings:** F-006, F-017, F-018, F-019, F-043, F-044, F-045, F-046, F-047, F-048, F-049, F-084, F-085, F-093, F-094, F-095, F-107, F-108, F-109, F-146, F-147, F-148, F-149

**Files:** `engine/xcfs.mjs`, `engine/gateway.mjs` (decision logic only), `engine/contracts.mjs`, `test/xcfs.test.mjs` (new), `test/gateway.test.mjs`

- **Directive cue:**
  - Use word boundaries, so `sender` and `ignored` do not match.
  - Normalise Arabic (remove diacritics and tatweel, unify alef/hamza forms) and strip zero-width characters.
  - Suppress the cue only when the prompt contains the **same** verb, not any verb.
  - Be honest in the comments and tests that this is a small structural cue lexicon, not a "no word list" engine (F-095).
- **Single-invariant seed escalation:** a single-invariant seed match (X-CFS-003) must not escalate a rules VERIFY to INTERVENE at confidence 1.0 (F-006, F-017). Choose and document the rule, for example "require ≥ 2 invariants, or a send-tool invariant, for memory-driven INTERVENE".
- **Missing `trustedDestination`:** treat it consistently in both places (F-045, F-093).
- **Scores:** one consistent meaning for `confidence`, `evidenceStrength` and `matchScore`, documented in `contracts.mjs` (F-043).
- **Default environment:** do not invent cross-context claims from the default environment (F-044).
- **OpenAI path:**
  - Add an `AbortController` timeout.
  - Do not trust a model `matchedSignature` that is not in memory.
  - Do not auto-store fingerprints that have empty invariants.
  - Document what is sent to OpenAI (F-046, F-047, F-048, F-084, F-085).
- **Latency:** measure with `performance.now()` (F-109).
- **Tests:** add unit tests for the `xcfs.mjs` helpers (F-149), plus a test pinning the four judge cases.

## WS3 — Memory, persistence, telemetry

**Findings:** F-007, F-010, F-015, F-054 (engine part), F-058, F-059, F-060, F-061, F-062, F-063, F-064, F-065, F-066, F-086, F-087, F-090, F-126, F-127, F-128

**Files:** `engine/memory.mjs`, `engine/persist.mjs`, `engine/telemetry.mjs`, `engine/compliance.mjs`, `rememberAnalysis` in `engine/gateway.mjs`, tests

- **`lastAnalysis`:** store it per org (F-007, F-015, F-086).
- **Seeds:** deep-copy them per org; `record:false` must not mutate (F-010, F-058).
- **Environments from seeds:** illustrative seeds must not count as "immunized environments" or as learning history (F-059, F-060, F-090).
- **Fingerprint store:**
  - Dedupe identical invariant sets.
  - Use collision-safe ids, not ones derived from list length.
  - Cap stored fingerprints and events per org.
  - Drop or document the unused `graphScore` (F-061, F-062, F-063, F-065).
- **State file:**
  - Write it atomically (temp file + rename) with a single in-process write queue.
  - Log and back up a corrupt file instead of silently resetting it (F-064).
- **Events:**
  - Store ISO timestamps in data and format them only in the UI (F-054, F-087, F-126).
  - Keep the decision reason in audit events.
- **Migration helper:** have one migration helper instead of two (F-128).
- **Search:** trim and normalise Arabic (F-127).
- **Tests:** replace the vacuous memory tests (F-066).

## WS4 — MCP + SDK connectors

**Findings:** F-008, F-009, F-011, F-013, F-014, F-056, F-076, F-077, F-078, F-079, F-082, F-083, F-088, F-089, F-091, F-092, F-119, F-120, F-121, F-122, F-123, F-124, F-135, F-136, F-137, F-142, F-143, F-144, F-145

**Files:** `connectors/*.mjs`, the route bodies in `server.js` (after WS1), `lib/connectors.ts`, `components/causaseal/connectors-sdk-view.tsx`, tests

- **MCP server and its tools:**
  - Build the MCP server once (or cache the compiled schemas) instead of once per request (F-008).
  - Read-only tools must not write telemetry, or must drop `readOnlyHint` (F-009, F-014).
  - Truncation must produce valid JSON and truncate `structuredContent` too (F-013, F-056).
  - Make the SERMG count limits consistent (F-088).
  - Make compliance take `orgId` (F-089).
  - Take the server version from `package.json`.
  - Add `instructions` and `outputSchema`.
  - Write error replies Arabic first, then English (F-119–F-124, F-144).
- **`server.js` routes:** call `service.mjs` instead of copy-pasting it (F-079, F-091). The SDK then gets `cut`, `redactedBody` and the harness fields.
- **SDK:**
  - The `INTERVENE` redaction must remove every free-text field, not two (F-011).
  - Add a timeout and accept an `AbortSignal`.
  - Return typed errors with status and cause.
  - Validate the response.
  - Document the fail-closed contract (F-076–F-078, F-082).
  - Default `baseUrl` must match `npm start` (F-136).
  - Must not import the whole engine (F-135).
- **Tests:** fix `test/connectors-mcp.test.mjs` so it uses a temp state file (F-092). Add fail-closed SDK tests (F-083).

## WS5 — Dependencies, scaffold, repo hygiene

**Findings:** F-004, F-035, F-036, F-037, F-038, F-039, F-040, F-041, F-042, F-134, F-139, F-140, F-141, plus the `npm audit` baseline

**Only this workstream may touch `package.json` / `package-lock.json`.** Regenerate the lockfile with npm; never edit it by hand.

- **Runtime upgrades:**
  - `next` to ≥ 16.3.8 (critical CVE), and `eslint-config-next` with it.
  - `@modelcontextprotocol/{server,node,client}` to the latest 2.x.
  - `react` / `react-dom` / `react-server-dom-webpack` patch.
  - Re-run the full check suite after the upgrades.
- **Remove the unused vinext / Cloudflare / D1 / Drizzle / Sites scaffold.** Prove "unused" with grep in the PR body.
  - Files: `vite.config.ts`, `cloudflare-env.d.ts`, `.openai/`, `build/sites-vite-plugin.*`, `db/`, `drizzle/`, `drizzle.config.ts`, `examples/d1/`, `app/chatgpt-auth.ts`, and `scripts/sites-env.*`, `run-framework.mjs`, `execution-profile.mjs`, `install-*`, `pnpm-install.mjs`, `build-verified.sh`.
  - Remove the related deps and `package.json` scripts.
  - Rewrite the upstream half of `README.md` so it describes this product only.
- **Capacitor/Electron** are documented as supported in `README.md`, so keep them. Bump the EOL Electron and `electron-updater`, and fix the placeholder metadata in `electron/` (F-040, F-141).
- **`package.json` metadata:** `name`, `description`, `repository`, `license`, and a `LICENSE` file. Ask the owner which licence before adding one; if there's no answer, leave it out and note it in the PR.
- **Engines:** make `engines.node` truthful (F-042).
- **`.env.example`:** list every `process.env` the code actually reads (F-139).
- **`.agents/skills/brag` audio (17 MB):** do **not** delete it without asking. Raise it in the PR body as an owner decision (F-038).

## WS6 — UI runtime + API client

**Findings:** F-003, F-029, F-030, F-031, F-032, F-033, F-034, F-055, F-067, F-068, F-069, F-070, F-071, F-072, F-073, F-074, F-075, F-102, F-103, F-104, F-105, F-106, F-129, F-130, F-131, F-132

**Files:** `lib/api/*`, `lib/compliance-client.ts`, `lib/seed-data.ts`, `lib/decisions.ts`, `components/causaseal/*-view.tsx` (logic only), `language-provider.tsx` (storage guard only)

- **Baseline lint errors:** fix the 2 baseline lint errors idiomatically: a cancelled-flag fetch in the effect, and `useSyncExternalStore` for the device URL (F-074, F-075).
- **API client:**
  - The fingerprint fallback must never fake "saved to memory"; show offline state honestly (F-003, F-132).
  - Add the missing `await` (F-029).
  - Surface the server's error envelope (F-030).
  - Add a timeout and an in-flight guard to polling (F-031).
- **Compliance:** drop or align `lib/compliance-client.ts` with the engine (F-032, F-073).
- **Validation:** validate responses with the existing zod schemas (F-034).
- **Data and keys:**
  - Use stable React keys (F-068, F-069).
  - Guard the monitor polling against races (F-070).
  - The sidebar badge should come from the API (F-071).
  - Respect the `illustrative` flag from the API (F-072).
- **Storage:** guard `localStorage` access with try/catch (F-055, F-067).

## WS7 — i18n + accessibility

**Findings:** F-021–F-028, F-051, F-052, F-053, F-054 (UI formatting part), F-096–F-101, F-110–F-116, F-133

**Files:** copy, labels and ARIA in `components/causaseal/*` and `components/ui/*`, `lib/i18n.ts`, `lib/architecture.ts`, `lib/nav.ts`, `app/globals.css` (contrast tokens only)

- **Language toggle:** make it work on all 13 routes (F-051), starting with the Architecture judge page (F-052).
- **Direction:** fix the inverted chevrons (F-053). `<html lang>` must match the content (F-026).
- **Formatting:** format timestamps and numbers by app locale in the UI (F-054, F-115).
- **ARIA:** add names to Select, Slider and Progress. Add a nav landmark and a skip link. Remove the stray `Command Palette` h2. Add `scope="col"` to table headers, plus RTL alignment. Add `aria-current`. Respect reduced motion (F-021–F-028, F-096–F-101).
- **Contrast:** light-theme badges must meet WCAG AA (F-024).
