"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** رأس صفحة + محتوى — للمستخدم وصاحب الملعب داخل AppTabShell */
export function PageShell({ title, description, action, children, className }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      <PageHeader title={title} description={description} action={action} />
      {children}
    </motion.div>
  );
}

type MarketingPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hero?: boolean;
};

/** غلاف صفحات التسويق الثابتة (من نحن، تواصل، سياسة) */
export function MarketingPageLayout({
  title,
  description,
  children,
  className,
  hero = true,
}: MarketingPageLayoutProps) {
  return (
    <div className={cn("min-h-[50vh] bg-background", className)}>
      {hero && (
        <div className="border-b border-border bg-background">
          <div className="page-container py-10 md:py-12">
            <PageHeader title={title} description={description} />
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="page-container py-8 md:py-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
