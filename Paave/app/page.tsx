import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { KineticButton } from "@/components/ui/kinetic-button";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <AmbientBackground />

      <header className="relative z-20 flex w-full items-center justify-between px-6 py-4">
        <PaaveWordmark />
        <nav className="flex items-center gap-6">
          <Link
            href="#vibe"
            className="hidden font-display text-[12px] uppercase tracking-pulse text-fog transition-colors hover:text-lime-soft md:inline"
          >
            The Vibe
          </Link>
          <Link
            href="/sign-in"
            className="font-display text-[12px] uppercase tracking-pulse text-lime-soft"
          >
            Sign in →
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col items-center px-6 pt-16 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-ink-600/60 px-4 py-1.5 backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-lime" />
          <span className="font-display text-[11px] uppercase tracking-pulse text-plasma">
            V2.0 · Now in Open Beta
          </span>
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-[56px] font-bold leading-[1.05] tracking-display text-lime-soft sm:text-[72px]">
          Invest in the <span className="text-lime">vibe</span>,<br />
          not the noise.
        </h1>

        <p className="mt-6 max-w-xl font-body text-[18px] leading-[1.62] text-fog">
          PAAVE is the Gen Z ledger for paper-trading Vietnam, Korea, and
          global markets. AI-assisted. Community-driven. Zero real-money risk
          while you learn.
        </p>

        <div className="mt-10 flex w-full max-w-[320px] flex-col gap-3">
          <Link href="/splash" className="block">
            <KineticButton>
              Enter the Ledger
              <ArrowRight className="size-5 text-lime-ink" strokeWidth={2.5} />
            </KineticButton>
          </Link>
          <Link href="/sign-in" className="block">
            <KineticButton variant="ghost">I&apos;m already in</KineticButton>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 font-display text-[11px] uppercase tracking-pulse text-fog-muted">
          <span>Preview flow:</span>
          <Link href="/splash" className="hover:text-lime-soft">Splash</Link>
          <span>·</span>
          <Link href="/sign-up" className="hover:text-lime-soft">Sign up</Link>
          <span>·</span>
          <Link href="/verify-otp" className="hover:text-lime-soft">OTP</Link>
          <span>·</span>
          <Link href="/welcome" className="hover:text-lime-soft">Welcome</Link>
          <span>·</span>
          <Link href="/onboarding/nationality" className="hover:text-lime-soft">Onboarding</Link>
        </div>

        <div id="vibe" className="mt-20 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<TrendingUp className="size-5" strokeWidth={2} />}
            title="Kinetic Markets"
            body="VN · KR · Global sparklines updated in real time. Tabular numerals so your eyes stop dancing."
            accent="lime"
          />
          <FeatureCard
            icon={<Users className="size-5" strokeWidth={2} />}
            title="Community Pulse"
            body="See what your crew is watching. Per-ticker threads, not a noisy global feed."
            accent="plasma"
          />
          <FeatureCard
            icon={<Zap className="size-5" strokeWidth={2} />}
            title="Paper Trading"
            body="Learn by doing. Every trade is virtual — every lesson is real."
            accent="lime"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "lime" | "plasma";
}) {
  const tile = accent === "lime" ? "bg-lime-drop text-lime-ink" : "bg-plasma-drop text-white";
  return (
    <article className="rounded-3xl border border-edge bg-ink-800/60 p-6 text-left backdrop-blur">
      <div className={`grid size-10 place-items-center rounded-xl ${tile}`}>
        {icon}
      </div>
      <h3 className="mt-5 font-display text-[18px] uppercase tracking-[-0.45px] text-lime-soft">
        {title}
      </h3>
      <p className="mt-2 font-body text-[14px] leading-[1.6] text-fog">{body}</p>
    </article>
  );
}
