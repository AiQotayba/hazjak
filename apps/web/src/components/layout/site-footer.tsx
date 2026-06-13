import Link from "next/link";

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

    <footer className="mt-auto border-t border-border bg-background">

      <div className="mx-auto max-w-6xl px-4 py-12">

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-2">

            <p className="font-display text-xl font-bold text-heading mb-2">

              {APP_NAME_AR}

            </p>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">

              حجز ملاعب كرة القدم في {APP_CITIES.join(" و")} — مواعيد واضحة وتأكيد

              من صاحب الملعب.

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

        <p className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">

          © {new Date().getFullYear()} {APP_NAME_AR} — حلب وإدلب

        </p>

      </div>

    </footer>

  );

}

