---
name: Connectors integration page
overview: صفحة الموصّلات على /connectors، مع HTTP API الموجود، وخادم MCP بعيد بلا مصادقة على /mcp بعشر أدوات (5 قراءة و5 كتابة)، وSDK Node داخل المستودع بلا مفتاح وبلا نشر npm.
todos:
  - id: phase-1-service
    content: "مرحلة 1 — أربع مهام: طبقة connectors/service.mjs داخل العملية، بلا HTTP وبلا مفتاح"
    status: completed
  - id: phase-2-mcp
    content: "مرحلة 2 — أربع مهام: causaseal-mcp-server على POST /mcp، 5 أدوات قراءة و5 كتابة، بلا OAuth"
    status: completed
  - id: phase-3-sdk
    content: "مرحلة 3 — أربع مهام: بناء connectors/sdk.mjs (beforeTool) بلا ترويسة مصادقة وبلا نشر"
    status: completed
  - id: phase-4-page
    content: "مرحلة 4 — أربع مهام: صفحة /connectors والرابط والقائمة والتجربة الحية"
    status: completed
  - id: phase-5-proof
    content: "مرحلة 5 — أربع مهام: اختبارات صف الفرق، عدد الأدوات، وملف تقييم من 10 أسئلة قراءة"
    status: completed
isProject: false
---

# الموصّلات: HTTP وMCP وSDK

هذه الخطة مكتفية بذاتها. الوكيل الذي يكملها يقرأ هذا الملف والكود المذكور، ولا يحتاج شات البداية.

## سياق المنتج (لا تختصره)

CAUSASEAL نموذج أولي لجائزة سيف 2026. يحمي وكيلًا قبل تنفيذ أداة إرسال: يستخرج ثوابت شكل المسار، يطابقها بذاكرة Jaccard عتبة `0.6`، ثم يقرر `ALLOW` أو `VERIFY` أو `INTERVENE`. عند `INTERVENE` لا يُرسل الأصل؛ تُسلَّم نسخة حُذفت منها البيانات الحساسة (`redact-sensitive`) والمهمة تكمل.

جملة الفرق المعتمدة في [`lib/nav.ts`](lib/nav.ts): موافقة الهارنس توقف هذه الأداة الآن. البصمة توقف الصياغة التالية لأن الثوابت هي نفسها.

المستفيد: فريق يشغّل وكيلًا يملك أداة إرسال (مساحة عمل، بريد، تذكرة، قناة). الوكيل يبقى عندهم. CAUSASEAL يُستدعى مرة واحدة قبل تلك الأداة. لا بنك ولا وزارة ولا شعار شريك في هذه الدفعة. الجهة في العرض اسمها «نظام الشريك».

ملف المطابقة [`docs/مطابقة-الفكرة-مع-الكود.md`](docs/مطابقة-الفكرة-مع-الكود.md) يغلق أوزان سيف داخل المستودع على 100 حسب تعريف الفريق. هذا لا يعني إنتاجًا ولا مركزًا أول. صفحة الموصّلات موجودة حتى يرى المحكّم عقد الربط حيًا، لا شاشات ببيانات ثابتة. ممنوع في النص: 90٪، 99٪، «أول في العالم»، «مناعة سيادية».

العزل: كل جهة مفتاح `orgId` (الافتراضي `demo`) تحت `orgs` في `data/causaseal-state.json` عبر [`engine/persist.mjs`](engine/persist.mjs).

## ما يعمل اليوم في الكود

التشغيل: `npm run dev` يشغّل [`server.js`](server.js) على المنفذ `4000` وNext على `3000`. إعادة التوجيه في [`next.config.ts`](next.config.ts) تغطي `/api/:path*` فقط، ووقت التطوير فقط. الإنتاج: `server.js` يخدم `out/` و`/api/*` على نفس المنفذ (`PORT`، الافتراضي في الملف `3000`، وعلى Hostinger من البيئة).

مسارات [`server.js`](server.js) الحالية، وكلها بلا مفتاح:

