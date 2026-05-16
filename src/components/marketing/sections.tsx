import Link from "next/link";
import { CalendarDays, ChevronRight, Crown, Flame, ShieldCheck, Trophy, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SETUP_TYPE_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import type { getMembershipPlans } from "@/lib/membership-service";
import type { getPublicPricing } from "@/lib/setup-service";

type Pricing = Awaited<ReturnType<typeof getPublicPricing>>;
type Plans = Awaited<ReturnType<typeof getMembershipPlans>>;

export function FeaturedGames() {
  const games = ["EA Sports FC 26", "Tekken 8", "Mortal Kombat 1", "Call of Duty", "GTA Online", "Fortnite"];

  return (
    <section className="container py-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Badge variant="outline">Featured Games</Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-normal">Built for the games people actually queue for</h2>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <Card key={game} className="group overflow-hidden">
            <CardContent className="relative p-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-green opacity-70" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Station ready</p>
                  <h3 className="mt-2 text-xl font-bold text-white">{game}</h3>
                </div>
                <span className="grid size-11 place-items-center rounded-md border border-neon-blue/30 bg-neon-blue/10 text-neon-cyan transition group-hover:shadow-neon-sm">
                  {index % 2 === 0 ? <Zap /> : <Flame />}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const items = [
    {
      icon: ShieldCheck,
      title: "No double booking",
      text: "Every online slot, walk-in session, and buffer window is checked server-side."
    },
    {
      icon: Zap,
      title: "Fast front desk flow",
      text: "Start, extend, pause, switch, settle, and stop sessions from one live screen."
    },
    {
      icon: Crown,
      title: "Membership-aware pricing",
      text: "Monthly, VIP, and prepaid hour packages apply discounts and remaining credits."
    }
  ];

  return (
    <section className="border-y border-neon-blue/10 bg-ink-900/45 py-14">
      <div className="container grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <item.icon className="size-7 text-neon-cyan" />
            <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingCards({ pricing }: { pricing: Pricing }) {
  return (
    <section className="container py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge variant="outline">Pricing</Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-normal">Console and racing wheel rates</h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/pricing">
            Full pricing
            <ChevronRight />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {pricing.map((item) => (
          <Card key={item.type} className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>{SETUP_TYPE_LABELS[item.type]}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.setupCount} setups live</p>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-black text-white">
                {formatINR(item.minHourlyPrice)}
                <span className="text-sm font-medium text-muted-foreground">/hr</span>
              </p>
              {item.maxHourlyPrice !== item.minHourlyPrice ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  VIP pods up to {formatINR(item.maxHourlyPrice)}/hr
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function GtaBanner() {
  return (
    <section className="container py-8">
      <div className="relative overflow-hidden rounded-lg border border-neon-blue/25 bg-ink-950 p-8 shadow-neon-sm">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,163,255,.18),transparent_45%,rgba(43,255,136,.12))]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge variant="warning">Featured Banner</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-normal text-white">GTA 6 launch lounge reservations</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create hype-night blocks, VIP packages, controller bundles, and tournament slots
              without losing regular booking control.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/booking">Reserve launch slot</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function TournamentSection() {
  return (
    <section className="container py-14">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Badge variant="outline">Events</Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-normal">Run tournaments like a serious esports venue</h2>
          <p className="mt-4 text-muted-foreground">
            Publish events, collect entry fees, track registrations, and keep peak-hour setups protected.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/tournaments">View events</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
            {["Bracket Night", "Duo Royale", "FC Friday"].map((event) => (
              <div key={event} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <Trophy className="size-6 text-neon-amber" />
                <h3 className="mt-4 font-bold text-white">{event}</h3>
                <p className="mt-2 text-xs text-muted-foreground">Prize pool, entries, and reminders ready.</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-neon-blue/10 bg-ink-900/45 py-14">
      <div className="container grid gap-4 md:grid-cols-3">
        {[
          ["Clean setups, real-time booking, zero waiting confusion.", "Rohan"],
          ["The VIP PS5 pod feels premium and the timer is crystal clear.", "Meera"],
          ["Tournament nights finally run on schedule.", "Kabir"]
        ].map(([quote, name]) => (
          <Card key={name}>
            <CardContent className="p-5">
              <p className="text-sm leading-6 text-muted-foreground">“{quote}”</p>
              <p className="mt-4 font-semibold text-white">{name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function MembershipPreview({ plans }: { plans: Plans }) {
  return (
    <section className="container py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Badge variant="outline">Memberships</Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-normal">Packages for regular players</h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/memberships">All plans</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.slice(0, 3).map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{plan.name}</CardTitle>
                {plan.priorityBooking ? <Badge variant="success">Priority</Badge> : null}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-white">{formatINR(plan.price)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {Math.floor(plan.includedMinutes / 60)} hours included · {plan.discountPercent}% discount
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function BookingCta() {
  return (
    <section className="container pb-16 pt-8">
      <div className="rounded-lg border border-neon-blue/25 bg-neon-blue/10 p-8 text-center shadow-neon-sm">
        <CalendarDays className="mx-auto size-8 text-neon-cyan" />
        <h2 className="mt-4 text-3xl font-black tracking-normal text-white">Lock your next session now</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          See live setup states, choose duration, pay token or full amount, and get a QR confirmation.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/booking">Book online</Link>
        </Button>
      </div>
    </section>
  );
}
