// ---------------------------------------------------------------------------
// LessonCardView — card shell with type badge, heading, body dispatch, XP strip.
// ---------------------------------------------------------------------------

import { Zap } from "lucide-react";
import type { LessonCard } from "@/lib/learning/types";
import { cn } from "@/lib/utils";
import { TextCardBody, CTACardBody } from "./lesson-card-body";
import { QuizCardBody } from "./quiz-card-body";

// ---------------------------------------------------------------------------
// Card type display config
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

// ---------------------------------------------------------------------------
// LessonCardView
// ---------------------------------------------------------------------------

export function LessonCardView({
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
  xpPerLesson,
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
  xpPerLesson: number;
}) {
  const typeCls =
    CARD_TYPE_COLORS[card.type] ?? "bg-ink-violet-surface text-text-neo-primary";
  const typeLabel = CARD_TYPES_LABEL[card.type] ?? card.type;

  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden h-full min-h-[420px] flex flex-col">
      {/* Card type badge */}
      <div className="px-4 pt-4 pb-0">
        <span
          className={cn(
            "inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.8px]",
            typeCls,
          )}
        >
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
            xpPerLesson={xpPerLesson}
          />
        ) : (
          <TextCardBody body={card.body} />
        )}
      </div>

      {/* XP reward strip */}
      <div className="px-4 py-3 border-t border-border-neo-subtle flex items-center justify-end gap-1.5">
        <Zap className="size-3.5 text-lime-signal-400/60" strokeWidth={2} />
        <span className="text-[11px] text-text-neo-tertiary">
          +{xpPerLesson} XP bài học này
        </span>
      </div>
    </div>
  );
}
