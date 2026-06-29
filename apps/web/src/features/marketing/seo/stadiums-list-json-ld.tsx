import { APP_COUNTRY_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { locationLabel, fetchStadiumsForSeo, siteUrl } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export async function StadiumsListJsonLd() {
  const stadiums = await fetchStadiumsForSeo();

  if (stadiums.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@type": "ItemList",
        name: `ملاعب كرة القدم في ${locationLabel}`,
        description: `قائمة ملاعب ${APP_NAME_AR} المتاحة للحجز في ${APP_COUNTRY_AR}`,
        numberOfItems: stadiums.length,
        itemListElement: stadiums.map((stadium, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: stadium.name,
          url: `${siteUrl}/stadiums/${stadium.slug}`,
        })),
      }}
    />
  );
}
