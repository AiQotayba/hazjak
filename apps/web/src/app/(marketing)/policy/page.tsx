import { createMetadata } from "@/lib/seo";
import { MarketingPageShell } from "@/features/marketing/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = createMetadata({
  title: "سياسة الإلغاء والعربون",
  description:
    "قواعد الإلغاء واسترداد العربون قبل تأكيد الحجز. إلغاء قبل 24 ساعة من موعد المباراة.",
  path: "/policy",
});

export default function PolicyPage() {
  return (
    <MarketingPageShell
      title="سياسة الإلغاء والعربون"
      description="قواعد واضحة قبل ما ترسل طلب الحجز"
    >
      <Card className="border-0 shadow-soft max-w-2xl">
        <CardContent className="p-6 md:p-8 space-y-5 text-muted-foreground leading-relaxed text-sm">
          <p>
            يمكنك إلغاء الحجز قبل <strong className="text-heading">24 ساعة</strong> على الأقل
            من موعد المباراة المؤكد لاسترداد العربون كاملاً.
          </p>
          <p>
            الإلغاء خلال أقل من 24 ساعة قد يؤدي إلى فقدان العربون وفق اتفاق الملعب.
          </p>
          <p>
            طلبات الحجز تبقى <strong className="text-heading">قيد الانتظار</strong> حتى يؤكدها
            صاحب الملعب. تنتهي صلاحية الطلبات غير المؤكدة خلال 15 دقيقة إن لم يُفعّل الحجز الفوري.
          </p>
          <p>
            بعد تأكيد الحجز، ستصلك إشعارات تذكير قبل 24 ساعة وقبل ساعتين من الموعد.
          </p>
        </CardContent>
      </Card>
    </MarketingPageShell>
  );
}
