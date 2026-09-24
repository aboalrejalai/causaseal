# Registration & poster copy — CAUSASEAL (SAIF 2026)

**Platform / poster language:** paste the **English** sections into SAIF and into `_SAIF Poster Template Age Group (18 and Above) - 2026.pptx`.  
**Arabic at the bottom** mirrors the same tables for the team to read. Do **not** paste Arabic into English-required form fields.

Not the live demo script — that is [`judge-runbook.md`](judge-runbook.md).

---

## Missing data — send these so we can fill the file

Copy this checklist to the group; reply with answers (no need to invent IDs in chat if sensitive — you can paste privately and we put them in the file locally).

| # | What we need | Who | Status |
| ---: | --- | --- | --- |
| 1 | **Full legal name in English** (as on ID) | Bushra | Missing — surname / full name |
| 2 | **Full legal name in Arabic** (as on ID) | Bushra | Missing |
| 3 | **ID number for the poster** (national ID or the ID SAIF shows on the form — say which) | Shadia | Missing |
| 4 | Same **ID** | Bushra | Missing |
| 5 | Same **ID** | Mohammed | Missing |
| 6 | **Email** used on SAIF (if the form asks) | each member | Optional — confirm if needed |
| 7 | **Mobile** used on SAIF (if the form asks) | each member | Optional — confirm if needed |
| 8 | **Booth Number** | team | Later — after qualification |
| 9 | **Poster flag choice** | team | Decide: Saudi only · Yemen only · both flags (mixed team: Shadia & Bushra Saudi, Mohammed Yemeni) |
| 10 | **Google Drive link** for technical docs (view access for judges) | team | Missing if not created yet |
| 11 | **Prototype screenshot** path/file for JPG/PNG upload | team | Missing if not exported yet |
| 12 | Confirm English spelling: **Shadia Ahmed Taher** / **Mohammed Abo Alrejal** | Shadia, Mohammed | Confirm or correct |

**Already known (updated in this file):**

| Member | Nationality | Role (EN) |
| --- | --- | --- |
| Shadia Ahmed Taher | Saudi | Idea / innovation lead |
| Bushra `[FILL surname]` | Saudi | Software engineering / prototype |
| Mohammed Abo Alrejal | Yemeni | Systems / cybersecurity / AI platform |

---

# ENGLISH (paste this)

## A. Poster header (template fields)

| Field on template | Paste |
| --- | --- |
| **Innovation Title** | CAUSASEAL — Causal Decision Layer Before Agent Tool Impact |
| **Student Name** (line 1) | Shadia Ahmed Taher |
| **ID** (line 1) | `[FILL: Shadia ID]` |
| **Nationality** (line 1) | Saudi Arabia |
| **Student Name** (line 2) | Bushra `[FILL: full family name]` |
| **ID** (line 2) | `[FILL: Bushra ID]` |
| **Nationality** (line 2) | Saudi Arabia |
| **Student Name** (line 3) | Mohammed Abo Alrejal |
| **ID** (line 3) | `[FILL: Mohammed ID]` |
| **Nationality** (line 3) | Yemen |
| **Country Flag Here** | `[FILL: Saudi · Yemen · or both — see missing #9]` |
| **Booth Number** | `[FILL after qualification]` |
| **QR Code** | `https://causaseal.aboalrejal.com` (and/or `https://github.com/aboalrejalai/causaseal`) |

If the platform allows one lead name only, use **Shadia Ahmed Taher**; list all three on the poster.

---

## B. Poster body blocks

### Introduction

AI agents fail in *actions*, not only in answers. Each tool call can look allowed on its own while the chain still leaks sensitive data. A normal **tool harness** only decides whether *this* known tool call is allowed *now*. It has no memory of the causal shape of a past incident when the wording or tool name changes.

