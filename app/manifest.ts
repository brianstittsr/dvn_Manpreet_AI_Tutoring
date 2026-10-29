import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AICenter4U | AI-Guided Learning for Kids",
    short_name: "AICenter4U",
    description:
      "Friendly AI coaches that help kids learn math, reading, and life skills — with questions and hints, not just answers.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#37ca37",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/aicenter4u-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["business", "productivity"],
    lang: "en-US",
    dir: "ltr",
  };
}
