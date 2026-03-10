# Regime Risk Engine — Product Design Specification

**GenAI-Powered Portfolio Regime Vulnerability Analysis for Institutional Advisors**

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | March 9, 2026 |
| **Classification** | Confidential — Internal Use Only |

---

## 1. Executive Summary

Existing risk tools — VaR, historical stress tests, Monte Carlo simulations — tell advisors what *would have* happened. They don't tell you what *could* happen next.

The Regime Risk Engine uses AI to generate forward-looking regime scenarios tailored to a specific portfolio's exposures, assess vulnerability under each regime, and produce governance-grade metrics that drive institutional decision-making.

**Key differentiators:**

- **Forward-looking, not backward-looking** — generates novel scenarios, not replays of known crises
- **Portfolio-specific, not generic** — every scenario is assessed against your actual exposures
- **Transparent AI reasoning** — watch the engine think, challenge its logic, audit every step
- **Governance-ready** — built-in escalation protocols with committee-ready documentation
- **Historically grounded** — every scenario is anchored to real historical analogies, not hallucinated narratives

---

## 2. The Problem We Solve

### The Gap

Institutional advisors manage complex multi-asset portfolios but rely on risk tools designed for a different era. VaR assumes normal distributions. Static stress tests replay known crises. Neither captures the *next* regime shift — the one that hasn't happened yet.

### The Consequence

When regime shifts occur (2020 COVID crash, 2022 rate shock, SVB contagion), advisors are caught reactive. Portfolio repositioning happens *after* the damage. Risk committees receive backward-looking reports that don't inform forward action.

### The Opportunity

Large Language Models can synthesize macroeconomic signals, identify emerging regime patterns, and reason about how specific portfolio exposures would behave under novel scenarios — all with structured uncertainty quantification.

### Who Feels This Pain

- **CIOs**: Need to anticipate, not just report
- **Investment Advisors**: Need to articulate risk narratives to clients
- **Risk Committees**: Need governance-grade metrics, not just gut feel
- **Compliance Officers**: Need audit trails for AI-assisted decisions

---

## 3. Who Uses This Product

### Primary: The Institutional Investment Advisor

- Manages $100M–$5B in multi-asset portfolios
- Reports to CIO and investment committee
- **Needs**: Actionable risk insights they can explain to clients and committees
- **Pain**: Spends hours manually constructing "what if" narratives; current tools don't connect macro views to portfolio-specific impact

### Secondary: The Chief Investment Officer (CIO)

- Oversees firm-wide investment strategy
- Chairs or presents to investment committee
- **Needs**: High-level regime vulnerability dashboard across all portfolios
- **Pain**: Lacks a systematic framework to evaluate forward-looking risks across the book

### Tertiary: Risk Committee / Compliance

- Governance oversight of investment decisions
- **Needs**: Documented reasoning, audit trails, escalation protocols
- **Pain**: AI is a "black box" — can't govern what you can't see

---

## 4. Key Concepts

### Regime

A distinct macroeconomic environment characterized by a set of conditions (e.g., "stagflation," "credit crisis," "liquidity squeeze"). Regimes represent the macro backdrop that drives asset class behavior.

### Regime Scenario

A specific forward-looking narrative describing how a regime could emerge, what triggers it, how it transmits through markets, and how different asset classes respond. Each scenario includes a historical analogy for grounding.

### Exposure Decomposition

The process of breaking down a portfolio into its underlying risk exposures — beyond just asset class labels. A "60/40" portfolio isn't just "stocks and bonds" — it has inflation sensitivity, duration risk, credit exposure, liquidity dependence, and geographic concentration.

### Macro Driver Mapping

Connecting portfolio exposures to the macroeconomic factors that drive them. Your TIPS allocation is sensitive to inflation expectations. Your EM debt sleeve is sensitive to dollar strength and credit spreads. This mapping is how the engine connects your portfolio to regime scenarios.

### RCI (Regime Confidence Index)

A composite score (0–100) that quantifies how much confidence you should place in a generated regime scenario. Broken into four sub-scores:

| Sub-Score | What It Measures |
|-----------|-----------------|
| **Data Grounding** | Is this scenario supported by economic data and research? |
| **Consensus** | Do multiple analytical perspectives agree? |
| **Analogy Strength** | How closely does this match known historical episodes? |
| **Self-Consistency** | Does the narrative hold together logically? |

A high RCI (>70) means the scenario is well-supported. A low RCI (<40) means high uncertainty — which itself is a signal worth escalating.

### LCI (Liquidity Compression Index)

A score (0–100) estimating the risk of forced selling under stress. Considers:

- **Private market allocation** — can't sell quickly
- **Redemption queue risk** — other investors leaving
- **Bid-ask spread widening** — market liquidity drying up

High LCI (>60) means the portfolio could face liquidity constraints precisely when flexibility matters most.

### Escalation Protocol

A governance framework with defined thresholds:

| Level | Condition | Action |
|-------|-----------|--------|
| 🟢 **Green (Monitor)** | RCI > 70, LCI < 30 | Risks are well-understood, no action needed |
| 🟡 **Amber (Review)** | RCI 40–70 or LCI 30–60 | Schedule committee discussion |
| 🔴 **Red (Escalate)** | RCI < 40 or LCI > 60 | Immediate committee review required |

