# Web App Architecture (Feature Board)

تنظيم `apps/web` حسب **الميزات** وليس حسب نوع الملف فقط. الهدف: كل ميزة في مكان واحد، و`app/` رفيعة تستورد من `features/`.

## الهيكل

```txt
src/
├── app/                    # Next.js App Router — مسارات + metadata + SEO للصفحة
│   ├── (marketing)/        # عام: هبوط، ملاعب، عن المنصة
│   ├── (auth)/             # تسجيل دخول / تسجيل
│   ├── (user)/             # لوحة المستخدم
│   └── (owner)/            # لوحة صاحب الملعب
│
├── features/               # ميزات المنتج (التركيز الرئيسي)
│   ├── auth/
│   ├── landing/
│   ├── marketing/
│   ├── stadium/
│   ├── user-profile/
│   ├── user-bookings/
│   ├── user-shell/
│   ├── owner-bookings/
│   └── owner-dashboard/
│
├── components/             # مشترك بين أكثر من ميزة
│   ├── ui/                 # shadcn / primitives
│   ├── layout/             # هيدر، فوتر، أصداف اللوحات
│   └── shared/             # empty-state، skeletons مشتركة
│
└── lib/                    # أدوات مشتركة على مستوى التطبيق
    ├── api.ts
    ├── utils.ts
    ├── booking-slots.ts
    └── booking-status-icons.tsx
```

## قواعد التنظيم

| الطبقة | ماذا يضع هنا | مثال |
|--------|----------------|------|
| **app/** | `page.tsx`, `layout.tsx`, `metadata`, مسار URL فقط | `(marketing)/page.tsx` يستورد من `@/features/landing` |
| **features/** | UI + منطق + types + hooks خاصة بميزة واحدة | `user-bookings/components/booking-list-item.tsx` |
| **components/** | يُستخدم في **ميزتين+** أو بدون سياق منتج | `components/ui/button`, `components/layout/site-header` |
| **lib/** | بدون UI، مشترك عالمياً | `api`, `cn`, فتحات الحجز |

### داخل كل feature

```txt
features/<name>/
├── components/     # واجهات الميزة
├── lib/            # (اختياري) منطق خاص بالميزة
├── hooks/          # (اختياري)
├── data/           # (اختياري) ثوابت / FAQ
├── seo/            # (اختياري) JSON-LD
└── index.ts        # واجهة عامة — استورد من هنا من app/
```

**لا تستورد** من داخل feature أخرى عبر مسارات عميقة؛ استخدم `index.ts` أو انقل المشترك إلى `components/` أو `lib/`.

## خريطة الميزات ↔ المسارات

| Feature | المسارات / الاستخدام |
|---------|----------------------|
| `landing` | `/` — أقسام الهبوط + SEO (`LandingJsonLd`) |
| `marketing` | `/about`, `/contact`, `/policy`, `MarketingPageShell` |
| `landing` (owners) | `/owners` — صفحة أصحاب الملاعب |
| `stadium` | `/stadiums`, `/stadium/[slug]` — بطاقة وعرض ملعب + حجز |
| `auth` | `/login`, `/register`, … + `useAuthStore`, `useRequireRole` |
| `user-profile` | `/user/profile` |
| `user-bookings` | `/user/bookings` |
| `user-shell` | `(user)/layout` — تنقل الموبايل |
| `owner-dashboard` | `/owner` — إحصائيات |
| `owner-bookings` | `/owner/bookings` |

ميزات بصفحات في `app/` فقط (حتى تُستخرج لاحقاً): `user-notifications`, `owner-calendar`, `owner-notifications`, `owner-settings`, `owner-analytics`, `owner-reviews`, `owner-stadium`.

## استيراد من app

```tsx
// صفحة رفيعة — metadata هنا، UI من feature
import type { Metadata } from "next";
import { LandingHero, LandingJsonLd } from "@/features/landing";

export const metadata: Metadata = { title: "…" };

export default function HomePage() {
  return (
    <>
      <LandingJsonLd />
      <LandingHero />
    </>
  );
}
```

## إضافة ميزة جديدة

1. أنشئ `src/features/<feature-name>/` مع `components/` و`index.ts`.
2. صفحة في `app/` تستورد من `@/features/<feature-name>`.
3. إن وُجدت حاجة مشتركة مع ميزة ثانية → ارفعها إلى `components/shared` أو `lib/`.
