"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { CTAActionType, Lesson } from "@/lib/learning/types";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { MODULES, MODULES_BY_ID } from "@/lib/learning/content";
import { cn } from "@/lib/utils";
import { LessonCardView } from "./lesson-card-view";

// ---------------------------------------------------------------------------
// Map CTA action types to in-app destinations
// ---------------------------------------------------------------------------
const CTA_ROUTES: Partial<Record<CTAActionType, string>> = {
  BROWSE_STOCK_LIST:     "/discover",
  CHECK_MARKET_SESSION:  "/discover",
  OPEN_PRICE_BOARD:      "/discover",
  READ_NEWS_ARTICLE:     "/discover",
  VIEW_SECTOR_BREAKDOWN: "/discover",
  USE_SECTOR_FILTER:     "/discover",
  ADD_TO_WATCHLIST:      "/discover",
  SET_PRICE_ALERT:       "/discover",
  OPEN_AI_INSIGHTS:      "/discover",
  ATTEMPT_CEILING_ORDER: "/stock/VIC",
  PLACE_MARKET_ORDER:    "/stock/VNM",
  ATTEMPT_ODD_LOT_ORDER: "/stock/FPT",
  PLACE_LIMIT_BUY:       "/stock/VNM",
  VIEW_T2_LABEL:         "/portfolio",
  OPEN_PNL_TAB:          "/portfolio",
  VIEW_FOMO_PATTERNS:    "/portfolio",
  VIEW_BEHAVIORAL_FLAGS: "/portfolio",
  VIEW_FEE_TOTAL:        "/portfolio",
  VIEW_REALIZED_PNL:     "/portfolio",
  SHARE_TRADING_RULES:   "/profile",
};

// ---------------------------------------------------------------------------
// LessonViewer — card-stack with swipe + button navigation
// FRD: FR-LEARN-03, FR-LEARN-04, FR-LEARN-05, FR-LEARN-06
// ---------------------------------------------------------------------------

interface Props {
  lesson: Lesson;
}

