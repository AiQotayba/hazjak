import { APP_NAME_AR } from "@beeplay/constants";

import { MarketingPageShell } from "@/features/marketing/components/page-shell";

import { Card, CardContent } from "@/components/ui/card";



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

        </CardContent>

      </Card>

    </MarketingPageShell>

  );

}

