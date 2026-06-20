import type { LucideIcon } from "lucide-react";
import { AuthBrand } from "@/features/auth/components/auth-brand";

export const authInputClass =
  "rounded-2xl border-0 shadow-soft bg-secondary/80 h-11";

type AuthFormShellProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthFormShell({
  icon: Icon,
  title,
  description,
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <div className="surface-card p-6 sm:p-8">
      <div className="mb-6">
        <AuthBrand size="sm" showTagline={false} className="mb-5" />
        <div className="flex flex-col items-center gap-3 text-center">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold text-heading">{title}</h1>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      {children}
      {footer}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
      {message}
    </p>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-primary/10 px-3 py-2.5 text-center text-sm font-medium text-primary">
      {message}
    </p>
  );
}
