import {
  LandingHero,
  LandingStadiumsSection,
  LandingHowItWorks,
  LandingFaq,
  LandingJsonLd,
} from "@/features/landing";
import { citiesLabel, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: `احجز ملعب كرة قدم في ${citiesLabel}`,
  description:
    `منصة حجزك لحجز ملاعب كرة القدم في ${citiesLabel}: تصفّح المواعيد والأسعار، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب خلال دقائق.`,
  path: "/",
  keywords: [
    "حجز ملاعب حلب",
    "حجز ملاعب إدلب",
    "ملاعب كرة قدم",
    "حجز ملعب أونلاين",
    "حجزك",
  ],
});

export default function HomePage() {
  return (
    <>
      <LandingJsonLd />
      <LandingHero browseHref="#stadiums" />
      <LandingStadiumsSection />
      <LandingHowItWorks compact />
      <LandingFaq compact />
    </>
  );
}
