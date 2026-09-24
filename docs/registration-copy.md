# Registration & poster copy — CAUSASEAL (SAIF 2026)

**Platform / poster language:** paste the **English** sections into SAIF and into `_SAIF Poster Template Age Group (18 and Above) - 2026.pptx`.  
**Arabic at the bottom** mirrors the same tables for the team to read. Do **not** paste Arabic into English-required form fields.

Not the live demo script — that is [`judge-runbook.md`](judge-runbook.md).

**Technical docs (Drive):** [Saif-26 folder](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing)

---

## Still missing (only these)

| # | What | Who | Status |
| ---: | --- | --- | --- |
| 1 | **Email** for SAIF (if the form asks) | Bushra | Missing |
| 2 | **Email** for SAIF | Mohammed | Missing |
| 3 | **Poster flag choice** | team | Decide: Saudi · Yemen · both |
| 4 | **Booth Number** | team | After qualification |
| 5 | **Prototype screenshot** JPG/PNG for upload | team | If not already in Drive |

Filled: names, IDs, mobiles, Shadia email, Drive link, nationalities.

### Team roster (filled)

| Member (EN) | Member (AR) | Nationality | ID | Mobile | Email |
| --- | --- | --- | --- | --- | --- |
| Shadia Ahmed Taher Albsheer | شادية أحمد طاهر البشير | Saudi | 1014444887 | 0543404892 | Shadia.ta10@gmail.com |
| Bushra Fahad O Alshammari | بشرى فهد عبيد الشمري | Saudi | 1136396387 | 0553533657 | `[FILL email]` |
| Mohammed Nadher Aboalrejal | محمد نذير أبو الرجال | Yemeni | 10491861 | 0533548021 | `[FILL email]` |

---

# ENGLISH (paste this)

## A. Poster header (template fields)

| Field on template | Paste |
| --- | --- |
| **Innovation Title** | CAUSASEAL — Causal Decision Layer Before Agent Tool Impact |
| **Student Name** (line 1) | Shadia Ahmed Taher Albsheer |
| **ID** (line 1) | 1014444887 |
| **Nationality** (line 1) | Saudi Arabia |
| **Student Name** (line 2) | Bushra Fahad O Alshammari |
| **ID** (line 2) | 1136396387 |
| **Nationality** (line 2) | Saudi Arabia |
| **Student Name** (line 3) | Mohammed Nadher Aboalrejal |
| **ID** (line 3) | 10491861 |
| **Nationality** (line 3) | Yemen |
| **Country Flag Here** | `[FILL: Saudi · Yemen · or both]` |
| **Booth Number** | `[FILL after qualification]` |
| **QR Code** | `https://causaseal.aboalrejal.com` (and/or `https://github.com/aboalrejalai/causaseal`) |

If the platform allows one lead name only, use **Shadia Ahmed Taher Albsheer**; list all three on the poster.

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

Prototype: `https://causaseal.aboalrejal.com` · Source: `https://github.com/aboalrejalai/causaseal` · Docs folder: [Google Drive Saif-26](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing)

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
- Judges: this repo · [`idea-to-code.md`](idea-to-code.md) · [`saif.md`](saif.md) · `/architecture` compare · [Drive Saif-26](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing).

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
| **Demo / repo / docs links** | `https://causaseal.aboalrejal.com` · `https://github.com/aboalrejalai/causaseal` · [Drive Saif-26](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing) |
| **Team member 1** | Shadia Ahmed Taher Albsheer — Saudi — ID 1014444887 — mobile 0543404892 — Shadia.ta10@gmail.com — idea / innovation lead |
| **Team member 2** | Bushra Fahad O Alshammari — Saudi — ID 1136396387 — mobile 0553533657 — email `[FILL]` — software engineering / prototype |
| **Team member 3** | Mohammed Nadher Aboalrejal — Yemeni — ID 10491861 — mobile 0533548021 — email `[FILL]` — systems / cybersecurity / AI platform |
| **Intellectual property** | Original team work; no plagiarized drop-in codebase presented as ours. |
| **Attachments checklist** | Video ≤5 min MP4 · Scientific poster PDF · Prototype image JPG/PNG · Technical docs: Drive link above (view access). |

### Do not paste as measured claims

- 90% / 99%+
- “First in the world”
- “Sovereign immunity” as a proven product claim
- Live Entra / real EHR / external SIEM as if shipped

---

# ARABIC (للفريق فقط — فهم · لا للصق في حقول الإنجليزية)

## ما زال ناقصًا فقط

| # | المطلوب | من |
| ---: | --- | --- |
| 1 | البريد الإلكتروني | بشرى |
| 2 | البريد الإلكتروني | محمد |
| 3 | علم الملصق: سعودي / يمني / الاثنان | الفريق |
| 4 | رقم الجناح | بعد التأهل |
| 5 | صورة النموذج JPG/PNG إن لم تكن في الدرايف | الفريق |

### قائمة الفريق (مُعبَّأة)

| الاسم (EN) | الاسم (AR) | الجنسية | الهوية | الجوال | البريد |
| --- | --- | --- | --- | --- | --- |
| Shadia Ahmed Taher Albsheer | شادية أحمد طاهر البشير | سعودية | 1014444887 | 0543404892 | Shadia.ta10@gmail.com |
| Bushra Fahad O Alshammari | بشرى فهد عبيد الشمري | سعودية | 1136396387 | 0553533657 | `[املأ البريد]` |
| Mohammed Nadher Aboalrejal | محمد نذير أبو الرجال | يمني | 10491861 | 0533548021 | `[املأ البريد]` |

**رابط التوثيق:** [مجلد Saif-26 على Drive](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing)

---

## أ) رأس الملصق

| الحقل في القالب | المقابل |
| --- | --- |
| عنوان الابتكار | CAUSASEAL — طبقة قرار سببي قبل أثر أداة الوكيل |
| اسم الطالبة (سطر 1) | شادية أحمد طاهر البشير |
| الهوية (سطر 1) | 1014444887 |
| الجنسية (سطر 1) | سعودية |
| اسم الطالبة (سطر 2) | بشرى فهد عبيد الشمري |
| الهوية (سطر 2) | 1136396387 |
| الجنسية (سطر 2) | سعودية |
| اسم الطالب (سطر 3) | محمد نذير أبو الرجال |
| الهوية (سطر 3) | 10491861 |
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
| Results | الجدول أعلاه + رابط الديمو والمستودع والدرايف |
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
| العضو 1 | شادية أحمد طاهر البشير — سعودية — 1014444887 — 0543404892 — Shadia.ta10@gmail.com |
| العضو 2 | بشرى فهد عبيد الشمري — سعودية — 1136396387 — 0553533657 — بريد `[املأ]` |
| العضو 3 | محمد نذير أبو الرجال — يمني — 10491861 — 0533548021 — بريد `[املأ]` |

---

## ممنوع رفعه

| ممنوع |
| --- |
| 90٪ / 99٪+ كرقم مقاس |
| «أول في العالم» |
| «مناعة سيادية» كادعاء مثبت |
| Entra / EHR حقيقي / SIEM خارجي كأنها شغّالة |

مرجع: [`idea-to-code.md`](idea-to-code.md) · [`saif.md`](saif.md) · [`idea-causaseal-sermg.md`](idea-causaseal-sermg.md).
