import {
  OwnerHero,
  OwnerValueStrip,
  OwnerFeatures,
  OwnerPricing,
  OwnerSteps,
  OwnerFinalCta,
} from "@/features/landing";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "سجّل ملعبك — حلب وإدلب",
  description:
    "لوحة تحكم لأصحاب ملاعب كرة القدم في حلب وإدلب: قبول الحجوزات، التقويم، والإحصائيات.",
  path: "/owners",
});

export default function OwnersLandingPage() {
  return (
    <>
      <OwnerHero />
      <OwnerValueStrip />
      <OwnerFeatures />
      <OwnerPricing />
      <OwnerSteps />
      <OwnerFinalCta />
    </>
  );
}