---

## 5. How It Works — The Advisor Experience

### Step 1: Set Up Your Portfolio

The advisor inputs their portfolio structure:

- Asset class allocations and weights (e.g., 35% US Large Cap, 20% IG Fixed Income, 15% Private Credit)
- Key characteristics: duration profile, geographic mix, leverage, liquidity terms
- Investment policy constraints (if any)

The system doesn't need holdings-level data — aggregated allocation data is sufficient. **No client PII required.**

### Step 2: Launch a Regime Scan

With one click, the advisor initiates a "Regime Scan." The AI engine begins its analysis. The advisor can watch the reasoning unfold in real-time — like watching an analyst think out loud:

> *"Decomposing portfolio: identifying 34% combined inflation sensitivity from TIPS + real estate allocations..."*
>
> *"Mapping macro drivers: this portfolio has elevated duration risk (7.2 years effective) and moderate credit spread exposure..."*
>
> *"Generating regime scenarios: considering current macro environment + historical parallels..."*
>
> *"Regime 1 shares characteristics with the 1994 bond market massacre — a surprise tightening cycle that repriced duration risk across all fixed income..."*

This transparency is intentional. Advisors can see *how* the AI is reasoning, not just *what* it concludes. This builds trust and enables informed challenge.

### Step 3: Review Regime Scenarios

The engine produces 3–5 regime scenarios, each presented as a structured card:

**Example Scenario Card — "Stagflation Redux":**

| Field | Detail |
|-------|--------|
| **Narrative** | A resurgence of sticky inflation driven by commodity supply constraints and deglobalization, combined with slowing growth as fiscal stimulus fades. Central banks face a policy dilemma — tightening into weakness. |
| **Key Triggers** | Commodity supply shock, wage-price spiral entrenchment, central bank credibility erosion |
| **Historical Analogy** | 1973–74 Oil Crisis (similarity: 72/100) |
| *Parallels* | Energy-driven inflation, policy uncertainty, stagflation dynamics |
| *Differences* | Modern economy is more services-oriented, central banks have more tools |
| **Timeline** | 6–18 months |
| **Probability** | Moderate (20–30%) |
| **Portfolio Impact** | High negative — fixed income and growth equity most exposed |

Scenarios are deliberately diverse — spanning different macro quadrants (high/low inflation × high/low growth) so the analysis isn't biased toward doom scenarios.

### Step 4: Examine the Impact Heatmap

A visual matrix showing how each portfolio exposure interacts with each regime scenario:

|                    | Stagflation | Credit Crisis | Liquidity Squeeze | Soft Landing | Tech Disruption |
|--------------------|:-----------:|:-------------:|:-----------------:|:------------:|:---------------:|
| **US Large Cap**   | Moderate -  | High -        | Moderate -        | High +       | High -          |
| **IG Fixed Income**| High -      | Moderate -    | Low -             | Moderate +   | Neutral         |
| **Private Credit** | Moderate -  | High -        | High -            | Low +        | Neutral         |
| **TIPS**           | High +      | Neutral       | Low -             | Low -        | Neutral         |
| **Real Estate**    | Moderate -  | High -        | High -            | Moderate +   | Low -           |

Each cell isn't just a label — clicking reveals the AI's reasoning for that specific interaction (e.g., *"Private Credit under Credit Crisis is rated High Negative because leveraged loan defaults historically spike 3–4x in credit stress environments, and your allocation's average leverage of 4.5x amplifies this sensitivity..."*).

### Step 5: Review Governance Metrics

**RCI Dashboard** — Not just one number, a decomposed view:

| Metric | Score | Interpretation |
|--------|:-----:|----------------|
| **Composite RCI** | **58 / 100** | **Amber zone** |
| Data Grounding | 72 | Scenarios are well-supported by current data |
| Consensus | 45 | Analytical perspectives diverge on inflation persistence |
| Analogy Strength | 65 | Historical parallels are reasonable but imperfect |
| Self-Consistency | 51 | Some internal tension in the stagflation scenario |

This decomposition lets the advisor say to their committee: *"The overall confidence is moderate, mainly because there's genuine disagreement about whether inflation is sticky or transitory. The scenarios themselves are well-grounded in data."*

**LCI Dashboard** — Liquidity stress visualization:

| Metric | Score | Interpretation |
|--------|:-----:|----------------|
| **Composite LCI** | **42 / 100** | **Amber zone** |
| Private market illiquidity risk | 65 | Primary concern |
| Redemption queue risk | 28 | Manageable |
| Spread widening risk | 34 | Moderate |

The advisor can immediately see: *"Our main liquidity concern is the 15% private credit allocation — if we need to raise cash under stress, that sleeve is effectively locked."*

### Step 6: Escalation & Governance Actions

Based on the metrics, the system applies the escalation protocol:

