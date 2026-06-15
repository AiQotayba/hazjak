import {
  LandingHero,
  LandingValueStrip,
  LandingProblem,
  LandingSolution,
  LandingBenefits,
  LandingHowItWorks,
  LandingFeatures,
  LandingMidCta,
  LandingFeaturedStadiums,
  LandingFaq,
  LandingFinalCta,
  LandingJsonLd,
} from "@/features/landing";
import { citiesLabel, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: `احجز ملعب كرة قدم في ${citiesLabel}`,
  description:
    `منصة Hazjak لحجز ملاعب كرة القدم في ${citiesLabel}: تصفّح المواعيد والأسعار، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب خلال دقائق.`,
  path: "/",
  keywords: [
    "حجز ملاعب حلب",
    "حجز ملاعب إدلب",
    "ملاعب كرة قدم",
    "حجز ملعب أونلاين",
    "Hazjak",
  ],
});

export default function HomePage() {
  return (
    <>
      <LandingJsonLd />
      <LandingHero />
      <LandingValueStrip />
      <LandingProblem />
      <LandingSolution />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingMidCta />
      <LandingFeaturedStadiums />
      <LandingFaq />
      <LandingFinalCta />
    </>
  );
}
