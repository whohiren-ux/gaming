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
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = Math.max(520, window.innerHeight * 0.82) * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${Math.max(520, window.innerHeight * 0.82)}px`;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = Math.max(520, window.innerHeight * 0.82);
      frame += 1;
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#030508");
      gradient.addColorStop(0.55, "#07111f");
      gradient.addColorStop(1, "#030508");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(width / 2, height * 0.76);
      context.strokeStyle = "rgba(0, 163, 255, 0.22)";
      context.lineWidth = 1;
      for (let i = -28; i <= 28; i += 1) {
        const offset = (frame * 0.8) % 28;
        context.beginPath();
        context.moveTo(i * 44, -height * 0.7);
        context.lineTo(i * 180, 120);
        context.stroke();

        context.beginPath();
        context.moveTo(-width, -i * 18 + offset);
        context.lineTo(width, -i * 18 + offset);
        context.stroke();
      }
      context.restore();

      for (let i = 0; i < 7; i += 1) {
        const x = (width / 7) * i + 60;
        const pulse = (Math.sin(frame / 35 + i) + 1) / 2;
        context.fillStyle = `rgba(56, 232, 255, ${0.08 + pulse * 0.14})`;
        context.beginPath();
        context.roundRect(x, height * 0.28 + pulse * 20, 96, 132, 14);
        context.fill();
        context.strokeStyle = `rgba(56, 232, 255, ${0.2 + pulse * 0.3})`;
        context.stroke();
      }

      context.fillStyle = "rgba(0, 0, 0, 0.35)";
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
    <section className="relative isolate overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 -z-10" aria-hidden="true" />
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
          <h1 className="text-balance text-5xl font-black leading-tight tracking-normal text-white sm:text-6xl lg:text-7xl">
            Neon Nexus Gaming Cafe
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Premium cyber lounge booking, live setup tracking, session timers, memberships,
            tournaments, and payments in one realtime operating system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
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
