import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { citiesLabel, siteUrl, supportEmail } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function SiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: APP_NAME_AR,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        email: supportEmail,
        description: `منصة حجز ملاعب كرة القدم في ${citiesLabel}، سوريا`,
        areaServed: APP_CITIES.map((city) => ({
          "@type": "City",
          name: city,
          containedInPlace: { "@type": "Country", name: "سوريا" },
        })),
      }}
    />
  );
}
