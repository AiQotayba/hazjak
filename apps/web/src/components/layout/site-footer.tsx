import Link from "next/link";
import Image from "next/image";

import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";

const columns = [
  {
    title: "المنصة",
    links: [
      { href: "/stadiums", label: "الملاعب" },
      { href: "/owners", label: "لأصحاب الملاعب" },
      { href: "/#how-it-works", label: "كيف يعمل" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/policy", label: "سياسة الإلغاء" },
      { href: "/about", label: "من نحن" },
      { href: "/contact", label: "تواصل" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-accent/40 to-background">
      <div className="page-container py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20 shadow-soft transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-primary">{APP_NAME_AR}</p>
                <p className="text-xs text-primary/70 font-medium">حجز ملاعبك بسهولة</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mt-4">
              حجز ملاعب كرة القدم في {APP_CITIES.join(" و")} — مواعيد واضحة وتأكيد من صاحب
              الملعب.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-bold text-heading text-sm mb-3">{col.title}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 pt-6 border-t border-border/80 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME_AR} · جميع الحقوق محفوظة · بُني بكل حب في سوريا
        </p>
      </div>
    </footer>
  );
}
