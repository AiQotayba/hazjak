import Link from "next/link";
import { APP_NAME_AR } from "@/lib/brand";
import { createMetadata } from "@/lib/seo";
import { MarketingPageShell } from "@/features/marketing/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createMetadata({
  title: "من نحن",
  description: `${APP_NAME_AR} منصة تربط اللاعبين بأصحاب ملاعب كرة القدم في حلب وإدلب. حجز بسيط وشفاف.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingPageShell
      title="من نحن"
      description={`${APP_NAME_AR} — حجز ملاعب كرة القدم في حلب وإدلب`}
    >
      <Card className="border-0 shadow-soft max-w-2xl">
        <CardContent className="p-6 md:p-8 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            {APP_NAME_AR} منصة لحجز ملاعب كرة القدم في حلب وإدلب. نربط اللاعبين بأصحاب
            الملاعب عبر تجربة حجز بسيطة وشفافة.
          </p>
          <p>
            سواء كنت تبحث عن ملعب لمباراة ودية أو تدير ملعباً وتريد استقبال الحجوزات رقمياً،
            نحن هنا لخدمتك.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="rounded-full shadow-soft" asChild>
              <Link href="/stadiums">تصفح الملاعب</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-0 bg-secondary" asChild>
              <Link href="/owners">لأصحاب الملاعب</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </MarketingPageShell>
  );
}
