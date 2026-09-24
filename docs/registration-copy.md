# Registration & poster copy — CAUSASEAL (SAIF 2026)

**Platform / poster language:** paste the **English** sections below into SAIF and into `_SAIF Poster Template Age Group (18 and Above) - 2026.pptx`.  
**Arabic at the bottom** is for the team only (understand what the English says). Do **not** paste Arabic into English-required form fields.

Not the live demo script — that is [`judge-runbook.md`](judge-runbook.md).

Source of truth for what the product does: four-case harness compare on `/architecture` and `/impact`.

---

# ENGLISH (paste this)

## A. Poster header (template fields)

| Field on template | Paste |
| --- | --- |
| **Innovation Title** | CAUSASEAL — Causal Decision Layer Before Agent Tool Impact |
| **Student Name** (line 1) | Shadia Ahmed Taher |
| **ID** (line 1) | `[FILL: her national / platform ID]` |
| **Student Name** (line 2) | Bushra `[FILL: full family name]` |
| **ID** (line 2) | `[FILL: her national / platform ID]` |
| **Student Name** (line 3) | Mohammed Abo Alrejal |
| **ID** (line 3) | `[FILL: his national / platform ID]` |
| **Country Flag Here** | Saudi Arabia |
| **Booth Number** | `[FILL after qualification]` |
| **QR Code** | Point to live demo: `https://causaseal.aboalrejal.com` (and/or repo: `https://github.com/aboalrejalai/causaseal`) |

If the platform allows one “lead” name only, use **Shadia Ahmed Taher** as idea lead; list all three on the poster.

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

Live session outcomes (reproducible with the demo button; also covered by `npm test`):

| Case | Harness | Fingerprint | Original sent | Cut |
| --- | --- | --- | --- | --- |
| Mutated phrasing | ALLOW | INTERVENE | No | Directive in retrieved text |
| Known leak | BLOCK | INTERVENE | No | Named invariant |
| Lookalike (benign) | ALLOW | ALLOW | Yes | — |
| Partial start | ALLOW | VERIFY | No | — (monitor; no send) |

**One-line product claim (use everywhere):**  
We sit above the agent harness. The harness judges the current tool call. We store the cause of a past incident, recognize it when it returns in a new form, and cut that edge while the task completes.

Prototype URL: `https://causaseal.aboalrejal.com` · Source: GitHub `aboalrejalai/causaseal`

### Innovation

- **Difference from a tool harness:** harness = allow/block *this* call; CAUSASEAL = remember *why* a path was dangerous and catch the same cause after surface mutation.
- **Smallest practical intervention:** redacted delivery + named cut — not “stop the whole mission” as the only option.
- **Honest scope:** rules + invariant memory + local/simulated outbox. No claim of measured 90%/99% on external enterprise logs. No live Entra / real EHR / external SIEM in this build (shown as Later / Simulated on `/architecture`).

### Conclusion

CAUSASEAL is a working prototype for SAIF: a causal decision layer before agent tool impact, with a four-case proof a judge can replay. It does not replace enterprise IAM or SIEM; it answers a gap harnesses leave open — **returning causal shape under new wording**.

### Future Work & References

- Real beneficiary attach (one send tool in a partner agent) and one documented blocked incident.
- Optional stronger matching beyond Jaccard if evidence requires it.
- IAM / real EHR / external SIEM only after the causal difference is solid.
- References for judges: this repository · [`idea-to-code.md`](idea-to-code.md) · [`saif.md`](saif.md) · live `/architecture` compare.

### Acknowledgments

Team CAUSASEAL. Built for SAIF 2026 (Security and Innovation Fair) under the Global Security & Technology Summit context. Soft UI / Next.js prototype hosted for demo verification.

### Statement

We affirm that CAUSASEAL is our team’s original work for SAIF 2026. Unmeasured marketing numbers (e.g. 90%, 99%+) from older pitch text are **not** submitted as measured results. Claims match the running prototype and tests in the public repository.

---

## C. SAIF platform form (English fields)

Use these when the online form asks for project text (wording may vary slightly by field label):

