import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { citiesLabel, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/features/marketing/seo/json-ld";
import { landingFaqs } from "../data/faq-data";

export function LandingJsonLd() {
  return (
    <JsonLd
      data={[
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: APP_NAME_AR,
          url: siteUrl,
          inLanguage: "ar-SY",
          description: `منصة حجز ملاعب كرة القدم في ${citiesLabel}، سوريا`,
          publisher: { "@id": `${siteUrl}/#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteUrl}/stadiums?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "WebApplication",
          name: APP_NAME_AR,
          url: siteUrl,
          applicationCategory: "SportsApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript",
          inLanguage: "ar-SY",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "SYP",
            description: "تصفح مجاني — دفع العربون عند تأكيد الحجز",
          },
          areaServed: APP_CITIES.map((city) => ({
            "@type": "City",
            name: city,
          })),
        },
        {
          "@type": "FAQPage",
          mainEntity: landingFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        },
      ]}
    />
  );
}