export function LessonViewer({ lesson }: Props) {
  const router = useRouter();
  const { getLessonProgress, saveCardProgress, incrementQuizAttempts, completeLesson } =
    useLearningProgress();

  // Resume from last saved card
  const initialCard = getLessonProgress(lesson.id)?.cardIndex ?? 0;
  const [cardIndex, setCardIndex] = useState(initialCard);
  const [completed, setCompleted] = useState(
    getLessonProgress(lesson.id)?.completed ?? false,
  );

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [showHint, setShowHint] = useState(false);
  const wrongStreakRef = useRef(0);

  // Swipe gesture
  const touchStartX = useRef<number | null>(null);

  const currentCard = lesson.cards[cardIndex];
  const totalCards = lesson.cards.length;

  // Save progress on card change
  useEffect(() => {
    saveCardProgress(lesson.id, cardIndex);
  }, [cardIndex, lesson.id, saveCardProgress]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const resetCardState = useCallback(() => {
    setSelectedOption(null);
    setQuizResult("idle");
    setShowHint(false);
    wrongStreakRef.current = 0;
  }, []);

  const goNext = useCallback(() => {
    if (cardIndex >= totalCards - 1) return;
    setCardIndex((i) => i + 1);
    resetCardState();
  }, [cardIndex, totalCards, resetCardState]);

  const goPrev = useCallback(() => {
    if (cardIndex <= 0) return;
    setCardIndex((i) => i - 1);
    resetCardState();
  }, [cardIndex, resetCardState]);

  // Can advance: quiz card requires correct answer first
  const canGoNext = currentCard?.type === "QUIZ" ? quizResult === "correct" : true;

  // ── Swipe handlers ────────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    const SWIPE_THRESHOLD = 50;
    if (dx < -SWIPE_THRESHOLD && canGoNext) goNext();
    else if (dx > SWIPE_THRESHOLD) goPrev();
    touchStartX.current = null;
  };

  // ── Quiz logic ────────────────────────────────────────────────────────────

  const handleQuizAnswer = (optionId: string) => {
    if (quizResult === "correct") return; // already answered correctly
    setSelectedOption(optionId);
    if (optionId === currentCard?.correctOption) {
      setQuizResult("correct");
      wrongStreakRef.current = 0;
    } else {
      setQuizResult("wrong");
      wrongStreakRef.current += 1;
      incrementQuizAttempts(lesson.id);
      if (wrongStreakRef.current >= 3) setShowHint(true);
    }
  };

  // ── CTA completion ────────────────────────────────────────────────────────

  const handleCTAAction = () => {
    completeLesson(lesson.id, lesson.moduleId);
    setCompleted(true);
  };

  // ── Next-lesson resolution ────────────────────────────────────────────────

  const module = MODULES_BY_ID[lesson.moduleId];
  const xpPerLesson = module
    ? Math.round(module.lessonXP / module.lessons.length)
    : 25;

  const lessonIndexInModule = module
    ? module.lessons.findIndex((l) => l.id === lesson.id)
    : -1;
  const nextLesson =
    module && lessonIndexInModule >= 0
      ? (module.lessons[lessonIndexInModule + 1] ?? null)
      : null;

  const nextModuleFirstLesson = (() => {
    if (nextLesson) return null;
    const moduleOrder = MODULES.map((m) => m.id);
    const moduleIdx = moduleOrder.indexOf(lesson.moduleId);
    if (moduleIdx < 0 || moduleIdx >= moduleOrder.length - 1) return null;
    const nextModule = MODULES[moduleIdx + 1];
    return nextModule?.lessons[0] ?? null;
  })();

  const nextLessonTarget = nextLesson ?? nextModuleFirstLesson;

  // ── Render ────────────────────────────────────────────────────────────────

  if (!currentCard) return null; // guard against out-of-bounds index

  return (
    <main
      className="min-h-screen bg-ink-violet-base text-text-neo-primary flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <button
          onClick={() => router.back()}
          aria-label="Quay lại"
          className="grid size-9 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-secondary hover:text-text-neo-primary transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
        </button>

        {/* Progress dots */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {lesson.cards.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i <= cardIndex) {
                  setCardIndex(i);
                  resetCardState();
                }
              }}
              aria-label={`Thẻ ${i + 1}`}
              className={cn(
                "rounded-full transition-all",
                i === cardIndex
                  ? "w-6 h-2 bg-lime-signal-400"
                  : i < cardIndex
                    ? "size-2 bg-lime-signal-400/40"
                    : "size-2 bg-ink-violet-raised",
              )}
            />
          ))}
        </div>

        <span className="text-[12px] text-text-neo-tertiary tabular-nums w-9 text-right">
          {cardIndex + 1}/{totalCards}
        </span>
      </header>

      {/* Lesson title */}
      <div className="px-4 pt-4 pb-2 max-w-[640px] mx-auto w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary mb-1">
          {module?.titleVi ?? lesson.moduleId} · {lesson.titleVi}
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 pb-4 max-w-[640px] mx-auto w-full">
        <LessonCardView
          card={currentCard}
          selectedOption={selectedOption}
          quizResult={quizResult}
          showHint={showHint}
          onQuizAnswer={handleQuizAnswer}
          onDismissHint={() => setShowHint(false)}
          onShowHint={() => setShowHint(true)}
          onCTAAction={handleCTAAction}
          completed={completed}
          nextLesson={nextLessonTarget}
          ctaRoute={currentCard.ctaAction ? (CTA_ROUTES[currentCard.ctaAction] ?? null) : null}
          onNavigate={(href) => router.push(href)}
          xpPerLesson={xpPerLesson}
        />
      </div>

      {/* Navigation buttons */}
      <div className="sticky bottom-20 px-4 pb-4 max-w-[640px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={cardIndex === 0}
            aria-label="Thẻ trước"
            className="grid size-12 place-items-center rounded-2xl border border-border-neo bg-ink-violet-surface text-text-neo-secondary hover:text-text-neo-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="size-5" strokeWidth={2} />
          </button>

          {currentCard.type !== "CTA" && (
            <button
              onClick={canGoNext ? goNext : undefined}
              disabled={!canGoNext}
              aria-label="Thẻ tiếp theo"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-display text-[14px] font-bold transition-all",
                canGoNext
                  ? "bg-lime-signal-400 text-ink-violet-base hover:opacity-90 active:scale-[0.98]"
                  : "bg-ink-violet-surface border border-border-neo text-text-neo-tertiary cursor-not-allowed",
              )}
            >
              {currentCard.type === "QUIZ" && quizResult !== "correct"
                ? "Chọn câu trả lời →"
                : cardIndex === totalCards - 2
                  ? "Câu thực hành cuối →"
                  : "Tiếp theo"}
              {canGoNext && <ChevronRight className="size-4" strokeWidth={2.5} />}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
