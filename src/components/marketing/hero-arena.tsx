"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, Shield, Zap, Users, Clock, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandName } from "@/components/common/brand-name";
import { LiveSetupCounter } from "@/components/marketing/live-setup-counter";

const STATS = [
  { icon: Zap, label: "Avg Session", value: "2.4h" },
  { icon: Users, label: "Members", value: "1,200+" },
  { icon: Clock, label: "Open Daily", value: "16h" },
];

const TRUST_BADGES = [
  { icon: Shield, text: "Secure Zone" },
  { icon: Gamepad2, text: "Premium Setups" },
  { icon: Wifi, text: "Live Tracking" },
];

export function HeroArena() {
  return (
    <section className="relative isolate overflow-hidden bg-grid-pattern">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#030508]" />

        {/* Blue glow top-left */}
        <div
          className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,102,255,0.2) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        {/* Red glow bottom-right */}
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,0,51,0.15) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        {/* Cyan accent top-right */}
        <div
          className="absolute -right-20 top-0 h-[500px] w-[400px]"
          style={{
            background: "linear-gradient(180deg, rgba(0,212,255,0.06) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#030508] to-transparent" />
      </div>

      <div className="container pb-16 pt-28 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            {/* Live pill */}
            <div className="mb-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#0066ff]/30 bg-[#0066ff]/8 px-3 py-2 lg:inline-flex lg:w-auto lg:justify-start lg:px-4 lg:py-1.5">
              <span className="status-dot" />
              <span className="whitespace-nowrap font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#00d4ff] min-[390px]:text-[0.68rem] lg:text-[0.68rem] lg:tracking-[0.18em]">
                PS5 -  Racing Wheel - Live
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-full overflow-visible text-balance">
              <BrandName className="brand-name-hero" />
            </h1>

            {/* Sub heading */}
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/50 lg:text-lg">
              Premium gaming lounge with real-time booking, live session tracking, and instant payments. 
              Your next gaming session is one click away.
            </p>

            {/* Trust badges */}
            <div className="mt-7 grid grid-cols-3 gap-2.5 lg:flex lg:flex-wrap">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-lg border border-[#0066ff]/20 bg-[#0066ff]/8 px-3 py-2 text-center lg:min-h-0 lg:justify-start lg:px-3.5"
                >
                  <Icon className="size-3.5 text-[#00d4ff]" />
                  <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#00d4ff] min-[390px]:text-[0.68rem] lg:tracking-wider">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 grid w-full max-w-[390px] gap-3 lg:flex lg:max-w-none lg:flex-wrap">
              <Button
                asChild
                size="lg"
                className="h-14 w-full justify-center gap-2 font-display text-sm font-bold uppercase tracking-wider shadow-neon lg:h-12 lg:w-auto bg-gradient-to-r from-[#0066ff] to-[#0044cc] hover:from-[#0077ff] hover:to-[#0055dd] border-0"
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
                className="h-14 w-full justify-center gap-2 font-display text-sm font-bold uppercase tracking-wider border-[#0066ff]/30 hover:bg-[#0066ff]/10 hover:border-[#0066ff]/50 lg:h-12 lg:w-auto"
              >
                <Link href="/availability">
                  <Gamepad2 className="size-4" />
                  Live Availability
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-8 lg:flex lg:items-center lg:gap-10">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex min-w-0 flex-col gap-1 lg:min-w-fit">
                  <span
                    className="font-display text-[clamp(1.9rem,9vw,3rem)] font-black lg:text-3xl stat-number"
                  >
                    {value}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-white/32 min-[390px]:text-[0.62rem] lg:tracking-widest">
                    <Icon className="size-3" />
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Live card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow behind card */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-30"
              style={{
                background: "radial-gradient(ellipse at 50% 40%, #0066ff 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />

            {/* Corner brackets */}
            <div className="pointer-events-none absolute -left-px -top-px h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-[#0066ff]/50" />
            <div className="pointer-events-none absolute -bottom-px -right-px h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-[#ff0033]/50" />

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#040810]/95 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              {/* Top shimmer */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0066ff]/70 to-transparent" />

              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_6px_#00d4ff]" />
                  <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/38">
                    Live Lounge Pulse
                  </span>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/8 px-2.5 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-wider text-[#00ff88]">
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
