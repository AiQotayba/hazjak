import { BreadcrumbJsonLd, StadiumsListJsonLd } from "@/features/marketing/seo";
import { citiesLabel, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: `ملاعب كرة القدم في ${citiesLabel}`,
  description:
    `تصفّح ملاعب كرة القدم في ${citiesLabel}. قارن أسعار الصباح والمساء، اطلع على التقييمات، وأرسل طلب حجز — صاحب الملعب يؤكّد الموعد.`,
  path: "/stadiums",
  keywords: [
    "ملاعب حلب",
    "ملاعب إدلب",
    "حجز ملعب",
    "أسعار ملاعب",
    "ملاعب خماسيات",
  ],
});

export default async function StadiumsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", path: "/" },
          { name: "الملاعب", path: "/stadiums" },
        ]}
      />
      <StadiumsListJsonLd />
      {children}
    </>
  );
}
