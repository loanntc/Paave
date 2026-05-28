// Lesson card body renderers — TextCardBody (paragraphs, bullets, tables) and
// CTACardBody ("try it now" completion flow). QuizCardBody lives in quiz-card-body.tsx.

import { CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import type { LessonCard } from "@/lib/learning/types";
import { parseBodyBlocks } from "@/lib/learning/parse-body";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Inline text renderer — supports **bold** spans
// ---------------------------------------------------------------------------

export function renderInline(text: string): React.ReactNode[] {
  return text.split(/\*\*(.*?)\*\*/g).map((part, j) =>
    j % 2 === 1 ? (
      <strong key={j} className="text-text-neo-primary font-semibold">
        {part}
      </strong>
    ) : (
      <span key={j}>{part}</span>
    ),
  );
}

// ---------------------------------------------------------------------------
// TextCardBody — Concept, Example, Myth-Buster cards
// Supports: **bold**, - bullet lists, 1. numbered lists, | tables
// ---------------------------------------------------------------------------

export function TextCardBody({ body }: { body: string }) {
  const blocks = parseBodyBlocks(body);
  return (
    <div className="space-y-2 py-2">
      {blocks.map((block, i) => {
        if (block.kind === "para") {
          return (
            <p key={i} className="text-[14px] leading-[1.6] text-text-neo-secondary">
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.kind === "bullet") {
          return (
            <ul key={i} className="space-y-1.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="mt-[7px] shrink-0 size-1.5 rounded-full bg-lime-signal-400/60" />
                  <span className="text-[14px] leading-[1.6] text-text-neo-secondary">
                    {renderInline(item)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.kind === "ordered") {
          return (
            <ol key={i} className="space-y-1.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="shrink-0 min-w-[18px] text-[12px] font-bold tabular-nums text-lime-signal-400/70 pt-[2px]">
                    {j + 1}.
                  </span>
                  <span className="text-[14px] leading-[1.6] text-text-neo-secondary">
                    {renderInline(item)}
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        if (block.kind === "table") {
          const [header, ...rows] = block.rows;
          return (
            <div key={i} className="overflow-x-auto rounded-xl border border-border-neo-subtle">
              <table className="w-full text-[12px]">
                {header && (
                  <thead>
                    <tr className="border-b border-border-neo">
                      {header.map((cell, ci) => (
                        <th
                          key={ci}
                          className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-text-neo-tertiary"
                        >
                          {renderInline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={ri < rows.length - 1 ? "border-b border-border-neo-subtle" : ""}
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-2.5 py-2 text-text-neo-secondary leading-snug">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CTACardBody — "Try it now" card (final card in a lesson)
// ---------------------------------------------------------------------------

export function CTACardBody({
  card,
  onAction,
  completed,
  nextLesson,
  ctaRoute,
  onNavigate,
  xpPerLesson,
}: {
  card: LessonCard;
  onAction: () => void;
  completed: boolean;
  nextLesson: { id: string; titleVi: string } | null;
  ctaRoute: string | null;
  onNavigate: (href: string) => void;
  xpPerLesson: number;
}) {
  return (
    <div className="py-4 space-y-4">
      <TextCardBody body={card.body} />

      {completed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-lime-signal-400/10 border border-lime-signal-400/30">
            <CheckCircle2 className="size-5 text-lime-signal-400 shrink-0" />
            <div>
              <p className="text-[14px] text-lime-signal-400 font-bold leading-snug">
                Bài học hoàn thành!
              </p>
              <p className="text-[11px] text-lime-signal-400/70">
                +{xpPerLesson} XP được cộng vào hồ sơ của bạn
              </p>
            </div>
          </div>

          {nextLesson && (
            <button
              onClick={() => onNavigate(`/grow/lesson/${nextLesson.id}`)}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-lime-signal-400 text-ink-violet-base font-display text-[15px] font-bold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <ChevronRight className="size-4" strokeWidth={2.5} />
              Bài tiếp theo
            </button>
          )}

          {ctaRoute && (
            <button
              onClick={() => onNavigate(ctaRoute)}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-lime-signal-400/40 text-lime-signal-400 text-[14px] font-bold hover:bg-lime-signal-400/10 transition-colors"
            >
              <ExternalLink className="size-4" strokeWidth={2} />
              {card.ctaLabel ?? "Thực hành"}
            </button>
          )}

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
            Hoàn thành thực hành để nhận +{xpPerLesson} XP và mở bài tiếp theo.
          </p>
        </>
      )}
    </div>
  );
}
