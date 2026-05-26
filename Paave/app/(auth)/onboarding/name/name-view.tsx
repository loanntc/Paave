"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { KineticButton } from "@/components/ui/kinetic-button";
import { OnboardingShell } from "@/components/ui/onboarding-shell";
import { readOnboarding, writeOnboarding } from "@/lib/onboarding-storage";

const MIN_LEN = 2;
const MAX_LEN = 20;
const NAME_RE = /^[\p{L}\p{M}\d _.-]+$/u;
const SUGGESTIONS = ["Minh", "Ji-woo", "Alex", "Phuong", "Hana"];

export function NameView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = readOnboarding().name;
    if (saved) setName(saved);
  }, []);

  const trimmed = name.trim();
  const isValid =
    trimmed.length >= MIN_LEN &&
    trimmed.length <= MAX_LEN &&
    NAME_RE.test(trimmed);

  async function submit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    writeOnboarding({ name: trimmed });
    await new Promise((r) => setTimeout(r, 400));
    router.push("/home");
  }

  return (
    <OnboardingShell
      backHref="/onboarding/nationality"
      step={2}
      eyebrow="Your Handle"
      heading={
        <>
          What should we
          <br />
          <span className="text-lime">call you</span>?
        </>
      }
      copy="This is how PAAVE greets you in the ledger. Keep it between 2 and 20 characters — you can remix it later."
      footer={
        <KineticButton onClick={submit} disabled={!isValid || submitting}>
          {submitting ? "Unlocking ledger…" : "Enter the Ledger"}
          <Zap
            className="size-5 fill-lime-ink stroke-lime-ink"
            strokeWidth={2}
            aria-hidden
          />
        </KineticButton>
      }
    >
      <div className="rounded-[40px] border border-edge bg-[rgba(38,38,38,0.4)] px-8 pt-8 pb-10 backdrop-blur-md">
        <label
          htmlFor="onboard-name"
          className="block font-display text-[12px] uppercase tracking-[2.4px] text-fog"
        >
          Display name
        </label>
        <input
          id="onboard-name"
          type="text"
          autoComplete="given-name"
          autoFocus
          maxLength={MAX_LEN}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Minh, Ji-woo, Alex…"
          className="mt-3 block h-14 w-full rounded-lg bg-ink-600 px-5 font-body text-[18px] text-lime-soft placeholder:text-ink-400 outline-none transition-all focus:ring-2 focus:ring-lime"
        />
        <div className="mt-3 flex items-center justify-between">
          <p
            className={cn(
              "font-display text-[11px] uppercase tracking-pulse",
              isValid || trimmed.length === 0
                ? "text-fog-muted"
                : "text-negative",
            )}
          >
            {trimmed.length === 0
              ? "Letters, numbers, spaces & - . _"
              : !NAME_RE.test(trimmed)
                ? "Only letters, numbers, spaces & - . _"
                : trimmed.length < MIN_LEN
                  ? "At least 2 characters"
                  : "Locked in — sounds great"}
          </p>
          <p className="font-display text-[11px] uppercase tracking-pulse text-fog-muted">
            {trimmed.length}/{MAX_LEN}
          </p>
        </div>

        <div className="mt-6">
          <p className="font-display text-[11px] uppercase tracking-pulse text-plasma">
            <Sparkles className="inline size-3 -mt-1" /> Quick-pick
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setName(s)}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-display text-[12px] uppercase tracking-pulse transition-colors",
                  trimmed === s
                    ? "border-lime bg-lime-glow/40 text-lime"
                    : "border-edge bg-ink-800/60 text-lime-soft hover:bg-ink-700",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
