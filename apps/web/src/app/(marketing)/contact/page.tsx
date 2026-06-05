import { MarketingPageShell } from "@/features/marketing/components/page-shell";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

import { Mail, MapPin, Phone } from "lucide-react";

import { APP_CITIES } from "@beeplay/constants";



export default function ContactPage() {

  return (

    <MarketingPageShell

      title="تواصل معنا"

      description={`فريق الدعم في ${APP_CITIES.join(" و")} — نرد خلال يوم عمل`}

    >

      <Card className="max-w-lg border-0 shadow-card">

        <CardContent className="p-6 space-y-5">

          <CardTitle className="font-display text-heading">فريق الدعم</CardTitle>

          <p className="flex items-center gap-3 text-muted-foreground">

            <Mail className="h-5 w-5 shrink-0 text-primary" />

            support@beeplay.ps

          </p>

          <p className="flex items-center gap-3 text-muted-foreground">

            <Phone className="h-5 w-5 shrink-0 text-primary" />

            +963 XXX XXX XXX

          </p>

          <p className="flex items-center gap-3 text-muted-foreground">

            <MapPin className="h-5 w-5 shrink-0 text-primary" />

            {APP_CITIES.join(" · ")}

          </p>

        </CardContent>

      </Card>

    </MarketingPageShell>

  );

}

