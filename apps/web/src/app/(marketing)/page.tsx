import {
  LandingHero,
  LandingStadiumsSection,
  LandingHowItWorks,
  LandingFaq,
  LandingJsonLd,
} from "@/features/landing";
import { locationLabel, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: `احجز ملعب كرة قدم في ${locationLabel}`,
  description:
    `منصة حجزك لحجز ملاعب كرة القدم في ${locationLabel}: تصفّح المواعيد والأسعار، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب خلال دقائق.`,
  path: "/",
  keywords: [
    "حجز ملاعب سوريا",
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
