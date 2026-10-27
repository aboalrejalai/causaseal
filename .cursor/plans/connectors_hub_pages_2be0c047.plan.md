---
name: Connectors hub pages
overview: هب الموصّلات يصير ثلاث بطاقات قابلة للضغط مثل عدادات مركز العمليات، وكل بطاقة تفتح صفحة فيها عدادات حقيقية من الجلسة وشرح عربي بدون رموز. الرابط المنشور لـ MCP هو دومين الموقع، والواجهات تبقى متجاوبة على الجوال.
todos:
  - id: channel-counts
    content: حقل channel على الأحداث (http/mcp/sdk) وعداداته في GET /api/session
    status: completed
  - id: hub
    content: "هب /connectors: ثلاث بطاقات Stat قابلة للضغط بدون JSON ولا RO"
    status: completed
  - id: http-page
    content: "صفحة /connectors/http: 4 عدادات + شرح ثلاث خطوات + مثال الصياغة المتغيرة"
    status: completed
  - id: mcp-page
    content: "صفحة /connectors/mcp: عدادات + رابط الجهاز ورابط causaseal.aboalrejal.com/mcp + قراءة/كتابة"
    status: completed
  - id: sdk-page
    content: "صفحة /connectors/sdk: شرح السماح والنسخة المحذوفة + رأس sdk"
    status: completed
  - id: responsive
    content: min-w-0 ومنع التمرير الأفقي في الهيكل والرأس والبطاقات على 390px
    status: completed
isProject: false
---

# هب الموصّلات: ثلاث بطاقات وثلاث صفحات

الصفحة الحالية في [`components/causaseal/connectors-view.tsx`](components/causaseal/connectors-view.tsx) تعرض الرابط وJSON وشارة `RO` وقائمة حقول في شاشة واحدة. الزائر ما يلقى خطوة واضحة. الاستبدال: هب ثم صفحة لكل موصّل، بنفس بطاقة [`Stat`](components/causaseal/stat.tsx) المستخدمة في [`overview-view.tsx`](components/causaseal/overview-view.tsx) (`variant="gradient"`).

## الهب `/connectors`

ثلاث بطاقات فقط، شبكة `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` و`gap-4`. كل بطاقة رابط `h-full` بأيقونة Lucide ومربع `size-10 rounded-lg bg-primary/10 text-primary`، عنوان، وجملة واحدة، ورقم واحد من الجلسة:

- **HTTP** — «نداء قبل أداة الإرسال» — الرقم: عدد أحداث `source === "intercept"`.
- **MCP** — «الصق الرابط في كلود أو كيرسر» — الرقم: عدد أحداث القناة `mcp`.
- **SDK** — «دالة داخل وكيل الشريك» — الرقم: عدد أحداث القناة `sdk`.

الضغط يفتح الصفحة. لا JSON ولا شارة `RO` ولا قسم «جرّب كأنك نظام الشريك» على الهب.

## من أين تأتي الأرقام

الأرقام من جلسة `orgId=demo` الموجودة، لا أرقام مزروعة. اليوم اعتراض HTTP وMCP يُسجَّلان كلاهما `source: "intercept"` فلا يُفصلان.

في [`engine/telemetry.mjs`](engine/telemetry.mjs) و[`server.js`](server.js) و[`connectors/mcp-server.mjs`](connectors/mcp-server.mjs): حقل `channel` على الحدث.

- مسارات `/api/gateway/intercept` و`/api/agent/run` و`/api/analyze`: `channel: "http"` ما لم يأتِ الرأس `X-Causaseal-Channel: sdk`.
- أدوات MCP: `channel: "mcp"` (قراءة وكتابة؛ القراءة تسجّل حدثًا خفيفًا `label: MCP-READ` حتى العداد يتحرك).
- [`connectors/sdk.mjs`](connectors/sdk.mjs) يرسل الرأس `X-Causaseal-Channel: sdk` مع `Content-Type` فقط، بلا `Authorization`.

`GET /api/session` يرجّع `channels: { http, mcp, sdk }` محسوبة من أحداث الجلسة. إن كانت الجلسة فارغة القيمة `0` والتعليق «من هذه الجلسة».

## صفحة HTTP `/connectors/http`

أربع بطاقات `Stat`: اعتراضات، أصول مُرسلة (`DELIVERED`)، نسخ محذوفة (`DELIVERED-REDACTED`)، قرارات تدخل (`INTERVENE`).

تحتهم بطاقة شرح بثلاث خطوات عربية:

1. أرسل المسار إلى `POST /api/gateway/intercept` قبل أداة الإرسال.
2. `ALLOW` يعني أرسل النص الأصلي. `INTERVENE` يعني أرسل النسخة المحذوفة فقط. `VERIFY` يعني أوقف حتى يراجع شخص.
3. مثال واحد قصير قابل للنسخ (curl). الحقول الكاملة داخل `Collapsible` بعنوان «حقول الطلب»، ليست واجهة الصفحة.

