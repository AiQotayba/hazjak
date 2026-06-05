import Link from "next/link";
import { StadiumCard } from "@/features/stadium/components/stadium-card";
import { api } from "@/lib/api";
import { Section, SectionHeading } from "./section";

interface StadiumCardData {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  morningPrice: number;
  eveningPrice: number;
  coverImage?: string | null;
  averageRating?: number;
  reviewCount?: number;
}

async function getFeaturedStadiums() {
  try {
    const res = await api<StadiumCardData[]>(
      "/stadiums?limit=6&sortBy=createdAt&order=desc"
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function LandingFeaturedStadiums() {
  const stadiums = await getFeaturedStadiums();

  return (
    <Section id="stadiums">
      <div className="flex items-end justify-between gap-4 mb-4">
        <SectionHeading
          className="mb-0"
          title="ملاعب متاحة الآن"
          description="حجز مباشر من المنصة — الأسعار محدثة من أصحاب الملاعب."
        />
        <Link
          href="/stadiums"
          className="shrink-0 text-xs text-primary font-bold hover:underline"
        >
          عرض الكل
        </Link>
      </div>
      {stadiums.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stadiums.map((s: StadiumCardData) => (
            <StadiumCard key={s.id} {...s} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8 rounded-3xl border border-dashed border-border/60">
          لا توجد ملاعب معروضة حالياً — شغّل الخادم ونفّذ{" "}
          <code className="text-xs bg-secondary px-1.5 py-0.5 rounded-lg">pnpm db:seed</code>
        </p>
      )}
    </Section>
  );
}