- `POST /api/analyze` — [`analyze`](engine/gateway.mjs). قد يسجّل حدثًا.
- `GET /api/events` — [`listEvents`](engine/telemetry.mjs).
- `GET /api/fingerprints` و`POST /api/fingerprints` — [`listFingerprints`](engine/memory.mjs) / [`storeFingerprint`](engine/memory.mjs).
- `POST /api/gateway/intercept` — `analyze` بمصدر `intercept` و`rulesOnly: true`. الرد `{ executed: false, result }`. لا ينفّذ أداة الشريك.
- `POST /api/agent/run` — [`runOpsAgent`](engine/ops-agent.mjs). يحكم، يقارن [`harnessDecision`](engine/ops-agent.mjs)، ثم يسلّم الأصل عند `ALLOW` أو النسخة المحذوفة عند `INTERVENE`.
- `POST /api/sermg/run` — [`mutate`](engine/sermg.mjs).
- `GET /api/reports/metrics` و`GET /api/session` و`GET /api/compliance`.

عقد الحادث: [`IncidentInputSchema`](engine/contracts.mjs). الحقول: `prompt`, `untrustedContent`, `retrievedText`, `agent`, `tool`, `trustedDestination`, `elevatedPrivilege`, `sensitiveData`, `environment` (`cloud` | `enterprise` | `dev`), `orgId`, `steps[]` من `{ tool, summary }`, `preferRules`.

أدوات الإرسال المعروفة في [`engine/xcfs.mjs`](engine/xcfs.mjs): `send_to_workspace`, `export_document`, `share_document`, `invoke_vendor_api`. الهارنس يمنع فقط إذا كانت الأداة من هذه المجموعة مع `sensitiveData` و`trustedDestination === false`. أداة `post_update` خارج المجموعة، لذلك الهارنس يسمح بها حتى لو الشكل خطر. هذا صف الفرق.

حالات جاهزة في [`engine/fixtures/novel-leak.mjs`](engine/fixtures/novel-leak.mjs): `NOVEL_LEAK` (تسريب)، `BENIGN_SEND` (مشروع)، `MUTATED_LEAK` (صياغة متغيرة، أداة `post_update`)، `LOOKALIKE` (لفظ يشبه التسريب والسبب مختلف).

بذور الذاكرة الثلاث دائمًا في القائمة (لا حذف في الكود): `X-CFS-001` بيئة `dev` بتاريخ `18 سبتمبر 2026`، `X-CFS-002` بيئة `enterprise` بتاريخ `17 سبتمبر 2026`، `X-CFS-003` بيئة `cloud` بتاريخ `16 سبتمبر 2026`. أصلها `seed`. [`evaluate`](engine/compliance.mjs) يرجّع دائمًا خمسة ضوابط: `NCA-1`, `NCA-2`, `OWASP-ASI01`, `OWASP-ASI02`, `OWASP-ASI06`. حالة الضابط (`mapped` / `partial` / `planned`) تتغير مع الجلسة، لذلك أسئلة التقييم تسأل عن المعرّف والعنوان لا عن الحالة.

## ثلاثة قرارات مغلقة

1. **HTTP API يبقى كما هو.** لا مسار جديد تحت `/api` لهذه الدفعة. الصفحة توثّق `POST /api/gateway/intercept` و`POST /api/agent/run`.
2. **SDK يُبنى.** ملف [`connectors/sdk.mjs`](connectors/sdk.mjs) يصدّر `beforeTool`. يعمل من عملية الشريك، ينادي HTTP، بلا ترويسة `Authorization` وبلا معامل مفتاح. لا نشر npm. لا Python ولا Go.
3. **MCP يُبنى كرابط بعيد بلا مصادقة.** الاسم `causaseal-mcp-server`. النقل Streamable HTTP عديم الجلسة (`sessionIdGenerator: undefined`) على مسار `/mcp` داخل [`server.js`](server.js) نفسه، عبر `@modelcontextprotocol/node` و`@modelcontextprotocol/server`. يستدعي المحرك داخل العملية، لا يمر على HTTP داخلي، ولا يقرأ مفتاحًا. غياب ترويسة المصادقة نجاح. لا OAuth ولا Bearer ولا `EXAMPLE_API_KEY`. حارس `localhostHostValidation()` من دليل الحزمة يُرفض هنا لأنه يرد 403 على طلب Claude أو ChatGPT القادم من مضيف عام.

