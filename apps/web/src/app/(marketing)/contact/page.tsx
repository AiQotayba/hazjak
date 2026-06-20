import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { citiesLabel, createMetadata, supportEmail } from "@/lib/seo";
import { BreadcrumbJsonLd, JsonLd } from "@/features/marketing/seo";
import { MarketingPageShell } from "@/features/marketing/components/page-shell";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";

export const metadata = createMetadata({
  title: "تواصل معنا",
  description: `تواصل مع فريق دعم ${APP_NAME_AR} في ${citiesLabel}. البريد: ${supportEmail} — نرد خلال يوم عمل.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", path: "/" },
          { name: "تواصل معنا", path: "/contact" },
        ]}
      />
      <JsonLd
        data={{
          "@type": "ContactPage",
          name: `تواصل مع ${APP_NAME_AR}`,
          description: `صفحة التواصل مع فريق دعم ${APP_NAME_AR} في ${citiesLabel}`,
          mainEntity: {
            "@type": "Organization",
            name: APP_NAME_AR,
            email: supportEmail,
            areaServed: APP_CITIES.map((city) => ({ "@type": "City", name: city })),
          },
        }}
      />
      <MarketingPageShell
      title="تواصل معنا"
      description={`فريق الدعم في ${APP_CITIES.join(" و")} — نرد خلال يوم عمل`}
    >
      <Card className="surface-card max-w-lg">
        <CardContent className="p-6 space-y-5">
          <CardTitle className="font-display text-heading">فريق الدعم</CardTitle>
          <p className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-5 w-5 shrink-0 text-primary" />
            <a href="mailto:support@hazjak.sy" className="hover:text-primary transition-colors">
              support@hazjak.sy
            </a>
          </p>
          <p className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            {APP_CITIES.join(" · ")}
          </p>
        </CardContent>
      </Card>
    </MarketingPageShell>
    </>
  );
}
