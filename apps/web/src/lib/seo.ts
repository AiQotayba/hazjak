import type { Metadata } from "next";
import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";

export const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
export const citiesLabel = APP_CITIES.join(" و");
export const ogImage = `${siteUrl}/logo.png`;

export function createMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME_AR,
      locale: "ar_SY",
      type: "website",
      images: [{ url: ogImage, width: 512, height: 512, alt: APP_NAME_AR }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImage],
    },
  };
}

interface StadiumSeoData {
  name: string;
  slug: string;
  city: string;
  area: string;
  description?: string;
  morningPrice: number;
  eveningPrice: number;
}

export async function fetchStadiumBySlug(slug: string): Promise<StadiumSeoData | null> {
  try {
    const res = await fetch(`${apiUrl}/stadiums/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: StadiumSeoData };
    return json.data ?? null;
  } catch {
    return null;
  }
}

interface StadiumListItem {
  slug: string;
  updatedAt?: string;
}

export async function fetchStadiumSlugs(): Promise<StadiumListItem[]> {
  try {
    const res = await fetch(`${apiUrl}/stadiums?limit=50`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: StadiumListItem[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}