المخاطرة المقبولة: أي شخص معه الرابط يقرأ حالة `orgId` ويكتب أحداثًا وبصمات في ملف الحالة. هذا مقصود للنموذج التجريبي حتى يلصق المحكّم الرابط ويجرّب فورًا. لا تُضاف خطوة حماية في هذه الدفعة.

الرابط الذي يُنسخ:

- تطوير على نفس الجهاز (Cursor): `http://127.0.0.1:4000/mcp`
- إنتاج (Claude وChatGPT وCursor على جهاز آخر): `https://<مضيف server.js>/mcp` — نفس أصل الموقع لأن `server.js` يخدم الواجهة والـ API معًا. الصفحة تحسبه من `NEXT_PUBLIC_API_BASE` إن وُجد، وإلا من أصل الصفحة في الإنتاج. في `next dev` على المنفذ 3000 تعرض الرابط `http://127.0.0.1:4000/mcp` لأن إعادة توجيه Next لا تغيّر ما يناديه عميل بعيد. لا تخترع اسم نطاق غير موجود في المستودع.

إعداد العميل، بلا حقل مفتاح:

```json
{
  "mcpServers": {
    "causaseal": {
      "url": "http://127.0.0.1:4000/mcp"
    }
  }
}
```

في Claude وChatGPT يُستبدل `url` برابط الإنتاج `https`. نوع المصادقة في واجهتهم: None.

حزمة SDK: المشروع على Zod 3 (`zod` في [`package.json`](package.json)). عند التثبيت، إن رفض `@modelcontextprotocol/server` مخططات Zod 3، تُكتب مخططات الأدوات بالواجهة التي تقبلها الحزمة المثبّتة، ويبقى Zod المحرك كما هو. لا Express. التسجيل بـ `registerTool` فقط. الرد: `content` نصًا و`structuredContent` كائنًا. أخطاء الأداة داخل النتيجة مع `isError: true` ورسالة تقول ما الحقل الناقص وما الأداة البديلة. سقف الرد `25000` حرفًا مع جملة تطلب `offset` أو `response_format=json`.

كل أداة تقبل `response_format`: `markdown` (الافتراضي) أو `json`. أدوات القوائم تقبل `limit` (1–50، افتراضي 20) و`offset` (افتراضي 0) وترد `total_count`, `count`, `has_more`, `next_offset`.

`orgId` اختياري، افتراضي `demo`، نمط `^[A-Za-z0-9_-]{1,64}$`. القيمة المخالفة ترجع خطأ أداة: «orgId يقبل حروفًا وأرقامًا و _ و - حتى 64، أو اتركه فارغًا ليُستخدم demo».

أدوات الكتابة تمرّر `preferRules: true` و`rulesOnly: true` حتى تكتمل التجربة بلا `OPENAI_API_KEY`.

## الأدوات العشر

البادئة `causaseal_` حتى لا تصطدم بخادم آخر في عميل المحكّم. المجموع **10**. القراءة **5**. الكتابة **5**. لا أداة ثامنة «صحية»؛ `/healthz` يبقى HTTP فقط.

قراءة. `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`.

- `causaseal_get_session` — ملخص جلسة الجهة: عدادات، آخر قرار، هل الجلسة فارغة. المدخل: `orgId`, `response_format`. تقابل `GET /api/session`.
- `causaseal_list_events` — أحداث المراقبة. المدخل: `orgId`, `status` (`all` | `blocked` | `verify` | `allowed`), `q`, `limit`, `offset`, `response_format`. تقابل `GET /api/events`.
- `causaseal_list_fingerprints` — ذاكرة X-CFS بما فيها البذور الثلاث. المدخل: `orgId`, `q`, `limit`, `offset`, `response_format`. البحث عبر [`searchFingerprints`](engine/memory.mjs) عند وجود `q`. تقابل `GET /api/fingerprints`.
- `causaseal_get_report` — مقاييس الجلسة. إن لم توجد جلسة، `illustrative: true` ومقاييس فارغة، والنص يقول: شغّل `causaseal_run_agent` ثم أعد القراءة. تقابل `GET /api/reports/metrics`.
- `causaseal_list_compliance` — الضوابط الخمسة. المدخل: `limit`, `offset`, `response_format`. تقابل `GET /api/compliance`. حالة الضابط تتغير؛ الوصف يقول ذلك.

