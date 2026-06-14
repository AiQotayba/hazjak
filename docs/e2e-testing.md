# اختبار E2E — من User Story إلى Playwright

> **الفكرة:** User Story → Test Cases → Playwright Script → تشغيل

---

## 1. User Stories (من `user-story.md`)

### US-01 — تصفّح الملاعب (زائر)

> **كـزائر،** أريد تصفّح الملاعب المتاحة **حتى** أختار ملعباً للحجز.

### US-02 — تسجيل الدخول (مستخدم)

> **كلاعب،** أريد تسجيل الدخول **حتى** أصل إلى حجوزاتي وأحجز ملعباً.

### US-03 — صفحة الملعب (زائر)

> **كـزائر،** أريد فتح صفحة ملعب **حتى** أرى التفاصيل والأسعار قبل الحجز.

---

## 2. Test Cases

### US-01 — تصفّح الملاعب

| # | الخطوة | النتيجة المتوقعة |
|---|--------|------------------|
| 1 | افتح الصفحة الرئيسية `/` | تظهر عبارة «احجز ملعبك» |
| 2 | اضغط «تصفح الملاعب» | الانتقال إلى `/stadiums` |
| 3 | انتظر تحميل القائمة | يظهر ملعب واحد على الأقل (بعد seed) |

### US-02 — تسجيل الدخول

| # | الخطوة | النتيجة المتوقعة |
|---|--------|------------------|
| 1 | افتح `/login` | تظهر «مرحباً بعودتك» |
| 2 | أدخل بريداً وكلمة مرور صحيحين | لا رسالة خطأ |
| 3 | اضغط «تسجيل الدخول» | الانتقال إلى `/user/bookings` |
| 4 | — | تظهر «أهلاً، محمد» (مستخدم seed) |

### Auth — صفحات `(auth)`

| الصفحة | User Story | ملف الاختبار |
|--------|------------|--------------|
| `/login` | تسجيل الدخول (مستخدم / صاحب ملعب) | `e2e/auth/login.spec.ts` |
| `/register` | إنشاء حساب لاعب | `e2e/auth/register.spec.ts` |
| `/register/owner` | إنشاء حساب صاحب ملعب | `e2e/auth/register-owner.spec.ts` |
| `/forgot-password` | استعادة كلمة المرور | `e2e/auth/forgot-password.spec.ts` |
| `/reset-password` | إعادة تعيين كلمة المرور | `e2e/auth/reset-password.spec.ts` |
| `/verify-email` | التحقق من البريد (OTP) | `e2e/auth/verify-email.spec.ts` |

### US-03 — صفحة الملعب

| # | الخطوة | النتيجة المتوقعة |
|---|--------|------------------|
| 1 | افتح `/stadiums` | قائمة الملاعب |
| 2 | اضغط «ملعب النخيل» | الانتقال لصفحة التفاصيل |
| 3 | — | يظهر زر «سجّل للحجز» (بدون تسجيل دخول) |

---

## 3. Playwright Scripts

```
User Story          →  ملف الاختبار
─────────────────────────────────────────────
US-01 تصفّح        →  e2e/landing-browse-stadiums.spec.ts
US-02 تسجيل دخول   →  e2e/auth/login.spec.ts
US-03 صفحة ملعب    →  e2e/stadium-detail.spec.ts
Auth (6 صفحات)     →  e2e/auth/*.spec.ts
```

---

## 4. التشغيل

**متطلبات:** قاعدة بيانات + seed + API + Web

```bash
# مرة واحدة
pnpm db:setup        # أو db:setup:local على Windows
pnpm db:seed
pnpm --filter @hazjak/web test:e2e:install   # تحميل متصفح Chromium

# شغّل الخوادم (أو دع Playwright يشغّلها تلقائياً)
pnpm dev

# من جذر المشروع
pnpm test:e2e

# أو من apps/web
pnpm --filter @hazjak/web test:e2e
# اختبار Auth فقط
pnpm --filter @hazjak/web test:e2e e2e/auth
```

**حسابات seed (`apps/api/prisma/seed.ts`):**

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| مستخدم | `user@hazjak.sy` | `Password123!` |
| صاحب ملعب | `owner@hazjak.sy` | `Password123!` |
| مدير | `admin@hazjak.sy` | `Password123!` |

---

## 5. إضافة User Story جديدة

1. اكتب الـ User Story في `docs/user-story.md`.
2. حوّلها إلى جدول Test Cases هنا (قسم 2).
3. أنشئ ملف `.spec.ts` في `apps/web/e2e/`.
4. شغّل `pnpm test:e2e`.

**مثال — حجز ملعب (لاحقاً):**

> **كلاعب،** أريد إرسال طلب حجز **حتى** يراجعه صاحب الملعب.

```text
Book Stadium
├── سجّل دخول
├── افتح صفحة ملعب
├── اختر موعداً
├── اضغط حفظ
└── تأكد ظهور الحجز في /user/bookings
```

---

## النتيجة

```
User Story  →  Test Cases  →  Playwright Script  →  pnpm test:e2e
```

لا تحتاج أدوات إضافية في البداية. عندما يكبر المشروع: Page Objects، fixtures، أو توليد بالذكاء الاصطناعي.
