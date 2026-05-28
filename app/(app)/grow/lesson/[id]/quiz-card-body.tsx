// QuizCardBody — multiple choice card with answer feedback and hint reveal.
// Separated from lesson-card-body.tsx to keep each file under 300 lines.

import { CheckCircle2, HelpCircle, Lightbulb, XCircle } from "lucide-react";
import type { LessonCard, QuizOption } from "@/lib/learning/types";
import { cn } from "@/lib/utils";

export function QuizCardBody({
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
            <span
              className={cn(
                "shrink-0 size-7 rounded-full grid place-items-center text-[12px] font-bold border",
                showResult && isCorrect
                  ? "border-lime-signal-400 text-lime-signal-400"
                  : showResult && !isCorrect
                    ? "border-negative text-negative"
                    : "border-border-neo text-text-neo-tertiary",
              )}
            >
              {opt.id}
            </span>
            <span className="flex-1 text-[14px] leading-snug">{opt.text}</span>
            {showResult && isCorrect && (
              <CheckCircle2 className="size-4 text-lime-signal-400 shrink-0" />
            )}
            {showResult && !isCorrect && (
              <XCircle className="size-4 text-negative shrink-0" />
            )}
          </button>
        );
      })}

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
          <span className="text-[13px] text-negative">Chưa đúng. Thử lại nhé!</span>
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
