---
name: business-planner
description: >
  Comprehensive business planning for any industry — from idea to launch-ready strategy.
  Trigger for: starting a business, evaluating a business idea, writing a business plan,
  competitor analysis, go-to-market strategy, legal requirements, customer acquisition,
  startup planning, investment/budget, or business risk. Also trigger for phrases like
  "I want to start a...", "is this a good idea?", "how do I launch...", "what's my target market",
  "how do I beat competitors". Always trigger even if only one aspect is mentioned.
  CROSS-SKILL: Routes to docx/pdf/pptx/xlsx for export; business-analyst for BRD/FRD;
  product-design for digital products; trading-system-architect for fintech/securities;
  frontend-design for UI/web. Uses web_search for live market and competitor data.
  Offers GitHub push when project context is present.
  Activates specialist industry subagents (fintech, edtech, ecommerce, saas, f&b,
  healthcare, real estate, manufacturing, logistics, agritech, etc.) for expert-level
  analysis per plan section.
---

# Business Planner Skill

A structured, expert-level framework for planning any business idea — from validation to launch strategy.
Covers all industries via **specialist Industry Subagents**. Integrates with the full skill ecosystem.

---

## Cross-Skill Routing Map

Before generating the plan, check context for these signals and route accordingly:

| Signal | Action |
|---|---|
| User wants output as Word doc | After plan → invoke `docx` skill |
| User wants PDF (e.g., for investors) | After plan → invoke `pdf` skill |
| User wants pitch deck | After plan → invoke `pptx` skill |
| User needs financial model / budget spreadsheet | After plan → invoke `xlsx` skill |
| Business involves building a digital product/app | Route product sections to `product-design` skill |
| User needs BRD/FRD/SRD for a product feature | Route to `business-analyst` skill |
| Business is fintech, securities, or trading | Route regulatory/tech sections to `trading-system-architect` skill |
| User needs landing page or web UI | Route to `frontend-design` skill |
| User asks about competitors, market size, trends | Use `web_search` actively for live data |
| User mentions a GitHub repo or project | Offer to push output files to Git (see Export & Git section) |

**Always complete the full business plan first. Routing and export happen after delivery.**

---

## Industry Subagent System

This skill spawns **specialist Industry Subagents** to provide expert-level analysis per domain.
Each subagent is an expert persona adopted when handling industry-specific sections.

### How to Activate

When the business idea maps to an industry below, activate the relevant subagent for:
- Section 2 (Market Research) — industry-specific data sources and sizing methods
- Section 3 (Competitor Analysis) — naming real players in that space
- Section 6 (Legal Requirements) — sector-specific regulations
- Section 11 (Survival Strategy) — industry-specific moats and dynamics

Activation syntax:
```
🤖 ACTIVATING SUBAGENT: [Industry Name] Expert
   Region context: [country/city]
   Sections enhanced: Market Research, Competitor Analysis, Legal, Survival Strategy
```

### Available Industry Subagents

| Industry | Subagent Persona | Key Expertise |
|---|---|---|
| **Fintech / Payments** | Fintech Strategist | PSP/e-money licensing, PCI-DSS, banking partnerships, CAC benchmarks |
| **EdTech** | EdTech Growth Expert | Curriculum alignment, B2B2C school models, LMS competition, MOE compliance |
| **E-commerce / Retail** | D2C Commerce Specialist | Unit economics, fulfillment, marketplace vs. own-site, ROAS |
| **SaaS / B2B Software** | SaaS Growth Advisor | ARR/MRR, churn benchmarks, PLG vs. sales-led, SOC2 |
| **F&B / Restaurant** | F&B Operations Expert | COGS targets (28–32%), foot traffic, food safety licensing, franchise |
| **Healthcare / MedTech** | Healthcare Regulatory Expert | FDA/CE/MOH approval, HIPAA, reimbursement models |
| **Real Estate / PropTech** | Real Estate Strategist | Capital structure, licensing, market cycles, PropTech disruption |
| **Manufacturing / Hardware** | Manufacturing Operations Expert | CapEx, supply chain, MOQ negotiation, IP protection |
| **Media / Content / Creator** | Creator Economy Expert | Monetization, platform dependency risks, audience ownership |
| **Logistics / Supply Chain** | Logistics Operations Expert | Last-mile economics, 3PL vs. owned fleet, customs/compliance |
| **Agriculture / AgriTech** | AgriTech Strategist | Seasonal cash flow, government subsidies, distribution channels |
| **Travel / Hospitality** | Travel & Hospitality Expert | RevPAR/ADR metrics, OTA dependency, seasonality |
| **Legal / Professional Services** | Professional Services Advisor | Billable model design, referral networks, liability and insurance |
| **Education / Training** | Education Business Expert | B2B vs. B2C, accreditation, corporate L&D market |
| **General / Cross-industry** | Senior Business Strategist | Used when no specific subagent matches |

