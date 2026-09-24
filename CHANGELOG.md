# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.3] - 2026-09-24

### Changed
- Expand `docs/registration-copy.md` with English poster and SAIF form paste fields from the over-18 template; Arabic section is for team reading only.

## [0.10.2] - 2026-09-24

### Changed
- Rename public docs to English filenames (`registration-copy`, `judge-runbook`, `idea-to-code`, `idea-causaseal-sermg`, `saif`) while keeping Arabic content.
- Slim `docs/saif.md` to the cyber-defense track, over-18 criteria, IP rules, dates, and attachments only.
- Add `docs/README.md` clarifying registration copy versus judge runbook.

## [0.10.1] - 2026-09-24

### Changed
- Restructure the idea-to-code match doc: core idea tasks first, then extras (MCP/SDK/architecture/named cut), with a clearer internal SAIF score table.

## [0.10.0] - 2026-09-24

### Added
- Name the severed causal invariant on INTERVENE and show it in the harness-compare Cut column while the original stays unsent.
- Add a fourth harness-compare case (`partial`): harness ALLOW, fingerprint VERIFY, no send.
- Add paste-ready registration copy in `docs/نص-التسجيل.md` aligned with the four-case demo.

### Changed
- Replace the one-line harness difference copy with the registration sentence used on Architecture and Impact.

## [0.9.1] - 2026-09-24

### Added
- Adopt Keep a Changelog + SemVer shipping rules from the personal site (`changelog.mdc`, `cloud-auto-push.mdc`) and backfill this file from the full GitHub commit history.

### Changed
- Require a dated SemVer cut, `package.json` bump, and push to `main` after every finished durable batch; do not park shipped work under `[Unreleased]`.

## [0.9.0] - 2026-09-24

### Added
- Add an honest `/architecture` map with live / simulated / later badges linking Connectors, Impact, and Monitor.
- Add a three-row live harness compare on Architecture and Impact (`mutated` / `leak` / `lookalike`).
- Add a simulated health scenario (`kind: health`) labeled EHR / email simulation only — no Entra, real EHR, or external SIEM.
- Add a judge runbook and lock the team architecture diagram as a presentation target in the idea-to-code match doc.

### Changed
- Soften product subtitle copy to “decision before tool impact” and mark unmeasured 90% / 99% claims in the idea document.

## [0.8.1] - 2026-09-23

### Added
- Replace the crowded Connectors screen with a three-card Soft hub and HTTP / MCP / SDK detail pages with session KPIs.
- Title connector subroutes in i18n and the site header.

### Fixed
- Keep the dashboard shell from scrolling sideways on mobile.
- Inert `process.stdin` so the MCP server loads on Hostinger.

### Changed
- Tag telemetry events with `channel` (`http` / `mcp` / `sdk`) and expose connector counts on `GET /api/session`.

## [0.8.0] - 2026-09-23

### Added
- Add an in-process connectors service layer for partner attach points.
- Expose `causaseal-mcp-server` on `/mcp` (Streamable HTTP, no authentication) with ten read/write tools.
- Add a Node `beforeTool` / `applySend` SDK client with no `Authorization` header (repo file, not published to npm).
- Add a Connectors page with live partner trial cases and MCP evaluation pairs / tests.

## [0.7.1] - 2026-09-23

### Added
- Show illustrative demo charts on Monitor, Impact, and Lab before the first live run.

### Fixed
- Drop broken horizontal bars for Arabic labels; put ops KPIs above charts with an illustrative fallback.
- Make Arabic metric charts readable on Memory and Reports.

## [0.7.0] - 2026-09-23

### Added
- Add prop-driven Soft chart blocks from shadcn.
- Add session area/status charts on Operations and Monitor, harness-vs-fingerprint and invariant charts, and session charts on Memory, Lab, and Reports.

### Fixed
- Exclude Electron from `tsc` and ease the `IncidentInput` resolver for Hostinger builds.

### Changed
- Document Capacitor / Electron pack scripts without shipping store releases.

## [0.6.0] - 2026-09-23

### Added
- Compare a local tool-list harness to the fingerprint decision; on `INTERVENE` deliver a redacted copy only and allow lookalike wording that is not the same cause.
- Show harness comparison and safe-copy outcomes on the Impact page.

