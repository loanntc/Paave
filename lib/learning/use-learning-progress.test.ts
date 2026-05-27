// ---------------------------------------------------------------------------
// Tests for useLearningProgress (FR-LEARN-07)
// Covers: module status computation, lesson completion, XP calculation,
//         card progress, quiz attempts, and welcome modal flag.
// Rule T-1: business logic tests are mandatory.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLearningProgress } from "./use-learning-progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flush all pending effects in the hook under test. */
async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("initial state", () => {
  it("starts with zero XP on first use", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.progress.totalLearningXP).toBe(0);
  });

  it("becomes hydrated=true after effects run", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.hydrated).toBe(true);
  });

  it("loads default progress when localStorage is empty", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.progress.totalLearningXP).toBe(0);
    expect(result.current.progress.welcomeModalShown).toBe(false);
    expect(result.current.progress.lessons).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Module status — getModuleStatus
// ---------------------------------------------------------------------------

describe("getModuleStatus", () => {
  it("returns UNLOCKED for M1 (no prerequisites)", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.getModuleStatus("M1")).toBe("UNLOCKED");
  });

  it("returns LOCKED for M2 when M1 is not complete", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.getModuleStatus("M2")).toBe("LOCKED");
  });

  it("returns LOCKED for M3 when M2 is not complete", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.getModuleStatus("M3")).toBe("LOCKED");
  });

  it("returns LOCKED for M4 when M3 is not complete", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.getModuleStatus("M4")).toBe("LOCKED");
  });

  it("returns IN_PROGRESS when some M1 lessons are complete", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
    });
    expect(result.current.getModuleStatus("M1")).toBe("IN_PROGRESS");
  });

  it("returns COMPLETE when all M1 lessons are done", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    // Complete all 5 M1 lessons
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
      result.current.completeLesson("L1.3", "M1");
      result.current.completeLesson("L1.4", "M1");
      result.current.completeLesson("L1.5", "M1");
    });
    expect(result.current.getModuleStatus("M1")).toBe("COMPLETE");
  });

  it("unlocks M2 when M1 is complete", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
      result.current.completeLesson("L1.3", "M1");
      result.current.completeLesson("L1.4", "M1");
      result.current.completeLesson("L1.5", "M1");
    });
    expect(result.current.getModuleStatus("M2")).toBe("UNLOCKED");
  });

  it("returns LOCKED for unknown module id", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.getModuleStatus("M99")).toBe("LOCKED");
  });
});

// ---------------------------------------------------------------------------
// completeLesson — XP and module completion
// ---------------------------------------------------------------------------

describe("completeLesson", () => {
  it("awards 25 XP for a single lesson completion", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
    });
    expect(result.current.progress.totalLearningXP).toBe(25);
  });

  it("is idempotent — completing the same lesson twice awards XP only once", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.1", "M1");
    });
    expect(result.current.progress.totalLearningXP).toBe(25);
  });

  it("marks the lesson as completed", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
    });
    expect(result.current.progress.lessons["L1.1"]?.completed).toBe(true);
    expect(result.current.progress.lessons["L1.1"]?.cardIndex).toBe(4);
  });

  it("awards module bonus XP when all module lessons complete", async () => {
    // M2 has bonusXP = 0 per content.ts; M3 = 25; M4 = 75
    // Use M1 which has bonusXP = 0 — total should be 5 * 25 = 125
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
      result.current.completeLesson("L1.3", "M1");
      result.current.completeLesson("L1.4", "M1");
      result.current.completeLesson("L1.5", "M1");
    });
    // 5 × 25 XP = 125; M1 bonusXP = 0
    expect(result.current.progress.totalLearningXP).toBe(125);
  });

  it("records the module completion timestamp when all lessons done", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
      result.current.completeLesson("L1.3", "M1");
      result.current.completeLesson("L1.4", "M1");
      result.current.completeLesson("L1.5", "M1");
    });
    expect(result.current.progress.modulesCompleted["M1"]).toBeTruthy();
    // value should be an ISO date string
    expect(typeof result.current.progress.modulesCompleted["M1"]).toBe("string");
  });

  it("does not record module complete timestamp if only some lessons done", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
    });
    expect(result.current.progress.modulesCompleted["M1"]).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// saveCardProgress
// ---------------------------------------------------------------------------

