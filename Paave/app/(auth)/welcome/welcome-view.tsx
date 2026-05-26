"use client";

import Link from "next/link";
import { ArrowRight, Gift, LineChart, Users } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { KineticButton } from "@/components/ui/kinetic-button";

export function WelcomeView() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <PaaveWordmark />
        <span className="font-display text-[11px] uppercase tracking-pulse text-plasma">
          Account minted
        </span>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pt-16 pb-12 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 rounded-[40px] bg-lime-soft/20 blur-3xl"
          />
          <div className="relative grid size-28 place-items-center rounded-[32px] border border-edge bg-ink-600">
            <span className="font-display text-[40px] italic font-bold leading-none tracking-[-2px] text-lime-soft">
              ✶
            </span>
          </div>
          <span className="absolute -right-2 -bottom-2 rounded-xl bg-plasma px-3 py-1 font-display text-[12px] uppercase tracking-pulse text-plasma-ink shadow-card">
            You&apos;re In
          </span>
        </div>

        <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-edge bg-ink-600/60 px-4 py-1.5 backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-lime" />
          <span className="font-display text-[11px] uppercase tracking-pulse text-plasma">
            Welcome to the alpha · Minh
          </span>
        </span>

        <h1 className="mt-6 max-w-lg font-display text-[48px] font-bold leading-[1.05] tracking-[-2.2px] text-lime-soft sm:text-[56px]">
          Chào mừng,
          <br />
          <span className="text-lime">Minh.</span>
        </h1>
        <p className="mt-5 max-w-md font-body text-[17px] leading-[1.62] text-fog">
          Your ledger is live. We&apos;ve seeded it with virtual capital so you
          can learn the vibe before you risk the real thing.
        </p>

        <div className="mt-10 w-full max-w-[520px] rounded-[32px] border border-edge bg-ink-800/80 p-8 backdrop-blur">
          <p className="font-display text-[11px] uppercase tracking-drop text-fog">
            Virtual Balance · Starter Drop
          </p>
          <p className="mt-3 font-display text-[44px] font-bold tracking-[-1.8px] text-lime-soft">
            ₫500.000.000
          </p>
          <p className="mt-2 font-body text-[13px] text-fog">
            ≈ $20,000 in paper-trading credit. Spend it, learn from it, reset
            anytime.
          </p>
        </div>

        <ul className="mt-8 grid w-full max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-3">
          <FeatureBullet
            icon={<LineChart className="size-4" strokeWidth={2} />}
            label="VN · KR · Global markets"
            accent="lime"
          />
          <FeatureBullet
            icon={<Users className="size-4" strokeWidth={2} />}
            label="Community pulse threads"
            accent="plasma"
          />
          <FeatureBullet
            icon={<Gift className="size-4" strokeWidth={2} />}
            label="Weekly streak rewards"
            accent="lime"
          />
        </ul>

        <div className="mt-10 w-full max-w-[320px]">
          <Link href="/onboarding/nationality" className="block">
            <KineticButton>
              Bắt đầu khám phá
              <ArrowRight
                className="size-5 text-lime-ink"
                strokeWidth={2.5}
                aria-hidden
              />
            </KineticButton>
          </Link>
          <Link
            href="/home"
            className="mt-4 inline-block font-display text-[12px] uppercase tracking-pulse text-fog transition-colors hover:text-lime-soft"
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
  accent: "lime" | "plasma";
}) {
  const tile =
    accent === "lime"
      ? "bg-lime-drop text-lime-ink"
      : "bg-plasma-drop text-white";
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-edge bg-ink-800/60 px-4 py-3 text-left backdrop-blur">
      <span className={`grid size-8 place-items-center rounded-lg ${tile}`}>
        {icon}
      </span>
      <span className="font-display text-[12px] uppercase tracking-pulse text-lime-soft">
        {label}
      </span>
    </li>
  );
}