**CAUSASEAL** sits above that harness: we store a compact **causal fingerprint** of the incident shape, recognize it when it returns in a new form, and cut the dangerous edge so the task can continue with a safe (redacted) send — without sending the original sensitive payload.

**Track:** Cybersecurity and Defensive Technologies · **Age group:** Over 18 · **Team size:** 3

### Methodology

1. **Path-shape invariants (X-CFS):** From the tool-path contract we derive structural invariants (send tool, sensitive data, untrusted destination, directive in retrieved text, elevated privilege) — not a hostile word list.
2. **Memory match:** Fingerprints are stored per organization (`orgId`) and matched with Jaccard similarity (threshold 0.6), including cross-environment learning.
3. **Runtime gateway:** Before a send tool, `POST /api/gateway/intercept` / `POST /api/agent/run` returns `ALLOW`, `VERIFY`, or `INTERVENE`.
4. **Named causal cut:** On `INTERVENE`, we name the severed edge (e.g. directive in retrieved text), deliver a redacted copy only, and never send the original.
5. **Connectors (extra):** Same engine over HTTP, MCP (`/mcp`, no auth key in the demo), and a partner SDK (`beforeTool` / `applySend`).
6. **Proof loop:** Live harness compare on `/architecture` — four cases below.

### Results

| Case | Harness | Fingerprint | Original sent | Cut |
| --- | --- | --- | --- | --- |
| Mutated phrasing | ALLOW | INTERVENE | No | Directive in retrieved text |
| Known leak | BLOCK | INTERVENE | No | Named invariant |
| Lookalike (benign) | ALLOW | ALLOW | Yes | — |
| Partial start | ALLOW | VERIFY | No | — (monitor; no send) |

**One-line product claim:**  
We sit above the agent harness. The harness judges the current tool call. We store the cause of a past incident, recognize it when it returns in a new form, and cut that edge while the task completes.

Prototype: `https://causaseal.aboalrejal.com` · Source: `https://github.com/aboalrejalai/causaseal`

### Innovation

- **Difference from a tool harness:** harness = allow/block *this* call; CAUSASEAL = remember *why* a path was dangerous and catch the same cause after surface mutation.
- **Smallest practical intervention:** redacted delivery + named cut — not “stop the whole mission” as the only option.
- **Honest scope:** rules + invariant memory + local/simulated outbox. No measured 90%/99% on external logs. No live Entra / real EHR / external SIEM in this build.

### Conclusion

CAUSASEAL is a working prototype for SAIF: a causal decision layer before agent tool impact, with a four-case proof a judge can replay. It does not replace enterprise IAM or SIEM; it covers **returning causal shape under new wording**.

### Future Work & References

- One real beneficiary attach and one documented blocked incident.
- Stronger matching only if evidence requires it.
- IAM / real EHR / external SIEM after the causal difference is solid.
- Judges: this repo · [`idea-to-code.md`](idea-to-code.md) · [`saif.md`](saif.md) · `/architecture` compare.

### Acknowledgments

Team CAUSASEAL. Built for SAIF 2026 (Security and Innovation Fair). Soft UI / Next.js prototype for demo verification.

### Statement

We affirm that CAUSASEAL is our team’s original work for SAIF 2026. Unmeasured marketing numbers (e.g. 90%, 99%+) are **not** submitted as measured results. Claims match the running prototype and tests in the public repository.

---

## C. SAIF platform form (English fields)

