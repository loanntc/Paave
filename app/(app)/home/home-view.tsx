"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Bell, BookOpen, Trophy, Zap } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { usePriceAlerts } from "@/lib/use-price-alerts";
import { MODULES } from "@/lib/learning/content";
import { useHomeData } from "./use-home-data";
import { PortfolioHero, QuickActions } from "./home-portfolio-section";
import { MarketSnapshot } from "./home-market-section";
import { TrendingRow, WatchlistSection } from "./home-stock-sections";

// ---------------------------------------------------------------------------
// HomeView — orchestrator: data from useHomeData, display from sub-modules
// ---------------------------------------------------------------------------
export function HomeView() {
  const {
    displayName,
    isAuthenticated,
    portfolio,
    portfolioLoading,
    indices,
    indicesLoading,
    trending,
    trendingLoading,
    watchlist,
    watchlistHydrated,
    watchlistStocks,
    watchlistLoading,
  } = useHomeData();

  const { hydrated: alertsHydrated, alerts } = usePriceAlerts();

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <HomeHeader
        name={displayName}
        alertCount={alertsHydrated ? alerts.length : 0}
      />

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col gap-5 px-6">
        <PortfolioHero
          name={displayName}
          data={portfolio}
          isLoading={portfolioLoading}
          isAuthenticated={isAuthenticated}
        />
        <QuickActions />
        <MarketSnapshot indices={indices} isLoading={indicesLoading} />
        {watchlistHydrated && watchlist.length > 0 && (
          <WatchlistSection stocks={watchlistStocks} isLoading={watchlistLoading} />
        )}
        <TrendingRow stocks={trending} isLoading={trendingLoading} />
        <LearningProgressCard />
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// HomeHeader — top bar with logo, alert badge, and avatar initial
// ---------------------------------------------------------------------------
function HomeHeader({ name, alertCount }: { name: string; alertCount: number }) {
  const router = useRouter();
  return (
    <header className="relative z-20 flex w-full items-center justify-between px-6 pt-4 pb-6">
      <div className="flex items-center gap-3">
        <PaaveWordmark size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label={alertCount > 0 ? `${alertCount} thông báo giá đang bật` : "Thông báo"}
          onClick={() => router.push("/discover")}
          className="relative grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-lime-soft backdrop-blur transition-colors hover:bg-ink-700"
        >
          <Bell className="size-4" strokeWidth={2} />
          {alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-plasma text-[9px] font-bold text-plasma-ink">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
        <div
          aria-label={`Greeting for ${name}`}
          className="grid size-10 place-items-center rounded-full bg-plasma font-display text-[14px] uppercase text-plasma-ink"
        >
          {name.charAt(0)}
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// LearningProgressCard — contextual entry point to the F0 Learning Path
// ---------------------------------------------------------------------------
function LearningProgressCard() {
  const { hydrated, progress, getModuleStatus } = useLearningProgress();

  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = Object.values(progress.lessons).filter((l) => l.completed).length;
  const pct = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const allDone = completedLessons === totalLessons && totalLessons > 0;

  // Find the first incomplete lesson across all unlocked or in-progress modules
  let resumeHref = "/grow";
  for (const module of MODULES) {
    const status = getModuleStatus(module.id);
    if (status === "IN_PROGRESS" || status === "UNLOCKED") {
      const next = module.lessons.find((l) => !progress.lessons[l.id]?.completed);
      if (next) {
        resumeHref = `/grow/lesson/${next.id}`;
        break;
      }
    }
  }

  const hasStarted = completedLessons > 0 || Object.keys(progress.lessons).length > 0;

  if (!hydrated) {
    return (
      <section
        aria-label="Tiến độ học tập"
        className="rounded-3xl border border-edge bg-ink-800 p-6 animate-pulse"
      >
        <div className="h-3 w-24 rounded bg-ink-700" />
        <div className="mt-2 h-5 w-48 rounded bg-ink-700" />
        <div className="mt-4 h-2 w-full rounded-full bg-ink-700" />
        <div className="mt-4 h-9 w-36 rounded-xl bg-ink-700" />
      </section>
    );
  }

  return (
    <Link
      href={hasStarted ? resumeHref : "/grow"}
      aria-label="Đến trang học tập"
      className="group relative block overflow-hidden rounded-3xl border border-edge bg-gradient-to-br from-ink-800 to-ink-900 p-6 transition-opacity hover:opacity-90 active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-lime/10 blur-3xl"
      />

      <div className="relative flex items-start gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-lime-drop text-lime-ink shrink-0">
          {allDone ? (
            <Trophy className="size-5" strokeWidth={2} />
          ) : (
            <BookOpen className="size-5" strokeWidth={2} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-[11px] uppercase tracking-pulse text-plasma">
            {allDone
              ? "Hoàn thành · F0 Master"
              : hasStarted
                ? `Tiến độ · ${completedLessons}/${totalLessons} bài học`
                : "Lộ trình F0 · Bắt đầu ngay"}
          </p>

          <h3 className="mt-1 font-display text-[18px] uppercase tracking-[-0.45px] text-lime-soft leading-tight">
            {allDone
              ? "Bạn đã chinh phục toàn bộ!"
              : hasStarted
                ? "Tiếp tục học tập"
                : "Hiểu chứng khoán từ đầu"}
          </h3>

          <p className="mt-2 font-body text-[13px] leading-[1.55] text-fog">
            {allDone
              ? `${progress.totalLearningXP} XP kiếm được · Giao dịch giả lập đang chờ bạn.`
              : hasStarted
                ? `${progress.totalLearningXP} XP · ${100 - pct}% còn lại để hoàn thành lộ trình F0.`
                : "4 module · 20 bài học · Không cần kinh nghiệm. Học trong ~60 phút."}
          </p>

          {hasStarted && !allDone && (
            <div className="mt-4 space-y-1.5">
              <div className="h-1.5 rounded-full bg-ink-600 overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-fog">
                <Zap className="size-3 text-lime shrink-0" />
                <span>{progress.totalLearningXP} XP kiếm được</span>
              </div>
            </div>
          )}

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-drop px-5 py-2 font-display text-[12px] uppercase tracking-drop text-lime-ink shadow-glow-lime">
            {allDone ? "Ôn tập" : hasStarted ? "Tiếp tục" : "Bắt đầu học"}
            <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}
