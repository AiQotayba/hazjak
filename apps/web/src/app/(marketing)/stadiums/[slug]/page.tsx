import type { Metadata } from "next";
import { BreadcrumbJsonLd, StadiumJsonLd } from "@/features/marketing/seo";
import { createMetadata, fetchStadiumBySlug } from "@/lib/seo";
import { StadiumDetailPage } from "./stadium-detail-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stadium = await fetchStadiumBySlug(slug);

  if (!stadium) {
    return createMetadata({
      title: "الملعب غير موجود",
      description: "تعذّر العثور على هذا الملعب. تصفّح قائمة الملاعب المتاحة للحجز.",
      path: `/stadiums/${slug}`,
      noIndex: true,
    });
  }

  const description =
    stadium.description?.trim() ||
    `احجز ${stadium.name} في ${stadium.area}، ${stadium.city}. سعر الصباح ${stadium.morningPrice} ل.س — المساء ${stadium.eveningPrice} ل.س. أرسل طلب حجز وانتظر تأكيد صاحب الملعب.`;

  const images = stadium.coverImage
    ? [{ url: stadium.coverImage, alt: `${stadium.name} — ${stadium.city}` }]
    : undefined;

  return createMetadata({
    title: `${stadium.name} — حجز في ${stadium.city}`,
    description,
    path: `/stadiums/${stadium.slug}`,
    keywords: [
      stadium.name,
      `ملعب ${stadium.city}`,
      stadium.area,
      "حجز ملعب",
      stadium.city,
    ],
    images,
  });
}

export default async function StadiumPage({ params }: Props) {
  const { slug } = await params;
  const stadium = await fetchStadiumBySlug(slug);

  return (
    <>
      {stadium && (
        <>
          <StadiumJsonLd stadium={stadium} />
          <BreadcrumbJsonLd
            items={[
              { name: "الرئيسية", path: "/" },
              { name: "الملاعب", path: "/stadiums" },
              { name: stadium.name, path: `/stadiums/${stadium.slug}` },
            ]}
          />
        </>
      )}
      <StadiumDetailPage slug={slug} />
    </>
  );
}
