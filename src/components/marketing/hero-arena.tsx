"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, Shield, Zap, Users, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiveSetupCounter } from "@/components/marketing/live-setup-counter";

const STATS = [
  { icon: Zap, label: "Avg Session", value: "2.4h" },
  { icon: Users, label: "Members", value: "1,200+" },
  { icon: Clock, label: "Open Daily", value: "16h" },
];

const TRUST_BADGES = [
  { icon: Shield, text: "Safe & Secure Zone" },
  { icon: Gamepad2, text: "Comfort Gaming" },
];

export function HeroArena() {
  return (
    <section className="relative isolate overflow-hidden">

      {/* ── Scanline texture overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#030508]" />

        {/* Blue bloom top-left */}
        <div
          className="absolute -left-60 -top-60 h-[900px] w-[900px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,163,255,0.20) 0%, transparent 65%)",
            filter: "blur(70px)",
          }}
        />

        {/* Cyan streak right */}
        <div
          className="absolute -right-20 top-0 h-full w-[500px]"
          style={{
            background: "linear-gradient(180deg, rgba(56,232,255,0.06) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#030508] to-transparent" />
      </div>

      {/* ── Top accent line ── */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#38e8ff] to-transparent opacity-50" />

      <div className="container py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ══ LEFT ══ */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Live pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#38e8ff]/25 bg-[#38e8ff]/6 px-4 py-1.5">
              <span className="status-dot" />
              <span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#38e8ff]">
                PS5 · PS4 · Racing Wheel · Live
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-[clamp(3.2rem,7.5vw,6rem)] font-black uppercase leading-[0.88] tracking-tight">
              <span className="block text-white drop-shadow-[0_0_40px_rgba(56,232,255,0.25)]">
                Elite
              </span>
              <span
                className="block"
                style={{
                  background: "linear-gradient(95deg, #38e8ff 0%, #00a3ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 28px rgba(56,232,255,0.45))",
                }}
              >
                Arena
              </span>
            </h1>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-lg border border-[#00a3ff]/18 bg-[#00a3ff]/6 px-3.5 py-2"
                >
                  <Icon className="size-3.5 text-[#38e8ff]" />
                  <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-[#38e8ff]">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 font-display text-sm font-bold uppercase tracking-wider shadow-neon"
              >
                <Link href="/booking">
                  Book a Setup
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 font-display text-sm font-bold uppercase tracking-wider"
              >
                <Link href="/availability">
                  <Gamepad2 className="size-4" />
                  Live Availability
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center gap-10 border-t border-white/[0.06] pt-8">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span
                    className="font-display text-3xl font-black"
                    style={{
                      background: "linear-gradient(90deg, #ffffff 0%, #38e8ff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {value}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-widest text-white/32">
                    <Icon className="size-3" />
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ══ RIGHT — Live card ══ */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow behind card */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-35"
              style={{
                background: "radial-gradient(ellipse at 50% 40%, #00a3ff 0%, transparent 70%)",
                filter: "blur(55px)",
              }}
            />

            {/* Corner brackets */}
            <div className="pointer-events-none absolute -left-px -top-px h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 border-[#38e8ff]/50" />
            <div className="pointer-events-none absolute -bottom-px -right-px h-8 w-8 rounded-br-2xl border-b-2 border-r-2 border-[#38e8ff]/50" />

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050d18]/90 shadow-[0_40px_100px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38e8ff]/60 to-transparent" />

              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#38e8ff] shadow-[0_0_6px_#38e8ff]" />
                  <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/38">
                    Live Lounge Pulse
                  </span>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-[#2bff88]/20 bg-[#2bff88]/8 px-2.5 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-wider text-[#2bff88]">
                  <span className="status-dot" />
                  Live
                </span>
              </div>

              <div className="p-5">
                <LiveSetupCounter />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}