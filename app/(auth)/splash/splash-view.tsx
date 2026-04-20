"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingUp, Zap } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { KineticButton } from "@/components/ui/kinetic-button";

export function SplashView() {
  const [pct, setPct] = useState(12);

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (p >= 75 ? 75 : p + 2));
    }, 90);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-ink-900">
      <AmbientBackground />

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[40px] bg-lime-soft/20 blur-3xl"
          />
          <div className="relative grid h-[184px] w-[184px] place-items-center rounded-[40px] border border-edge bg-ink-600 shadow-card">
            <span className="font-display text-[60px] italic font-bold leading-none tracking-[-3px] text-lime-soft">
              pv
            </span>
            <span className="absolute right-4 top-4 size-2 rounded-full bg-lime animate-pulse-glow" />
          </div>
        </div>

        <h1 className="mt-12 font-display text-[44px] font-bold leading-[1.1] tracking-[-2px] text-lime-soft sm:text-[56px]">
          Learn. Trade.{" "}
          <span className="relative inline-block">
            <span className="text-plasma">Level Up.</span>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-[4px] w-full rounded-full bg-plasma-drop"
            />
          </span>
        </h1>

        <p className="mt-5 max-w-md font-body text-[17px] leading-[1.62] text-fog">
          The ultimate paper trading arena for the next gen of investors.
          Vietnam. Korea. Global. Zero real-money risk.
        </p>

        <div className="mt-16 w-full max-w-[420px]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-display text-[12px] uppercase tracking-drop text-plasma">
              <Zap
                className="size-3.5 fill-plasma stroke-plasma"
                strokeWidth={2}
                aria-hidden
              />
              Synchronizing Ledger
            </span>
            <span className="font-display text-[12px] uppercase tracking-pulse text-fog">
              {pct}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-600">
            <div
              className="h-full rounded-full bg-plasma-drop transition-[width] duration-200"
              style={{
                width: `${pct}%`,
                backgroundImage:
                  "linear-gradient(90deg, #D277FF 0%, #CAFD00 100%)",
              }}
            />
          </div>
        </div>

        <div className="mt-12 w-full max-w-[320px]">
          <Link href="/sign-up" className="block">
            <KineticButton aria-label="Get started">
              Get Started
              <TrendingUp
                className="size-5 text-lime-ink"
                strokeWidth={2.5}
                aria-hidden
              />
            </KineticButton>
          </Link>
          <p className="mt-5 font-display text-[11px] uppercase tracking-pulse text-fog-muted">
            Encrypted · v1.0.4-beta · kinetic protocol
          </p>
        </div>
      </section>
    </main>
  );
}
