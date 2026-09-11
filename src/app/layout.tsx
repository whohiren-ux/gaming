import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CAFE_NAME } from "@/lib/constants";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: `${CAFE_NAME} OS`,
    template: `%s | ${CAFE_NAME}`
  },
  description:
    "Realtime gaming cafe operating system for PS5 and racing wheel lounges.",
  applicationName: CAFE_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: CAFE_NAME,
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  themeColor: "#C20A16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-ink-900 focus:text-white focus:outline-none"
        >
          Skip to main content
        </a>
        <div className="noise-overlay" />
        <AppProviders>
          <SiteHeader />
          <main id="main-content">
            {children}
          </main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