### Fixed
- Default the shell to the light theme and strip extra sidebar chrome.

### Changed
- Record redacted-intervene and chat-origin answers in the SAIF match docs; require commit and push to `main` after every finished change set.

## [0.5.1] - 2026-09-22

### Changed
- Record why a 100% idea-to-code match does not mean first place at SAIF, and keep the honest next-work paths in the match document.

## [0.5.0] - 2026-09-21

### Added
- Derive causal invariants from tool-path shape (no hostile word list), with org-scoped memory and an ops agent before send.
- Cover Jaccard, leak block, allow-deliver, cross-context, and org isolation in gateway tests.
- Add the Impact page, honest overview metrics, and Arabic decision labels.
- Close the SAIF criteria checklist at 100 with a test evidence table in the match doc.

## [0.4.0] - 2026-09-21

### Added
- Resolve API calls through `NEXT_PUBLIC_API_BASE` for Capacitor shells and scaffold Android / iOS / Electron sync without release scripts.
- Score SAIF criteria against the code, list honest closure tasks, and replace the capped plan with a six-stage path to 100.

### Changed
- Gate platform store releases; adjust idea-match percentages as Capacitor prep lands (90 → 92) without claiming a store ship.

## [0.3.0] - 2026-09-21

### Added
- Prune incident graphs, match causal fingerprints, block known causes, and replay mutations through the gateway.
- Persist causal memory on disk with environment tags and block a cause learned in one environment when it reappears in another.
- Intercept tool calls and score compliance from the live session; choose environment, immunize in the lab, and simulate a live agent in the UI.
- Show the live causal loop across the existing Soft pages.

### Changed
- Defer a cloud database; document idea completion / Capacitor multi-platform notes in Arabic match docs.

## [0.2.1] - 2026-09-21

### Added
- Add Soft design audit and idea-to-code gap analysis; rewrite the README for the Soft foundation.
- Add the Arabic CAUSASEAL + SERMG idea file and show Mohammed Abo Alrejal on the team page.

### Fixed
- Use `next build --webpack` for Hostinger GLIBC builders; redirect legacy `/dashboard.html` and document Express settings.
- Clarify that static export ignores rewrites without failing the build.

## [0.2.0] - 2026-09-21

### Added
- Soft Saudi theme tokens and Soft-safe Badge chips.
- Stub engine modules for X-CFS, SERMG, gateway, and compliance; shared API client, contracts, i18n, nav, and seed data.
- Soft app chrome (sidebar, header, theme, language) and dashboard views: overview, monitor, investigate, memory, lab, reports.
- Wire Soft App Router routes and serve the static export from `server.js` with a Hostinger build path.

### Removed
- Remove the legacy static dashboard HTML/JS/CSS and unused analyze route.

### Changed
- Require granular English commits pushed straight to `main`.

## [0.1.0] - 2026-09-20

### Added
- Publish the CAUSASEAL source so the local vinext app can run and be cloned from GitHub.
- Migrate from pnpm to npm and add `server.js` for Hostinger Node.js deployment.
- Generate standalone / static output suitable for Hostinger.

### Fixed
- Serve static UI and API from a plain Node server to clear Hostinger 503s.
- Align Hostinger deploy with the Express entry and stop publishing `public` as the site root.

[Unreleased]: https://github.com/aboalrejalai/causaseal/compare/v0.10.3...HEAD
[0.10.3]: https://github.com/aboalrejalai/causaseal/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/aboalrejalai/causaseal/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/aboalrejalai/causaseal/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/aboalrejalai/causaseal/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/aboalrejalai/causaseal/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/aboalrejalai/causaseal/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/aboalrejalai/causaseal/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/aboalrejalai/causaseal/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/aboalrejalai/causaseal/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/aboalrejalai/causaseal/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/aboalrejalai/causaseal/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/aboalrejalai/causaseal/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/aboalrejalai/causaseal/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/aboalrejalai/causaseal/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/aboalrejalai/causaseal/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/aboalrejalai/causaseal/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/aboalrejalai/causaseal/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/aboalrejalai/causaseal/releases/tag/v0.1.0
