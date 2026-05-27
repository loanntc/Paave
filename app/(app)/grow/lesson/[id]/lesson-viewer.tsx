"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  XCircle,
  Zap,
} from "lucide-react";
import type { CTAActionType, Lesson, LessonCard, QuizOption } from "@/lib/learning/types";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { MODULES, MODULES_BY_ID } from "@/lib/learning/content";
import { cn } from "@/lib/utils";

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

const CARD_TYPES_LABEL: Record<string, string> = {
  CONCEPT:     "Khái niệm",
  EXAMPLE:     "Ví dụ",
  MYTH_BUSTER: "Sự thật",
  QUIZ:        "Câu hỏi",
  CTA:         "Thực hành",
};

const CARD_TYPE_COLORS: Record<string, string> = {
  CONCEPT:     "bg-violet-deep-800/60 text-violet-deep-200",
  EXAMPLE:     "bg-sky-900/50 text-sky-300",
  MYTH_BUSTER: "bg-orange-900/50 text-orange-300",
  QUIZ:        "bg-lime-signal-400/10 text-lime-signal-400",
  CTA:         "bg-lime-signal-400 text-ink-violet-base",
};

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

  const goNext = useCallback(() => {
    if (cardIndex >= totalCards - 1) return;
    setCardIndex((i) => i + 1);
    setSelectedOption(null);
    setQuizResult("idle");
    setShowHint(false);
    wrongStreakRef.current = 0;
  }, [cardIndex, totalCards]);

  const goPrev = useCallback(() => {
    if (cardIndex <= 0) return;
    setCardIndex((i) => i - 1);
    setSelectedOption(null);
    setQuizResult("idle");
    setShowHint(false);
    wrongStreakRef.current = 0;
  }, [cardIndex]);

  // Can advance: quiz card requires correct answer first
  const canGoNext =
    currentCard.type === "QUIZ"
      ? quizResult === "correct"
      : true;

  // ── Swipe handlers ────────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    const THRESHOLD = 50;
    if (dx < -THRESHOLD && canGoNext) goNext();
    else if (dx > THRESHOLD) goPrev();
    touchStartX.current = null;
  };

  // ── Quiz logic ────────────────────────────────────────────────────────────

  const handleQuizAnswer = (optionId: string) => {
    if (quizResult === "correct") return; // already answered correctly
    setSelectedOption(optionId);
    if (optionId === currentCard.correctOption) {
      setQuizResult("correct");
      wrongStreakRef.current = 0;
    } else {
      setQuizResult("wrong");
      wrongStreakRef.current += 1;
      incrementQuizAttempts(lesson.id);
      if (wrongStreakRef.current >= 3) {
        setShowHint(true);
      }
    }
  };

  // ── CTA completion / lesson completion ───────────────────────────────────

  const handleCTAAction = () => {
    completeLesson(lesson.id, lesson.moduleId);
    setCompleted(true);
    // Stay on page — completion state offers next-lesson navigation
  };

  const module = MODULES_BY_ID[lesson.moduleId];

  // Find the next lesson (within module, then across modules)
  const lessonIndexInModule = module
    ? module.lessons.findIndex((l) => l.id === lesson.id)
    : -1;
  const nextLesson =
    module && lessonIndexInModule >= 0
      ? (module.lessons[lessonIndexInModule + 1] ?? null)
      : null;

  // If last lesson in module, try to find first lesson of the next unlocked module
  const nextModuleFirstLesson = (() => {
    if (nextLesson) return null; // already have a next lesson in same module
    const moduleOrder = MODULES.map((m) => m.id);
    const moduleIdx = moduleOrder.indexOf(lesson.moduleId);
    if (moduleIdx < 0 || moduleIdx >= moduleOrder.length - 1) return null;
    const nextModule = MODULES[moduleIdx + 1];
    return nextModule?.lessons[0] ?? null;
  })();

  const nextLessonTarget = nextLesson ?? nextModuleFirstLesson;

  return (
    <main
      className="min-h-screen bg-ink-violet-base text-text-neo-primary flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top bar ──────────────────────────────────────────────────── */}
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
                  setSelectedOption(null);
                  setQuizResult("idle");
                  setShowHint(false);
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

      {/* ── Lesson title ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 max-w-[640px] mx-auto w-full">
        <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary mb-1">
          {module?.titleVi ?? lesson.moduleId} · {lesson.titleVi}
        </p>
      </div>

      {/* ── Card ─────────────────────────────────────────────────────── */}
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
        />
      </div>

      {/* ── Navigation buttons ───────────────────────────────────────── */}
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

// ---------------------------------------------------------------------------
// LessonCardView — renders one card based on its type
// ---------------------------------------------------------------------------
function LessonCardView({
  card,
  selectedOption,
  quizResult,
  showHint,
  onQuizAnswer,
  onDismissHint,
  onShowHint,
  onCTAAction,
  completed,
  nextLesson,
  ctaRoute,
  onNavigate,
}: {
  card: LessonCard;
  selectedOption: string | null;
  quizResult: "idle" | "correct" | "wrong";
  showHint: boolean;
  onQuizAnswer: (id: string) => void;
  onDismissHint: () => void;
  onShowHint: () => void;
  onCTAAction: () => void;
  completed: boolean;
  nextLesson: { id: string; titleVi: string } | null;
  ctaRoute: string | null;
  onNavigate: (href: string) => void;
}) {
  const typeCls = CARD_TYPE_COLORS[card.type] ?? "bg-ink-violet-surface text-text-neo-primary";
  const typeLabel = CARD_TYPES_LABEL[card.type] ?? card.type;

  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden h-full min-h-[420px] flex flex-col">
      {/* Card type badge */}
      <div className="px-4 pt-4 pb-0">
        <span className={cn("inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.8px]", typeCls)}>
          {typeLabel}
        </span>
      </div>

      {/* Card heading */}
      <div className="px-4 pt-3 pb-2">
        <h2 className="font-display text-[18px] font-bold text-text-neo-primary leading-snug">
          {card.heading}
        </h2>
      </div>

      {/* Card body */}
      <div className="px-4 flex-1">
        {card.type === "QUIZ" ? (
          <QuizCardBody
            card={card}
            selectedOption={selectedOption}
            quizResult={quizResult}
            showHint={showHint}
            onAnswer={onQuizAnswer}
            onDismissHint={onDismissHint}
            onShowHint={onShowHint}
          />
        ) : card.type === "CTA" ? (
          <CTACardBody
            card={card}
            onAction={onCTAAction}
            completed={completed}
            nextLesson={nextLesson}
            ctaRoute={ctaRoute}
            onNavigate={onNavigate}
          />
        ) : (
          <TextCardBody body={card.body} />
        )}
      </div>

      {/* XP reward strip (bottom of every card) */}
      <div className="px-4 py-3 border-t border-border-neo-subtle flex items-center justify-end gap-1.5">
        <Zap className="size-3.5 text-lime-signal-400/60" strokeWidth={2} />
        <span className="text-[11px] text-text-neo-tertiary">+25 XP bài học này</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TextCardBody — Concept, Example, Myth-Buster cards
// ---------------------------------------------------------------------------
function TextCardBody({ body }: { body: string }) {
  // Convert basic markdown-ish **bold** and line breaks
  const formatted = body
    .split("\n")
    .map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={cn("text-[14px] leading-[1.6] text-text-neo-secondary", line.startsWith("|") ? "font-mono text-[12px]" : "")}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-text-neo-primary font-semibold">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>
      );
    });
  return <div className="space-y-1.5 py-2">{formatted}</div>;
}

