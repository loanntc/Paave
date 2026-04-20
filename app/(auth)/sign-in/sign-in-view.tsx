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
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <PaaveWordmark />
        <Link
          href="/"
          className="font-display text-[12px] uppercase tracking-pulse text-fog transition-colors hover:text-lime-soft"
        >
          About
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col items-center px-6 pt-20 pb-12">
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-ink-600/60 px-4 py-1.5 backdrop-blur">
            <Sparkles className="size-3.5 text-plasma" strokeWidth={2.5} />
            <span className="font-display text-[11px] uppercase tracking-pulse text-plasma">
              Paper trading · Gen Z ledger
            </span>
          </span>

          <h1 className="mt-8 max-w-md text-center font-display text-[40px] font-bold leading-[1.1] tracking-display text-lime-soft">
            Enter the <span className="text-lime">Ledger</span>.
          </h1>
          <p className="mt-4 max-w-md text-center font-body text-[18px] leading-[1.62] text-fog">
            Drop your email. We&apos;ll send a six-digit pulse — no password,
            no hassle, just vibe.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-12 w-full max-w-[520px] rounded-[40px] bg-ink-800 px-8 pt-8 pb-10"
          noValidate
        >
          <label
            htmlFor="email"
            className="block font-display text-[12px] uppercase tracking-pulse text-fog"
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
            className="mt-3 block h-14 w-full rounded-lg bg-ink-600 px-5 font-body text-[16px] text-lime-soft placeholder:text-ink-400 outline-none transition-all focus:ring-2 focus:ring-lime"
          />

          <div className="mt-6">
            <KineticButton type="submit" disabled={!valid || submitting}>
              {submitting ? "Sending Pulse…" : "Send Me a Pulse"}
              <ArrowRight
                className="size-5 text-lime-ink"
                strokeWidth={2.5}
                aria-hidden
              />
            </KineticButton>
          </div>

          <p className="mt-6 text-center font-body text-[13px] leading-[1.6] text-fog">
            By continuing, you agree to the{" "}
            <Link href="#" className="text-plasma hover:underline">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link href="#" className="text-plasma hover:underline">
              Privacy Pact
            </Link>
            .
          </p>
        </form>

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
    <li className="rounded-2xl border border-edge bg-ink-800/60 px-4 py-4 backdrop-blur">
      <p className="font-display text-[14px] uppercase tracking-drop text-lime">
        {label}
      </p>
      <p className="mt-1 font-body text-[12px] text-fog">{caption}</p>
    </li>
  );
}
