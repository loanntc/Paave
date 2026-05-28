"use client";

// ---------------------------------------------------------------------------
// Learning progress — client-side localStorage store
// Persists across page refreshes; syncs to Supabase once the DB migration runs.
// FRD: module-f0-learning.md (FR-LEARN-07)
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import type { UserLearningProgress, LessonSessionProgress } from "./types";
import { MODULES } from "./content";

const STORAGE_KEY = "paave_learning_v1";

const DEFAULT_PROGRESS: UserLearningProgress = {
  lessons: {},
  modulesCompleted: Object.fromEntries(MODULES.map((m) => [m.id, null])),
  welcomeModalShown: false,
  totalLearningXP: 0,
};

function load(): UserLearningProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } as UserLearningProgress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function save(progress: UserLearningProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage quota exceeded — silently swallow; next write may succeed
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useLearningProgress() {
  const [progress, setProgress] = useState<UserLearningProgress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(load());
    setHydrated(true);
  }, []);

  // Persist to localStorage on every state change after hydration
  useEffect(() => {
    if (hydrated) save(progress);
  }, [progress, hydrated]);

  // ── Selectors ─────────────────────────────────────────────────────────────

  const getLessonProgress = useCallback(
    (lessonId: string): LessonSessionProgress | null =>
      progress.lessons[lessonId] ?? null,
    [progress],
  );

  const isLessonCompleted = useCallback(
    (lessonId: string): boolean =>
      progress.lessons[lessonId]?.completed === true,
    [progress],
  );

  const isModuleCompleted = useCallback(
    (moduleId: string): boolean => progress.modulesCompleted[moduleId] != null,
    [progress],
  );

  const getModuleCompletedLessons = useCallback(
    (moduleId: string): number => {
      const module = MODULES.find((m) => m.id === moduleId);
      if (!module) return 0;
      return module.lessons.filter((l) => progress.lessons[l.id]?.completed).length;
    },
    [progress],
  );

  /** Compute module status from current progress */
  const getModuleStatus = useCallback(
    (moduleId: string): "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETE" => {
      const module = MODULES.find((m) => m.id === moduleId);
      if (!module) return "LOCKED";
      // Check prerequisites
      const prereqsMet = module.prerequisites.every((pId) => isModuleCompleted(pId));
      if (!prereqsMet) return "LOCKED";
      if (isModuleCompleted(moduleId)) return "COMPLETE";
      const completedCount = getModuleCompletedLessons(moduleId);
      if (completedCount > 0) return "IN_PROGRESS";
      return "UNLOCKED";
    },
    [isModuleCompleted, getModuleCompletedLessons],
  );

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Called when user views/saves card progress within a lesson */
  const saveCardProgress = useCallback(
    (lessonId: string, cardIndex: number) => {
      setProgress((prev) => {
        const existing = prev.lessons[lessonId] ?? {
          lessonId,
          cardIndex: 0,
          completed: false,
          quizAttempts: 0,
          updatedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              ...existing,
              cardIndex: Math.max(existing.cardIndex, cardIndex),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [],
  );

  const incrementQuizAttempts = useCallback((lessonId: string) => {
    setProgress((prev) => {
      const existing = prev.lessons[lessonId] ?? {
        lessonId,
        cardIndex: 3, // quiz is card index 3
        completed: false,
        quizAttempts: 0,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            ...existing,
            quizAttempts: existing.quizAttempts + 1,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  /** Called when user completes the CTA card (card 5) — awards XP, marks lesson done */
  const completeLesson = useCallback(
    (lessonId: string, moduleId: string) => {
      const XP_PER_LESSON = 25; // 5 lessons × 25 = 125 XP per module

      setProgress((prev) => {
        const alreadyCompleted = prev.lessons[lessonId]?.completed === true;
        if (alreadyCompleted) return prev; // idempotent

        const module = MODULES.find((m) => m.id === moduleId);
        const updatedLessons = {
          ...prev.lessons,
          [lessonId]: {
            lessonId,
            cardIndex: 4,
            completed: true,
            quizAttempts: prev.lessons[lessonId]?.quizAttempts ?? 0,
            updatedAt: new Date().toISOString(),
          },
        };

        // Check if all module lessons are now complete
        const allModuleLessonsComplete =
          module?.lessons.every((l) =>
            l.id === lessonId ? true : updatedLessons[l.id]?.completed === true,
          ) ?? false;

        const updatedModulesCompleted = allModuleLessonsComplete
          ? { ...prev.modulesCompleted, [moduleId]: new Date().toISOString() }
          : prev.modulesCompleted;

        const bonusXP = allModuleLessonsComplete ? (module?.bonusXP ?? 0) : 0;

        return {
          ...prev,
          lessons: updatedLessons,
          modulesCompleted: updatedModulesCompleted,
          totalLearningXP: prev.totalLearningXP + XP_PER_LESSON + bonusXP,
        };
      });
    },
    [],
  );

  const markWelcomeModalShown = useCallback(() => {
    setProgress((prev) => ({ ...prev, welcomeModalShown: true }));
  }, []);

  return {
    progress,
    hydrated,
    // selectors
    getLessonProgress,
    isLessonCompleted,
    isModuleCompleted,
    getModuleCompletedLessons,
    getModuleStatus,
    // mutations
    saveCardProgress,
    incrementQuizAttempts,
    completeLesson,
    markWelcomeModalShown,
  };
}