زر واحد: «شغّل مثال الصياغة المتغيرة». النتيجة جملة: «الهارنس سمح. البصمة منعت الأصل وأرسلت نسخة محذوفة.» ورابط إلى المراقبة.

## صفحة MCP `/connectors/mcp`

أربع بطاقات: نداءات MCP، قراءات، كتابات، وأدوات مسجّلة (القيمة الثابتة `10`).

الرابطان ظاهران معًا، `break-all`، كل واحد بزر نسخ:

- على هذا الجهاز أثناء التطوير: `http://127.0.0.1:4000/mcp`
- على الموقع بعد النشر: `https://causaseal.aboalrejal.com/mcp`

جملة واحدة: على الدومين الرابط يشتغل من `server.js` نفسه بلا مفتاح، بعد ما يكتمل نشر Git الحالي. أثناء `next dev` على المنفذ 3000 الواجهة محلية والـ API على 4000، لذلك رابط الجهاز يبقى 4000. لا شارة `RO`. الأدوات مجموعتان بعنوان «قراءة» و«كتابة» واسم الأداة ونبذة عربية.

## صفحة SDK `/connectors/sdk`

أربع بطاقات: نداءات وصلت بالرأس `sdk`، منها سماح، منها نسخة محذوفة، ومنها إيقاف للمراجعة.

الشرح ثلاث جمل مربوطة بالدالتين الموجودتين:

- `beforeTool` يسأل البوابة قبل الإرسال.
- `applySend` عند السماح يبقي النص الأصلي.
- عند التدخل يبدله بنص «أُزيلت البيانات الحساسة» ولا يرجّع السر. عند التحقق لا يُرجع جسم إرسال.

المقطع البرمجي في `pre` مع `overflow-x-auto`. سطر: الملف داخل المستودع وغير منشور على npm. جملة: نداءات SDK تُحسب لأنها تصدم نفس مسار HTTP مع الرأس `sdk`.

العودة من كل صفحة برابط «الموصّلات» في رأس الصفحة. القائمة الجانبية تبقى على `/connectors` فقط. أضف العناوين في [`lib/i18n.ts`](lib/i18n.ts) و[`lib/nav.ts`](lib/nav.ts) `VIEW_TITLES` حتى شريط العنوان لا يبقى «مركز الحماية».

## التجاوب (الموقع كله، بهذا الحد)

الهيكل أصلًا: شريط جانبي `offcanvas`، محتوى `p-4 md:p-6`، جداول تخفي أعمدة تحت `md`. التمريرة:

- [`SidebarInset`](app/(dashboard)/layout.tsx): `min-w-0 overflow-x-hidden` حتى شبكة عريضة لا تسحب الصفحة أفقيًا على الجوال.
- [`site-header.tsx`](components/causaseal/site-header.tsx): الأزرار `flex-wrap` والعنوان يبقى مخفيًا تحت `sm` كما هو؛ كبسولة السمة لا تفرض عرضًا ثابتًا أكبر من الشاشة.
- بطاقات الهب والصفحات الثلاث: عمود واحد تحت `sm`، عمودان من `sm`، ثلاثة أو أربعة من `lg`.
- أي `pre` أو رابط طويل: `max-w-full overflow-x-auto break-all`.
- مراجعة سريعة لـ [`lab-view.tsx`](components/causaseal/lab-view.tsx) و[`investigate-view.tsx`](components/causaseal/investigate-view.tsx): الشبكات التي تبدأ من `xl` تبقى عمودًا واحدًا تحته (هذا موجود جزئيًا بـ `grid` بلا `grid-cols` على الأساس). لا إعادة تصميم تلك الصفحات.

## تحقق

- جوال عرض 390: الهب ثلاث بطاقات فوق بعض، لا شريط تمرير أفقي، القائمة تُفتح من زر القائمة.
- سطح المكتب: ثلاث بطاقات في صف.
- ضغط كل بطاقة يفتح صفحتها والعداد يقرأ من `/api/session`.
- بعد تشغيل مثال HTTP يزيد عداد الاعتراضات والنسخ المحذوفة.
- اللغة الإنجليزية تترجم العناوين الجديدة.
- `npm test` يبقى أخضر؛ اختبار صغير أن رأس `sdk` يُسجَّل `channel: "sdk"` وأن حدث MCP يحمل `channel: "mcp"`.

بعد التنفيذ: commits صغيرة على `main` ثم `git push`، وGit على Hostinger ينشر `causaseal.aboalrejal.com` فيصير رابط MCP العام حيًا.