describe("saveCardProgress", () => {
  it("saves the card index", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.saveCardProgress("L1.1", 2);
    });
    expect(result.current.progress.lessons["L1.1"]?.cardIndex).toBe(2);
    expect(result.current.progress.lessons["L1.1"]?.completed).toBe(false);
  });

  it("only updates if new index is greater than stored index", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.saveCardProgress("L1.1", 3);
    });
    await act(async () => {
      result.current.saveCardProgress("L1.1", 1); // regress attempt
    });
    // Must not go backwards
    expect(result.current.progress.lessons["L1.1"]?.cardIndex).toBe(3);
  });

  it("does not mark lesson as completed even at card 4", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.saveCardProgress("L1.1", 4);
    });
    expect(result.current.progress.lessons["L1.1"]?.completed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// incrementQuizAttempts
// ---------------------------------------------------------------------------

describe("incrementQuizAttempts", () => {
  it("increments quiz attempt count each call", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.incrementQuizAttempts("L1.1");
      result.current.incrementQuizAttempts("L1.1");
      result.current.incrementQuizAttempts("L1.1");
    });
    expect(result.current.progress.lessons["L1.1"]?.quizAttempts).toBe(3);
  });

  it("preserves existing cardIndex when incrementing attempts on a started lesson", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.saveCardProgress("L1.1", 2); // sets cardIndex = 2
      result.current.incrementQuizAttempts("L1.1"); // must not overwrite cardIndex
    });
    // saveCardProgress already set cardIndex to 2; incrementQuizAttempts should not override it
    expect(result.current.progress.lessons["L1.1"]?.cardIndex).toBe(2);
    expect(result.current.progress.lessons["L1.1"]?.quizAttempts).toBe(1);
  });

  it("initialises card index to 3 (quiz card) when no prior record exists", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.incrementQuizAttempts("L1.2"); // no prior saveCardProgress call
    });
    expect(result.current.progress.lessons["L1.2"]?.cardIndex).toBe(3);
    expect(result.current.progress.lessons["L1.2"]?.quizAttempts).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Welcome modal flag
// ---------------------------------------------------------------------------

describe("markWelcomeModalShown", () => {
  it("sets welcomeModalShown to true", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.progress.welcomeModalShown).toBe(false);
    await act(async () => {
      result.current.markWelcomeModalShown();
    });
    expect(result.current.progress.welcomeModalShown).toBe(true);
  });

  it("persists the flag to localStorage", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.markWelcomeModalShown();
    });
    const stored = JSON.parse(localStorage.getItem("paave_learning_v1") ?? "{}");
    expect(stored.welcomeModalShown).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Selectors — isLessonCompleted / isModuleCompleted
// ---------------------------------------------------------------------------

describe("selectors", () => {
  it("isLessonCompleted returns false before completing", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.isLessonCompleted("L1.1")).toBe(false);
  });

  it("isLessonCompleted returns true after completing", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
    });
    expect(result.current.isLessonCompleted("L1.1")).toBe(true);
  });

  it("isModuleCompleted returns false before completing all lessons", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.isModuleCompleted("M1")).toBe(false);
  });

  it("isModuleCompleted returns true after completing all module lessons", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
      result.current.completeLesson("L1.3", "M1");
      result.current.completeLesson("L1.4", "M1");
      result.current.completeLesson("L1.5", "M1");
    });
    expect(result.current.isModuleCompleted("M1")).toBe(true);
  });

  it("getModuleCompletedLessons counts completed lessons in a module", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.completeLesson("L1.1", "M1");
      result.current.completeLesson("L1.2", "M1");
    });
    expect(result.current.getModuleCompletedLessons("M1")).toBe(2);
  });

  it("getLessonProgress returns null for an un-started lesson", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(result.current.getLessonProgress("L1.1")).toBeNull();
  });

  it("getLessonProgress returns the progress record after saving", async () => {
    const { result } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result.current.saveCardProgress("L1.1", 1);
    });
    const p = result.current.getLessonProgress("L1.1");
    expect(p).not.toBeNull();
    expect(p?.cardIndex).toBe(1);
    expect(p?.completed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("localStorage persistence", () => {
  it("persists progress across hook re-mounts", async () => {
    // First mount — complete a lesson
    const { result: r1, unmount } = renderHook(() => useLearningProgress());
    await flushEffects();
    await act(async () => {
      result1complete(r1);
    });
    unmount();

    // Second mount — should restore the completed lesson
    const { result: r2 } = renderHook(() => useLearningProgress());
    await flushEffects();
    expect(r2.current.progress.totalLearningXP).toBe(25);
    expect(r2.current.isLessonCompleted("L1.1")).toBe(true);
  });
});

function result1complete(
  r: ReturnType<typeof renderHook<ReturnType<typeof useLearningProgress>>>["result"],
) {
  r.current.completeLesson("L1.1", "M1");
}
