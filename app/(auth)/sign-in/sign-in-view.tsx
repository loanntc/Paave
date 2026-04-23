"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { KineticButton } from "@/components/ui/kinetic-button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = EMAIL_RE.test(email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    // TODO: Supabase signInWithOtp({ email })
    await new Promise((r) => setTimeout(r, 400));
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-violet-base">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <PaaveWordmark />
        <Link
          href="/"
          className="font-pretendard text-[12px] uppercase tracking-pulse text-text-neo-secondary transition-colors hover:text-text-neo-primary"
        >
          About
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col items-center px-6 pt-20 pb-12">
        {/* Badge */}
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-neo bg-ink-violet-raised/60 px-4 py-1.5 backdrop-blur">
            <Sparkles className="size-3.5 text-violet-deep-400" strokeWidth={2.5} />
            <span className="font-pretendard text-[11px] uppercase tracking-pulse text-violet-deep-400">
              Paper trading · Gen Z ledger
            </span>
          </span>

          <h1 className="mt-8 max-w-md text-center font-pretendard text-[40px] font-bold leading-[1.1] tracking-[-2px] text-text-neo-primary">
            Enter the{" "}
            <span className="text-lime-signal-400">Ledger</span>.
          </h1>
          <p className="mt-4 max-w-md text-center text-[18px] leading-[1.62] text-text-neo-secondary">
            Drop your email. We&apos;ll send a six-digit pulse — no password,
            no hassle, just vibe.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className="mt-12 w-full max-w-[520px] rounded-[32px] border border-border-neo bg-ink-violet-surface px-8 pt-8 pb-10"
          noValidate
        >
          <label
            htmlFor="email"
            className="block font-pretendard text-[12px] uppercase tracking-pulse text-text-neo-secondary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@vibe.com"
            className="mt-3 block h-14 w-full rounded-lg bg-ink-violet-raised px-5 text-[16px] text-text-neo-primary placeholder:text-text-neo-tertiary border border-border-neo outline-none transition-all focus:border-border-neo-focus focus:border-2 focus:px-[19px]"
          />

          <div className="mt-6">
            <KineticButton type="submit" disabled={!valid || submitting}>
              {submitting ? "Sending Pulse…" : "Send Me a Pulse"}
              <ArrowRight
                className="size-5 text-ink-violet-base"
                strokeWidth={2.5}
                aria-hidden
              />
            </KineticButton>
          </div>

          <p className="mt-6 text-center text-[13px] leading-[1.6] text-text-neo-secondary">
            By continuing, you agree to the{" "}
            <Link href="#" className="text-violet-deep-400 hover:underline">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link href="#" className="text-violet-deep-400 hover:underline">
              Privacy Pact
            </Link>
            .
          </p>
        </form>

        {/* Market tiles */}
        <ul className="mt-10 grid w-full max-w-[520px] grid-cols-3 gap-3 text-center">
          <BadgeTile label="VN" caption="Vietnam" />
          <BadgeTile label="KR" caption="Korea" />
          <BadgeTile label="GLOBAL" caption="Worldwide" />
        </ul>
      </section>
    </main>
  );
}

function BadgeTile({ label, caption }: { label: string; caption: string }) {
  return (
    <li className="rounded-2xl border border-border-neo bg-ink-violet-raised/60 px-4 py-4 backdrop-blur">
      <p className="font-pretendard text-[14px] font-semibold uppercase tracking-drop text-lime-signal-400">
        {label}
      </p>
      <p className="mt-1 text-[12px] text-text-neo-secondary">{caption}</p>
    </li>
  );
}
