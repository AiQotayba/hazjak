import type { LucideIcon } from "lucide-react";

export const authInputClass =
  "rounded-2xl border-0 shadow-soft bg-secondary/80 h-11";

type AuthFormShellProps = {
  icon: LucideIcon;
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
    <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-card">
      <div className="mb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-heading">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
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
