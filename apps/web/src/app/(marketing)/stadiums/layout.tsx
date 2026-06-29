import { APP_COUNTRY_AR } from "@hazjak/constants";
import { BreadcrumbJsonLd, StadiumsListJsonLd } from "@/features/marketing/seo";
import { locationLabel, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: `ملاعب كرة القدم في ${locationLabel}`,
  description:
    `تصفّح ملاعب كرة القدم في ${locationLabel}. قارن أسعار الصباح والمساء، اطلع على التقييمات، وأرسل طلب حجز — صاحب الملعب يؤكّد الموعد.`,
  path: "/stadiums",
  keywords: [
    "ملاعب سوريا",
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
