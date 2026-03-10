# Regime Risk Engine — UI/UX Specification

**How It Works: Screens, Inputs, Outputs & User Flows**

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | March 9, 2026 |
| **Audience** | Finance stakeholders, product team |
| **Classification** | Confidential — Internal Use Only |

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Navigation Structure](#2-navigation-structure)
3. [Screen-by-Screen Breakdown](#3-screen-by-screen-breakdown)
4. [Input/Output Summary](#4-inputoutput-summary)
5. [Key Interaction Patterns](#5-key-interaction-patterns)
6. [Data Visualizations](#6-data-visualizations)
7. [Notifications & Alerts](#7-notifications--alerts)
8. [Report & Export Outputs](#8-report--export-outputs)
9. [Role-Based Views](#9-role-based-views)
10. [Mobile & Responsive Considerations](#10-mobile--responsive-considerations)

---

## 1. Application Overview

The Regime Risk Engine is a web application with a clean, dashboard-centric interface designed for institutional investment professionals. The experience follows the advisor's natural workflow:

**Set up portfolio → Run regime scan → Review scenarios → Assess vulnerability → Take governance action**

### Design Principles

- **Clarity over complexity** — Every number has context. No orphaned metrics.
- **Progressive disclosure** — Show the summary first, let users drill into detail on demand.
- **Transparent reasoning** — The AI's thinking is always visible, never hidden.
- **Governance-first** — Traffic lights, escalation status, and audit trails are front and center.
- **Finance-native language** — No technical jargon. Speak in terms advisors already use.

---

## 2. Navigation Structure

### Global Navigation (Left Sidebar)

```
┌──────────────────────┐
│  REGIME RISK ENGINE   │
│                       │
│  📊 Dashboard         │  ← Landing page / portfolio overview
│  📁 Portfolios        │  ← Manage all portfolios
│  🔍 Regime Scans      │  ← Run & review analyses
│  📋 Reports           │  ← Generated memos & exports
│  ⏱  History           │  ← Past analyses & audit trail
│  ⚙️ Settings          │  ← Firm config, users, preferences
│                       │
│  ─────────────────    │
│  👤 Advisor Name      │
│  🏢 Firm Name         │
│  🚪 Sign Out          │
└──────────────────────┘
```

### Top Bar (Persistent)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Current Portfolio: "Growth Balanced Strategy"]  ▼    🔔 3     │
│                                            Notifications        │
└─────────────────────────────────────────────────────────────────┘
```

- **Portfolio selector**: Quick-switch between managed portfolios
- **Notification bell**: Alerts for escalation triggers, completed scans, team comments

---

## 3. Screen-by-Screen Breakdown

---

### Screen 1: Dashboard (Home)

**Purpose**: At-a-glance view of all portfolios and their current risk posture.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD                                          March 9, 2026  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  FIRM-WIDE RISK SUMMARY                                     │   │
│  │                                                             │   │
│  │  Portfolios: 12    Active Scans: 3    Escalations: 1 🔴     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Growth Bal.   │  │ Conservative │  │ Alt. Strat.  │   ...       │
│  │              │  │              │  │              │             │
│  │  🟡 AMBER    │  │  🟢 GREEN   │  │  🔴 RED      │             │
│  │  RCI: 58     │  │  RCI: 78    │  │  RCI: 34     │             │
│  │  LCI: 42     │  │  LCI: 22    │  │  LCI: 67     │             │
│  │              │  │              │  │              │             │
│  │  Last scan:  │  │  Last scan: │  │  Last scan:  │             │
│  │  2 hrs ago   │  │  1 day ago  │  │  30 min ago  │             │
│  │              │  │              │  │              │             │
│  │  [View] [Scan]│ │  [View] [Scan]│ │  [View] [Scan]│            │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  RECENT ACTIVITY                                            │   │
│  │  • Alt. Strategy flagged RED — LCI at 67 (30 min ago)       │   │
│  │  • Growth Balanced scan completed (2 hrs ago)               │   │
│  │  • Committee memo generated for Q1 review (yesterday)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**: None (display only)

**Outputs**:
- Portfolio cards with traffic light status (Green / Amber / Red)
- RCI and LCI scores per portfolio
- Last scan timestamp
- Recent activity feed
- Escalation count badge

**User actions**:
- Click a portfolio card → goes to Portfolio Detail screen
- Click [Scan] → launches a new Regime Scan for that portfolio
- Click escalation badge → jumps to the flagged portfolio's governance view

---

### Screen 2: Portfolio Setup & Management

**Purpose**: Create or edit a portfolio's structure for analysis.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  PORTFOLIO SETUP                                                    │
│                                                                     │
│  Portfolio Name: [ Growth Balanced Strategy          ]              │
│  AUM:           [ $850,000,000                       ]              │
│  Benchmark:     [ 60/40 Blended                    ▼ ]              │
│                                                                     │
│  ── ASSET ALLOCATION ──────────────────────────────────────────     │
│                                                                     │
│  Asset Class              │ Weight │ Sub-Details           │ Actions│
│  ─────────────────────────┼────────┼───────────────────────┼────────│
│  US Large Cap Equity      │  35%   │ Growth tilt, S&P 500  │ ✏️ 🗑 │
│  Investment Grade Fixed   │  20%   │ Duration: 6.2 yrs     │ ✏️ 🗑 │
│  Private Credit           │  15%   │ Leverage: 4.5x        │ ✏️ 🗑 │
│  TIPS                     │  10%   │ 5yr breakeven linked   │ ✏️ 🗑 │
│  Real Estate (Private)    │  10%   │ Core, 18mo lock-up     │ ✏️ 🗑 │
│  EM Debt                  │   5%   │ Hard currency          │ ✏️ 🗑 │
│  Cash & Equivalents       │   5%   │ T-Bills, MMF           │ ✏️ 🗑 │
│  ─────────────────────────┼────────┼───────────────────────┼────────│
│  TOTAL                    │ 100%   │                       │        │
│                                                                     │
│  [+ Add Asset Class]                                                │
│                                                                     │
│  ── PORTFOLIO CHARACTERISTICS ─────────────────────────────────     │
│                                                                     │
│  Effective Duration:  [ 7.2 years  ]                                │
│  Geographic Mix:      [ 70% US / 20% Intl / 10% EM ]               │
│  Leverage:            [ 1.2x gross ]                                │
│  Liquidity Profile:   [ 75% daily / 15% quarterly / 10% locked ]   │
│                                                                     │
│  ── INVESTMENT POLICY CONSTRAINTS (Optional) ──────────────────     │
│                                                                     │
│  Max single-asset:    [ 40%  ]    Min cash buffer:   [ 3%  ]       │
│  Max EM exposure:     [ 15%  ]    Max leverage:      [ 1.5x ]      │
│                                                                     │
│  [ Save Portfolio ]   [ Save & Run Scan → ]                         │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs** (what the advisor provides):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Portfolio Name | Text | Yes | Free-form |
| AUM | Currency | Yes | Total assets under management |
| Benchmark | Dropdown | No | Common benchmarks pre-loaded |
| Asset Classes | Table rows | Yes (min 2) | Asset class + weight + sub-details |
| Weight (%) | Number | Yes | Must sum to 100% |
| Sub-Details | Text | No | Duration, leverage, lock-up, style, etc. |
| Portfolio Characteristics | Mixed fields | Recommended | Duration, geography, leverage, liquidity |
| Policy Constraints | Number fields | No | Optional guardrails |

**Outputs**:
- Validation: Weights must sum to 100% (real-time bar indicator)
- Warning if illiquid allocation exceeds 25%
- Saved portfolio available for scanning

**Key interactions**:
- Inline editing — click any row to modify
- Drag-and-drop to reorder asset classes
- "Save & Run Scan" triggers the Regime Scan immediately

---

### Screen 3: Regime Scan — Live Reasoning Stream

**Purpose**: Show the AI analysis in progress. The advisor watches the engine reason in real time.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  REGIME SCAN IN PROGRESS                                            │
│  Portfolio: Growth Balanced Strategy                                 │
│  Started: 2:14 PM                    Estimated: ~90 seconds         │
│                                                                     │
│  ═══════════════════════════════════════════════════ 68% ━━━━━━━━   │
│                                                                     │
│  ── LIVE REASONING STREAM ─────────────────────────────────────     │
│                                                                     │
│  ✅ Step 1: Portfolio Decomposition                                 │
│  │  Identified 7 asset classes across 3 geographic regions          │
│  │  Combined inflation sensitivity: 34% (TIPS + Real Estate)       │
│  │  Effective duration: 7.2 years — elevated rate sensitivity       │
│  │  Illiquid allocation: 25% (Private Credit + Real Estate)        │
│                                                                     │
│  ✅ Step 2: Macro Driver Mapping                                    │
│  │  Primary sensitivities:                                          │
│  │  • Interest rates (high — 7.2yr duration)                       │
│  │  • Credit spreads (moderate — 15% private credit)               │
│  │  • Inflation (moderate — 34% inflation-linked)                  │
│  │  • USD strength (low-moderate — 15% non-US)                     │
│  │  • Liquidity conditions (elevated — 25% illiquid)               │
│                                                                     │
│  🔄 Step 3: Generating Regime Scenarios...                          │
│  │  Considering current macro environment...                        │
│  │  Cross-referencing historical regime transitions...              │
│  │  Scenario 1: Stagflation Redux — resembles 1973-74...           │
│  │  Scenario 2: Credit Crisis 2.0 — parallels to 2008...           │
│  │  ▌ (cursor blinking — actively generating)                       │
│                                                                     │
│  ⬚ Step 4: Impact Simulation            (pending)                   │
│  ⬚ Step 5: Vulnerability Ranking        (pending)                   │
│  ⬚ Step 6: Governance Scoring           (pending)                   │
│                                                                     │
│  [ Cancel Scan ]                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**: None (triggered from Portfolio Setup or Dashboard)

**Outputs** (while running):
- Progress bar with percentage and estimated time
- 6-step reasoning stream — each step expands with live text
- Completed steps show green checkmarks
- Active step shows spinning indicator with streaming text
- Pending steps are grayed out

**Outputs** (on completion):
- Redirects to Results screen with all scenarios, heatmap, and governance scores

**Key interactions**:
- Scroll through reasoning as it streams
- Expand/collapse completed steps
- Cancel scan at any time
- No other input — this is a "watch it work" experience

---

### Screen 4: Regime Scenarios — Results

**Purpose**: Present the generated regime scenarios as reviewable cards.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  REGIME SCENARIOS                          Growth Balanced Strategy │
│  Scan completed: March 9, 2026 at 2:16 PM          5 scenarios     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SCENARIO 1                                    🔴 High Risk │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  Stagflation Redux                                          │   │
│  │                                                             │   │
│  │  A resurgence of sticky inflation driven by commodity       │   │
│  │  supply constraints and deglobalization, combined with      │   │
│  │  slowing growth as fiscal stimulus fades.                   │   │
│  │                                                             │   │
│  │  Probability: 20-30%      Timeline: 6-18 months            │   │
│  │                                                             │   │
│  │  📎 Historical Analogy: 1973-74 Oil Crisis (72% match)     │   │
│  │  Parallels: Energy-driven inflation, policy uncertainty     │   │
│  │  Differences: More service-oriented economy today           │   │
│  │                                                             │   │
│  │  Top Triggers:                                              │   │
│  │  • Commodity supply shock                                   │   │
│  │  • Wage-price spiral entrenchment                          │   │
│  │  • Central bank credibility erosion                        │   │
│  │                                                             │   │
│  │  Portfolio Impact: Fixed income & growth equity hardest hit  │   │
│  │                                                             │   │
│  │  [Explore Full Details →]                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SCENARIO 2                               🟡 Moderate Risk  │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  Credit Crisis 2.0                                          │   │
│  │  ...                                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                           │
│  │ Scenario │ │ Scenario │ │ Scenario │                           │
│  │    3     │ │    4     │ │    5     │                           │
│  │ Liq.     │ │ Soft     │ │ Tech     │                           │
│  │ Squeeze  │ │ Landing  │ │ Disrupt  │                           │
│  │  🟡      │ │  🟢      │ │  🟡      │                           │
│  └──────────┘ └──────────┘ └──────────┘                           │
│                                                                     │
│  [ ← Back ]   [ View Impact Heatmap → ]   [ Download Report ]     │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**: None (display only, but interactive)

**Outputs per scenario card**:
| Output | Description |
|--------|-------------|
| Scenario Name | Descriptive label (e.g., "Stagflation Redux") |
| Narrative Summary | 2-3 sentence plain-language description |
| Risk Level Badge | High (Red) / Moderate (Amber) / Low (Green) |
| Probability Range | e.g., "20-30%" — never a false-precision point estimate |
| Timeline | Expected window (e.g., "6-18 months") |
| Historical Analogy | Best-fit historical episode with match % |
| Analogy Parallels/Differences | What's similar and what's different from history |
| Key Triggers | Bullet list of catalysts that would activate this regime |
| Portfolio Impact Summary | One-line statement of what's most exposed |

**Key interactions**:
- Click "Explore Full Details" → expands into a full-page deep dive
- Scenario cards can be reordered by risk level or probability
- Filter scenarios by risk level (show only Red, only Amber, etc.)

---

### Screen 5: Impact Heatmap

**Purpose**: Visual matrix showing how each portfolio exposure interacts with each regime.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  IMPACT HEATMAP                            Growth Balanced Strategy │
│                                                                     │
│  How your portfolio exposures respond under each regime scenario    │
│                                                                     │
│               │Stagflation│ Credit  │Liquidity│  Soft   │  Tech   │
│               │  Redux    │Crisis 2.0│ Squeeze │ Landing │Disruption│
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  US Large Cap │  🟡 -12%  │ 🔴 -28% │ 🟡 -15% │ 🟢 +14% │ 🔴 -22% │
│  35% weight   │           │         │         │         │         │
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  IG Fixed Inc │  🔴 -18%  │ 🟡 -8%  │ 🟡 -5%  │ 🟢 +6%  │  ── 0%  │
│  20% weight   │           │         │         │         │         │
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  Pvt Credit   │  🟡 -10%  │ 🔴 -25% │ 🔴 -20% │ 🟢 +3%  │  ── 0%  │
│  15% weight   │           │         │         │         │         │
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  TIPS         │  🟢 +8%   │  ── 0%  │ 🟡 -3%  │ 🟡 -2%  │  ── 0%  │
│  10% weight   │           │         │         │         │         │
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  Real Estate  │  🟡 -8%   │ 🔴 -22% │ 🔴 -18% │ 🟢 +7%  │ 🟡 -5%  │
│  10% weight   │           │         │         │         │         │
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  EM Debt      │  🟡 -12%  │ 🔴 -20% │ 🟡 -14% │ 🟢 +5%  │ 🟡 -8%  │
│  5% weight    │           │         │         │         │         │
│  ─────────────┼───────────┼─────────┼─────────┼─────────┼─────────│
│  Cash         │  🟢 +1%   │ 🟢 +1%  │ 🟢 +1%  │  ── 0%  │  ── 0%  │
│  5% weight    │           │         │         │         │         │
│  ─────────────┴───────────┴─────────┴─────────┴─────────┴─────────│
│                                                                     │
│  WEIGHTED PORTFOLIO IMPACT:                                         │
│  ─────────────────────────                                          │
│  Stagflation: -8.3%  │ Credit: -17.1%  │ Liquidity: -11.4%        │
│  Soft Landing: +7.8% │ Tech: -9.2%                                 │
│                                                                     │
│  🔴 = High negative  🟡 = Moderate  🟢 = Positive  ── = Neutral   │
│                                                                     │
│  💡 Click any cell to see the AI's reasoning for that assessment    │
│                                                                     │
│  [ ← Scenarios ]   [ View Governance Metrics → ]                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**: None (display only)

**Outputs**:
- Color-coded matrix with estimated return impact ranges
- Weighted portfolio-level impact row at the bottom
- Color legend

**Key interactions**:
- **Click any cell** → side panel slides open showing the AI's reasoning for that specific intersection (e.g., "Private Credit under Credit Crisis is rated High Negative because leveraged loan defaults historically spike 3-4x in credit stress environments, and your allocation's average leverage of 4.5x amplifies this sensitivity...")
- Sort columns by worst-case impact
- Sort rows by weight or by exposure severity
- Toggle between percentage impact and dollar impact

---

### Screen 6: Governance Metrics Dashboard

**Purpose**: Present RCI, LCI, and escalation status with full decomposition.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  GOVERNANCE METRICS                        Growth Balanced Strategy │
│                                                                     │
│  ┌──────────────────────────────────────────────┐                  │
│  │                                              │                  │
│  │            🟡  AMBER — REVIEW                │                  │
│  │                                              │                  │
│  │   Recommend scheduling committee review      │                  │
│  │   within 2 weeks                             │                  │
│  │                                              │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                     │
│  ── REGIME CONFIDENCE INDEX (RCI) ─────────────────────────────     │
│                                                                     │
│  ┌───────────────────────────────────────┐                         │
│  │  COMPOSITE RCI:  58 / 100   🟡       │                         │
│  └───────────────────────────────────────┘                         │
│                                                                     │
│  Data Grounding     ████████████████████░░░░░░  72 / 100           │
│  "Scenarios are well-supported by current economic data"            │
│                                                                     │
│  Consensus          ████████████░░░░░░░░░░░░░░  45 / 100           │
│  "Analytical perspectives diverge on inflation persistence"         │
│                                                                     │
│  Analogy Strength   █████████████████░░░░░░░░░  65 / 100           │
│  "Historical parallels are reasonable but imperfect"                │
│                                                                     │
│  Self-Consistency   █████████████░░░░░░░░░░░░░  51 / 100           │
│  "Some internal tension in the stagflation scenario"                │
│                                                                     │
│  ── LIQUIDITY COMPRESSION INDEX (LCI) ─────────────────────────    │
│                                                                     │
│  ┌───────────────────────────────────────┐                         │
│  │  COMPOSITE LCI:  42 / 100   🟡       │                         │
│  └───────────────────────────────────────┘                         │
│                                                                     │
│  Pvt Market Illiquidity  █████████████████████░░  65 / 100         │
│  "15% private credit + 10% real estate = 25% effectively locked"    │
│                                                                     │
│  Redemption Queue Risk   ████████░░░░░░░░░░░░░░  28 / 100         │
│  "Low current redemption pressure"                                  │
│                                                                     │
│  Spread Widening Risk    ██████████░░░░░░░░░░░░  34 / 100         │
│  "Moderate bid-ask spread risk in credit markets"                   │
│                                                                     │
│  ── ESCALATION THRESHOLDS ─────────────────────────────────────     │
│                                                                     │
│  🟢 GREEN  (Monitor)  — RCI > 70 and LCI < 30                     │
│  🟡 AMBER  (Review)   — RCI 40-70 or LCI 30-60       ← YOU ARE HERE
│  🔴 RED    (Escalate)  — RCI < 40 or LCI > 60                     │
│                                                                     │
│  [ ← Impact Heatmap ]  [ Generate Committee Memo → ]               │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**: None (display only)

**Outputs**:
| Output | Description |
|--------|-------------|
| Traffic Light | Large Green/Amber/Red indicator with action label |
| Composite RCI | Single score with color-coded bar |
| RCI Sub-scores (4) | Individual bars with plain-language explanations |
| Composite LCI | Single score with color-coded bar |
| LCI Sub-scores (3) | Individual bars with plain-language explanations |
| Escalation Rule | Shows which threshold was triggered and why |
| Recommended Action | Clear next step ("schedule committee review within 2 weeks") |

**Key interactions**:
- Hover over any sub-score bar → tooltip with additional detail
- Click "Generate Committee Memo" → navigates to memo drafting screen
- Each sub-score explanation is generated by the AI in plain language

---

### Screen 7: Committee Memo Generator

**Purpose**: Auto-generate a governance-ready memo for investment committee review.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  COMMITTEE MEMO                            Growth Balanced Strategy │
│                                                                     │
│  Auto-generated summary for investment committee review             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  INVESTMENT COMMITTEE MEMO                                  │   │
│  │  Date: March 9, 2026                                        │   │
│  │  Portfolio: Growth Balanced Strategy ($850M AUM)             │   │
│  │  Status: AMBER — Committee Review Recommended               │   │
│  │                                                             │   │
│  │  EXECUTIVE SUMMARY                                          │   │
│  │  The latest regime vulnerability analysis identifies         │   │
│  │  Credit Crisis 2.0 and Liquidity Squeeze as the highest-   │   │
│  │  impact scenarios for this portfolio, driven by the 15%     │   │
│  │  private credit allocation and 7.2-year effective duration.  │   │
│  │                                                             │   │
│  │  TOP 3 VULNERABILITIES                                      │   │
│  │  1. Private Credit under credit stress (-25% est. impact)   │   │
│  │  2. Duration risk if rates spike (+150bps scenario)         │   │
│  │  3. Liquidity constraints — 25% illiquid in forced-sell     │   │
│  │                                                             │   │
│  │  GOVERNANCE SCORES                                          │   │
│  │  RCI: 58/100 (Amber) — Moderate confidence in scenarios     │   │
│  │  LCI: 42/100 (Amber) — Moderate liquidity risk              │   │
│  │                                                             │   │
│  │  DISCUSSION POINTS FOR COMMITTEE                            │   │
│  │  • Should we reduce private credit from 15% to 10%?        │   │
│  │  • Is the 7.2yr duration appropriate given rate outlook?    │   │
│  │  • Do we need a liquidity buffer above the current 5%?     │   │
│  │                                                             │   │
│  │  SUGGESTED ACTIONS TO CONSIDER                              │   │
│  │  • Increase cash buffer to 8-10%                            │   │
│  │  • Add interest rate hedges (consider swaptions)            │   │
│  │  • Review private credit lock-up terms                     │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ✏️  [ Edit Memo ]   The memo is fully editable before sending     │
│                                                                     │
│  📎  Attachments:                                                   │
│  ☑ Full scenario cards    ☑ Impact heatmap    ☑ Reasoning chain    │
│                                                                     │
│  [ Export PDF ]   [ Export PPTX ]   [ Share with Team ]            │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**:
| Input | Type | Description |
|-------|------|-------------|
| Memo text edits | Rich text | Advisor can edit any part of the AI-generated memo |
| Attachment toggles | Checkboxes | Select which supporting materials to include |
| Annotations | Text | Add personal notes or commentary |

**Outputs**:
- Auto-generated committee memo with all key findings
- PDF or PPTX export
- Shareable link for team members
- Full audit trail of the memo (who generated, who edited, when sent)

---

### Screen 8: What-If Explorer

**Purpose**: Interactive workspace where advisors can modify assumptions and see how results change.

**What the advisor sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  WHAT-IF EXPLORER                          Growth Balanced Strategy │
│                                                                     │
│  Modify scenarios or portfolio allocations to test alternatives     │
│                                                                     │
│  ── SCENARIO ADJUSTMENTS ──────────────────────────────────────     │
│                                                                     │
│  Adjust: [ Stagflation Redux            ▼ ]                        │
│                                                                     │
│  Inflation Rate:     ◀───●────────────▶    6.0%  (was: 4.0%)      │
│  Growth Rate:        ◀────────●───────▶    1.5%  (was: 1.5%)      │
│  Rate Hikes:         ◀──────────●─────▶  +200bps (was: +150bps)   │
│  Oil Price:          ◀────────────●───▶  $120/bbl (was: $95/bbl)  │
│                                                                     │
│  [ Apply Changes ]   [ Reset to Original ]                          │
│                                                                     │
│  ── PORTFOLIO ADJUSTMENTS ─────────────────────────────────────     │
│                                                                     │
│  Current Allocation          →     Test Allocation                  │
│  US Large Cap:    35%        →     [ 35% ]                         │
│  IG Fixed Inc:    20%        →     [ 20% ]                         │
│  Private Credit:  15%        →     [ 10% ]  ← modified            │
│  TIPS:            10%        →     [ 10% ]                         │
│  Real Estate:     10%        →     [ 10% ]                         │
│  EM Debt:          5%        →     [  5% ]                         │
│  Cash:             5%        →     [ 10% ]  ← modified            │
│  TOTAL:          100%        →     100% ✅                          │
│                                                                     │
│  ── COMPARISON RESULTS ────────────────────────────────────────     │
│                                                                     │
│  │              │  Original  │  What-If   │  Change     │          │
│  │──────────────┼────────────┼────────────┼─────────────│          │
│  │  RCI         │  58        │  55        │  -3  🟡     │          │
│  │  LCI         │  42        │  34        │  -8  🟢⬇    │          │
│  │  Worst-case  │ -17.1%     │ -14.8%     │  +2.3% ✅   │          │
│  │  Escalation  │  Amber     │  Amber     │  No change  │          │
│  │──────────────┴────────────┴────────────┴─────────────│          │
│                                                                     │
│  💡 Reducing private credit by 5% and adding to cash improves      │
│     LCI by 8 points and reduces worst-case impact by 2.3%.         │
│     Escalation status remains Amber.                                │
│                                                                     │
│  [ Save as New Scenario ]   [ Compare Side-by-Side ]               │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**:
| Input | Type | Description |
|-------|------|-------------|
| Scenario selector | Dropdown | Choose which scenario to adjust |
| Macro parameter sliders | Range sliders | Adjust inflation, growth, rates, commodity prices |
| Portfolio allocation fields | Number inputs | Test different allocation weights (must sum to 100%) |

**Outputs**:
| Output | Description |
|--------|-------------|
| Updated RCI/LCI | Recomputed governance scores under new assumptions |
| Worst-case impact | Revised portfolio-level impact estimate |
| Change indicators | Shows direction and magnitude of change from original |
| AI commentary | Plain-language interpretation of what changed and why |
| Escalation status | Whether the traffic light would change |

**Key interactions**:
- Sliders provide real-time feedback (recomputes on release)
- "Save as New Scenario" — bookmarks this configuration for future reference
- "Compare Side-by-Side" — opens a split view with original vs. modified

---

### Screen 9: History & Audit Trail

**Purpose**: Browse past analyses with full audit trail for compliance.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ANALYSIS HISTORY                          Growth Balanced Strategy │
│                                                                     │
│  Filter: [ All Time ▼ ]  [ All Types ▼ ]  [ 🔍 Search... ]       │
│                                                                     │
│  Date/Time          │ Type           │ Status │ RCI │ LCI │ By    │
│  ────────────────────┼────────────────┼────────┼─────┼─────┼───────│
│  Mar 9, 2:16 PM     │ Full Scan      │ 🟡     │ 58  │ 42  │ J.S.  │
│  Mar 7, 10:02 AM    │ What-If        │ 🟢     │ 72  │ 28  │ J.S.  │
│  Mar 1, 3:45 PM     │ Full Scan      │ 🟢     │ 71  │ 31  │ M.K.  │
│  Feb 22, 9:30 AM    │ Full Scan      │ 🟡     │ 55  │ 45  │ J.S.  │
│  Feb 15, 2:00 PM    │ Committee Memo │ 🟡     │ 55  │ 45  │ J.S.  │
│  ────────────────────┴────────────────┴────────┴─────┴─────┴───────│
│                                                                     │
│  Showing 5 of 23 analyses  [ Load More ]                           │
│                                                                     │
│  ── TREND VIEW ────────────────────────────────────────────────     │
│                                                                     │
│  RCI over time:   72 ── 71 ── 55 ── 55 ── 58                      │
│  LCI over time:   28 ── 31 ── 45 ── 45 ── 42                      │
│                   Jan    Feb    Feb    Feb    Mar                    │
│                                                                     │
│  ── AUDIT DETAIL (click any row above) ────────────────────────     │
│                                                                     │
│  Selected: March 9, 2:16 PM — Full Scan by J. Smith                │
│                                                                     │
│  • Portfolio snapshot: [View Portfolio as of Scan]                  │
│  • AI reasoning chain: [View Full Chain — 847 tokens]              │
│  • Model version: gpt-4.1-mini                                      │
│  • Prompt version: v2.3.1                                          │
│  • Knowledge base: Historical Regimes KB v1.2                      │
│  • Escalation action: Memo generated, sent to committee            │
│  • Changes since last scan: RCI +3, LCI -3, 1 new scenario        │
│                                                                     │
│  [ Export Audit Log ]   [ Compare to Previous Scan ]               │
└─────────────────────────────────────────────────────────────────────┘
```

**Inputs**:
- Date filter, type filter, search
- Click any row to expand audit detail

**Outputs**:
- Chronological list of all analyses with key metrics
- Trend line showing RCI and LCI movement over time
- Full audit detail per analysis (who, when, what model, what version, what was decided)

---

## 4. Input/Output Summary

### All User Inputs (What Goes In)

| Input | Where | Format | Required |
|-------|-------|--------|----------|
| Portfolio name | Portfolio Setup | Text | Yes |
| AUM | Portfolio Setup | Currency ($) | Yes |
| Benchmark | Portfolio Setup | Dropdown selection | No |
| Asset class allocations | Portfolio Setup | Table (class + weight + details) | Yes |
| Portfolio characteristics | Portfolio Setup | Mixed (duration, geography, leverage, liquidity) | Recommended |
| Policy constraints | Portfolio Setup | Numbers (max %, max leverage) | No |
| Scan trigger | Dashboard or Portfolio Setup | Button click | Yes |
| What-if macro adjustments | What-If Explorer | Sliders (rates, inflation, growth, etc.) | No |
| What-if allocation changes | What-If Explorer | Number fields | No |
| Memo edits | Committee Memo | Rich text editor | No |
| Annotations/comments | Any results screen | Text | No |

### All System Outputs (What Comes Out)

| Output | Where | Format |
|--------|-------|--------|
| Live reasoning stream | Regime Scan | Streaming text with step indicators |
| Regime scenarios (3-5) | Scenario Results | Structured cards with narrative, probability, triggers, analogy |
| Impact heatmap | Impact Heatmap | Color-coded matrix with % ranges |
| Cell-level AI reasoning | Impact Heatmap (click) | Side panel text |
| RCI composite + 4 sub-scores | Governance Metrics | Scores (0-100) with bars and explanations |
| LCI composite + 3 sub-scores | Governance Metrics | Scores (0-100) with bars and explanations |
| Escalation status | Governance Metrics | Traffic light (Green/Amber/Red) with action |
| Committee memo draft | Committee Memo | Rich text document |
| What-if comparison | What-If Explorer | Side-by-side table with change indicators |
| Historical trend | History | Line chart of RCI/LCI over time |
| Audit trail | History | Structured log (who, when, what, model version) |
| PDF / PPTX reports | Export | Downloadable files |

---

## 5. Key Interaction Patterns

### Pattern 1: Progressive Disclosure
- **Summary first** → user clicks for detail
- Example: Heatmap shows color + percentage → click opens full AI reasoning
- Example: RCI shows composite 58 → sub-scores visible below → hover for deeper explanation

### Pattern 2: Transparent AI Reasoning
- The AI never produces a "black box" output
- Every score, every scenario, every impact assessment has an expandable explanation
- Reasoning chains are preserved and accessible from the audit trail

### Pattern 3: Governance-First Design
- Traffic lights (Green/Amber/Red) appear on every screen where decisions matter
- Escalation actions are suggested, never forced
- Committee memos are auto-generated but always human-editable
- Audit trail captures everything — who ran it, who edited it, who sent it

### Pattern 4: One-Click Depth
- From the Dashboard, one click reaches any portfolio's latest scan
- From any scenario, one click reaches the full reasoning chain
- From any governance metric, one click reaches the committee memo

### Pattern 5: Non-Destructive Exploration
- What-If Explorer never modifies the original analysis
- All modifications are saved as separate scenarios
- "Reset to Original" is always available

---

## 6. Data Visualizations

### 6.1 Traffic Light Indicator
- Used on: Dashboard cards, Governance Metrics, History table
- Large, color-filled circle or badge
- Always accompanied by a text label (never color alone — accessibility)
- States: Green (Monitor), Amber (Review), Red (Escalate)

### 6.2 Score Bars (RCI / LCI)
- Horizontal bar chart, filled proportionally to score
- Color transitions: 0-39 = Red, 40-69 = Amber, 70-100 = Green
- Each bar has a one-line plain-language explanation beneath it
- Hover reveals additional context

### 6.3 Impact Heatmap
- Matrix grid with color-coded cells
- Red = high negative impact, Amber = moderate, Green = positive, Gray = neutral
- Each cell shows estimated % impact range
- Bottom row shows weighted portfolio-level impact
- Cells are clickable for drill-down

### 6.4 Trend Lines
- Simple line chart showing RCI and LCI over time
- Y-axis: 0-100, with colored threshold bands (Green/Amber/Red zones)
- X-axis: time (scans, not calendar — spacing reflects actual scan dates)
- Hover on any point shows scan details

### 6.5 Progress Indicator (Regime Scan)
- Linear progress bar with percentage
- Below it: 6-step checklist with status icons (done, active, pending)
- Active step shows streaming text

---

## 7. Notifications & Alerts

| Trigger | Notification Type | Message |
|---------|------------------|---------|
| Scan completed | In-app + optional email | "Regime scan for [Portfolio] complete. Status: [Amber]" |
| Red escalation triggered | In-app + email + push | "ESCALATION: [Portfolio] flagged RED — LCI at 67. Immediate review required." |
| Amber threshold crossed | In-app | "[Portfolio] moved to Amber status — recommend committee review" |
| Team comment added | In-app | "[Name] commented on [Portfolio] analysis" |
| Status improved to Green | In-app | "[Portfolio] returned to Green status — no action required" |
| Weekly digest | Email | Summary of all portfolio statuses and any changes |

---

## 8. Report & Export Outputs

### 8.1 Committee Memo (PDF)
- Professional format with firm branding
- Sections: Executive Summary, Top Vulnerabilities, Governance Scores, Discussion Points, Suggested Actions
- Attachments: Scenario cards, heatmap, reasoning chain excerpts
- 3-5 pages

### 8.2 Full Analysis Report (PDF)
- Comprehensive export of all scan results
- Includes: Portfolio snapshot, all scenarios, full heatmap, all governance metrics, complete reasoning chain
- 15-25 pages

### 8.3 Presentation Deck (PPTX)
- Slide-ready format for committee presentations
- Key slides: Portfolio overview, top scenarios, heatmap, governance dashboard, recommended actions
- 8-12 slides

### 8.4 Audit Export (CSV / PDF)
- Compliance-friendly format
- All scans, all decisions, all model versions, all user actions
- Filterable by date range, user, portfolio

---

## 9. Role-Based Views

| Feature | Advisor | Senior Advisor | CIO | Compliance | Admin |
|---------|---------|---------------|-----|------------|-------|
| Create/edit portfolios | ✅ Own | ✅ Own | ✅ All | ❌ | ✅ All |
| Run regime scans | ✅ | ✅ | ✅ | ❌ | ✅ |
| View results & heatmap | ✅ Own | ✅ Own | ✅ All | ✅ All (read) | ✅ All |
| What-If Explorer | ✅ | ✅ | ✅ | ❌ | ✅ |
| Generate committee memos | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit committee memos | ✅ Own | ✅ All | ✅ All | ❌ | ✅ All |
| View audit trail | ✅ Own | ✅ Own | ✅ All | ✅ All | ✅ All |
| Export audit log | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Configure firm settings | ❌ | ❌ | ✅ | ❌ | ✅ |
| Override escalation rules | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 10. Mobile & Responsive Considerations

The primary experience is desktop (1280px+), reflecting how institutional advisors work. However, key views are optimized for tablet and mobile for on-the-go monitoring:

### Tablet (768px - 1024px)
- Dashboard portfolio cards stack in 2 columns
- Heatmap scrolls horizontally
- All functionality preserved

### Mobile (< 768px)
- Dashboard shows portfolio list with traffic lights (one column)
- Tap to expand portfolio card → shows RCI/LCI
- Scenario cards stack vertically
- Heatmap replaced with a ranked vulnerability list
- Committee memo is read-only (editing on desktop)
- Primary use case: check status, receive alerts, review escalations

### Push Notifications (Mobile)
- Red escalation alerts
- Scan completion
- Team comments on your portfolios

---

## Appendix: User Flow Diagram

```
                          ┌─────────────┐
                          │  Dashboard  │
                          │  (Home)     │
                          └──────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │ Portfolio │ │ Portfolio │ │ Portfolio │
            │  Card A   │ │  Card B   │ │  Card C   │
            └─────┬────┘ └──────────┘ └──────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
  ┌──────────────┐  ┌──────────────┐
  │  Portfolio    │  │  Run Regime  │
  │  Setup/Edit  │  │    Scan      │
  └──────┬───────┘  └──────┬───────┘
         │                 │
         │           ┌─────┴─────┐
         │           ▼           │
         │    ┌──────────────┐   │
         │    │ Live Reasoning│  │
         │    │   Stream     │   │
         │    └──────┬───────┘   │
         │           │           │
         │           ▼           │
         │    ┌──────────────┐   │
         │    │  Scenario    │   │
         │    │  Results     │   │
         │    └──────┬───────┘   │
         │           │           │
         │     ┌─────┼─────┐    │
         │     ▼     ▼     ▼    │
         │  ┌─────┐┌────┐┌───┐ │
         │  │Heat-││Gov.││What│ │
         │  │map  ││Dash││-If │ │
         │  └──┬──┘└─┬──┘└───┘ │
         │     │     │          │
         │     │     ▼          │
         │     │  ┌──────────┐  │
         │     │  │Committee │  │
         │     │  │  Memo    │  │
         │     │  └──────────┘  │
         │     │                │
         │     ▼                │
         │  ┌──────────┐       │
         └─▶│ History  │◀──────┘
            │& Audit   │
            └──────────┘
```

**Core flow**: Dashboard → Portfolio → Scan → Scenarios → Heatmap → Governance → Memo

**Always accessible**: History & Audit Trail from any screen via sidebar navigation.

---

*This document describes the user-facing interface of the Regime Risk Engine. For product strategy and business context, refer to the Product Design Specification. For technical implementation details, refer to the Engineering Specification (forthcoming).*
