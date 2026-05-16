import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site/site-header";
import { CAFE_NAME } from "@/lib/constants";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: `${CAFE_NAME} OS`,
    template: `%s | ${CAFE_NAME}`
  },
  description:
    "Realtime gaming cafe operating system for PS5, PS4, and racing wheel lounges.",
  applicationName: CAFE_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: CAFE_NAME,
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#030508",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="noise-overlay" />
        <AppProviders>
          <SiteHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
