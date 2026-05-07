"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  Receipt,
  Shield,
  Trophy,
  Users
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sessions", label: "Sessions", icon: CalendarClock },
  { href: "/admin/setups", label: "Setups", icon: Gamepad2 },
  { href: "/admin/bookings", label: "Bookings", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/memberships", label: "Memberships", icon: Shield },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/users", label: "Users", icon: Users }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-neon-blue/10 bg-ink-950/95 p-4 backdrop-blur-xl lg:block">
        <Link href="/admin" className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md border border-neon-blue/40 bg-neon-blue/10 text-neon-cyan">
            <Gamepad2 className="size-5" />
          </span>
          <div>
            <p className="font-black text-white">Neon Nexus</p>
            <p className="text-xs text-muted-foreground">Cafe Operating System</p>
          </div>
        </Link>
        <nav className="grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-neon-blue/10 hover:text-foreground",
                pathname === item.href && "bg-neon-blue/12 text-neon-cyan"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          className="absolute bottom-4 left-4 right-4"
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut />
          Sign out
        </Button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-neon-blue/10 bg-ink-950/80 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-6">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Admin panel</p>
              <h1 className="text-lg font-bold text-white">Realtime operations</h1>
            </div>
            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {navItems.slice(0, 5).map((item) => (
                <Button key={item.href} asChild size="icon" variant={pathname === item.href ? "default" : "ghost"}>
                  <Link href={item.href} aria-label={item.label}>
                    <item.icon />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
