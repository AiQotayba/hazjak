import type { MetadataRoute } from "next";
import { APP_COUNTRY_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { locationLabel } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${APP_NAME_AR} — حجز ملاعب في ${locationLabel}`,
    short_name: APP_NAME_AR,
    description: `منصة حجز ملاعب كرة القدم في ${APP_COUNTRY_AR}`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    lang: "ar",
    dir: "rtl",
    categories: ["sports", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
