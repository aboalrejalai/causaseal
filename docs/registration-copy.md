# Registration & poster copy — CAUSASEAL (SAIF 2026)

**English above** = paste into the **18+ poster template** (and any English project fields).  
**Arabic below** = for the team to read only — do **not** paste Arabic into the poster.

Poster is **mandatory** and **English only**. Video / screenshots / Drive folder are **optional** extras (you will film the video, upload it to the platform and to Drive with images, and generate QR codes yourselves).

**Drive folder:** [Saif-26](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing)  
**Demo:** `https://causaseal.aboalrejal.com` · **Repo:** `https://github.com/aboalrejalai/causaseal`  
**Live script (not poster):** [`judge-runbook.md`](judge-runbook.md)

### Your jobs (not text in this file)

| Item | Who | Note |
| --- | --- | --- |
| Scientific poster PPTX → PDF | team | Paste English sections below; keep template titles/boxes; leave ~15–20% empty space |
| Country flag | team | Use **Saudi Arabia** flag (participation country) |
| Booth number + official booth QR | — | **Not available at this submission stage** (after qualification) |
| References QR | team | Point to Drive Saif-26 (and/or demo URL) |
| Video ≤5 min | team | Arabic or English; platform + Drive |
| Prototype screenshots | team | Clear images → platform (optional) + Drive |

Nothing else is required from you for this markdown file.

---

# ENGLISH (paste into poster)

## A. Header

| Template field | Paste |
| --- | --- |
| **Innovation Title** | CAUSASEAL: Path-Shape Fingerprints That Catch Rephrased Agent Data Leaks Before Send |
| **Student Name** (1) | Shadia Ahmed Taher Albsheer |
| **ID** (1) | 1014444887 |
| **Student Name** (2) | Bushra Fahad O Alshammari |
| **ID** (2) | 1136396387 |
| **Student Name** (3) | Mohammed Nadher Aboalrejal |
| **ID** (3) | 10491861 |
| **Country Flag Here** | Saudi Arabia |
| **Booth Number** | Leave empty until assigned |
| **QR Code** (header) | Leave empty this stage **or** temporary link to demo/Drive if you want visitors to open it now |

Lead name if only one slot: **Shadia Ahmed Taher Albsheer**.

---

## B. Introduction

Agent security tools and **tool harnesses** already approve or block a single tool call. That works for the *current* call, but it does not remember *why* a past incident was dangerous when the agent rephrases the attack or changes the tool name.

Organizations then investigate after the leak: logs, forensics, reports. The same causal pattern can return in a new surface form.

**Gap:** there is no compact, reusable memory of the **causal shape** of a send-path incident that stops the *next* mutated attempt while still allowing lookalike but benign work.

**Goal:** build **CAUSASEAL** — a runtime layer above the harness that fingerprints path-shape invariants, matches them across rephrasing, and on intervene delivers a **redacted** copy only (original sensitive payload never sent).

Track: Cybersecurity and Defensive Technologies · Age group: Over 18 · Team of 3.

---

## C. Methodology

What we built and how a specialist can replay it:

1. **Path-shape invariants (X-CFS):** Derive structural invariants from the tool-path contract (send tool, sensitive data, untrusted destination, directive in retrieved text, elevated privilege) — no hostile word list.
2. **Fingerprint memory:** Store invariants per `orgId`; match with Jaccard similarity (threshold 0.6), including cross-environment reuse.
3. **Runtime gateway:** Before send, `POST /api/gateway/intercept` / `POST /api/agent/run` → `ALLOW` | `VERIFY` | `INTERVENE`.
4. **Named causal cut:** On `INTERVENE`, name the severed edge, deliver redacted body only.
5. **Connectors:** Same engine via HTTP, MCP (`/mcp`), and partner SDK.
6. **Proof:** Live four-case harness compare on `/architecture` + automated tests (`npm test`).

*On the poster:* prefer a small **flowchart** (Agent → Harness → CAUSASEAL → Allow / Verify / Redacted deliver) with a figure caption under it; keep this text short beside the figure.

---

## D. Results

| Case | Harness | Fingerprint | Original sent | Cut |
| --- | --- | --- | --- | --- |
| Mutated phrasing | ALLOW | INTERVENE | No | Directive in retrieved text |
| Known leak | BLOCK | INTERVENE | No | Named invariant |
| Lookalike (benign) | ALLOW | ALLOW | Yes | — |
| Partial start | ALLOW | VERIFY | No | — (monitor; no send) |

**Claim (honest):** We sit above the agent harness. The harness judges the current tool call. We store the cause of a past incident, recognize it when it returns in a new form, and cut that edge while the task completes.

*On the poster:* add **Figure:** screenshot of the four-row compare on `/architecture` (clear resolution) + caption “Fig. 1 — Live harness vs fingerprint compare”.

Demo: `https://causaseal.aboalrejal.com`

---

## E. Innovation (short)