كتابة. `readOnlyHint: false`, `destructiveHint: false` (لا حذف)، `idempotentHint: false` (كل نداء يسجّل حدثًا جديدًا), `openWorldHint: false`.

- `causaseal_intercept_tool` — عقد الشريك قبل الأداة. المدخل: حقول الحادث. تستدعي `analyze` بمصدر `intercept`. الرد يتضمن `executed: false` و`decision` و`sendOriginal` (`true` فقط عند `ALLOW`). عند `INTERVENE` ترفق `redactedBody` وتقول: لا ترسل الأصل. عند `VERIFY`: أوقف التنفيذ لشخص. تقابل `POST /api/gateway/intercept`.
- `causaseal_run_agent` — حلقة التجربة. المدخل: `kind` (`leak` | `safe` | `cross` | `mutated` | `lookalike`) أو `body` كامل، مع `orgId` و`environment`. تستدعي `runOpsAgent`. الرد: `harness`, `decision`, `intervention`, `deliveredOriginal`, `change`. هذه الأداة التي تُظهر صف الفرق. تقابل `POST /api/agent/run`.
- `causaseal_analyze_path` — تحليل المسار وتسجيله. نفس حقول الحادث. تقابل `POST /api/analyze` مع `preferRules: true`.
- `causaseal_store_fingerprint` — يحفظ بصمة في دلو الجهة. المدخل: حقول البصمة التي يقبلها `storeFingerprint` (`title` مطلوب). تقابل `POST /api/fingerprints`.
- `causaseal_run_sermg` — طفرات المختبر. المدخل: `signatureId` (افتراضي `X-CFS-001`), `count` (1–24), أعلام التغيير, `environment`, `orgId`. تقابل `POST /api/sermg/run`.

وصف كل أداة يذكر: متى تُستخدم، الحقول، شكل `structuredContent`، ومثالًا واحدًا. مثال الكتابة في الوصف: «قبل إرسال أداة فيها بيانات حساسة إلى وجهة غير معتمدة، نادِ `causaseal_intercept_tool`». مثال القراءة: «بعد التجربة، `causaseal_list_events` لنفس `orgId`».

منطق الحذف المشترك يعيش في [`connectors/service.mjs`](connectors/service.mjs) وتستعمله `causaseal_intercept_tool` واختبار صف الفرق. [`redactSensitive`](engine/ops-agent.mjs) اليوم دالة خاصة داخل الملف؛ انقل السلوك إلى الدالة المشتركة أو استدعِ `runOpsAgent` حتى لا يُنسخ نص الحذف.

موارد URI وقوالب prompts خارج هذه الدفعة. البيانات تُسحب بالأدوات الخمس للقراءة.

## SDK: يُبنى، بهذا الحد

[`connectors/sdk.mjs`](connectors/sdk.mjs):

- `beforeTool(incident, { baseUrl, orgId })` يرسل `POST ${baseUrl}/api/gateway/intercept` بجسم JSON. الترويسات: `Content-Type` فقط. `baseUrl` الافتراضي في التطوير `http://127.0.0.1:4000`.
- `applySend(incident, interceptResponse)` يرجع `{ sendOriginal, body }`. `ALLOW` يبقي الجسم. `INTERVENE` يبدل الجسم بالنسخة المحذوفة من طبقة الخدمة. `VERIFY` يرجع `sendOriginal: false` بلا جسم إرسال.
- فشل الشبكة يرجع خطأً نصه: «تعذر الوصول إلى CAUSASEAL على {baseUrl}. تأكد أن server.js يعمل، ثم أعد المحاولة. لا مفتاح مطلوب.»

الصفحة تعرض الدالة كما هي في الملف، مع سطر أن الحزمة غير منشورة على npm.

## مرحلة 1 — طبقة الخدمة (4 مهام)

