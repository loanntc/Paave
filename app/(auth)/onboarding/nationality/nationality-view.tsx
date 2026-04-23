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
  accent: "lime" | "violet";
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
    accent: "violet",
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
          <span className="text-lime-signal-400">tuned in</span>?
        </>
      }
      copy="Pick your home market. You can follow the rest later — this just tunes the ledger to your timezone and local tickers."
      footer={
        <KineticButton onClick={next} disabled={!selected}>
          Lock it in
          <ArrowRight className="size-5 text-ink-violet-base" strokeWidth={2.5} />
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
                      ? "border-lime-signal-400 bg-[rgba(181,232,47,0.08)] shadow-glow-accent"
                      : "border-violet-deep-600 bg-[rgba(83,74,183,0.12)] shadow-glow-violet"
                    : "border-border-neo bg-ink-violet-raised/60 hover:bg-ink-violet-hover",
                )}
              >
                {/* Flag icon */}
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl text-3xl",
                    isSel
                      ? opt.accent === "lime"
                        ? "bg-gradient-lime"
                        : "bg-gradient-violet"
                      : "bg-ink-violet-raised",
                  )}
                  aria-hidden
                >
                  {opt.flag}
                </span>

                {/* Labels */}
                <div className="flex-1">
                  <p className="font-pretendard text-[20px] font-bold uppercase tracking-[-0.5px] text-text-neo-primary">
                    {opt.name}
                  </p>
                  <p className="mt-1 font-pretendard text-[11px] uppercase tracking-pulse text-text-neo-secondary">
                    {opt.caption}
                  </p>
                </div>

                {/* Check */}
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border transition-all",
                    isSel
                      ? opt.accent === "lime"
                        ? "border-lime-signal-400 bg-lime-signal-400 text-ink-violet-base"
                        : "border-violet-deep-600 bg-violet-deep-600 text-white"
                      : "border-border-neo text-text-neo-tertiary",
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
