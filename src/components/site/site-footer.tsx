import Link from "next/link";

import { CAFE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-ink-950/80">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-white/90">{CAFE_NAME}</h3>
            <p className="text-xs text-white/40">
              Premium gaming experience with PS5, PS4, and racing wheel setups.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/booking" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Book a Setup
                </Link>
              </li>
              <li>
                <Link href="/availability" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Live Availability
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/memberships" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Memberships
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Events</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tournaments" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} {CAFE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