- **Traffic Light Display**: Large, clear Green / Amber / Red indicator
- **Amber triggers**: *"RCI of 58 and LCI of 42 both fall in the Amber zone — recommend scheduling committee review within 2 weeks"*
- **Auto-Generated Committee Memo** summarizing:
  - Portfolio overview
  - Top 3 vulnerabilities
  - Regime scenarios of concern
  - RCI/LCI scores with interpretation
  - Recommended discussion points
  - Suggested actions to consider

The advisor reviews, edits, and sends to their committee. Full audit trail is preserved.

### Step 7: Explore "What If" Scenarios

The advisor can interact with the results:

- Adjust scenario parameters (*"What if inflation runs at 6% instead of 4%?"*)
- Modify portfolio allocations (*"What if we reduce private credit to 10%?"*)
- Compare current analysis to previous analyses over time
- Add their own commentary and annotations
- Share the analysis with team members

---

## 6. What Makes This Different

| Feature | Traditional Risk Tools | Regime Risk Engine |
|---------|----------------------|-------------------|
| **Orientation** | Backward-looking | Forward-looking |
| **Scenarios** | Replay historical crises | Generate novel regime scenarios |
| **Reasoning** | Black box models | Transparent AI reasoning chains |
| **Customization** | Generic market scenarios | Portfolio-specific vulnerability |
| **Uncertainty** | Point estimates | Decomposed confidence scores |
| **Governance** | Manual reporting | Built-in escalation protocol |
| **Audit** | Limited | Full reasoning chain audit trail |
| **Interaction** | Static reports | Interactive what-if exploration |
| **Analogies** | None | Every scenario grounded in history |

---

## 7. Governance & Compliance Design

### Audit Trail

Every analysis preserves:

- What portfolio data was analyzed
- What AI reasoning was performed (full chain)
- What model version and prompt version was used
- What knowledge base was referenced
- When the analysis was run and by whom
- What escalation decisions were made

### Fiduciary Safeguards

- The system **does not make investment decisions** — it informs human decision-makers
- Clear disclaimers on AI-generated content
- RCI explicitly quantifies uncertainty — discouraging blind trust
- Red Team self-checks: every regime scenario includes built-in skepticism (*"What would make this scenario wrong?"*)
- Historical grounding reduces hallucination risk

### Access Controls

- **Role-based access**: Advisor, Senior Advisor, CIO, Compliance, Admin
- **Firm-level data isolation** — no cross-firm data access
- **Configurable data retention policies** (default: 7 years)

---

## 8. How the AI Reasoning Engine Works

Think of the engine as a team of specialist analysts working in sequence:

1. **The Portfolio Analyst** examines your portfolio and identifies all the underlying risk exposures — going beyond labels to understand sensitivities.

2. **The Macro Strategist** connects those exposures to the macro forces that drive them — inflation, growth, rates, credit, currency, liquidity.

3. **The Scenario Architect** *(the core innovation)* generates 3–5 forward-looking regime scenarios, grounded in:
   - Current economic data and trends
   - Historical regime transitions (a curated knowledge base)
   - Explicit historical analogies (*"this resembles 1994 because..."*)
   - Built-in skepticism (every scenario is challenged by a "devil's advocate" check)

4. **The Risk Assessor** simulates how your specific portfolio would behave under each scenario, producing impact ranges (not false-precision point estimates).

5. **The Vulnerability Analyst** ranks the most critical risks and explains them in plain language.

6. **The Governance Analyst** computes RCI and LCI, applies escalation rules, and drafts committee-ready documentation.

Each "analyst" shows their work. The entire reasoning chain is preserved and reviewable — **there are no black boxes.**

---

## 9. Product Roadmap

### Phase 1 — Foundation (Month 1)
- Portfolio input and management
- User authentication and firm setup
- Basic dashboard framework

### Phase 2 — Core Engine (Months 2–3)
- AI regime generation pipeline
- Exposure decomposition and macro mapping
- Impact simulation and vulnerability ranking
- Real-time reasoning stream (watch the AI think)

### Phase 3 — Governance Layer (Month 3)
- RCI and LCI computation with decomposed scores
- Escalation protocol (Green / Amber / Red)
- Auto-generated committee memos
- Full audit trail

### Phase 4 — Advanced Features (Month 4)
- What-if scenario exploration
- Historical analogy browser
- Report export (PDF, presentation format)
- Team collaboration and annotations
- Multi-portfolio comparison

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **AI hallucination** (generating implausible scenarios) | RAG grounding in historical data + adversarial self-checks + RCI confidence scoring |
| **Narrative overconfidence** (advisors trusting AI too much) | Decomposed RCI forces engagement with uncertainty; clear disclaimers |
| **Regime bias** (all scenarios being negative) | Diversity enforcement across macro quadrants; includes constructive scenarios |
| **Fiduciary risk** (AI influencing investment decisions) | System informs, never decides; human-in-the-loop at every escalation |
| **Data security** | No client PII; aggregated portfolio data only; firm-level isolation |
| **Model drift over time** | Versioned prompts, model cards, regular evaluation against known scenarios |

---

*This document is confidential and intended for internal use only. The Regime Risk Engine is a decision-support tool and does not constitute investment advice.*
