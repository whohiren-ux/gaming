import Link from "next/link";
import { CalendarDays, ChevronRight, Crown, Flame, ShieldCheck, Trophy, Zap, Gamepad2, Headphones, Monitor, Swords, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SETUP_TYPE_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import type { getMembershipPlans } from "@/lib/membership-service";
import type { getPublicPricing } from "@/lib/setup-service";

type Pricing = Awaited<ReturnType<typeof getPublicPricing>>;
type Plans = Awaited<ReturnType<typeof getMembershipPlans>>;

export function FeaturedGames() {
  const games = [
    { name: "EA Sports FC 26", icon: Gamepad2, color: "#0066ff" },
    { name: "Tekken 8", icon: Swords, color: "#ff0033" },
    { name: "Mortal Kombat 1", icon: Flame, color: "#ff0033" },
    { name: "Call of Duty", icon: Monitor, color: "#0066ff" },
    { name: "GTA Online", icon: Zap, color: "#00d4ff" },
    { name: "Fortnite", icon: Crown, color: "#00ff88" },
  ];

  return (
    <section className="container py-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <span className="section-label">Games Library</span>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-white">Built for the games people actually queue for</h2>
          <p className="mt-2 text-sm text-white/40">From competitive shooters to casual sports - we got it all</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div
            key={game.name}
            className="group gaming-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/30">Now Available</p>
                <h3 className="mt-2 text-xl font-bold text-white group-hover:text-[#00d4ff] transition-colors">{game.name}</h3>
              </div>
              <div
                className="grid size-12 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${game.color}15, ${game.color}08)`,
                  border: `1px solid ${game.color}25`,
                }}
              >
                <game.icon className="size-5" style={{ color: game.color }} />
              </div>
            </div>
            {/* Bottom accent line */}
            <div
              className="mt-4 h-0.5 w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Zero Double Booking",
      text: "Every online slot, walk-in session, and buffer window is checked server-side. No conflicts, no confusion.",
      color: "#0066ff"
    },
    {
      icon: Zap,
      title: "Instant Front Desk",
      text: "Start, extend, pause, switch, settle, and stop sessions from one live screen. Speed is everything.",
      color: "#ff0033"
    },
    {
      icon: Crown,
      title: "Smart Pricing",
      text: "Monthly, VIP, and prepaid hour packages apply discounts and remaining credits automatically.",
      color: "#00d4ff"
    }
  ];

  return (
    <section className="border-y border-[#0066ff]/10 bg-[#060a12]/80 py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <span className="section-label justify-center">Why Choose Us</span>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-white">The gaming experience you deserve</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="group gaming-card rounded-xl p-8 text-center"
            >
              <div
                className="mx-auto grid size-14 place-items-center rounded-2xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                  border: `1px solid ${item.color}25`,
                }}
              >
                <item.icon className="size-6" style={{ color: item.color }} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/40">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingCards({ pricing }: { pricing: Pricing }) {
  return (
    <section className="container py-16">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="section-label">Pricing</span>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-white">Console and racing wheel rates</h2>
          <p className="mt-2 text-sm text-white/40">Transparent pricing, no hidden charges</p>
        </div>
        <Button asChild variant="outline" className="border-[#0066ff]/30 hover:bg-[#0066ff]/10">
          <Link href="/pricing">
            Full pricing
            <ChevronRight />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {pricing.map((item, index) => (
          <div
            key={item.type}
            className={`group gaming-card rounded-xl p-6 ${index === 1 ? 'border-[#0066ff]/30 shadow-[0_0_30px_rgba(0,102,255,0.1)]' : ''}`}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#0066ff] to-[#0044cc] px-4 py-1 text-xs font-bold text-white">
                POPULAR
              </div>
            )}
            <div className="mb-4 flex items-center gap-3">
              <div
                className="grid size-10 place-items-center rounded-lg"
                style={{
                  background: index === 0 ? 'rgba(0,102,255,0.1)' : index === 1 ? 'rgba(255,0,51,0.1)' : 'rgba(0,212,255,0.1)',
                  border: `1px solid ${index === 0 ? 'rgba(0,102,255,0.2)' : index === 1 ? 'rgba(255,0,51,0.2)' : 'rgba(0,212,255,0.2)'}`,
                }}
              >
                {index === 0 ? <Gamepad2 className="size-5 text-[#0066ff]" /> : index === 1 ? <Headphones className="size-5 text-[#ff0033]" /> : <Monitor className="size-5 text-[#00d4ff]" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{SETUP_TYPE_LABELS[item.type]}</h3>
                <p className="text-xs text-white/40">{item.setupCount} setups live</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-black text-white">
                {formatINR(item.minHourlyPrice)}
                <span className="text-sm font-medium text-white/40">/hr</span>
              </p>
              {item.maxHourlyPrice !== item.minHourlyPrice ? (
                <p className="mt-2 text-sm text-white/40">
                  VIP pods up to {formatINR(item.maxHourlyPrice)}/hr
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GtaBanner() {
  return (
    <section className="container py-8">
      <div className="relative overflow-hidden rounded-2xl border border-[#0066ff]/20 bg-gradient-to-r from-[#060a12] via-[#0a1020] to-[#060a12] p-8 shadow-gaming-glow lg:p-10">
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        {/* Glow effects */}
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#0066ff]/20 blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#ff0033]/15 blur-[60px]" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="section-label">
              <Flame className="size-3" />
              Featured
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-normal text-white">GTA 6 Launch Night</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Create hype-night blocks, VIP packages, controller bundles, and tournament slots
              without losing regular booking control.
            </p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-[#0066ff] to-[#0044cc] hover:from-[#0077ff] hover:to-[#0055dd] border-0 shadow-[0_0_30px_rgba(0,102,255,0.3)]">
            <Link href="/booking">
              Reserve Launch Slot
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function TournamentSection() {
  return (
    <section className="container py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="section-label">Events</span>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-white">Run tournaments like a serious esports venue</h2>
          <p className="mt-4 text-white/40">
            Publish events, collect entry fees, track registrations, and keep peak-hour setups protected.
          </p>
          <Button asChild className="mt-6 border-[#0066ff]/30 hover:bg-[#0066ff]/10" variant="outline">
            <Link href="/tournaments">View Events</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Bracket Night", prize: "5,000", icon: Trophy, color: "#FFB020" },
            { name: "Duo Royale", prize: "3,000", icon: Swords, color: "#0066ff" },
            { name: "FC Friday", prize: "2,000", icon: Gamepad2, color: "#00ff88" }
          ].map((event) => (
            <div
              key={event.name}
              className="group gaming-card rounded-xl p-5 text-center"
            >
              <div
                className="mx-auto grid size-12 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${event.color}10`,
                  border: `1px solid ${event.color}25`,
                }}
              >
                <event.icon className="size-5" style={{ color: event.color }} />
              </div>
              <h3 className="mt-4 font-bold text-white">{event.name}</h3>
              <p className="mt-1 text-xs text-white/40">Prize Pool</p>
              <p className="mt-1 text-lg font-bold" style={{ color: event.color }}>
                ₹{event.prize}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const testimonials = [
    { quote: "Clean setups, real-time booking, zero waiting confusion. Best gaming lounge in town.", name: "Rohan", role: "Regular Player" },
    { quote: "The VIP PS5 pod feels premium and the timer is crystal clear. Worth every rupee.", name: "Meera", role: "VIP Member" },
    { quote: "Tournament nights finally run on schedule. The live tracking is a game changer.", name: "Kabir", role: "Tournament Organizer" },
  ];

  return (
    <section className="border-y border-[#0066ff]/10 bg-[#060a12]/80 py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <span className="section-label justify-center">Testimonials</span>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-white">What our players say</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="gaming-card rounded-xl p-6">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="size-1.5 rounded-full bg-[#FFB020]" />
                ))}
              </div>
              <p className="text-sm leading-6 text-white/60">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#0066ff] to-[#ff0033] text-xs font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MembershipPreview({ plans }: { plans: Plans }) {
  return (
    <section className="container py-16">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <span className="section-label">Memberships</span>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-white">Packages for regular players</h2>
          <p className="mt-2 text-sm text-white/40">Save more with membership plans</p>
        </div>
        <Button asChild variant="outline" className="border-[#0066ff]/30 hover:bg-[#0066ff]/10">
          <Link href="/memberships">All Plans</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.slice(0, 3).map((plan) => (
          <div
            key={plan.id}
            className={`group gaming-card rounded-xl p-6 ${plan.priorityBooking ? 'border-[#0066ff]/30 shadow-[0_0_30px_rgba(0,102,255,0.1)]' : ''}`}
          >
            {plan.priorityBooking && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#0066ff]/10 border border-[#0066ff]/20 px-3 py-1 text-xs font-bold text-[#00d4ff]">
                <Crown className="size-3" />
                Priority
              </div>
            )}
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <div className="mt-4">
              <p className="text-4xl font-black text-white">{formatINR(plan.price)}</p>
              <p className="mt-2 text-sm text-white/40">
                {Math.floor(plan.includedMinutes / 60)} hours included · {plan.discountPercent}% discount
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BookingCta() {
  return (
    <section className="container pb-16 pt-8">
      <div className="relative overflow-hidden rounded-2xl border border-[#0066ff]/20 bg-gradient-to-br from-[#0066ff]/5 via-[#060a12] to-[#ff0033]/5 p-10 text-center shadow-gaming-glow">
        {/* Background glow */}
        <div className="absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#0066ff]/15 blur-[60px]" />
        <div className="absolute -right-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#ff0033]/10 blur-[60px]" />

        <div className="relative">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#0066ff]/10 border border-[#0066ff]/20">
            <CalendarDays className="size-7 text-[#00d4ff]" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-normal text-white">Lock your next session now</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/50">
            See live setup states, choose duration, pay token or full amount, and get a QR confirmation.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/booking">
              Book Online
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
