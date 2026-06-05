import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card className="border-0 bg-none shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-2 text-3xl opacity-50">{icon ?? "📭"}</div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
        {actionLabel && actionHref && (
          <Button className="mt-4" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
