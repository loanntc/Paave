"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";

export interface OnboardingShellProps {
  backHref: string;
  step: 1 | 2;
  total?: number;
  eyebrow: string;
  heading: React.ReactNode;
  copy?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function OnboardingShell({
  backHref,
  step,
  total = 2,
  eyebrow,
  heading,
  copy,
  children,
  footer,
}: OnboardingShellProps) {
  const pct = Math.round((step / total) * 100);
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            aria-label="Back"
            className="grid size-10 place-items-center rounded-full text-lime-soft transition-colors hover:bg-ink-700"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
          </Link>
          <PaaveWordmark />
        </div>
        <span className="font-display text-[11px] uppercase tracking-pulse text-fog">
          Step {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[640px] px-6 pt-6">
        <div className="flex items-center gap-2" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < step ? "bg-lime" : "bg-ink-600",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-right font-display text-[10px] uppercase tracking-pulse text-fog-muted">
          {pct}% synced
        </p>
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col px-6 pt-8 pb-12">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 font-display text-[14px] uppercase tracking-[2.4px] text-plasma">
            <span className="size-1.5 rounded-full bg-plasma" />
            {eyebrow}
          </span>
          <h1 className="mt-5 max-w-md font-display text-[40px] font-bold leading-[1.08] tracking-[-2px] text-lime-soft sm:text-[48px]">
            {heading}
          </h1>
          {copy && (
            <p className="mt-4 max-w-md font-body text-[16px] leading-[1.62] text-fog">
              {copy}
            </p>
          )}
        </div>

        <div className="mt-10">{children}</div>

        <div className="mt-10">{footer}</div>
      </section>
    </main>
  );
}
