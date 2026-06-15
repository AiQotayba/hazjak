import {
  OwnerHero,
  OwnerValueStrip,
  OwnerFeatures,
  OwnerPricing,
  OwnerSteps,
  OwnerFinalCta,
} from "@/features/landing";
import { APP_NAME_AR } from "@/lib/brand";
import { BreadcrumbJsonLd, JsonLd } from "@/features/marketing/seo";
import { citiesLabel, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: `سجّل ملعبك في ${citiesLabel}`,
  description:
    `لوحة تحكم ${APP_NAME_AR} لأصحاب ملاعب كرة القدم في ${citiesLabel}: قبول الحجوزات، إدارة التقويم، متابعة الإحصائيات، والتواصل مع اللاعبين.`,
  path: "/owners",
  keywords: [
    "تسجيل ملعب",
    "إدارة ملعب",
    "أصحاب ملاعب",
    "حلب",
    "إدلب",
    APP_NAME_AR,
  ],
});

export default function OwnersLandingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", path: "/" },
          { name: "لأصحاب الملاعب", path: "/owners" },
        ]}
      />
      <JsonLd
        data={{
          "@type": "Service",
          name: `تسجيل ملعب على ${APP_NAME_AR}`,
          description: `خدمة إدارة وحجز الملاعب لأصحاب ملاعب كرة القدم في ${citiesLabel}`,
          provider: { "@type": "Organization", name: APP_NAME_AR },
          areaServed: citiesLabel,
          serviceType: "إدارة حجوزات الملاعب",
        }}
      />
      <OwnerHero />
      <OwnerValueStrip />
      <OwnerFeatures />
      <OwnerPricing />
      <OwnerSteps />
      <OwnerFinalCta />
    </>
  );
}
