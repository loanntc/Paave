// ---------------------------------------------------------------------------
// F0 Learning Path — Core Types
// FRD: docs/business/FRD/module-f0-learning.md
// ---------------------------------------------------------------------------

/** Card types in fixed sequence per lesson: Concept → Example → MythBuster → Quiz → CTA */
export type CardType = "CONCEPT" | "EXAMPLE" | "MYTH_BUSTER" | "QUIZ" | "CTA";

/** CTA action types — dictate what happens when user taps the CTA card */
export type CTAActionType =
  | "BROWSE_STOCK_LIST"
  | "CHECK_MARKET_SESSION"
  | "OPEN_PRICE_BOARD"
  | "READ_NEWS_ARTICLE"
  | "ATTEMPT_CEILING_ORDER"
  | "PLACE_MARKET_ORDER"
  | "ATTEMPT_ODD_LOT_ORDER"
  | "PLACE_LIMIT_BUY"
  | "VIEW_T2_LABEL"
  | "OPEN_PNL_TAB"
  | "VIEW_SECTOR_BREAKDOWN"
  | "USE_SECTOR_FILTER"
  | "ADD_TO_WATCHLIST"
  | "SET_PRICE_ALERT"
  | "OPEN_AI_INSIGHTS"
  | "VIEW_FOMO_PATTERNS"
  | "VIEW_BEHAVIORAL_FLAGS"
  | "VIEW_FEE_TOTAL"
  | "VIEW_REALIZED_PNL"
  | "SHARE_TRADING_RULES";

export interface QuizOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface LessonCard {
  type: CardType;
  /** Main heading shown at the top of the card */
  heading: string;
  /** Body content — supports markdown-ish line breaks via \n */
  body: string;
  /** Quiz only: answer options */
  options?: QuizOption[];
  /** Quiz only: correct option id */
  correctOption?: "A" | "B" | "C" | "D";
  /** Quiz only: hint shown after 3 consecutive wrong answers */
  hint?: string;
  /** CTA only: action to trigger */
  ctaAction?: CTAActionType;
  /** CTA only: button label */
  ctaLabel?: string;
}

export interface Lesson {
  id: string;                   // e.g. "L1.1"
  moduleId: string;             // e.g. "M1"
  /** Lesson number within module (1-based) */
  index: number;
  titleVi: string;
  titleEn: string;
  cards: readonly [LessonCard, LessonCard, LessonCard, LessonCard, LessonCard]; // exactly 5
}

export type ModuleStatus = "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETE";

export interface LearningModule {
  id: string;                    // "M1" | "M2" | "M3" | "M4"
  titleVi: string;
  titleEn: string;
  description: string;
  lessons: readonly Lesson[];    // exactly 5
  /** XP awarded on all lessons complete */
  lessonXP: number;
  /** Bonus XP on module completion event */
  bonusXP: number;
  /** Badge name awarded */
  badgeName: string;
  badgeRarity: "COMMON" | "UNCOMMON" | "RARE";
  /** Module IDs that must be COMPLETE before this unlocks */
  prerequisites: string[];
  /** Extra prerequisite description shown to user */
  prerequisiteHint?: string;
}

// ---------------------------------------------------------------------------
// Session progress — client-side (localStorage) until DB migration runs
// ---------------------------------------------------------------------------
export interface LessonSessionProgress {
  lessonId: string;
  /** 0-indexed card position last reached (0 = haven't started) */
  cardIndex: number;
  completed: boolean;
  quizAttempts: number;
  updatedAt: string; // ISO timestamp
}

export interface UserLearningProgress {
  /** lesson id → session progress */
  lessons: Record<string, LessonSessionProgress>;
  /** module id → completion timestamp or null */
  modulesCompleted: Record<string, string | null>;
  welcomeModalShown: boolean;
  totalLearningXP: number;
}
