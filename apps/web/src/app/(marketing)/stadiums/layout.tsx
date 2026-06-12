import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "الملاعب — حلب وإدلب",
  description:
    "تصفّح ملاعب كرة القدم في حلب وإدلب. قارن الأسعار وأرسل طلب حجز — صاحب الملعب يؤكّد الموعد.",
  path: "/stadiums",
});

export default function StadiumsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
