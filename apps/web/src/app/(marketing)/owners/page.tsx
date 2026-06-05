import {
  OwnerHero,
  OwnerValueStrip,
  OwnerFeatures,
  OwnerPricing,
  OwnerSteps,
  OwnerFinalCta,
} from "@/features/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بي بلاي | سجّل ملعبك — حلب وإدلب",
  description:
    "لوحة تحكم لأصحاب ملاعب كرة القدم في حلب وإدلب: قبول الحجوزات، التقويم، والإحصائيات.",
};

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
