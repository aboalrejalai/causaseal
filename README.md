# CAUSASEAL (SAIF 2026)

نموذج أولي لمنصة تحليل سببي تحمي وكلاء الذكاء الاصطناعي من المسارات الخطرة قبل تنفيذ الأدوات — واجهة عربية RTL مبنية بـ **Next.js App Router** + **shadcn/ui** + هوية **Saudi Soft** (SA-600، IBM Plex Sans Arabic، Lucide).

الواجهة تُصدَّر كملفات ثابتة إلى `out/` بينما يبقى `server.js` مسؤولاً عن الـ API والنشر على Hostinger (ملفات ثابتة + `/api/*`).

**تدقيق التصميم:** [`docs/DESIGN_SYSTEM_AUDIT.md`](./docs/DESIGN_SYSTEM_AUDIT.md) · **مطابقة الفكرة مع الكود:** [`docs/مطابقة-الفكرة-مع-الكود.md`](./docs/مطابقة-الفكرة-مع-الكود.md)

## Capacitor (بدون إصدار)

الواجهة الثابتة في `out/` تُزامَن إلى مشاريع Android / iOS / Electron عبر Capacitor. التطبيق المغلف يستدعي الـ API على Hostinger عبر `NEXT_PUBLIC_API_BASE` (انظر `.env.example`).

```bash
npm run cap:sync              # بناء out/ + مزامنة المنصات
npm run cap:open:android      # فتح Android Studio محليًا
npm run cap:open:ios          # فتح Xcode محليًا
npm run cap:open:electron     # فتح مشروع Electron محليًا
```

**ممنوع حتى موافقة صريحة بعد انتهاء التعديلات:** بناء APK/AAB أو IPA أو مثبتات ويندوز/ماك/لينكس، أو رفع أي متجر. لا توجد سكربتات `release` في جذر المشروع لهذه المرحلة.

## التشغيل

المتطلبات: Node.js `>=20.9` و npm.

```bash
npm install
npm run dev      # الواجهة :3000 + الـ API :4000
npm run build    # next build --webpack (export → out/) + تحقق Hostinger
npm start        # يخدم out/ عبر server.js
```

- الواجهة: http://localhost:3000
- الـ API: http://localhost:4000 (`/api/*` يُعاد توجيهه من Next في وضع التطوير)

## البناء والنشر

```bash
npm run build   # next build --webpack (output: export) ثم التحقق من out/
npm start       # node server.js — يخدم out/ + /api/*
```

### Hostinger (الإنتاج)

اترك إعدادات اللوحة كما هي — لا تغيّرها إلى Next.js:

| الحقل | القيمة الصحيحة |
| --- | --- |
| Framework preset | **Express** (التشغيل عبر `server.js` + تصدير ثابت `out/`) |
| Branch | `main` |
| Node version | **22.x** |
| Root directory | `./` |
| Package manager | **npm** |
| Entry file | **server.js** |
| Output directory | فارغ |

لا تستخدم preset **Next.js**: التطبيق ليس Next standalone؛ البناء يصدّر HTML إلى `out/` و`server.js` يخدمه + `/api/*`.

**تحذير:** لا تضع في `public_html/.htaccess` قاعدة `RewriteRule ^$ /dashboard.html` — كانت تسبّب 302 من `/` إلى صفحة قديمة محذوفة ثم Not Found. `DirectoryIndex` يجب أن يكون `index.html` فقط مع إعدادات Passenger.

مسار المنتج على Hostinger لا يحتاج vinext؛ استخدم `npm run build` ثم `npm start`.

## التحليل والواجهات البرمجية

| المسار | الوصف |
| --- | --- |
| `POST /api/analyze` | بوابة القرار السببي (قواعد + OpenAI اختياري) |
| `GET /api/events` | أحداث المراقبة (بيانات بذرية) |
| `GET\|POST /api/fingerprints` | ذاكرة X-CFS |
| `POST /api/sermg/run` | محاكاة SERMG (stub) |
| `GET /api/reports/metrics` | مقاييس توضيحية |
| `GET /api/compliance` | خريطة NCA / OWASP |
| `GET /healthz` | فحص الصحة |

- بدون `OPENAI_API_KEY` يعمل محرك القواعد السببية الآمن.
- لتفعيل تحليل النموذج، أضف `OPENAI_API_KEY` (واختياريًا `OPENAI_MODEL`) في متغيرات البيئة على الخادم فقط.

## الصفحات

`/` · `/monitor` · `/investigate` · `/memory` · `/lab` · `/reports` · `/team`

## تنبيه

هذا MVP للهاكاثون. المقاييس المعروضة في الواجهة توضيحية (معلّمة بـ «بيانات توضيحية»)، ويجب استبدالها بنتائج التجارب المقاسة قبل أي عرض علمي نهائي.

---

# vinext-starter (upstream scaffold notes)

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support. The CAUSASEAL product path above does **not** require vinext for Hostinger deploys.

## Prerequisites

- Node.js `>=22.13.0` (for the vinext/Sites path; CAUSASEAL Hostinger path uses `>=20.9`)
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Whenever reopening or moving a checkout, run `node <plugin-root>/scripts/configure-execution-profile.mjs` before project commands. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev:vinext` uses `vinext dev` with HMR. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev:vinext --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's vinext dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building for vinext, local Worker preview runs through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: CAUSASEAL Next + API (see above)
- `npm run dev:vinext`: start the Vite/Vinext development server
- `npm run build`: build the deployable artifact (`out/` for Hostinger; Sites artifact for vinext path)
- `npm run start`: serve `out/` + `/api/*` via `server.js` (Hostinger path)
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
