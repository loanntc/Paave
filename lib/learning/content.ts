// F0 Learning Path — Module registry
// Source: docs/business/FRD/module-f0-learning-content.md
// All 4 modules with complete card content (20 lessons × 5 cards).
// Lesson content lives in content-m1.ts through content-m4.ts.
import type { LearningModule, Lesson } from "./types";
import { L1_1, L1_2, L1_3, L1_4, L1_5 } from "./content-m1";
import { L2_1, L2_2, L2_3, L2_4, L2_5 } from "./content-m2";
import { L3_1, L3_2, L3_3, L3_4, L3_5 } from "./content-m3";
import { L4_1, L4_2, L4_3, L4_4, L4_5 } from "./content-m4";

export const MODULES: readonly LearningModule[] = [
  {
    id: "M1",
    titleVi: "Thị trường Cổ phiếu VN",
    titleEn: "The VN Stock Market",
    description: "Hiểu cổ phiếu là gì, sàn giao dịch HoSE & HNX, bảng giá và biên độ dao động.",
    lessons: [L1_1, L1_2, L1_3, L1_4, L1_5],
    lessonXP: 125,
    bonusXP: 0,
    badgeName: "Market Foundations",
    badgeRarity: "COMMON",
    prerequisites: [],
  },
  {
    id: "M2",
    titleVi: "Lệnh Giao dịch Đầu tiên",
    titleEn: "Your First Trade",
    description: "Học cách đặt lệnh mua/bán, lô giao dịch, T+2 settlement và đọc P&L.",
    lessons: [L2_1, L2_2, L2_3, L2_4, L2_5],
    lessonXP: 125,
    bonusXP: 0,
    badgeName: "First Trader",
    badgeRarity: "COMMON",
    prerequisites: ["M1"],
    prerequisiteHint: "Hoàn thành Module 1 để mở khóa",
  },
  {
    id: "M3",
    titleVi: "Tư duy Danh mục",
    titleEn: "Thinking in Portfolios",
    description: "Đa dạng hóa, ngành kinh tế VN, watchlist và sức khỏe danh mục AI.",
    lessons: [L3_1, L3_2, L3_3, L3_4, L3_5],
    lessonXP: 125,
    bonusXP: 25,
    badgeName: "Portfolio Thinker",
    badgeRarity: "UNCOMMON",
    prerequisites: ["M2"],
    prerequisiteHint: "Hoàn thành Module 2 và đặt ≥3 lệnh để mở khóa",
  },
  {
    id: "M4",
    titleVi: "Tâm lý Giao dịch",
    titleEn: "Trader Psychology",
    description: "FOMO, bán hoảng loạn, overtrading và xây dựng quy tắc giao dịch cá nhân.",
    lessons: [L4_1, L4_2, L4_3, L4_4, L4_5],
    lessonXP: 125,
    bonusXP: 75,
    badgeName: "Market Scholar",
    badgeRarity: "COMMON",
    prerequisites: ["M3"],
    prerequisiteHint: "Hoàn thành Module 3 và giao dịch ≥5 ngày khác nhau để mở khóa",
  },
] as const;

/** All lessons flat — for O(1) lookup by id */
export const LESSONS_BY_ID: Readonly<Record<string, Lesson>> = Object.fromEntries(
  MODULES.flatMap((m) => m.lessons).map((l) => [l.id, l]),
);

/** Module by id */
export const MODULES_BY_ID: Readonly<Record<string, LearningModule>> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
);
