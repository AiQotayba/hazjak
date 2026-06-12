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
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "احجز ملعبك — حلب وإدلب",
  description:
    "منصة حجز ملاعب كرة القدم في حلب وإدلب: تصفّح المواعيد، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب.",
  path: "/",
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
