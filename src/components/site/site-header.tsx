"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, LogIn, Menu, ShieldCheck, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/booking", label: "Book" },
  { href: "/availability", label: "Availability" },
  { href: "/memberships", label: "Memberships" },
  { href: "/tournaments", label: "Events" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neon-blue/10 bg-ink-950/78 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-normal">
          <span className="grid size-9 place-items-center rounded-md border border-neon-blue/40 bg-neon-blue/10 text-neon-cyan shadow-neon-sm">
            <Gamepad2 className="size-5" />
          </span>
          <span className="hidden sm:inline">Neon Nexus</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-neon-blue/10 hover:text-foreground",
                pathname === item.href && "bg-neon-blue/10 text-neon-cyan"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session?.user?.role === "ADMIN" || session?.user?.role === "STAFF" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ShieldCheck />
                Admin
              </Link>
            </Button>
          ) : null}
          {session?.user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn />
                Login
              </Link>
            </Button>
          )}
        </div>

        <Button
          aria-label="Toggle navigation"
          className="lg:hidden"
          size="icon"
          variant="ghost"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-neon-blue/10 bg-ink-950 lg:hidden">
          <div className="container grid gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-neon-blue/10 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {session?.user ? (
                <Button className="flex-1" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              ) : (
                <Button asChild className="flex-1">
                  <Link href="/login">Login</Link>
                </Button>
              )}
              {session?.user?.role === "ADMIN" || session?.user?.role === "STAFF" ? (
                <Button asChild className="flex-1" variant="outline">
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
