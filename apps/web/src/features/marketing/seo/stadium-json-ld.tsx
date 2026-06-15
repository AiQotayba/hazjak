import type { StadiumSeoData } from "@/lib/seo";
import { siteUrl } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function StadiumJsonLd({ stadium }: { stadium: StadiumSeoData }) {
  const url = `${siteUrl}/stadiums/${stadium.slug}`;
  const image = stadium.coverImage?.trim() || `${siteUrl}/logo.png`;

  const schema: Record<string, unknown> = {
    "@type": "SportsActivityLocation",
    "@id": `${url}#stadium`,
    name: stadium.name,
    url,
    image,
    description:
      stadium.description?.trim() ||
      `${stadium.name} في ${stadium.area}، ${stadium.city}. احجز عبر ${siteUrl}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: stadium.address || stadium.area,
      addressLocality: stadium.city,
      addressRegion: stadium.area,
      addressCountry: "SY",
    },
    priceRange: `${stadium.morningPrice} - ${stadium.eveningPrice} SYP`,
    sport: "كرة قدم",
  };

  if (stadium.latitude != null && stadium.longitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: stadium.latitude,
      longitude: stadium.longitude,
    };
  }

  if (stadium.averageRating && stadium.averageRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: stadium.averageRating,
      reviewCount: stadium.reviewCount ?? 1,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return <JsonLd data={schema} />;
}
