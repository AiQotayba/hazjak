import Image from "next/image";
import Link from "next/link";
import { APP_MOTTO_AR, APP_TAGLINE_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { cn } from "@/lib/utils";

type AuthBrandProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showMotto?: boolean;
  showTagline?: boolean;
  linkToHome?: boolean;
};

const logoSizes = {
  sm: { box: "h-10 w-10", img: 32, name: "text-lg" },
  md: { box: "h-12 w-12", img: 40, name: "text-xl" },
  lg: { box: "h-14 w-14", img: 48, name: "text-2xl" },
} as const;

export function AuthBrand({
  className,
  size = "md",
  showMotto = false,
  showTagline = true,
  linkToHome = true,
}: AuthBrandProps) {
  const s = logoSizes[size];

  const content = (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20 shadow-soft transition-transform",
          s.box,
          linkToHome && "group-hover:scale-105"
        )}
      >
        <Image src="/logo.png" alt="" width={s.img} height={s.img} className="h-[80%] w-[80%]" />
      </div>
      <div className="min-w-0">
        <p className={cn("font-display font-bold text-primary", s.name)}>{APP_NAME_AR}</p>
        {showMotto && (
          <p className="mt-1 font-display text-base font-semibold text-heading">{APP_MOTTO_AR}</p>
        )}
        {showTagline && (
          <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{APP_TAGLINE_AR}</p>
        )}
      </div>
    </>
  );

  const wrapperClass = cn("inline-flex items-center gap-3", linkToHome && "group", className);

  if (linkToHome) {
    return (
      <Link href="/" className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