1. إنشاء [`connectors/service.mjs`](connectors/service.mjs) بعشر دوال أسماءها تطابق الأدوات، تستورد `engine/*.mjs` مباشرة.
2. نقل مقارنة الهارنس وحذف الحساس إلى هذه الطبقة بحيث `interceptTool` و`runAgent` لا يعيدان تنفيذ القاعدة في مكان ثان.
3. `formatResult(data, responseFormat)` و`paginate(items, limit, offset)` وسقف 25000 حرفًا.
4. `assertOrgId` ورسالة الخطأ أعلاه، مع اختبار وحدة صغير لهما داخل `test/connectors-service.test.mjs` يمكن توسيعه في المرحلة 5.

## مرحلة 2 — خادم MCP (4 مهام)

1. تثبيت `@modelcontextprotocol/server` و`@modelcontextprotocol/node`. إنشاء [`connectors/mcp-server.mjs`](connectors/mcp-server.mjs) باسم `causaseal-mcp-server` وإصدار `1.0.0`. يصدّر `createCausasealMcpServer()` حتى الاختبار يقدر يسجّل الأدوات دون فتح منفذ.
2. تسجيل أدوات القراءة الخمس عبر `registerTool`، بالمخططات والتعليقات والهوامش المذكورة.
3. تسجيل أدوات الكتابة الخمس بنفس الطريقة، والوصف يوجّه من `causaseal_run_agent` إلى `causaseal_list_events` بعد التجربة.
4. في [`server.js`](server.js): أي طريقة على المسار `/mcp` تذهب إلى `NodeStreamableHTTPServerTransport` جديد لكل طلب (`sessionIdGenerator: undefined`). لا فحص `Authorization`. لا `localhostHostValidation`. `OPTIONS /mcp` يرد 204 بنفس CORS الموجود لـ `/api`. أضف في [`next.config.ts`](next.config.ts) إعادة توجيه تطوير ` /mcp` إلى `http://127.0.0.1:4000/mcp` حتى تفحص الصفحة المحلية المسار. سكربت `connectors:mcp` غير مطلوب كعملية منفصلة؛ الرابط هو عملية `server.js`.

## مرحلة 3 — SDK (4 مهام)

1. كتابة [`connectors/sdk.mjs`](connectors/sdk.mjs) بالدالتين `beforeTool` و`applySend`.
2. التأكد أن طلب `fetch` لا يضع `Authorization` حتى لو مُرّر حقل زائد في الخيارات؛ الحقل الزائد يُتجاهل.
3. اختبار في `test/connectors-sdk.test.mjs` بخادم HTTP محلي مؤقت يرد 200، ويتحقق من المسار `/api/gateway/intercept` وغياب ترويسة المصادقة، ثم يتحقق أن `applySend` على قرار `INTERVENE` لا يرجّع النص الأصلي الحساس.
4. تعليق رأس الملف بالعربية: هذا عميل الشريك، والرابط العام للتجربة هو MCP على `/mcp`، والـ SDK لمن يدمج نداءً داخل وكيله.

## مرحلة 4 — صفحة الموصّلات (4 مهام)

1. المسار [`app/(dashboard)/connectors/page.tsx`](app/(dashboard)/connectors/page.tsx) يعرض [`components/causaseal/connectors-view.tsx`](components/causaseal/connectors-view.tsx). العنوان العربي «الموصّلات» والإنجليزي `Connectors`. إضافته في [`lib/nav.ts`](lib/nav.ts) ضمن عمليات بعد الأثر، وفي [`lib/i18n.ts`](lib/i18n.ts)، وفي [`components/causaseal/global-search-dialog.tsx`](components/causaseal/global-search-dialog.tsx)، وأيقونة `Plug` في [`components/causaseal/app-sidebar.tsx`](components/causaseal/app-sidebar.tsx).
2. [`lib/connectors.ts`](lib/connectors.ts) يصف ثلاث بطاقات صادقة: HTTP (جاهز، المساران الحاليان)، MCP (جاهز بعد المرحلة 2، الرابط، 5 قراءة و5 كتابة بأسمائها)، SDK (جاهز كملف داخل المستودع، غير منشور). فقرة «من ينادي»: فريق وكيل الإرسال، نداء واحد قبل الأداة، عزل `orgId`.
3. بطاقة MCP تعرض الرابط القابل للنسخ وإعداد JSON بلا مفتاح، وتسرد الأدوات العشر مجمّعة قراءة ثم كتابة مع الهامش `readOnly`. جملة واحدة: الرابط يعمل من أول لصق، بلا OAuth وبلا مفتاح، ومن معه الرابط يقرأ ويكتب في حالة النموذج.
4. قسم «جرّب كأنك نظام الشريك» بثلاثة أزرار تستدعي [`runOpsAgentClient`](lib/api/client.ts) على `mutated` و`leak` و`lookalike` لنفس `orgId` الظاهر في الصفحة (افتراضي `demo`). كل نتيجة تعرض `harness` و`decision` و`deliveredOriginal`. بعد النجاح، جملة أن الحدث ظهر في المراقبة. قسم العقد يعرض حقول `IncidentInput` وأسماء الحقول في رد `runOpsAgent`.

