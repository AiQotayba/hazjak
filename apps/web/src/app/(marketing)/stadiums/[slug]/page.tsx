import type { Metadata } from "next";
import { createMetadata, fetchStadiumBySlug } from "@/lib/seo";
import { StadiumDetailPage } from "./stadium-detail-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stadium = await fetchStadiumBySlug(slug);

  if (!stadium) {
    return createMetadata({
      title: "الملعب غير موجود",
      description: "تعذّر العثور على هذا الملعب.",
      path: `/stadiums/${slug}`,
    });
  }

  const description =
    stadium.description?.trim() ||
    `${stadium.name} في ${stadium.area}، ${stadium.city}. سعر الصباح ${stadium.morningPrice} — المساء ${stadium.eveningPrice}. أرسل طلب حجز وانتظر تأكيد صاحب الملعب.`;

  return createMetadata({
    title: `${stadium.name} — حجز في ${stadium.city}`,
    description,
    path: `/stadiums/${slug}`,
  });
}

export default async function StadiumPage({ params }: Props) {
  const { slug } = await params;
  return <StadiumDetailPage slug={slug} />;
}
