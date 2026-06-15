import type { MetadataRoute } from "next";
import { fetchStadiumsForSeo, siteUrl } from "@/lib/seo";

const staticRoutes = ["", "/stadiums", "/owners", "/about", "/contact", "/policy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stadiums = await fetchStadiumsForSeo();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/stadiums" ? 0.9 : 0.7,
  }));

  const stadiumEntries: MetadataRoute.Sitemap = stadiums.map((stadium) => ({
    url: `${siteUrl}/stadiums/${stadium.slug}`,
    lastModified: stadium.updatedAt ? new Date(stadium.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...stadiumEntries];
}
