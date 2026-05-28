// Tests for useLearningProgress — module status and selector computations
// Covers: getModuleStatus (LOCKED / UNLOCKED / IN_PROGRESS / COMPLETE),
//         isLessonCompleted, isModuleCompleted, getModuleCompletedLessons,
//         getLessonProgress
// Companion file: use-learning-progress.test.ts (mutation tests)

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLearningProgress } from "./use-learning-progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
});

// ---------------------------------------------------------------------------
// getModuleStatus
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
// Selectors — isLessonCompleted / isModuleCompleted / getLessonProgress
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
