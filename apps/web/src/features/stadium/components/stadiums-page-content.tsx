"use client";

import { Suspense } from "react";
import { StadiumsBrowse } from "@/features/stadium/components/stadiums-browse";
import { StadiumsBrowseSkeleton } from "@/components/layout/page-skeletons";

type StadiumsPageContentProps = {
  basePath?: string;
  title?: string;
  description?: string;
};

export function StadiumsPageContent({
  basePath = "/stadiums",
  title,
  description,
}: StadiumsPageContentProps) {
  return (
    <Suspense fallback={<StadiumsBrowseSkeleton />}>
      <StadiumsBrowse basePath={basePath} title={title} description={description} />
    </Suspense>
  );
}