| Likely field | Paste |
| --- | --- |
| **Project / innovation title** | CAUSASEAL — Causal Decision Layer Before Agent Tool Impact |
| **Track** | Cybersecurity and Defensive Technologies |
| **Age category** | Over 18 |
| **Short summary / abstract** | CAUSASEAL is a runtime causal layer above an agent tool harness. The harness allows or blocks the current tool call. We store a compact fingerprint of why a path was dangerous, recognize that shape when phrasing or tools change, and on intervene deliver a redacted copy only — so the original sensitive payload is never sent. Demo: four live harness-vs-fingerprint cases. |
| **Problem** | Agent failures happen in tool actions. Traditional harnesses lack memory of causal shape across rephrased attacks. |
| **Solution** | Path-shape invariants + fingerprint memory + gateway before send + named cut / redacted deliver. |
| **How it works (short)** | Analyze path → match fingerprint → ALLOW / VERIFY / INTERVENE → deliver original or redacted or hold for human. |
| **Impact / beneficiary** | Teams that run agents with send tools against sensitive systems. Demo uses a simulated outbox; not a production contract yet. |
| **Tech stack** | Node.js gateway, Next.js UI, MCP server, partner SDK stub, session metrics, automated tests. |
| **Demo / repo links** | `https://causaseal.aboalrejal.com` · `https://github.com/aboalrejalai/causaseal` |
| **Team member 1** | Shadia Ahmed Taher — Saudi — idea / innovation lead — ID `[FILL]` |
| **Team member 2** | Bushra `[FILL surname]` — Saudi — software engineering / prototype — ID `[FILL]` |
| **Team member 3** | Mohammed Abo Alrejal — Yemeni — systems / cybersecurity / AI platform — ID `[FILL]` |
| **Intellectual property** | Original team work; no plagiarized drop-in codebase presented as ours. |
| **Attachments checklist** | Video ≤5 min MP4 · Scientific poster PDF · Prototype image JPG/PNG · Technical docs Drive link (view access). |

### Do not paste as measured claims

- 90% / 99%+
- “First in the world”
- “Sovereign immunity” as a proven product claim
- Live Entra / real EHR / external SIEM as if shipped

---

# ARABIC (للفريق فقط — فهم · لا للصق في حقول الإنجليزية)

نفس جداول الإنجليزية، صف لكل شخص.

## بيانات ناقصة — انسخ للواتساب

| # | المطلوب | من | الحالة |
| ---: | --- | --- | --- |
| 1 | الاسم الكامل بالإنجليزية كما في الهوية | بشرى | ناقص |
| 2 | الاسم الكامل بالعربية كما في الهوية | بشرى | ناقص |
| 3 | رقم الهوية / معرف سيف للملصق | شادية | ناقص |
| 4 | رقم الهوية / معرف سيف للملصق | بشرى | ناقص |
| 5 | رقم الهوية / معرف سيف للملصق | محمد | ناقص |
| 6 | البريد على منصة سيف (إن طُلب) | كل عضو | اختياري |
| 7 | الجوال على منصة سيف (إن طُلب) | كل عضو | اختياري |
| 8 | رقم الجناح | الفريق | لاحقًا بعد التأهل |
| 9 | علم الملصق: سعودي فقط / يمني فقط / الاثنان | الفريق | قرّروا |
| 10 | رابط Google Drive للتوثيق التقني | الفريق | ناقص إن لم يُنشأ |
| 11 | صورة النموذج الأولي JPG/PNG | الفريق | ناقص إن لم تُصدَّر |
| 12 | تأكيد تهجئة: Shadia Ahmed Taher / Mohammed Abo Alrejal | شادية، محمد | أكّدوا أو صحّحوا |

**معروف الآن:**

| العضو | الجنسية | الدور |
| --- | --- | --- |
| شادية أحمد طاهر | سعودية | قائدة الفكرة والابتكار |
| بشرى `[أكمل اللقب]` | سعودية | هندسة برمجيات / النموذج الأولي |
| محمد أبو الرجال | يمني | أنظمة / أمن سيبراني / منصة ذكاء اصطناعي |

---

## أ) رأس الملصق