## مرحلة 5 — الإثبات (4 مهام)

1. `test/connectors-service.test.mjs` يشغّل جسم `MUTATED_LEAK`: الهارنس `ALLOW` والقرار `INTERVENE` و`sendOriginal === false`. جسم `LOOKALIKE`: الهارنس `ALLOW` والقرار `ALLOW`. جسم `NOVEL_LEAK`: الهارنس `BLOCK` والقرار `INTERVENE`.
2. اختبار ترقيم `causaseal_list_fingerprints` بـ `limit: 1` يرجّع `total_count >= 3` و`has_more: true` و`next_offset: 1`، والصفحة الثانية تحتوي عنصرًا واحدًا.
3. اختبار HTTP على `/mcp`: تهيئة الجلسة العديمة ثم `tools/list` يرجّع 10 أسماء مطابقة للقائمة أعلاه، خمس منها `readOnlyHint: true`. طلب بلا ترويسة `Authorization` ينجح.
4. ملف [`connectors/evaluation.xml`](connectors/evaluation.xml) بعشرة أسئلة قراءة مستقلة. الإجابات ثابتة من البذور والضوابط، وتُحل بأدوات القراءة فقط. انسخ هذه الأزواج كما هي:

- كم عدد ضوابط الامتثال التي يرجعها الخادم؟ الجواب: `5`
- كم ضابطًا إطارها NCA؟ الجواب: `2`
- ما معرّف ضابط إساءة استخدام الأداة (Tool Misuse)؟ الجواب: `OWASP-ASI02`
- ما معرّف ضابط تسميم الذاكرة (Memory Poisoning)؟ الجواب: `OWASP-ASI06`
- ما معرّف البصمة التي بيئتها المؤسسة (enterprise)؟ الجواب: `X-CFS-002`
- كم ثابتًا (invariants) على بصمة البيئة enterprise؟ الجواب: `3`
- ما تاريخ البصمة التي بيئتها السحابة (cloud)؟ الجواب: `16 سبتمبر 2026`
- ما أصل (origin) البصمة المؤرخة 18 سبتمبر 2026؟ الجواب: `seed`
- كم بيئة مغطاة (coveredEnvironments) للبصمة المؤرخة 18 سبتمبر 2026؟ الجواب: `1`
- ما بيئة البصمة التي ثابتها الوحيد تعليمة في النص المسترجع؟ الجواب: `cloud`

حالة الضابط وعدادات الجلسة ممنوعة في هذه الأسئلة لأنها تتغير بعد الكتابة.

التحقق في المتصفح بعد المرحلة 4: فتح `/connectors`، نسخ الرابط، تشغيل الحالات الثلاث، رؤية الفرق على `mutated`، ثم فتح المراقبة والتأكد أن الحدث سُجّل. تبديل اللغة يظهر Connectors في القائمة والبحث. إن تعذر المتصفح: الاختبارات أعلاه، ويُذكر ما لم يُفتح في المتصفح.

## خارج الدفعة

OAuth، مفاتيح، Express، عملية MCP منفصلة عن `server.js`، نشر SDK، لغات غير Node، موارد URI، شعارات شركات، إرسال بريد حقيقي، وتغيير بوابة الإصدار في ملف المطابقة.
