"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, RadioTower } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LiveSetupCounter } from "@/components/marketing/live-setup-counter";

export function HeroArena() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frame = 0;
    let animationId = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = Math.max(560, window.innerHeight * 0.82) * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${Math.max(560, window.innerHeight * 0.82)}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = Math.max(560, window.innerHeight * 0.82);
      frame += 1;
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#030508");
      gradient.addColorStop(0.42, "#07111f");
      gradient.addColorStop(0.72, "#0A1018");
      gradient.addColorStop(1, "#030508");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const sweep = (Math.sin(frame / 90) + 1) / 2;
      const railGradient = context.createLinearGradient(0, height * 0.18, width, height * 0.64);
      railGradient.addColorStop(0, "rgba(0, 163, 255, 0)");
      railGradient.addColorStop(0.32, `rgba(0, 163, 255, ${0.08 + sweep * 0.05})`);
      railGradient.addColorStop(0.58, `rgba(43, 255, 136, ${0.05 + sweep * 0.04})`);
      railGradient.addColorStop(1, "rgba(255, 61, 113, 0)");
      context.fillStyle = railGradient;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(width / 2, height * 0.78);
      context.strokeStyle = "rgba(56, 232, 255, 0.22)";
      context.lineWidth = 1;
      context.shadowColor = "rgba(0, 163, 255, 0.26)";
      context.shadowBlur = 8;
      for (let i = -32; i <= 32; i += 1) {
        const offset = (frame * 0.95) % 30;
        context.beginPath();
        context.moveTo(i * 42, -height * 0.64);
        context.lineTo(i * 190, 126);
        context.stroke();

        context.beginPath();
        context.moveTo(-width, -i * 19 + offset);
        context.lineTo(width, -i * 19 + offset);
        context.stroke();
      }
      context.restore();

      context.save();
      context.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const y = height * (0.34 + i * 0.08);
        const alpha = 0.08 + i * 0.025;
        context.strokeStyle = `rgba(255, 176, 32, ${alpha})`;
        context.beginPath();
        context.moveTo(width * 0.08, y);
        context.lineTo(width * 0.92, y + Math.sin(frame / 80 + i) * 10);
        context.stroke();
      }
      context.restore();

      for (let i = 0; i < 8; i += 1) {
        const x = (width / 8) * i + 48;
        const pulse = (Math.sin(frame / 34 + i * 0.9) + 1) / 2;
        const podHeight = 112 + pulse * 24;
        context.fillStyle = `rgba(56, 232, 255, ${0.08 + pulse * 0.13})`;
        context.strokeStyle = `rgba(56, 232, 255, ${0.22 + pulse * 0.34})`;
        context.shadowColor = "rgba(56, 232, 255, 0.28)";
        context.shadowBlur = 16;
        context.beginPath();
        context.roundRect(x, height * 0.26 + pulse * 18, 76, podHeight, 12);
        context.fill();
        context.stroke();

        context.shadowBlur = 0;
        context.fillStyle = i % 3 === 0 ? "rgba(43, 255, 136, 0.55)" : "rgba(255, 176, 32, 0.48)";
        context.fillRect(x + 14, height * 0.26 + pulse * 18 + 14, 28, 3);
      }

      context.fillStyle = "rgba(0, 0, 0, 0.28)";
      context.fillRect(0, 0, width, height);

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden border-b border-neon-blue/15">
      <canvas ref={canvasRef} className="absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-950 to-transparent" />
      <div className="container grid min-h-[82svh] items-center gap-10 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-neon-blue/30 bg-neon-blue/10 px-3 py-1 text-sm text-neon-cyan">
            <RadioTower className="size-4" />
            Realtime PS5, PS4, and PC lounge control
          </div>
          <h1 className="text-balance text-5xl font-black leading-tight tracking-normal text-white drop-shadow-[0_0_24px_rgba(56,232,255,0.28)] sm:text-6xl lg:text-7xl">
            Neon Nexus Gaming Cafe
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Premium cyber lounge booking, live setup tracking, session timers, memberships,
            tournaments, and payments in one realtime operating system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-neon">
              <Link href="/booking">
                Book a setup
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/availability">
                <Gamepad2 />
                Live availability
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="neon-border rounded-lg"
        >
          <LiveSetupCounter />
        </motion.div>
      </div>
    </section>
  );
}