| الحقل في القالب | المقابل |
| --- | --- |
| عنوان الابتكار | CAUSASEAL — طبقة قرار سببي قبل أثر أداة الوكيل |
| اسم الطالبة (سطر 1) | شادية أحمد طاهر |
| الهوية (سطر 1) | `[املأ: هوية شادية]` |
| الجنسية (سطر 1) | سعودية |
| اسم الطالبة (سطر 2) | بشرى `[املأ: اللقب الكامل]` |
| الهوية (سطر 2) | `[املأ: هوية بشرى]` |
| الجنسية (سطر 2) | سعودية |
| اسم الطالب (سطر 3) | محمد أبو الرجال |
| الهوية (سطر 3) | `[املأ: هوية محمد]` |
| الجنسية (سطر 3) | يمني |
| مكان العلم | `[املأ: سعودي · يمني · أو الاثنان]` |
| رقم الجناح | `[بعد التأهل]` |
| رمز QR | `https://causaseal.aboalrejal.com` |

---

## ب) جملة المنتج

نركب فوق هارنس الوكيل. الهارنس يحكم على الأداة الحالية. نحن نحفظ سبب الحادث السابق، نعرفه إذا رجع بشكل جديد، ونقطع تلك العلاقة والمهمة تكمل.

---

## ج) جدول الحالات الأربع

| الحالة | هارنس | بصمة | أصل مُرسل | القطع |
| --- | --- | --- | --- | --- |
| صياغة متغيرة | ALLOW | INTERVENE | لا | تعليمة في النص المسترجع |
| تسريب معروف | BLOCK | INTERVENE | لا | ثابت مسمّى |
| شبيه لفظي مشروع | ALLOW | ALLOW | نعم | — |
| بداية جزئية | ALLOW | VERIFY | لا | — (راقب؛ لا إرسال) |

---

## د) معنى أقسام الملصق الإنجليزية

| القسم | المعنى باختصار |
| --- | --- |
| Introduction | الوكيل يخطئ في الفعل؛ الهارنس على النداء الحالي؛ نحن نتذكر شكل السبب بعد تغيّر الصياغة |
| Methodology | ثوابت شكل المسار · Jaccard · بوابة قبل الإرسال · قطع مسمّى · موصّلات · أربع حالات |
| Results | الجدول أعلاه + رابط الديمو والمستودع |
| Innovation | الفرق عن الهارنس + أصغر تدخل + صدق النطاق |
| Conclusion | نموذج أولي لسيف؛ ليس بديل IAM/SIEM |
| Future Work | مستفيد حقيقي لاحقًا؛ لا نوسّع IAM قبل إثبات الفرق |
| Acknowledgments | فريق CAUSASEAL · سيف 2026 |
| Statement | عمل أصلي؛ لا نرفع 90٪/99٪ كأرقام مقاسة |

---

## هـ) حقول نموذج المنصة (معنى اللصق الإنجليزي)

| الحقل المحتمل | المعنى |
| --- | --- |
| عنوان المشروع | CAUSASEAL — طبقة قرار سببي قبل أثر أداة الوكيل |
| المسار | الأمن السيبراني والتقنيات الدفاعية |
| الفئة | أكبر من 18 |
| الملخص | طبقة فوق الهارنس · بصمة سبب · نسخة محذوفة عند التدخل · أربع حالات حية |
| العضو 1 | شادية أحمد طاهر — سعودية — قائدة الفكرة — هوية `[املأ]` |
| العضو 2 | بشرى `[لقب]` — سعودية — هندسة برمجيات — هوية `[املأ]` |
| العضو 3 | محمد أبو الرجال — يمني — أنظمة وأمن وذكاء اصطناعي — هوية `[املأ]` |

---

## ممنوع رفعه

| ممنوع |
| --- |
| 90٪ / 99٪+ كرقم مقاس |
| «أول في العالم» |
| «مناعة سيادية» كادعاء مثبت |
| Entra / EHR حقيقي / SIEM خارجي كأنها شغّالة |

مرجع: [`idea-to-code.md`](idea-to-code.md) · [`saif.md`](saif.md) · [`idea-causaseal-sermg.md`](idea-causaseal-sermg.md).
