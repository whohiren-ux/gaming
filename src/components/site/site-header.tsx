"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Gamepad2, LogIn, Menu, ShieldCheck, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

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
  const isHome = pathname === "/";

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div className="relative w-full max-w-[1100px]">
          <div className="pointer-events-none absolute -inset-x-7 -inset-y-4 rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(56,232,255,0.26),rgba(0,163,255,0.12)_38%,transparent_72%)] opacity-80 blur-2xl" />

          <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-2 shadow-[0_0_0_1px_rgba(56,232,255,0.05),0_18px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(90deg,rgba(56,232,255,0.11),rgba(255,255,255,0.035)_45%,rgba(0,163,255,0.10))]" />
            <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/65 to-transparent" />

            <Link href="/" className="relative flex shrink-0 items-center gap-2.5 pl-1">
              <span className="grid size-7 place-items-center rounded-full border border-neon-cyan/30 bg-neon-blue/10 text-neon-cyan">
                <Gamepad2 className="size-3.5" />
              </span>
              <span className="font-display text-[0.82rem] font-bold uppercase tracking-[0.1em] text-white/90">
                Elite Arena
              </span>
            </Link>

            <nav className="relative hidden items-center gap-0.5 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 font-sans text-[0.8rem] font-medium transition-all duration-200 hover:bg-white/[0.035]",
                    pathname === item.href
                      ? "bg-white/[0.055] text-white shadow-[inset_0_0_0_1px_rgba(56,232,255,0.16),0_0_16px_rgba(56,232,255,0.12)]"
                      : "text-white/45 hover:text-white/75"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="relative hidden shrink-0 items-center gap-2 pr-1 lg:flex">
              {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[0.78rem] font-medium text-white/45 transition-colors hover:bg-white/[0.035] hover:text-white/75"
                >
                  <ShieldCheck className="size-3.5" />
                  Admin
                </Link>
              )}

              {session?.user ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full px-3 py-1.5 font-sans text-[0.78rem] font-medium text-white/40 transition-colors hover:bg-white/[0.035] hover:text-white/65"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[0.78rem] font-medium text-white/40 transition-colors hover:bg-white/[0.035] hover:text-white/65"
                >
                  <LogIn className="size-3.5" />
                  Login
                </Link>
              )}

              <Link
                href="/booking"
                className="flex items-center gap-1.5 rounded-full bg-neon-cyan px-5 py-2 font-display text-[0.78rem] font-bold uppercase tracking-wide text-[#030508] shadow-[0_0_18px_rgba(56,232,255,0.42),0_0_42px_rgba(0,163,255,0.18)] transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_28px_rgba(56,232,255,0.62),0_0_70px_rgba(0,163,255,0.22)] active:scale-[0.97]"
              >
                <CalendarCheck className="size-3.5" />
                Book Setup
              </Link>
            </div>

            <button
              aria-label="Toggle navigation"
              className="relative mr-1 grid size-8 place-items-center rounded-full border border-white/[0.08] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white lg:hidden"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {!isHome && <div className="h-[76px]" />}

      {open && (
        <div className="fixed inset-x-4 top-[72px] z-[49] lg:hidden">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060e1a]/88 shadow-[0_20px_60px_rgba(0,0,0,0.46),0_0_34px_rgba(56,232,255,0.12)] backdrop-blur-2xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

            <div className="space-y-0.5 p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 font-sans text-[0.88rem] font-medium transition-all",
                    pathname === item.href
                      ? "bg-neon-blue/10 text-neon-cyan"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-white/[0.05] p-3">
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-neon-cyan py-3 font-display text-sm font-bold uppercase tracking-wider text-[#030508] shadow-[0_0_18px_rgba(56,232,255,0.3)]"
              >
                <CalendarCheck className="size-4" />
                Book a Setup
              </Link>

              <div className="flex gap-2">
                {session?.user ? (
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setOpen(false);
                    }}
                    className="flex-1 rounded-xl border border-white/[0.07] py-2.5 font-sans text-xs text-white/40 transition-colors hover:text-white/65"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] py-2.5 font-sans text-xs text-white/40 transition-colors hover:text-white/65"
                  >
                    <LogIn className="size-3.5" />
                    Login
                  </Link>
                )}

                {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neon-cyan/20 bg-neon-blue/[0.08] py-2.5 font-sans text-xs text-neon-cyan"
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
