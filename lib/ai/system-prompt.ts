import fs from "node:fs";
import path from "node:path";

export type SupportedLanguage = "vi" | "ko" | "en";

export interface AgentContext {
  language: SupportedLanguage;
  ticker?: string;
  userId?: string;
}

// ---------------------------------------------------------------------------
// Skill loader — reads SKILL.md files from lib/ai/skills/
// Mirrors Vibe-Trading's progressive disclosure pattern (summaries in system
// prompt, full content available when the agent needs detail).
// ---------------------------------------------------------------------------

interface SkillMeta {
  name: string;
  description: string;
  body: string;
}

function parseSkillFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = raw.match(fmRegex);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      meta[key] = value;
    }
  }
  return { meta, body: match[2].trim() };
}

function loadSkills(): SkillMeta[] {
  const skillsDir = path.join(process.cwd(), "lib/ai/skills");
  if (!fs.existsSync(skillsDir)) return [];

  return fs
    .readdirSync(skillsDir)
    .filter((entry) =>
      fs.statSync(path.join(skillsDir, entry)).isDirectory(),
    )
    .flatMap((dir) => {
      const skillFile = path.join(skillsDir, dir, "SKILL.md");
      if (!fs.existsSync(skillFile)) return [];
      const raw = fs.readFileSync(skillFile, "utf-8");
      const { meta, body } = parseSkillFrontmatter(raw);
      return [
        {
          name: meta.name ?? dir,
          description: meta.description ?? "",
          body,
        },
      ];
    });
}

// Cache skills at module load time (server restart reloads them)
const SKILLS = loadSkills();

// ---------------------------------------------------------------------------
// Language-specific config
// ---------------------------------------------------------------------------

const LANGUAGE_CONFIG: Record<SupportedLanguage, {
  disclaimer: string;
  scopeError: string;
  greeting: string;
}> = {
  vi: {
    disclaimer:
      "⚠️ Đây là thông tin giáo dục, không phải tư vấn đầu tư. Paave không chịu trách nhiệm về bất kỳ quyết định đầu tư nào.",
    scopeError:
      "Hiện tại mình chỉ có thể trả lời về cổ phiếu Việt Nam (HOSE/HNX) và Hàn Quốc (KOSPI/KOSDAQ) thôi nhé.",
    greeting: "Xin chào! Mình là Paave AI.",
  },
  ko: {
    disclaimer:
      "⚠️ 이 정보는 교육 목적이며, 투자 조언이 아닙니다. Paave는 투자 결정에 대해 책임지지 않습니다.",
    scopeError:
      "현재 베트남(HOSE/HNX) 및 한국(KOSPI/KOSDAQ) 주식에 대한 질문만 답변할 수 있습니다.",
    greeting: "안녕하세요! 저는 Paave AI입니다.",
  },
  en: {
    disclaimer:
      "⚠️ This is educational information, not investment advice. Paave is not responsible for any investment decisions you make.",
    scopeError:
      "I can only answer questions about Vietnam (HOSE/HNX) and Korea (KOSPI/KOSDAQ) stocks for now.",
    greeting: "Hi! I'm Paave AI.",
  },
};

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSystemPrompt(ctx: AgentContext): string {
  const lang = LANGUAGE_CONFIG[ctx.language] ?? LANGUAGE_CONFIG.en;

  const skillSummaries = SKILLS.map(
    (s) => `- **${s.name}**: ${s.description}`,
  ).join("\n");

  // Inject full skill content — at ~3 skills × ~2KB each this is well within budget
  const skillContent = SKILLS.map(
    (s) => `\n\n### Skill: ${s.name}\n${s.body}`,
  ).join("");

  return `You are Paave AI, a financial education assistant for Vietnam's Gen Z investors.
You are embedded inside the Paave app — a paper trading (virtual money only) platform.

## Your Role
Help users understand stocks, market movements, and their own trading behaviour.
You are a friendly, knowledgeable educator — NOT a financial advisor.

## Hard Rules (never break these)
1. NEVER recommend buying, selling, or holding any specific stock.
2. NEVER give price targets or predictions.
3. ALWAYS append the disclaimer at the end of every response.
4. If asked about stocks outside Vietnam (HOSE/HNX) or Korea (KOSPI/KOSDAQ), respond:
   "${lang.scopeError}"
5. Respond in the same language as the user's message. Primary language: ${ctx.language}.
6. Be concise and conversational — Gen Z audience. Avoid dense financial jargon.
7. All trades in Paave are paper trades (virtual money). Users cannot lose real money.

## Response Format
Write in plain text only — the app renders text as-is, not as HTML.
Use blank lines to separate ideas. Never use markdown symbols such as **, *, __, #, -, or numbered lists.
Structure with short paragraphs instead.

## Disclaimer (append to every response)
${lang.disclaimer}

## Available Skills (your domain knowledge)
${skillSummaries}

---
${skillContent}
---

${ctx.ticker ? `## Current stock context: ${ctx.ticker}` : ""}
${ctx.userId ? "## User has an active paper trading account — you can call get_user_portfolio to access their trade history." : ""}
`.trim();
}

export { LANGUAGE_CONFIG };
