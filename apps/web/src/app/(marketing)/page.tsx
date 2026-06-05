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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بي بلاي | احجز ملعبك — حلب وإدلب",
  description:
    "منصة حجز ملاعب كرة القدم في حلب وإدلب: تصفّح المواعيد، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب.",
};

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
