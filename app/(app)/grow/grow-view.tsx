"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Sparkles, Trophy, Zap } from "lucide-react";
import { MODULES } from "@/lib/learning/content";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { WelcomeModal } from "@/components/paave/welcome-modal";
import { ModuleCard } from "./module-card";

// ---------------------------------------------------------------------------
// GrowView — Learning path home (Grow tab / Tab 2)
// FRD: FR-LEARN-02
// ---------------------------------------------------------------------------
export function GrowView() {
  const router = useRouter();
  const {
    hydrated,
    getModuleStatus,
    getModuleCompletedLessons,
    progress,
    markWelcomeModalShown,
  } = useLearningProgress();

  // ── Welcome modal (FR-LEARN-01) ────────────────────────────────────────────
  // Open state is set exactly once after hydration; the progress flag is only
  // read at that moment so the modal never re-appears during the same session.
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const didInitModal = useRef(false);

  useEffect(() => {
    if (hydrated && !didInitModal.current) {
      didInitModal.current = true;
      if (!progress.welcomeModalShown) {
        setWelcomeOpen(true);
      }
    }
  // progress.welcomeModalShown is intentionally read only at first hydration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <>
    {/* FR-LEARN-01: Welcome modal — rendered once on first visit */}
    {welcomeOpen && (
      <WelcomeModal
        onMount={markWelcomeModalShown}
        onStart={() => { setWelcomeOpen(false); router.push(`/grow/lesson/${MODULES[0].lessons[0].id}`); }}
        onExplore={() => setWelcomeOpen(false)}
      />
    )}

    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-28">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <div>
          <span className="font-display text-[18px] font-bold tracking-[-0.3px]">
            Học hỏi
          </span>
          <p className="text-[11px] text-text-neo-tertiary">
            F0 Learning Path · {MODULES.length} module
          </p>
        </div>
        {hydrated && progress.totalLearningXP > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-signal-400/10 border border-lime-signal-400/20">
            <Zap className="size-3.5 text-lime-signal-400" strokeWidth={2.5} />
            <span className="text-[12px] font-bold text-lime-signal-400 tabular-nums">
              {progress.totalLearningXP} XP
            </span>
          </div>
        )}
      </header>

      <div className="px-4 pt-5 space-y-4 max-w-[640px] mx-auto">

        {/* ── Path summary strip ─────────────────────────────────────────── */}
        {hydrated && (
          <PathSummary
            total={MODULES.reduce((s, m) => s + m.lessons.length, 0)}
            completed={Object.values(progress.lessons).filter((l) => l.completed).length}
          />
        )}

        {/* ── FR-LEARN-02: Learning prompt card ─────────────────────────── */}
        {/* Shown after the welcome modal is dismissed without starting a lesson */}
        {hydrated &&
          progress.welcomeModalShown &&
          Object.keys(progress.lessons).length === 0 && (
            <LearningPromptCard />
          )}

        {/* ── Module cards ───────────────────────────────────────────────── */}
        {!hydrated ? (
          <ModuleListSkeleton />
        ) : (
          <ul className="space-y-3">
            {MODULES.map((module, idx) => {
              const status = getModuleStatus(module.id);
              const completedLessons = getModuleCompletedLessons(module.id);
              return (
                <li key={module.id}>
                  <ModuleCard
                    module={module}
                    status={status}
                    completedLessons={completedLessons}
                    moduleIndex={idx + 1}
                    progress={progress.lessons}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {/* ── Footer hint ────────────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-text-neo-tertiary pb-2">
          Mỗi bài học ~3 phút · Không cần kinh nghiệm
        </p>
      </div>
    </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// PathSummary — progress bar across all modules
// ---------------------------------------------------------------------------
function PathSummary({ total, completed }: { total: number; completed: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <section className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold text-text-neo-secondary">
          {completed}/{total} bài học hoàn thành
        </span>
        <span className="text-[12px] font-bold text-lime-signal-400">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-ink-violet-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-lime-signal-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LearningPromptCard — FR-LEARN-02
// Shown when the user dismissed the welcome modal without starting any lesson.
// Gives them a clear, prominent second invitation to begin Module 1.
// ---------------------------------------------------------------------------
function LearningPromptCard() {
  const firstLesson = MODULES[0].lessons[0];
  const xpPerLesson = Math.round(MODULES[0].lessonXP / MODULES[0].lessons.length);
  return (
    <Link
      href={`/grow/lesson/${firstLesson.id}`}
      className="block rounded-2xl overflow-hidden border border-lime-signal-400/20 hover:border-lime-signal-400/40 transition-all active:scale-[0.99]"
      style={{
        background: "linear-gradient(135deg, rgba(181,232,47,0.08) 0%, rgba(127,119,221,0.12) 100%)",
      }}
    >
      <div className="px-4 pt-4 pb-3">
        {/* Eyebrow */}
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="size-3 text-lime-signal-400" strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.8px] text-lime-signal-400">
            Bắt đầu học
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-display text-[17px] font-bold text-text-neo-primary leading-tight mb-1">
          Hành trình F0 đang chờ bạn
        </h2>
        <p className="text-[12px] text-text-neo-tertiary leading-relaxed">
          Module 1 · 5 bài học · ~15 phút để hiểu thị trường chứng khoán từ đầu.
        </p>

        {/* Lesson preview chips */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {["Cổ phiếu là gì?", "Sàn HOSE & HNX", "Mua/Bán thế nào?"].map((label) => (
            <span
              key={label}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-lime-signal-400/10 text-lime-signal-400 border border-lime-signal-400/15"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-lime-signal-400/10">
        <div className="flex items-center gap-3 text-[11px] text-text-neo-tertiary">
          <span className="flex items-center gap-1">
            <Zap className="size-3 text-lime-signal-400" />
            +{xpPerLesson} XP / bài
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="size-3 text-yellow-400" />
            Huy hiệu F0
          </span>
        </div>
        <span className="text-[13px] font-bold text-lime-signal-400 flex items-center gap-1">
          Bắt đầu <Play className="size-3.5 fill-lime-signal-400" strokeWidth={0} />
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ModuleListSkeleton() {
  return (
    <ul className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <li key={i} className="rounded-2xl bg-ink-violet-surface border border-border-neo p-4 animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-ink-violet-raised" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-16 rounded bg-ink-violet-raised" />
              <div className="h-4 w-40 rounded bg-ink-violet-raised" />
            </div>
          </div>
          <div className="h-2.5 w-full rounded bg-ink-violet-raised" />
          <div className="h-8 w-24 rounded-full bg-ink-violet-raised" />
        </li>
      ))}
    </ul>
  );
}
