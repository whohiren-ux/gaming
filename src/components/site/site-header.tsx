"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, LogIn, Menu, ShieldCheck, X, CalendarCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/availability", label: "Availability" },
  { href: "/memberships", label: "Memberships" },
  { href: "/tournaments", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* Thin cyan accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />

        <div className="bg-[#030508]/85 backdrop-blur-2xl border-b border-white/[0.05]">
          <div className="container flex h-[60px] items-center justify-between gap-4">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
            >
              <span className="grid size-8 place-items-center rounded-lg border border-neon-blue/35 bg-neon-blue/10 text-neon-cyan shadow-neon-sm">
                <Gamepad2 className="size-4" />
              </span>
              <span className="font-display text-[0.95rem] font-bold uppercase tracking-[0.08em] text-white hidden sm:inline">
                Elite Arena
              </span>
            </Link>

            {/* ── Desktop Nav — pill container ── */}
            <nav className="hidden lg:flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 font-display text-[0.78rem] font-semibold uppercase tracking-wider transition-all duration-200",
                    pathname === item.href
                      ? "bg-neon-blue/15 text-neon-cyan"
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
                  )}
                >
                  {pathname === item.href && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-neon-cyan/70 to-transparent" />
                  )}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop Right ── */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
                <Button asChild variant="outline" size="sm" className="gap-1.5 font-display text-xs uppercase tracking-wider">
                  <Link href="/admin">
                    <ShieldCheck className="size-3.5" />
                    Admin
                  </Link>
                </Button>
              )}

              {session?.user ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="font-display text-xs uppercase tracking-wider text-white/35 hover:text-white/60 transition-colors px-2"
                >
                  Sign out
                </button>
              ) : (
                <Button asChild variant="ghost" size="sm" className="gap-1.5 font-display text-xs uppercase tracking-wider text-white/45 hover:text-white">
                  <Link href="/login">
                    <LogIn className="size-3.5" />
                    Login
                  </Link>
                </Button>
              )}

              {/* CTA */}
              <Link
                href="/booking"
                className="relative inline-flex items-center gap-2 rounded-full bg-neon-cyan px-5 py-2 font-display text-[0.75rem] font-bold uppercase tracking-wider text-[#030508] shadow-[0_0_20px_rgba(56,232,255,0.35)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(56,232,255,0.55)] hover:scale-[1.03] active:scale-[0.98]"
              >
                <CalendarCheck className="size-3.5" />
                Book Setup
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              aria-label="Toggle navigation"
              className="lg:hidden grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 hover:text-white transition-colors"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="fixed inset-x-0 top-[61px] z-39 lg:hidden">
          <div className="mx-3 mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060e1a]/95 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
            {/* Top shimmer */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

            <div className="p-3 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-all",
                    pathname === item.href
                      ? "bg-neon-blue/12 text-neon-cyan"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="border-t border-white/[0.05] p-3 flex flex-col gap-2">
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-neon-cyan py-3 font-display text-sm font-bold uppercase tracking-wider text-[#030508] shadow-[0_0_20px_rgba(56,232,255,0.3)]"
              >
                <CalendarCheck className="size-4" />
                Book a Setup
              </Link>

              <div className="flex gap-2">
                {session?.user ? (
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white/45 hover:text-white/70 transition-colors"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white/45 hover:text-white/70 transition-colors"
                  >
                    <LogIn className="size-3.5" />
                    Login
                  </Link>
                )}

                {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-neon-blue/20 bg-neon-blue/8 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-neon-cyan"
                  >
                    <ShieldCheck className="size-3.5" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}