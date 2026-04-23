"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Flame, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { KineticButton } from "@/components/ui/kinetic-button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Strength = 0 | 1 | 2 | 3 | 4;

function scorePassword(pw: string): Strength {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) s++;
  return Math.min(s, 4) as Strength;
}

const STRENGTH_LABELS: Record<Strength, string> = {
  0: "Dormant",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Kinetic",
};

export function SignUpView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = EMAIL_RE.test(email);
  const strength = useMemo(() => scorePassword(password), [password]);
  const pwOk = strength >= 2;
  const canSubmit = emailOk && pwOk && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // TODO: Supabase signUp({ email, password })
    await new Promise((r) => setTimeout(r, 500));
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-violet-base">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/splash"
            aria-label="Back"
            className="grid size-10 place-items-center rounded-full text-text-neo-primary transition-colors hover:bg-ink-violet-raised"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
          </Link>
          <PaaveWordmark />
        </div>
        <Link
          href="/sign-in"
          className="font-pretendard text-[12px] uppercase tracking-pulse text-text-neo-secondary transition-colors hover:text-text-neo-primary"
        >
          Sign in →
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[640px] flex-col items-center px-6 pt-12 pb-12">
        {/* Header */}
        <div className="relative w-full">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-violet-deep-600/20 blur-3xl"
          />
          <div className="relative flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 font-pretendard text-[14px] uppercase tracking-[2.4px] text-violet-deep-400">
              <Flame className="size-3.5 fill-violet-deep-400 stroke-violet-deep-400" aria-hidden />
              Step 01 / Credentials
            </span>
            <h1 className="mt-5 font-pretendard text-[48px] font-bold uppercase leading-[1.02] tracking-[-2.4px] text-text-neo-primary sm:text-[56px]">
              Join the
              <br />
              <span className="text-lime-signal-400">Alpha</span>
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-[1.62] text-text-neo-secondary">
              Mint your credentials. No password reuse, no recycled energy —
              just a fresh universal ID.
            </p>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className="mt-10 w-full rounded-[32px] border border-border-neo bg-ink-violet-surface px-8 pt-8 pb-10"
          noValidate
        >
          {/* Email */}
          <div>
            <label
              htmlFor="su-email"
              className="block font-pretendard text-[12px] uppercase tracking-[2.4px] text-text-neo-secondary"
            >
              Universal ID / Email
            </label>
            <input
              id="su-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@vibe.com"
              className="mt-3 block h-14 w-full rounded-lg bg-ink-violet-raised px-5 text-[16px] text-text-neo-primary placeholder:text-text-neo-tertiary border border-border-neo outline-none transition-all focus:border-border-neo-focus focus:border-2 focus:px-[19px]"
            />
          </div>

          {/* Password */}
          <div className="mt-6">
            <label
              htmlFor="su-password"
              className="block font-pretendard text-[12px] uppercase tracking-[2.4px] text-text-neo-secondary"
            >
              Access Key / Password
            </label>
            <div className="relative">
              <input
                id="su-password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 8 characters — mix it up"
                className="mt-3 block h-14 w-full rounded-lg bg-ink-violet-raised pl-5 pr-14 text-[16px] text-text-neo-primary placeholder:text-text-neo-tertiary border border-border-neo outline-none transition-all focus:border-border-neo-focus focus:border-2 focus:pl-[19px]"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute right-4 top-1/2 -translate-y-1/2 mt-[6px] grid size-8 place-items-center rounded-md text-text-neo-secondary transition-colors hover:text-text-neo-primary"
              >
                {showPw ? (
                  <EyeOff className="size-4" strokeWidth={2} />
                ) : (
                  <Eye className="size-4" strokeWidth={2} />
                )}
              </button>
            </div>

            <SecurityMeter strength={strength} />
          </div>

          <div className="mt-8">
            <KineticButton type="submit" disabled={!canSubmit}>
              {submitting ? "Minting ID…" : "Start Your Streak"}
              <Zap
                className="size-5 fill-ink-violet-base stroke-ink-violet-base"
                strokeWidth={2}
                aria-hidden
              />
            </KineticButton>
          </div>

          <p className="mt-6 text-center text-[13px] leading-[1.6] text-text-neo-secondary">
            Already in the network?{" "}
            <Link
              href="/sign-in"
              className="font-pretendard uppercase tracking-pulse text-violet-deep-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>

        <div className="mt-8 flex items-center gap-3 font-pretendard text-[11px] uppercase tracking-pulse text-text-neo-tertiary">
          <ShieldCheck className="size-3.5 text-violet-deep-400" aria-hidden />
          Encrypted · v2.0.0
        </div>
      </section>
    </main>
  );
}

function SecurityMeter({ strength }: { strength: Strength }) {
  const label = STRENGTH_LABELS[strength];
  return (
    <div className="mt-4 rounded-2xl border border-border-neo bg-ink-violet-raised/60 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="font-pretendard text-[11px] uppercase tracking-pulse text-text-neo-secondary">
          Security Level
        </span>
        <span
          className={cn(
            "font-pretendard text-[11px] uppercase tracking-drop",
            strength >= 3
              ? "text-lime-signal-400"
              : strength === 2
                ? "text-violet-deep-400"
                : "text-text-neo-tertiary",
          )}
        >
          {label}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < strength
                ? strength >= 3
                  ? "bg-gradient-lime shadow-glow-accent"
                  : "bg-gradient-violet"
                : "bg-ink-violet-raised",
            )}
          />
        ))}
      </div>
    </div>
  );
}
