import { APP_COUNTRY_AR } from "@hazjak/constants";

import { APP_NAME_AR } from "@/lib/brand";

import { locationLabel, siteUrl, supportEmail } from "@/lib/seo";

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

        description: `منصة حجز ملاعب كرة القدم في ${locationLabel}`,

        areaServed: { "@type": "Country", name: APP_COUNTRY_AR },

      }}

    />

  );

}