// ---------------------------------------------------------------------------
// QuizCardBody — multiple choice with feedback
// ---------------------------------------------------------------------------
function QuizCardBody({
  card,
  selectedOption,
  quizResult,
  showHint,
  onAnswer,
  onDismissHint,
  onShowHint,
}: {
  card: LessonCard;
  selectedOption: string | null;
  quizResult: "idle" | "correct" | "wrong";
  showHint: boolean;
  onAnswer: (id: string) => void;
  onDismissHint: () => void;
  onShowHint: () => void;
}) {
  const options: QuizOption[] = card.options ?? [];

  return (
    <div className="space-y-3 py-2">
      {options.map((opt) => {
        const isSelected = selectedOption === opt.id;
        const isCorrect = opt.id === card.correctOption;
        const showResult = quizResult !== "idle" && isSelected;

        return (
          <button
            key={opt.id}
            onClick={() => onAnswer(opt.id)}
            disabled={quizResult === "correct"}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all",
              !isSelected
                ? "border-border-neo bg-ink-violet-raised/50 text-text-neo-secondary hover:border-lime-signal-400/40 hover:text-text-neo-primary"
                : showResult && isCorrect
                  ? "border-lime-signal-400 bg-lime-signal-400/10 text-lime-signal-400"
                  : showResult && !isCorrect
                    ? "border-negative bg-negative/10 text-negative"
                    : "border-border-neo bg-ink-violet-raised text-text-neo-primary",
            )}
          >
            <span className={cn(
              "shrink-0 size-7 rounded-full grid place-items-center text-[12px] font-bold border",
              showResult && isCorrect
                ? "border-lime-signal-400 text-lime-signal-400"
                : showResult && !isCorrect
                  ? "border-negative text-negative"
                  : "border-border-neo text-text-neo-tertiary",
            )}>
              {opt.id}
            </span>
            <span className="flex-1 text-[14px] leading-snug">{opt.text}</span>
            {showResult && isCorrect && <CheckCircle2 className="size-4 text-lime-signal-400 shrink-0" />}
            {showResult && !isCorrect && <XCircle className="size-4 text-negative shrink-0" />}
          </button>
        );
      })}

      {/* Result feedback */}
      {quizResult === "correct" && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-lime-signal-400/10 border border-lime-signal-400/30">
          <CheckCircle2 className="size-4 text-lime-signal-400 shrink-0" />
          <span className="text-[13px] text-lime-signal-400 font-medium">
            Chính xác! Tiếp tục thẻ tiếp theo.
          </span>
        </div>
      )}
      {quizResult === "wrong" && !showHint && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-negative/10 border border-negative/30">
          <XCircle className="size-4 text-negative shrink-0" />
          <span className="text-[13px] text-negative">
            Chưa đúng. Thử lại nhé!
          </span>
        </div>
      )}

      {/* Hint panel — shown after 3 wrong answers */}
      {showHint && card.hint && (
        <div className="px-3 py-3 rounded-xl bg-orange-900/30 border border-orange-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-orange-300 shrink-0" />
            <span className="text-[12px] font-bold text-orange-300">Gợi ý</span>
            <button
              onClick={onDismissHint}
              className="ml-auto text-[11px] text-text-neo-tertiary hover:text-text-neo-secondary"
            >
              Ẩn
            </button>
          </div>
          <p className="text-[13px] text-orange-200">{card.hint}</p>
        </div>
      )}

      {quizResult === "wrong" && !showHint && (
        <div className="flex justify-end">
          <button
            onClick={onShowHint}
            className="flex items-center gap-1 text-[11px] text-text-neo-tertiary hover:text-text-neo-secondary"
          >
            <HelpCircle className="size-3.5" />
            Cần gợi ý?
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CTACardBody — "Try it now" card (card 5)
// ---------------------------------------------------------------------------
function CTACardBody({
  card,
  onAction,
  completed,
  nextLesson,
  ctaRoute,
  onNavigate,
}: {
  card: LessonCard;
  onAction: () => void;
  completed: boolean;
  nextLesson: { id: string; titleVi: string } | null;
  ctaRoute: string | null;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="py-4 space-y-4">
      <TextCardBody body={card.body} />

      {completed ? (
        <div className="space-y-3">
          {/* XP celebration */}
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-lime-signal-400/10 border border-lime-signal-400/30">
            <CheckCircle2 className="size-5 text-lime-signal-400 shrink-0" />
            <div>
              <p className="text-[14px] text-lime-signal-400 font-bold leading-snug">
                Bài học hoàn thành!
              </p>
              <p className="text-[11px] text-lime-signal-400/70">+25 XP được cộng vào hồ sơ của bạn</p>
            </div>
          </div>

          {/* Next lesson — primary CTA */}
          {nextLesson && (
            <button
              onClick={() => onNavigate(`/grow/lesson/${nextLesson.id}`)}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-lime-signal-400 text-ink-violet-base font-display text-[15px] font-bold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <ChevronRight className="size-4" strokeWidth={2.5} />
              Bài tiếp theo
            </button>
          )}

          {/* Practice link — secondary */}
          {ctaRoute && (
            <button
              onClick={() => onNavigate(ctaRoute)}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-lime-signal-400/40 text-lime-signal-400 text-[14px] font-bold hover:bg-lime-signal-400/10 transition-colors"
            >
              <ExternalLink className="size-4" strokeWidth={2} />
              {card.ctaLabel ?? "Thực hành"}
            </button>
          )}

          {/* Back link */}
          <button
            onClick={() => onNavigate("/grow")}
            className="w-full text-center text-[12px] text-text-neo-tertiary hover:text-text-neo-secondary transition-colors"
          >
            Về trang Học tập
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={onAction}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-lime-signal-400 text-ink-violet-base font-display text-[15px] font-bold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <ExternalLink className="size-4" strokeWidth={2.5} />
            {card.ctaLabel ?? "Thực hành ngay"}
          </button>
          <p className="text-[11px] text-text-neo-tertiary text-center">
            Hoàn thành thực hành để nhận +25 XP và mở bài tiếp theo.
          </p>
        </>
      )}
    </div>
  );
}
