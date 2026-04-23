"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Mail, ShieldCheck, Zap } from "lucide-react";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { OtpInput } from "@/components/ui/otp-input";
import { KineticButton } from "@/components/ui/kinetic-button";
import { formatCountdown, maskEmail } from "@/lib/utils";

const OTP_LENGTH = 6;
const RESEND_WINDOW_SECS = 54;

export function VerifyOtpView({ email }: { email: string }) {
  const masked = useMemo(() => maskEmail(email), [email]);

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_WINDOW_SECS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const canSubmit = code.length === OTP_LENGTH && !submitting;
  const canResend = secondsLeft <= 0;

  async function onVerify() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // TODO: wire to Supabase verifyOtp when real flow is live
      await new Promise((r) => setTimeout(r, 600));
      if (code !== "000000") {
        window.location.href = "/home";
        return;
      }
      setError("That pulse didn't match. Try again.");
    } catch {
      setError("Signal lost. Try verifying again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onResend() {
    if (!canResend) return;
    setSecondsLeft(RESEND_WINDOW_SECS);
    setCode("");
    setError(null);
  }

  return (
    <main className="relative min-h-screen bg-ink-violet-base overflow-hidden">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            aria-label="Back"
            className="grid size-10 place-items-center rounded-full text-text-neo-primary transition-colors hover:bg-ink-violet-raised"
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
          </Link>
          <PaaveWordmark />
        </div>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col items-center px-6 pt-24 pb-12">
        {/* Hero identity */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 rounded-xl bg-lime-signal-400/10 blur-2xl"
            />
            <div className="relative grid size-32 place-items-center rounded-xl border border-border-neo bg-ink-violet-raised">
              <Mail
                className="size-[50px] text-lime-signal-400"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <span className="absolute -right-2 -bottom-2 rounded-xl bg-violet-deep-600 px-3 py-1 font-pretendard text-[12px] uppercase tracking-pulse text-white shadow-card">
              New Drop
            </span>
          </div>

          <h1 className="mt-10 max-w-sm text-center font-pretendard text-[36px] font-bold leading-[1.25] tracking-[-1.5px] text-text-neo-primary">
            Check the Vibe (and your email)
          </h1>

          <p className="mt-4 max-w-md text-center text-[18px] leading-[1.62] text-text-neo-secondary">
            We sent a 6-digit pulse to{" "}
            <span className="text-text-neo-primary font-medium">{masked}</span>. Verify your access to
            enter the ledger.
          </p>
        </div>

        {/* OTP card */}
        <div className="relative mt-12 w-full max-w-[672px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-3xl bg-violet-deep-600/20 blur-3xl opacity-30"
          />
          <div className="relative overflow-hidden rounded-[32px] border border-border-neo bg-ink-violet-surface px-8 pt-8 pb-12">
            <OtpInput
              length={OTP_LENGTH}
              value={code}
              onChange={setCode}
              disabled={submitting}
              autoFocus
            />

            {error && (
              <p
                role="alert"
                className="mt-4 text-center text-sm text-negative animate-fade-up"
              >
                {error}
              </p>
            )}

            <div className="mt-10">
              <KineticButton
                onClick={onVerify}
                disabled={!canSubmit}
                aria-label="Verify pulse"
              >
                <Zap
                  className="size-5 fill-ink-violet-base stroke-ink-violet-base"
                  strokeWidth={2}
                  aria-hidden
                />
                Verify Pulse
              </KineticButton>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="font-pretendard text-[12px] uppercase tracking-pulse text-text-neo-secondary">
                Didn&apos;t get the message?
              </p>
              <button
                type="button"
                onClick={onResend}
                disabled={!canResend}
                className="font-pretendard text-[14px] uppercase tracking-drop text-violet-deep-400 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:text-violet-deep-400/80"
              >
                {canResend
                  ? "Resend Code"
                  : `Resend Code (${formatCountdown(secondsLeft)})`}
              </button>
            </div>
          </div>
        </div>

        {/* Security callout */}
        <aside className="mt-8 w-full max-w-[672px] rounded-3xl border border-border-neo bg-ink-violet-raised/40 p-6 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid size-14 place-items-center rounded-xl bg-violet-deep-800">
              <ShieldCheck
                className="size-6 text-white"
                strokeWidth={2}
                aria-hidden
              />
            </div>
            <div>
              <h3 className="font-pretendard text-[18px] font-semibold uppercase tracking-[-0.45px] text-violet-deep-400">
                Kinetic Security Protocol
              </h3>
              <p className="mt-1 text-[14px] leading-[1.62] text-text-neo-secondary">
                This code is only valid for 10 minutes. PAAVE will never ask for
                your password via email. If you suspect a breach, lock your ledger
                immediately.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
