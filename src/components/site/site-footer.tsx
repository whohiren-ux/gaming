import Link from "next/link";
import { Gamepad2 } from "lucide-react";

import { CAFE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#0066ff]/10 bg-[#030508]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg border border-[#0066ff]/20 bg-[#0066ff]/10 text-[#00d4ff]">
                <Gamepad2 className="size-4" />
              </span>
              <span className="font-brand text-sm font-bold tracking-wider text-white/90">{CAFE_NAME}</span>
            </div>
            <p className="text-xs leading-relaxed text-white/30">
              Premium gaming experience with PS5 and racing wheel setups. Real-time booking and live session tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#00d4ff]/60">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "/booking", label: "Book a Setup" },
                { href: "/availability", label: "Live Availability" },
                { href: "/pricing", label: "Pricing" },
                { href: "/memberships", label: "Memberships" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-white/30 transition-colors hover:text-[#00d4ff]/70">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ff0033]/60">Events</h4>
            <ul className="space-y-3">
              {[
                // { href: "/tournaments", label: "Tournaments" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-white/30 transition-colors hover:text-[#ff0033]/70">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Account</h4>
            <ul className="space-y-3">
              {[
                { href: "/login", label: "Sign In" },
                { href: "/register", label: "Create Account" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-white/30 transition-colors hover:text-white/60">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/5 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} {CAFE_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="status-dot" />
              <span className="text-xs text-[#00ff88]/50">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
