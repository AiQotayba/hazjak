import { APP_NAME_AR } from "@beeplay/constants";
import { landingFaqs } from "../data/faq-data";

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

export function LandingJsonLd() {
  const graph = [
    {
      "@type": "Organization",
      name: APP_NAME_AR,
      url: siteUrl,
      description: "منصة حجز ملاعب كرة القدم في فلسطين",
    },
    {
      "@type": "WebSite",
      name: APP_NAME_AR,
      url: siteUrl,
      inLanguage: "ar",
    },
    {
      "@type": "SoftwareApplication",
      name: APP_NAME_AR,
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "ILS",
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