1. **Memory of cause, not only of this tool call** — catches rephrased leaks the harness allows.  
2. **Smallest practical intervene** — named cut + redacted deliver; benign lookalikes still allowed.  
3. **Scoped honesty** — prototype with rules + invariant memory + simulated outbox; not claimed measured 90%/99% on external enterprise logs.

---

## F. Conclusion

We closed the stated gap with a **working prototype**: four replayable cases show harness vs fingerprint decisions, including mutated phrasing blocked without sending the original.

**Readiness:** prototype (demo + tests), not a full enterprise IAM/SIEM replacement.

**Impact path:** ops/security teams that run agents with send tools against sensitive systems — starting from a local/simulated outbox proof.

---

## G. Future Work & References

**Near term (≈1–2 months):** (1) attach one real partner send-tool via intercept; (2) document one blocked incident without secrets; (3) keep claims aligned with measured session evidence only.

**References:** place a **References** QR on the poster pointing to [Drive Saif-26](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing) (video, screenshots, docs). Repo: `https://github.com/aboalrejalai/causaseal`.

---

## H. Acknowledgments

Team CAUSASEAL — SAIF 2026 (Security and Innovation Fair).

## I. Statement

Original team work for SAIF 2026. Unmeasured marketing figures (e.g. 90%, 99%+) are **not** submitted as measured results. Claims match the running prototype and tests.

### Do not paste as measured claims

- 90% / 99%+ · “First in the world” · “Sovereign immunity” as proven · Live Entra / real EHR / external SIEM as if shipped

---

# ARABIC (للفريق فقط — للقراءة)

الملصق **إلزامي** وبالإنجليزي فقط. الفيديو والصور ومجلد الدرايف **اختيارية** كإضافات — أنتم تصوّرون الفيديو وترفعونه للمنصة وللدرايف مع الصور، وتولّدون الـQR بنفسكم.

| البند | من يقوم به |
| --- | --- |
| تعبئة قالب الملصق 18+ بالنص الإنجليزي أعلاه | الفريق |
| علم الدولة | علم **السعودية** |
| رقم الجناح وQR الرسمي للجناح | فارغ الآن — بعد التأهل |
| QR المراجع | على مجلد [Saif-26](https://drive.google.com/drive/folders/1Dt9IJjQEXbdSHiBSF6UksP4ef7dKsw6e?usp=sharing) |
| فيديو + لقطات الشاشة | أنتم → منصة + درايف |

لا نطلب منكم إيميلات ولا رقم جناح الآن — مو مطلوب لهذه المرحلة حسب درس الملصق.

### الفريق (رأس الملصق)

| الاسم (EN) | الاسم (AR) | الهوية | الجنسية |
| --- | --- | --- | --- |
| Shadia Ahmed Taher Albsheer | شادية أحمد طاهر البشير | 1014444887 | سعودية |
| Bushra Fahad O Alshammari | بشرى فهد عبيد الشمري | 1136396387 | سعودية |
| Mohammed Nadher Aboalrejal | محمد نذير أبو الرجال | 10491861 | يمني |

### معنى الأقسام الإنجليزية

| القسم | المعنى |
| --- | --- |
| العنوان | بصمة شكل مسار تمسك تسريبًا مُعاد صياغته قبل الإرسال |
| المقدمة | هارنس يحكم على النداء الحالي → فجوة: لا ذاكرة لشكل السبب → هدف CAUSASEAL |
| المنهجية | ثوابت · Jaccard · بوابة · قطع مسمّى · موصّلات · أربع حالات (+ مخطط في الملصق) |
| النتائج | جدول الحالات + لقطة شاشة للمقارنة |
| الابتكار | ذاكرة السبب · أصغر تدخل · صدق النطاق |
| الخاتمة | نموذج أولي جاهز للإعادة؛ مو IAM كامل |
| المستقبل | خلال شهرين تقريبًا: ربط أداة حقيقية + حادثة موثّقة + التزام بالأدلة |
| المراجع | QR على الدرايف |

### جملة المنتج

نركب فوق هارنس الوكيل. الهارنس يحكم على الأداة الحالية. نحن نحفظ سبب الحادث السابق، نعرفه إذا رجع بشكل جديد، ونقطع تلك العلاقة والمهمة تكمل.

### جدول الحالات الأربع

| الحالة | هارنس | بصمة | أصل مُرسل | القطع |
| --- | --- | --- | --- | --- |
| صياغة متغيرة | ALLOW | INTERVENE | لا | تعليمة في النص المسترجع |
| تسريب معروف | BLOCK | INTERVENE | لا | ثابت مسمّى |
| شبيه لفظي مشروع | ALLOW | ALLOW | نعم | — |
| بداية جزئية | ALLOW | VERIFY | لا | — |

### ممنوع رفعه كرقم مقاس

90٪ / 99٪+ · «أول في العالم» · «مناعة سيادية» مثبتة · Entra/EHR/SIEM كأنها شغّالة.
