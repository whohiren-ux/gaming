"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, RadioTower, Zap, Users, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiveSetupCounter } from "@/components/marketing/live-setup-counter";

const STATS = [
  { icon: Zap, label: "Avg Session", value: "2.4h" },
  { icon: Users, label: "Members", value: "1,200+" },
  { icon: Clock, label: "Open Daily", value: "16h" },
];

export function HeroArena() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base dark */}
        <div className="absolute inset-0 bg-[#030508]" />

        {/* Subtle blue glow — top left */}
        <div
          className="absolute -left-40 -top-40 h-[680px] w-[680px] rounded-full opacity-[0.18]"
          style={{
            background: "radial-gradient(circle, #00a3ff 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Faint cyan glow — center right */}
        <div
          className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full opacity-[0.10]"
          style={{
            background: "radial-gradient(circle, #38e8ff 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#030508] to-transparent" />
      </div>

      {/* ── Thin accent line — top ── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      <div className="container py-24 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* ── LEFT: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-neon-blue/25 bg-neon-blue/8 px-4 py-1.5">
              <RadioTower className="size-3.5 text-neon-cyan" />
              <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-neon-cyan">
                Realtime PS5, PS4 &amp; Racing Wheel Control
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-[clamp(2.6rem,6vw,5rem)] font-black leading-[0.95] tracking-tight text-white">
              Elite Arena
              <br />
            
            </h1>

            {/* Body */}
            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-white/52">
              Premium cyber lounge booking, live setup tracking, session timers,
              memberships, tournaments, and payments — in one realtime operating system.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-neon gap-2">
                <Link href="/booking">
                  Book a Setup
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/availability">
                  <Gamepad2 className="size-4" />
                  Live Availability
                </Link>
              </Button>
            </div>

            {/* Inline stats strip */}
            <div className="mt-14 flex items-center gap-8 border-t border-white/[0.07] pt-8">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="font-display text-2xl font-black text-white">{value}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-white/38">
                    <Icon className="size-3 opacity-60" />
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Live counter card ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Card glow */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-30"
              style={{
                background: "radial-gradient(ellipse at 50% 30%, #00a3ff 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#07101a]/80 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              {/* Top shimmer line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />

              {/* Header bar */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-white/40">
                  Live Lounge Pulse
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-neon-green/10 px-2.5 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-neon-green">
                  <span className="status-dot" />
                  Live
                </span>
              </div>

              <div className="p-6">
                <LiveSetupCounter />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
