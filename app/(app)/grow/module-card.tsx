// ModuleCard — one expandable card per F0 learning module.
// Displays module header, gradient accent, progress bar, lesson list, and CTA.
// All pure display; state lives in GrowView via useLearningProgress.

import Link from "next/link";
import { BookOpen, CheckCircle2, Lock, Play, RotateCcw, Star, Trophy, Zap } from "lucide-react";
import type { LearningModule } from "@/lib/learning/types";
import { cn } from "@/lib/utils";

export type ModuleStatus = "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETE";

const MODULE_GRADIENTS: Record<string, string> = {
  M1: "from-violet-deep-800 to-violet-deep-900",
  M2: "from-blue-900/60 to-ink-violet-surface",
  M3: "from-emerald-900/40 to-ink-violet-surface",
  M4: "from-orange-900/40 to-ink-violet-surface",
};

const MODULE_ACCENTS: Record<string, string> = {
  M1: "text-violet-deep-200",
  M2: "text-sky-300",
  M3: "text-emerald-300",
  M4: "text-orange-300",
};

const MODULE_ICONS = ["📈", "🎯", "🗂️", "🧠"] as const;

export function ModuleCard({
  module,
  status,
  completedLessons,
  moduleIndex,
  progress,
}: {
  module: LearningModule;
  status: ModuleStatus;
  completedLessons: number;
  moduleIndex: number;
  progress: Record<string, { completed: boolean; cardIndex: number }>;
}) {
  const totalLessons = module.lessons.length;
  const pct = Math.round((completedLessons / totalLessons) * 100);
  const gradient = MODULE_GRADIENTS[module.id] ?? "from-ink-violet-surface to-ink-violet-base";
  const accent = MODULE_ACCENTS[module.id] ?? "text-lime-signal-400";
  const emoji = MODULE_ICONS[moduleIndex - 1] ?? "📚";

  // Find the first incomplete lesson to resume / start
  const resumeLesson =
    status === "IN_PROGRESS"
      ? module.lessons.find((l) => !progress[l.id]?.completed)
      : status === "UNLOCKED"
        ? module.lessons[0]
        : null;

  const isLocked = status === "LOCKED";
  const isComplete = status === "COMPLETE";

  const cardContent = (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-all",
        isLocked
          ? "border-border-neo-subtle opacity-60"
          : isComplete
            ? "border-lime-signal-400/30"
            : "border-border-neo hover:border-border-neo active:scale-[0.99]",
      )}
    >
      {/* Module header */}
      <div className={cn("px-4 pt-5 pb-4 bg-gradient-to-br", gradient)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[28px] leading-none">{emoji}</span>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.8px] mb-0.5", accent)}>
                Module {moduleIndex}
              </p>
              <h3 className="font-display text-[16px] font-bold text-text-neo-primary leading-tight">
                {module.titleVi}
              </h3>
            </div>
          </div>

          {/* Status icon */}
          <div className="shrink-0 mt-0.5">
            {isLocked && <Lock className="size-5 text-text-neo-tertiary" strokeWidth={2} />}
            {isComplete && <CheckCircle2 className="size-5 text-lime-signal-400" strokeWidth={2} />}
            {!isLocked && !isComplete && (
              <div className="size-8 rounded-full bg-lime-signal-400 grid place-items-center">
                {status === "IN_PROGRESS" ? (
                  <Play className="size-4 text-ink-violet-base fill-ink-violet-base" />
                ) : (
                  <BookOpen className="size-4 text-ink-violet-base" />
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-[12px] text-text-neo-tertiary leading-relaxed">
          {module.description}
        </p>

        {/* Progress bar — shown for in-progress and complete modules */}
        {(status === "IN_PROGRESS" || isComplete) && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] text-text-neo-tertiary">
              <span>{completedLessons}/{totalLessons} bài</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-violet-raised overflow-hidden">
              <div
                className="h-full rounded-full bg-lime-signal-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Module footer — rewards + CTA label */}
      <div className="px-4 py-3 bg-ink-violet-surface flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[11px] text-text-neo-tertiary">
          <span className="flex items-center gap-1">
            <Zap className="size-3 text-lime-signal-400" />
            {module.lessonXP + module.bonusXP} XP
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="size-3 text-yellow-400" />
            {module.badgeName}
          </span>
        </div>

        {isLocked && (
          <span className="text-[11px] text-text-neo-tertiary">{module.prerequisiteHint}</span>
        )}
        {isComplete && (
          <span className="flex items-center gap-1 text-[11px] text-lime-signal-400 font-bold">
            <RotateCcw className="size-3" />
            Ôn lại
          </span>
        )}
        {!isLocked && !isComplete && (
          <span className="text-[11px] font-bold text-lime-signal-400">
            {status === "IN_PROGRESS" ? "Tiếp tục →" : "Bắt đầu →"}
          </span>
        )}
      </div>

      {/* Lesson list — shown for unlocked / in-progress / complete modules */}
      {!isLocked && (
        <ul className="divide-y divide-border-neo-subtle">
          {module.lessons.map((lesson) => {
            const lessonDone = progress[lesson.id]?.completed === true;
            const isCurrent = !isComplete && resumeLesson?.id === lesson.id;
            return (
              <li key={lesson.id}>
                <Link
                  href={`/grow/lesson/${lesson.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-violet-raised",
                    isCurrent && "bg-ink-violet-raised/50",
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 size-7 rounded-full grid place-items-center text-[11px] font-bold",
                      lessonDone
                        ? "bg-lime-signal-400/15 text-lime-signal-400"
                        : isCurrent
                          ? "bg-lime-signal-400 text-ink-violet-base"
                          : "bg-ink-violet-raised text-text-neo-tertiary",
                    )}
                  >
                    {lessonDone ? (
                      <CheckCircle2 className="size-4" strokeWidth={2.5} />
                    ) : (
                      <span>{lesson.index}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13px] font-medium truncate",
                        lessonDone ? "text-text-neo-secondary" : "text-text-neo-primary",
                      )}
                    >
                      {lesson.titleVi}
                    </p>
                    <p className="text-[11px] text-text-neo-tertiary">
                      5 thẻ · +{Math.round(module.lessonXP / module.lessons.length)} XP
                    </p>
                  </div>
                  {isCurrent && (
                    <Star className="size-4 text-lime-signal-400 shrink-0" strokeWidth={2} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  // Locked modules are not navigable — render as a plain div
  if (isLocked) return cardContent;

  // Unlocked, in-progress, and complete modules are all navigable via their lesson links
  return cardContent;
}
