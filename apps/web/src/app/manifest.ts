import type { MetadataRoute } from "next";
import { APP_NAME_AR } from "@/lib/brand";
import { citiesLabel, siteUrl } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME_AR} — حجز ملاعب في ${citiesLabel}`,
    short_name: APP_NAME_AR,
    description: `منصة حجز ملاعب كرة القدم في ${citiesLabel}`,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ea580c",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
