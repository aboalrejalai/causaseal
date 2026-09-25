<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — CAUSASEAL

README for coding agents ([agents.md](https://agents.md/) convention). Humans: see root `README.md` and `docs/README.md`. Cursor-only ship rules live in `.cursor/rules/` — do not duplicate them here.

## What this is

SAIF 2026 cyber-defense prototype: a **causal decision layer above an agent tool harness**. Before a send tool runs, path-shape invariants (X-CFS) are matched to org fingerprint memory (Jaccard 0.6). Decisions: `ALLOW` | `VERIFY` | `INTERVENE`. On intervene: named cut + redacted body only — original sensitive payload never sent.

Live: `https://causaseal.aboalrejal.com` · MCP: `https://causaseal.aboalrejal.com/mcp` (no OAuth, no API key).

## Commands

```bash
npm install
npm run dev      # UI :3000 + API :4000 (Next rewrites /api and /mcp)
npm test         # node --test test/**/*.test.mjs
npm run build    # next export → out/ + Hostinger checks
npm start        # server.js serves out/ + /api/* + /mcp
```

Node `>=20.9`. Prefer `npm test` (and targeted gateway/MCP tests) after engine or connector changes.

## Layout (where to edit)

| Path | Role |
| --- | --- |
| `engine/` | Gateway, X-CFS, memory, fixtures, harness compare |
| `connectors/` | `mcp-server.mjs`, `service.mjs`, partner SDK |
| `server.js` | Production HTTP: static `out/`, `/api/*`, `/mcp` |
| `app/`, `components/causaseal/` | Soft UI dashboard (Arabic RTL + English toggle) |
| `lib/` | API client, connectors catalog, architecture copy |
| `docs/` | SAIF / judge / idea docs — English **filenames**, Arabic content where needed |
| `test/` | Gateway + MCP + related node tests |

Do not invent a second API server. Do not put business logic only in React if the engine already owns it.

## Product truth (non-negotiable)

- **Claim only what the prototype proves.** Forbidden as measured results: 90%/99%+, “first in the world”, “sovereign immunity”, live Entra / real EHR / external SIEM as if shipped.
- Four live harness-vs-fingerprint cases on `/architecture`: mutated, known leak, lookalike, partial. That compare is the judge proof — preserve it.
- Harness = allow/block **this** tool call. CAUSASEAL = remember **why** a past path was dangerous and catch rephrased shape. Do not collapse the product into a keyword blocklist.
- Jaccard `0.6` in `engine/memory.mjs` is a chosen operating point for reproducible demos, not a learned optimum. Do not “fix” it without tests and an explicit reason.
- Docs split: `docs/registration-copy.md` = paste text; `docs/judge-runbook.md` = booth script; `docs/idea-to-code.md` = what was built. Do not merge them into one mega-doc unless asked.

## MCP / connectors

- Protocol tool names stay `causaseal_*` (English). **`title` must be English.** Descriptions and markdown replies: **Arabic then English**.
- `/mcp` has **no** server-side approval queue and **no** auth. Claude’s `"No approval received"` is the **client** tool-permission gate (Always allow) — never “fix” by adding server OAuth for demo orgIds.
- After MCP changes: run `node --test test/connectors-mcp.test.mjs`.

## UI

- Soft / Saudi Soft tokens (SA-600, IBM Plex Sans Arabic, Lucide). Prefer existing `components/ui` and `components/causaseal`.
- Match surrounding bilingual `ar ? … : …` patterns; do not English-only the dashboard without reason.
- Hostinger serves **Express + static `out/`**, not Next standalone. Do not change panel preset guidance in README without owner confirmation.

## Ship workflow (summary)

Owner works on **`main` only**. After durable work: granular English commits → cut SemVer in `CHANGELOG.md` + bump `package.json` → tag → `git push origin main` (and tags). Details: `.cursor/rules/git-main-granular-commits.mdc`, `changelog.mdc`, `cloud-auto-push.mdc`.

Do **not** open routine PRs or feature branches unless the user overrides in that message. Never force-push `main`. Never commit secrets or `.env`.

## Do not

- Edit the `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:nextjs-agent-rules -->` block by hand to “clean” it — `next dev` will put it back.
- Dump chat exports, local plan dumps, or the SAIF PPTX into git unless asked.
- Rewrite published changelog history except factual fixes.
- Add fake enterprise integrations for demo theater.
- Leave finished durable product/docs/agent-rule work unpushed on another branch.

## Verify before finishing engine/MCP work

```bash
npm test
# or at least:
node --test test/gateway.test.mjs test/connectors-mcp.test.mjs
```
