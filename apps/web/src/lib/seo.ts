import type { Metadata } from "next";
import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";

export const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
export const citiesLabel = APP_CITIES.join(" و");
export const ogImage = `${siteUrl}/logo.png`;
export const supportEmail = "support@hazjak.sy";

export const DEFAULT_KEYWORDS = [
  "حجز ملاعب",
  "ملاعب كرة قدم",
  "حجز ملعب",
  "ملعب كرة قدم",
  "حلب",
  "إدلب",
  "سوريا",
  APP_NAME_AR,
  "حجز ملعب أونلاين",
  "ملاعب خماسيات",
];

const defaultRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export function createMetadata({
  title,
  description,
  path = "",
  keywords,
  noIndex = false,
  images,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
}): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImages = images ?? [
    { url: ogImage, width: 512, height: 512, alt: `${APP_NAME_AR} — حجز ملاعب في ${citiesLabel}` },
  ];

  return {
    title,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : defaultRobots,
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME_AR,
      locale: "ar_SY",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((image) => image.url),
    },
  };
}

export interface StadiumSeoData {
  name: string;
  slug: string;
  city: string;
  area: string;
  address?: string;
  description?: string;
  morningPrice: number;
  eveningPrice: number;
  coverImage?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  averageRating?: number;
  reviewCount?: number;
  updatedAt?: string;
}

export interface StadiumListSeoItem {
  name: string;
  slug: string;
  updatedAt?: string;
}

export async function fetchStadiumBySlug(slug: string): Promise<StadiumSeoData | null> {
  try {
    const res = await fetch(`${apiUrl}/stadiums/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: StadiumSeoData & { reviews?: unknown[] } };
    const stadium = json.data;
    if (!stadium) return null;
    return {
      ...stadium,
      reviewCount: stadium.reviewCount ?? stadium.reviews?.length ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchStadiumsForSeo(): Promise<StadiumListSeoItem[]> {
  try {
    const res = await fetch(`${apiUrl}/stadiums?limit=50`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: StadiumListSeoItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

/** @deprecated Use fetchStadiumsForSeo */
export async function fetchStadiumSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  const stadiums = await fetchStadiumsForSeo();
  return stadiums.map(({ slug, updatedAt }) => ({ slug, updatedAt }));
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
