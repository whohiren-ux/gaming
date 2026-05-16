"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, LogIn, Menu, ShieldCheck, X, CalendarCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
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

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* ── Floating Nav Bar ── */}
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
        <div className="w-full max-w-[1100px] flex items-center justify-between gap-4 rounded-full border border-white/[0.08] bg-[#07101a]/90 px-3 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 pl-1">
            <span className="grid size-7 place-items-center rounded-full border border-neon-cyan/30 bg-neon-blue/10 text-neon-cyan">
              <Gamepad2 className="size-3.5" />
            </span>
            <span className="font-display text-[0.82rem] font-bold uppercase tracking-[0.1em] text-white/90">
              Elite Arena
            </span>
          </Link>

          {/* ── Nav Links ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-1.5 font-sans text-[0.8rem] font-medium transition-all duration-200",
                  pathname === item.href
                    ? "text-white"
                    : "text-white/45 hover:text-white/75"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── Right Side ── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 pr-1">
            {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[0.78rem] font-medium text-white/45 hover:text-white/75 transition-colors"
              >
                <ShieldCheck className="size-3.5" />
                Admin
              </Link>
            )}

            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full px-3 py-1.5 font-sans text-[0.78rem] font-medium text-white/40 hover:text-white/65 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[0.78rem] font-medium text-white/40 hover:text-white/65 transition-colors"
              >
                <LogIn className="size-3.5" />
                Login
              </Link>
            )}

            {/* CTA Button — exactly like NOI's orange pill */}
            <Link
              href="/booking"
              className="flex items-center gap-1.5 rounded-full bg-neon-cyan px-5 py-2 font-display text-[0.78rem] font-bold uppercase tracking-wide text-[#030508] shadow-[0_0_18px_rgba(56,232,255,0.4)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(56,232,255,0.6)] hover:scale-[1.04] active:scale-[0.97]"
            >
              <CalendarCheck className="size-3.5" />
              Book Setup
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            aria-label="Toggle navigation"
            className="lg:hidden grid size-8 place-items-center rounded-full border border-white/[0.08] text-white/60 hover:text-white transition-colors mr-1"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* Spacer so content doesn't go under fixed nav */}
      <div className="h-[76px]" />

      {/* ── Mobile Dropdown ── */}
      {open && (
        <div className="fixed inset-x-4 top-[72px] z-49 lg:hidden">
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#060e1a]/96 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

            <div className="p-3 space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 font-sans text-[0.88rem] font-medium transition-all",
                    pathname === item.href
                      ? "text-neon-cyan bg-neon-blue/10"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/[0.05] p-3 flex flex-col gap-2">
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
                    onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                    className="flex-1 rounded-xl border border-white/[0.07] py-2.5 font-sans text-xs text-white/40 hover:text-white/65 transition-colors"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] py-2.5 font-sans text-xs text-white/40 hover:text-white/65 transition-colors"
                  >
                    <LogIn className="size-3.5" />
                    Login
                  </Link>
                )}

                {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-neon-cyan/20 bg-neon-blue/8 py-2.5 font-sans text-xs text-neon-cyan"
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