> If the business spans multiple industries (e.g., HealthTech SaaS), activate multiple subagents and synthesize their outputs per section.

---

## Step 1 — Intake

Ask the user for (extract from context first — only ask for what's missing):

1. **The business idea** (what product/service, for whom)
2. **Location/region** (country or city — affects legal, market, and subagent selection)
3. **Stage** — idea only / MVP / already launched?
4. **Budget range** — bootstrapped / <$10K / $10K–$100K / $100K+
5. **Industry** — to activate the right subagent(s)

---

## Step 2 — Subagent Activation

Based on intake, declare active subagents before proceeding:

```
🤖 ACTIVATING: [Industry] Expert | Region: [country/city]
   Enhancing: Market Research · Competitor Analysis · Legal · Survival Strategy
```

---

## Step 3 — Generate the Business Plan

Produce a structured summary with all sections. Keep each section concise (3–6 bullets or short paragraph).
After delivery, offer deep dives on any section on request.

---

## Business Plan Structure

### 1. 🧠 Idea Validation & Fundamentals
- What problem does this solve? Is the pain point real and recurring?
- Who specifically has this problem (target persona)?
- Is the timing right — why now?
- What does success look like in Year 1?
- Red flags or critical assumptions to validate early

### 2. 📊 Market Research
*(Subagent-enhanced: industry-specific data sources and sizing method)*

- Market size: TAM → SAM → SOM with appropriate sizing method for this industry
- Market trends — growing, shrinking, or disrupted?
- Customer segments and behaviors
- Underserved gaps or opportunities
- Specific research sources recommended for this industry

*Use `web_search` for real market data. Cite sources. See `references/market-research.md` for deep dive.*

### 3. ⚔️ Competitor Analysis
*(Subagent-enhanced: names real players in the specific industry and region)*

- Top 3–5 direct competitors (named, with brief positioning)
- Indirect competitors (alternative solutions)
- Competitor strengths and weaknesses
- Market positioning map (price vs. quality, niche vs. mass)
- The exploitable gap for this business

*Use `web_search` for live competitor data. See `references/competitive-strategy.md` for deep dive.*

### 4. ✅ Pros & Cons Assessment

**Pros:** Real advantages, favorable conditions
**Cons:** Genuine risks, capital requirements, skill gaps
**Verdict:** Honest one-paragraph viability assessment

### 5. 💼 Business Model Options
- 2–3 viable models (subscription, marketplace, service retainer, freemium, etc.)
- For each: how revenue is generated, who pays, when cash flows in
- Recommended model for this context and budget
- Pricing strategy framework (cost-plus, value-based, competitive)

> 🔗 *If this business involves building a digital product or app → route to `product-design` skill after planning.*

### 6. ⚖️ Legal Requirements
*(Subagent-enhanced: sector-specific regulations for the stated region)*

- Business structure options and tradeoffs
- Registration steps for the user's region
- Licenses, permits, certifications specific to this industry
- IP considerations (trademarks, patents, copyright)
- Tax obligations
- Data/privacy compliance (GDPR, PDPA, HIPAA, etc. — as applicable)

*See `references/legal-frameworks.md` for deep dive.*

> ⚠️ *Legal requirements vary by jurisdiction. This is a general framework — consult a licensed lawyer and accountant.*

### 7. 💰 Investment & Budget Planning
- Startup cost categories per phase (pre-launch / launch / months 1–6)
- Funding options: bootstrapping, loans, angels, grants, crowdfunding
- Break-even analysis framework
- Cash flow warning signs in Year 1

*See `references/financial-planning.md` for deep dive.*

> ⚠️ *Projections are estimates. Work with a qualified accountant or financial advisor.*

### 8. 🎯 Customer Acquisition Strategy
- Ideal Customer Profile (ICP): demographics, psychographics, behaviors, triggers
- Channels: organic (SEO, content, referrals) vs. paid (ads, partnerships)
- First 10 / First 100 customers — practical early-traction tactics
- CAC considerations and sales funnel overview

### 9. 🔁 Customer Retention Strategy
- Onboarding experience design
- Loyalty mechanisms: rewards, community, subscriptions, personalization
- Feedback loops and churn signal response
- LTV optimization — upsells, referrals, renewals

### 10. ⚠️ Risk Management

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Market risk | | | |
| Financial risk | | | |
| Operational risk | | | |
| Competitive risk | | | |
| Regulatory/legal risk | | | |
| Reputational risk | | | |
| Technology risk (if applicable) | | | |

### 11. 🏆 Competitive Survival Strategy
*(Subagent-enhanced: industry-specific moats and competitive dynamics)*

- **Differentiation**: What makes this 10x better or different (not just slightly better)
- **Moats to build**: brand, network effects, proprietary data, switching costs, cost advantages
- **Positioning**: own a clear niche before expanding
- **Competitor response plan**: when competitors copy or undercut pricing
- **Innovation cadence**: how to stay ahead of the market
- **Strategic partnerships**: accelerators and protectors

*See `references/competitive-strategy.md` for deep dive.*

---

## Step 4 — Post-Delivery: Export & Git Push

After delivering the full plan, **always offer** the following:

### Export Options

```
📦 Export this business plan:
  [A] Word document (.docx) — formatted report for sharing or printing
  [B] PDF — investor-ready, clean layout
  [C] Pitch deck (.pptx) — slide presentation of the plan
  [D] Financial model (.xlsx) — budget, break-even, and projections spreadsheet
  [E] All of the above
```

When the user selects an option, invoke the appropriate skill:
- **A** → Invoke `docx` skill: produce a professionally formatted Word document
- **B** → Invoke `pdf` skill: produce a clean PDF version
- **C** → Invoke `pptx` skill: produce a pitch deck from the plan sections
- **D** → Invoke `xlsx` skill: produce a financial model based on Section 7 data

### Git Push (only when project context is detected)

If the user has mentioned a GitHub repo, project folder, or active dev project:

```
🔗 Push to Git:
  Would you like me to save this business plan to your repository?
  I can commit it as Markdown to your project docs folder.
```

Git push workflow:
1. Save the plan as `docs/business-plan.md` (or path user specifies)
2. Run via bash_tool:
   ```bash
   cd [project-path]
   git add docs/business-plan.md
   git commit -m "docs: add business plan $(date +%Y-%m-%d)"
   git push
   ```
3. Confirm commit to user with file path and commit message

> Only offer Git push when a repo/project context is clearly present. Never assume a path.

---

## Deep Dive Mode

When the user asks to go deeper on any section:

| Request | Action |
|---|---|
| Legal deep dive | Read `references/legal-frameworks.md` |
| Financial deep dive | Read `references/financial-planning.md` |
| Market research deep dive | Read `references/market-research.md` |
| Competitive strategy deep dive | Read `references/competitive-strategy.md` |
| Product or feature planning | Invoke `product-design` skill |
| BRD / FRD documentation | Invoke `business-analyst` skill |
| Fintech / trading compliance | Invoke `trading-system-architect` skill |
| Website or app UI | Invoke `frontend-design` skill |

---

## Tone & Delivery Guidelines

- **Honest and direct** — don't sugarcoat bad ideas; frame critique constructively
- **Specific** — tailor everything to the stated idea, industry, and region
- Use `web_search` for real competitor names, market data, and legal specifics
- Avoid jargon unless the user demonstrates familiarity
- After the full summary, always close with:
  > *"Which section would you like to explore in more depth? I can also export this as a Word doc, PDF, pitch deck, or financial spreadsheet — just say the word."*

---

## Output Format

- Headers and emoji labels for scannability
- Bullet points within sections, prose for intro and verdict
- Tables for competitor comparisons, risk matrix, and subagent routing
- Summary: ~600–900 words
- Deep dives: longer and more detailed
- Subagent activation clearly labeled per relevant section
