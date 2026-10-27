---
name: Causaseal Changelog Rules
overview: لا يوجد CHANGELOG في causaseal. سنستنسخ قواعد Keep a Changelog + SemVer والرفع من موقع aboalrejal، ثم نوسّق تاريخ المشروع من كل الـ77 commit على GitHub في CHANGELOG.md مع قطع إصدارات مؤرخة، ونرفع على main.
todos:
  - id: rules-changelog-push
    content: إضافة changelog.mdc و cloud-auto-push.mdc ومواءمة git-main-granular-commits.mdc من أسلوب aboalrejal
    status: completed
  - id: backfill-changelog
    content: قراءة كل الـ77+ commit وبناء CHANGELOG.md منسّق Keep a Changelog + SemVer
    status: completed
  - id: bump-package-links
    content: مزامنة package.json version وروابط compare في أسفل CHANGELOG
    status: completed
  - id: commit-push-main
    content: commits granular على main ثم git push origin main
    status: completed
isProject: false
---

# CHANGELOG وقواعد الرفع لـ CAUSASEAL

## الجواب المباشر

- **هل يوجد CHANGELOG في المشروع؟ لا.** لا ملف `CHANGELOG.md` تحت [`/Users/aboarejal/Desktop/Project/causaseal`](file:///Users/aboarejal/Desktop/Project/causaseal).
- المصدر المعتمد للقواعد والأسلوب: الموقع الشخصي
  - [`/Users/aboarejal/Desktop/Project/aboalrejal/.cursor/rules/changelog.mdc`](file:///Users/aboarejal/Desktop/Project/aboalrejal/.cursor/rules/changelog.mdc)
  - [`/Users/aboarejal/Desktop/Project/aboalrejal/.cursor/rules/cloud-auto-push.mdc`](file:///Users/aboarejal/Desktop/Project/aboalrejal/.cursor/rules/cloud-auto-push.mdc)
  - نموذج الكتابة: [`/Users/aboarejal/Desktop/Project/aboalrejal/CHANGELOG.md`](file:///Users/aboarejal/Desktop/Project/aboalrejal/CHANGELOG.md)
- «الـ77 Comment» على الريبو = **77 commit** في [`aboalrejalai/causaseal`](https://github.com/aboalrejalai/causaseal) (أكدها `gh api` = 77؛ محليًا 78 مع commit المعمارية غير المدفوع `5e94c5a`).

## القرار الثابت (نفس أسلوب aboalrejal — لا نسخة commit=إصدار)

حسب قواعدك أنت: **Commits ≠ changelog versions.** نقرأ كل الـ77+ commit كمدخل، ثم **ننتقي وندمج** في bullets تحت أنواع Keep a Changelog، ونقطع إصدارات SemVer منطقية حسب دفعات الشحن (غالبًا حسب اليوم/الدفعة)، مو 77 رقم إصدار منفصل.

- شكل الملف: Keep a Changelog 1.1.0 + SemVer 2.0.0
- أحدث إصدار أولًا؛ `## [Unreleased]` فارغ بعد القطع
- أنواع فقط: Added / Changed / Deprecated / Removed / Fixed / Security
- بعد كل دفعة جاهزة لاحقًا: قطع إصدار + bump `package.json` + `chore(release): cut X.Y.Z` + **`git push origin main`** فورًا (Hostinger يبني من main؛ فشل البناء لا يُسقط الموقع)

الإصدار الحالي في [`package.json`](package.json) هو `0.1.0` بلا تاريخ إصدارات. سنبني سلسلة `0.x.y` من البداية حتى أحدث دفعة (المعمارية الصادقة = أحدث قطع)، ثم نضبط `"version"` ليطابق آخر رقم.

Compare links في أسفل الملف تشير إلى:

`https://github.com/aboalrejalai/causaseal/compare/...`

## المرحلة 1 — قواعد Cursor (3 مهام)

1. إضافة [`.cursor/rules/changelog.mdc`](.cursor/rules/changelog.mdc) منسوخًا من aboalrejal مع استبدال اسم الريبو/المسار إلى causaseal وHostinger/`causaseal.aboalrejal.com`، والإبقاء على نفس سياسة القطع بعد كل دفعة.
2. إضافة [`.cursor/rules/cloud-auto-push.mdc`](.cursor/rules/cloud-auto-push.mdc) بنفس روح الموقع الشخصي (main فقط، push فوري، granular commits، قطع SemVer).
3. مواءمة [`.cursor/rules/git-main-granular-commits.mdc`](.cursor/rules/git-main-granular-commits.mdc) ليشير صراحة إلى ملفي changelog + cloud-auto-push حتى لا تتعارض القواعد (يبقي التفصيل الإنجليزي لرسائل الـcommit كما هو).

لا ننسخ `plan-files.mdc` / `graphify.md` إلا إذا طُلب لاحقًا — خارج هذا الطلب.

## المرحلة 2 — قراءة كل الـcommits وبناء CHANGELOG (4 مهام)

1. سحب القائمة الكاملة من GitHub/`git log --reverse` (من `dfa8c1f` حتى `5e94c5a`) وتجميعها حسب التاريخ المنطقي:
   - **2026-09-20:** bootstrap vinext + npm + server.js / Hostinger fixes
   - **2026-09-21:** Soft foundation، المحرك، الواجهات، Capacitor prep، مسار سيف إلى 100
   - **2026-09-22–23:** صدق المطابقة، harness/redact، charts، connectors/MCP/SDK/hub، إصلاحات mobile/stdin
   - **2026-09-24:** architecture صادقة + harness compare + health sim
2. كتابة [`CHANGELOG.md`](CHANGELOG.md) من الصفر: ترويسة Keep a Changelog، `[Unreleased]` فارغ، ثم أقسام `## [0.Y.Z] - YYYY-MM-DD` من الأحدث للأقدم.
3. انتقاء SemVer داخل كل يوم/دفعة: **MINOR** لسطح جديد (Soft app، causal loop، connectors، architecture)، **PATCH** لإصلاحات/docs/polish داخل نفس الموجة. دمج رسائل الـcommit المكررة في bullet واحد مقروء (imperative إنجليزي مثل aboalrejal).
4. تغطية كل commit ملحوظ كأثر مستخدم/منتج داخل bullet ما؛ الضجيج الصرف (lockfile alone إن وُجد بلا أثر) يُطوى داخل دفعة المنتج ولا يُخلق له إصدار فارغ.

## المرحلة 3 — مزامنة الإصدار والرفع (4 مهام)

1. ضبط `"version"` في [`package.json`](package.json) ليساوي آخر قطع في CHANGELOG.
2. إضافة روابط المقارنة في أسفل CHANGELOG لكل إصدار مقطوع + `[Unreleased]: .../compare/vLAST...HEAD`.
3. Commits granular على main مثلًا:
   - `chore(rules): add Keep a Changelog and main auto-push rules from personal site`
   - `docs(changelog): backfill Keep a Changelog from GitHub commit history`
   - `chore(release): cut X.Y.Z` (إن لزم فصل bump النسخة)
4. `git push origin main` (يشمل أيضًا commit المعمارية المحلي غير المدفوع إن بقي ahead). لا force-push. وسم `vX.Y.Z` فقط إذا بدأنا وسومًا في هذا الريبو؛ إن لم توجد وسوم سابقة نقطع الإصدار في الملف و`package.json` أولًا ونضيف التاج مع آخر قطع إن رغبت السياسة بنفس aboalrejal — **الخيار الافتراضي هنا:** إنشاء تاج لآخر إصدار فقط عند القطع الحالي بعد الـbackfill حتى تعمل compare links لاحقًا، دون تاج لكل إصدار تاريخي بأثر رجعي (تجنب ضوضاء 20+ تاج دفعة واحدة على تاريخ قديم).

## خارج النطاق

- لا إعادة كتابة تاريخ git (rebase/filter).
- لا بناء Entra/EHR.
- لا تعديل ملف الخطة `architecture_taken_right_*.plan.md`.
- لا نسخ كل خطط/قواعد aboalrejal غير changelog والرفع.

## تحقق

- وجود `CHANGELOG.md` + القاعدتين الجديدتين.
- كل يوم شحن رئيسي ممثل بإصدار واحد أو أكثر منطقي؛ bullets تغطي مسار الـ77 commit دون لصق raw log.
- `package.json` version = أحدث `[X.Y.Z]`.
- `git status` نظيف على الملفات المعنية بعد الرفع؛ `origin/main` محدّث.
