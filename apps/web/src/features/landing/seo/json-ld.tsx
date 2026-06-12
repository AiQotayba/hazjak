import { APP_CITIES } from "@beeplay/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { citiesLabel, siteUrl } from "@/lib/seo";
import { landingFaqs } from "../data/faq-data";

export function LandingJsonLd() {
  const graph = [
    {
      "@type": "Organization",
      name: APP_NAME_AR,
      url: siteUrl,
      description: `منصة حجز ملاعب كرة القدم في ${citiesLabel}، سوريا`,
      areaServed: APP_CITIES.map((city) => ({
        "@type": "City",
        name: city,
      })),
    },
    {
      "@type": "WebSite",
      name: APP_NAME_AR,
      url: siteUrl,
      inLanguage: "ar-SY",
    },
    {
      "@type": "SoftwareApplication",
      name: APP_NAME_AR,
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "SYP",
        description: "تصفح مجاني — دفع العربون عند تأكيد الحجز",
      },
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
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