| Likely field | Paste |
| --- | --- |
| **Project / innovation title** | CAUSASEAL — Causal Decision Layer Before Agent Tool Impact |
| **Track** | Cybersecurity and Defensive Technologies |
| **Age category** | Over 18 |
| **Short summary / abstract** | CAUSASEAL is a runtime causal layer above an agent tool harness. The harness allows or blocks the current tool call. We store a compact fingerprint of why a path was dangerous, recognize that shape when phrasing or tools change, and on intervene deliver a redacted copy only — so the original sensitive payload is never sent. Demo: four live harness-vs-fingerprint cases. |
| **Problem** | Agent failures happen in tool actions. Traditional harnesses lack memory of causal shape across rephrased attacks. |
| **Solution** | Path-shape invariants + fingerprint memory + gateway before send + named cut / redacted deliver. |
| **How it works (short)** | Analyze path → match fingerprint → ALLOW / VERIFY / INTERVENE → deliver original or redacted or hold for human. |
| **Impact / beneficiary** | Teams that run agents with send tools against sensitive systems (ops / security). Demo uses a simulated outbox; not a production contract yet. |
| **Tech stack** | Node.js gateway, Next.js UI, MCP server, partner SDK stub, session metrics, automated tests. |
| **Demo / repo links** | `https://causaseal.aboalrejal.com` · `https://github.com/aboalrejalai/causaseal` |
| **Team** | Shadia Ahmed Taher (idea / innovation lead); Bushra `[FILL surname]` (software engineering / prototype); Mohammed Abo Alrejal (systems / cybersecurity / AI platform). |
| **Intellectual property** | Original team work; no plagiarized drop-in codebase presented as ours. |
| **Attachments checklist** | Video ≤5 min MP4 · Scientific poster PDF (this template) · Prototype image JPG/PNG · Technical docs Drive link (view access). |

### Do not paste as measured claims

- 90% / 99%+
- “First in the world”
- “Sovereign immunity” as a proven product claim
- Live Entra / real EHR / external SIEM as if shipped

---

# ARABIC (team reading only — not for English form fields)

استخدم هذا القسم **للفهم داخل الفريق**. حقول المنصة والملصق المطلوبة بالإنجليزية = القسم الإنجليزي أعلاه.

## رأس الملصق

| الحقل | المعنى / المقابل |
| --- | --- |
| عنوان الابتكار | CAUSASEAL — طبقة قرار سببي قبل أثر أداة الوكيل |
| الأسماء | شادية أحمد طاهر · بشرى (أكمل اللقب) · محمد أبو الرجال |
| الهوية | املأوا أرقام الهوية / معرف المنصة يدويًا |
| العلم | المملكة العربية السعودية |
| رقم الجناح | بعد التأهل |
| رمز QR | الموقع الحي أو المستودع |

## جملة المنتج

نركب فوق هارنس الوكيل. الهارنس يحكم على الأداة الحالية. نحن نحفظ سبب الحادث السابق، نعرفه إذا رجع بشكل جديد، ونقطع تلك العلاقة والمهمة تكمل.

## جدول الحالات الأربع

| الحالة | هارنس | بصمة | أصل مُرسل | القطع |
| --- | --- | --- | --- | --- |
| صياغة متغيرة | ALLOW | INTERVENE | لا | تعليمة في النص المسترجع |
| تسريب معروف | BLOCK | INTERVENE | لا | ثابت مسمّى |
| شبيه لفظي مشروع | ALLOW | ALLOW | نعم | — |
| بداية جزئية | ALLOW | VERIFY | لا | — (راقب؛ لا إرسال) |

## ملخص المقدمة / المنهج / النتيجة (معنى النص الإنجليزي)

- **مقدمة:** الوكيل يخطئ في الفعل؛ الهارنس يحكم على النداء الحالي فقط؛ نحن نتذكر شكل السبب بعد تغيّر الصياغة.
- **منهج:** ثوابت شكل المسار · ذاكرة Jaccard · بوابة قبل الإرسال · قطع مسمّى · موصّلات HTTP/MCP/SDK · إثبات بأربع حالات.
- **نتائج:** الجدول أعلاه قابل للإعادة من الواجهة والاختبارات.
- **ابتكار:** الفرق عن الهارنس + أصغر تدخل عملي + صدق النطاق (لا أرقام غير مقاسة).
- **خاتمة:** نموذج أولي لسيف يثبت الفجوة؛ ليس بديل IAM/SIEM.
- **إقرار:** عمل أصلي للفريق؛ لا نرفع 90٪/99٪ كأرقام مقاسة.

## ممنوع رفعه

- 90٪ / 99٪+ · «أول في العالم» · «مناعة سيادية» كادعاء مثبت · Entra/EHR/SIEM كأنها شغّالة.

مرجع المطابقة: [`idea-to-code.md`](idea-to-code.md) · مختصر سيف: [`saif.md`](saif.md) · وثيقة الفكرة (لا تُلصق أرقامها غير المقاسة): [`idea-causaseal-sermg.md`](idea-causaseal-sermg.md).
