---
name: business-planner
description: >
  Comprehensive business planning skill for any business idea — from first spark to launch-ready strategy.
  Trigger this skill whenever a user mentions: starting a business, evaluating a business idea, writing a business plan,
  wanting to know if an idea is viable, asking about competitors in a market, needing a go-to-market strategy,
  wondering about legal requirements for a business, asking how to find or retain customers, planning a startup,
  assessing investment or budget for a venture, or asking about business risks.
  Also trigger for phrases like "I want to start a...", "is this a good business idea?", "how do I launch...",
  "what do I need to open a...", "how do I beat my competitors", "what's my target market", or any variation.
  Always use this skill even if the user only mentions one aspect (e.g., just competitors, just legal, just budget).
---

# Business Planner Skill

A structured framework for evaluating and planning any business idea — covering all critical dimensions
from validation to survival strategy. Works for any industry, business model, or scale.

---

## How to Use This Skill

### Step 1 — Intake

Before generating the plan, ask the user for:
1. **The business idea** (what product/service, for whom)
2. **Location/region** (country or city — affects legal and market sections)
3. **Stage** — is this just an idea, or are they already partially started?
4. **Budget range** (rough: bootstrapped / under $10K / $10K–$100K / $100K+)

If the user has already provided some of this, extract it from context and only ask for what's missing.
Keep the intake conversational — not a form.

---

### Step 2 — Generate the Business Plan Summary

Produce a **structured summary** with all sections below. Keep each section concise (3–6 bullet points or a short paragraph).
After the summary, offer to **deep dive** into any specific section on request.

Use this structure:

---

## Business Plan Structure

### 1. 🧠 Idea Validation & Fundamentals
- What problem does this solve? Is the pain point real and recurring?
- Who specifically has this problem (target persona)?
- Is the timing right — why now?
- What does success look like in Year 1?
- Red flags or critical assumptions to validate early

### 2. 📊 Market Research
- Market size: TAM (Total Addressable Market), SAM (Serviceable), SOM (Realistic target)
- Market trends — growing, shrinking, or disrupted?
- Customer segments and their behaviors
- Underserved gaps or opportunities
- How to research: suggest specific sources (industry reports, Google Trends, surveys, interviews)

*Use web_search to pull real market data when available. Cite sources.*

### 3. ⚔️ Competitor Analysis
- Who are the top 3–5 direct competitors?
- Who are the indirect competitors (alternative solutions)?
- Competitor strengths and weaknesses
- Market positioning map (price vs. quality, niche vs. mass)
- What gap the user's business can exploit

*Use web_search to find actual competitors and their positioning. Don't rely on generic examples.*

### 4. ✅ Pros & Cons of Starting This Business
Present an honest, balanced assessment:

**Pros:** Real advantages, favorable conditions, low-hanging opportunities
**Cons:** Genuine risks, capital requirements, time-to-revenue, skill gaps
**Verdict:** A one-paragraph honest take on viability

### 5. 💼 Business Model Options
- Suggest 2–3 viable business models (e.g., subscription, marketplace, service retainer, product + upsell, freemium)
- For each: how it generates revenue, who pays, when cash flows in
- Recommended model based on the user's context and budget
- Pricing strategy frameworks (cost-plus, value-based, competitive)

### 6. ⚖️ Legal Requirements
- Business structure options (sole trader, LLC/Ltd, partnership, corporation) and tradeoffs
- Registration steps for the user's region
- Licenses, permits, or certifications likely required
- IP considerations (trademarks, patents, copyright)
- Tax obligations to be aware of
- Data/privacy compliance if applicable (GDPR, PDPA, etc.)

> ⚠️ **Always include this disclaimer:**
> *"Legal requirements vary significantly by jurisdiction and business type. This is a general framework only —
> consult a licensed lawyer and accountant in your region before making legal or financial decisions."*

### 7. 💰 Investment & Budget Planning
- Startup cost categories: setup, equipment/tech, inventory, marketing, legal, working capital
- Estimated budget range broken into phases (pre-launch / launch / month 1–6)
- Funding options: bootstrapping, loans, angel investors, grants, crowdfunding
- Break-even analysis framework (fixed costs ÷ margin = units needed)
- Cash flow warning signs to watch in Year 1

> ⚠️ **Always include this disclaimer:**
> *"Financial projections are estimates. Work with a qualified accountant or financial advisor to build
> accurate forecasts for your specific situation."*

### 8. 🎯 Customer Acquisition Strategy
- Ideal Customer Profile (ICP): demographics, psychographics, behaviors, triggers
- Channels to reach them: organic (SEO, content, referrals) vs. paid (ads, partnerships)
- First 10 / First 100 customers strategy — practical tactics for early traction
- Customer acquisition cost (CAC) considerations
- Sales funnel overview: awareness → interest → decision → purchase

### 9. 🔁 Customer Retention Strategy
- Onboarding experience — first impression matters most
- Loyalty mechanisms: rewards, community, subscriptions, personalization
- Feedback loops: how to collect and act on customer feedback
- Churn warning signals and how to address them
- Lifetime value (LTV) optimization — upsells, referrals, renewals
- NPS and satisfaction tracking

### 10. ⚠️ Risk Management
For each risk, identify: **Likelihood** (Low/Med/High) × **Impact** (Low/Med/High) → **Mitigation**

Risk categories to cover:
- Market risk (demand doesn't materialize, wrong timing)
- Financial risk (runway runs out, costs spike)
- Operational risk (supply chain, key person dependency)
- Competitive risk (well-funded competitor enters)
- Regulatory/legal risk (laws change, non-compliance)
- Reputational risk (PR crisis, bad reviews)
- Technology risk (if applicable)

Produce a simple risk table:
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

### 11. 🏆 Competitive Survival Strategy
How to not just enter the market but win and stay relevant:
- **Differentiation strategy**: What makes this business 10x better or different (not just slightly better)
- **Moats to build**: brand, network effects, proprietary data, switching costs, cost advantages
- **Positioning**: own a clear niche before expanding
- **Competitor response plan**: what to do when competitors copy you or undercut pricing
- **Innovation cadence**: how to keep improving ahead of the market
- **Strategic partnerships** that could accelerate or protect the business

---

## Deep Dive Mode

When the user asks to go deeper on any section, load the relevant reference file:

- Legal deep dive → read `references/legal-frameworks.md`
- Financial deep dive → read `references/financial-planning.md`
- Market research deep dive → read `references/market-research.md`
- Competitive strategy deep dive → read `references/competitive-strategy.md`

---

## Tone & Delivery Guidelines

- Be **honest and direct** — don't sugarcoat bad ideas, but frame critique constructively
- Be **specific** — avoid generic advice; tailor everything to the stated business idea
- Use **web_search** for real competitor names, market data, and legal specifics when possible
- Avoid jargon unless the user demonstrates familiarity
- After delivering the full summary, always close with:
  > *"Which section would you like to explore in more depth? I can go deeper on any area — legal, financials, competitors, customers, or risk."*

---

## Output Format

- Use headers and emoji section labels for scannability
- Use bullet points within sections, prose for the intro and verdict
- Include tables where structured comparison helps (competitors, risks)
- Keep the summary version digestible (~600–900 words total)
- Deep dives can be longer and more detailed
