"use client";

import Link from "next/link";
import { ArrowRight, Gift, LineChart, Users } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { KineticButton } from "@/components/ui/kinetic-button";

export function WelcomeView() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-violet-base">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <PaaveWordmark />
        <span className="font-pretendard text-[11px] uppercase tracking-pulse text-lime-signal-400">
          Account minted
        </span>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pt-16 pb-12 text-center">
        {/* Logo badge */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[40px] bg-lime-signal-400/10 blur-3xl"
          />
          <div className="relative grid size-28 place-items-center rounded-[32px] border border-border-neo bg-ink-violet-raised">
            <span className="font-pretendard text-[40px] italic font-bold leading-none tracking-[-2px] text-lime-signal-400">
              ✶
            </span>
          </div>
          <span className="absolute -right-2 -bottom-2 rounded-xl bg-lime-signal-400 px-3 py-1 font-pretendard text-[12px] uppercase tracking-pulse text-ink-violet-base shadow-card">
            You&apos;re In
          </span>
        </div>

        {/* Live badge */}
        <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-border-neo bg-ink-violet-raised/60 px-4 py-1.5 backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-lime-signal-400" />
          <span className="font-pretendard text-[11px] uppercase tracking-pulse text-lime-signal-400">
            Welcome to the alpha
          </span>
        </span>

        {/* Heading */}
        <h1 className="mt-6 max-w-lg font-pretendard text-[48px] font-bold leading-[1.05] tracking-[-2.2px] text-text-neo-primary sm:text-[56px]">
          Chào mừng,
          <br />
          <span className="text-lime-signal-400">Trader.</span>
        </h1>
        <p className="mt-5 max-w-md text-[17px] leading-[1.62] text-text-neo-secondary">
          Your ledger is live. We&apos;ve seeded it with virtual capital so you
          can learn the vibe before you risk the real thing.
        </p>

        {/* Balance card */}
        <div className="mt-10 w-full max-w-[520px] rounded-[32px] border border-border-neo bg-ink-violet-surface p-8">
          <p className="font-pretendard text-[11px] uppercase tracking-drop text-text-neo-secondary">
            Virtual Balance · Starter Drop
          </p>
          <p className="mt-3 font-pretendard text-[44px] font-bold tracking-[-1.8px] text-text-neo-primary tabular">
            ₫500.000.000
          </p>
          <p className="mt-2 text-[13px] text-text-neo-secondary">
            ≈ $20,000 in paper-trading credit. Spend it, learn from it, reset
            anytime.
          </p>
        </div>

        {/* Feature bullets */}
        <ul className="mt-8 grid w-full max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-3">
          <FeatureBullet
            icon={<LineChart className="size-4" strokeWidth={2} />}
            label="VN · KR · Global markets"
            accent="lime"
          />
          <FeatureBullet
            icon={<Users className="size-4" strokeWidth={2} />}
            label="Community pulse threads"
            accent="violet"
          />
          <FeatureBullet
            icon={<Gift className="size-4" strokeWidth={2} />}
            label="Weekly streak rewards"
            accent="peach"
          />
        </ul>

        {/* CTA */}
        <div className="mt-10 w-full max-w-[320px]">
          <Link href="/onboarding/nationality" className="block">
            <KineticButton>
              Bắt đầu khám phá
              <ArrowRight
                className="size-5 text-ink-violet-base"
                strokeWidth={2.5}
                aria-hidden
              />
            </KineticButton>
          </Link>
          <Link
            href="/home"
            className="mt-4 inline-block font-pretendard text-[12px] uppercase tracking-pulse text-text-neo-secondary transition-colors hover:text-text-neo-primary"
          >
            Skip setup · go straight to ledger
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureBullet({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent: "lime" | "violet" | "peach";
}) {
  const iconStyle = {
    lime: "bg-gradient-lime text-ink-violet-base",
    violet: "bg-gradient-violet text-white",
    peach: "bg-gradient-peach text-white",
  }[accent];

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border-neo bg-ink-violet-raised/60 px-4 py-3 text-left backdrop-blur">
      <span className={`grid size-8 place-items-center rounded-lg ${iconStyle}`}>
        {icon}
      </span>
      <span className="font-pretendard text-[12px] uppercase tracking-pulse text-text-neo-primary">
        {label}
      </span>
    </li>
  );
}
