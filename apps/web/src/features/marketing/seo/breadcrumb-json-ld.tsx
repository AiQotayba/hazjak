import { buildBreadcrumbSchema, type BreadcrumbItem } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLd data={buildBreadcrumbSchema(items)} />;
}
