import type { MetadataRoute } from "next";

import { CAFE_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${CAFE_NAME} Operating System`,
    short_name: "Neon Nexus",
    description: "Installable gaming cafe management app with realtime bookings and sessions.",
    start_url: "/",
    display: "standalone",
    background_color: "#030508",
    theme_color: "#00A3FF",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
