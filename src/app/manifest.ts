import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} - Ship Your SaaS in Days, Not Months`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/logo/main/pwa-64x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/logo/main/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo/main/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo/main/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
