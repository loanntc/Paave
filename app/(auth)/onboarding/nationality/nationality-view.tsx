"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KineticButton } from "@/components/ui/kinetic-button";
import { OnboardingShell } from "@/components/ui/onboarding-shell";
import {
  readOnboarding,
  writeOnboarding,
  type Nationality,
} from "@/lib/onboarding-storage";

interface Option {
  code: Nationality;
  flag: string;
  name: string;
  caption: string;
  accent: "lime" | "plasma";
}

const OPTIONS: Option[] = [
  {
    code: "VN",
    flag: "🇻🇳",
    name: "Vietnam",
    caption: "HOSE · HNX · UPCOM",
    accent: "lime",
  },
  {
    code: "KR",
    flag: "🇰🇷",
    name: "Korea",
    caption: "KOSPI · KOSDAQ",
    accent: "plasma",
  },
  {
    code: "GLOBAL",
    flag: "🌐",
    name: "Global",
    caption: "NYSE · NASDAQ · LSE",
    accent: "lime",
  },
];

export function NationalityView() {
  const router = useRouter();
  const [selected, setSelected] = useState<Nationality | null>(null);

  useEffect(() => {
    const saved = readOnboarding().nationality;
    if (saved) setSelected(saved);
  }, []);

  function next() {
    if (!selected) return;
    writeOnboarding({ nationality: selected });
    router.push("/onboarding/name");
  }

  return (
    <OnboardingShell
      backHref="/welcome"
      step={1}
      eyebrow="Your Scene"
      heading={
        <>
          Where are you
          <br />
          <span className="text-lime">tuned in</span>?
        </>
      }
      copy="Pick your home market. You can follow the rest later — this just tunes the ledger to your timezone and local tickers."
      footer={
        <KineticButton onClick={next} disabled={!selected}>
          Lock it in
          <ArrowRight className="size-5 text-lime-ink" strokeWidth={2.5} />
        </KineticButton>
      }
    >
      <ul className="flex flex-col gap-3">
        {OPTIONS.map((opt) => {
          const isSel = selected === opt.code;
          return (
            <li key={opt.code}>
              <button
                type="button"
                onClick={() => setSelected(opt.code)}
                aria-pressed={isSel}
                className={cn(
                  "group flex w-full items-center gap-5 rounded-3xl border px-5 py-5 text-left transition-all",
                  isSel
                    ? opt.accent === "lime"
                      ? "border-lime bg-lime-glow/40 shadow-glow-lime"
                      : "border-plasma bg-plasma-glow/40 shadow-glow-plasma"
                    : "border-edge bg-ink-800/60 hover:bg-ink-700",
                )}
              >
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl text-3xl",
                    isSel
                      ? opt.accent === "lime"
                        ? "bg-lime-drop"
                        : "bg-plasma-drop"
                      : "bg-ink-600",
                  )}
                  aria-hidden
                >
                  {opt.flag}
                </span>
                <div className="flex-1">
                  <p className="font-display text-[20px] font-bold uppercase tracking-[-0.5px] text-lime-soft">
                    {opt.name}
                  </p>
                  <p className="mt-1 font-display text-[11px] uppercase tracking-pulse text-fog">
                    {opt.caption}
                  </p>
                </div>
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border transition-all",
                    isSel
                      ? opt.accent === "lime"
                        ? "border-lime bg-lime text-lime-ink"
                        : "border-plasma bg-plasma text-plasma-ink"
                      : "border-edge text-fog-muted",
                  )}
                >
                  {isSel ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <Globe2 className="size-4" strokeWidth={2} />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </OnboardingShell>
  );
}
