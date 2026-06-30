import type { MetadataRoute } from "next";

import { CAFE_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${CAFE_NAME} Operating System`,
    short_name: CAFE_NAME,
    description: "Installable gaming cafe management app with realtime bookings and sessions.",
    start_url: "/",
    display: "standalone",
    background_color: "#030508",
    theme_color: "#C20A16",
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
