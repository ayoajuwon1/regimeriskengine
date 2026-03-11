# Executive One-Page Summary

## Regime Risk Engine

### User

Institutional investment advisors, CIO-office analysts, and risk/governance staff responsible for preparing committee-ready portfolio risk materials.

### Business Problem

Institutional investment committees often receive two weak substitutes for forward-looking risk governance:

- backward-looking quantitative outputs such as VaR or historical stress tests
- ad hoc narrative memos assembled manually from portfolio data, market commentary, and analyst judgment

The first is often too retrospective. The second is often inconsistent, slow, and difficult to audit. The result is a governance gap: committees need a repeatable way to translate a portfolio’s structure into plausible future regimes, vulnerability pathways, and escalation actions before the regime shift arrives.

### Proposed Solution

Regime Risk Engine is a workflow-driven GenAI decision-support system for institutional portfolio regime-risk analysis.

The user does not “chat” with the model. The user submits a structured portfolio template. The system then:

1. creates a deterministic intake-classification artifact
2. generates a four-stage structured analysis
3. forces human review before committee use
4. produces a committee-oriented memo plus audit metadata

### Why This Matters

The product is designed to improve the quality and consistency of committee preparation, not to automate fiduciary judgment. That is the core operating principle.

## At-A-Glance System Design

| Category | Design Choice |
|---|---|
| Operating model | Structured workflow, not free-form chat |
| Primary input | Structured portfolio template with allocations, duration, leverage, liquidity, and constraints |
| Primary output | Exposure map, regime set, vulnerability matrix, governance metrics, validation checks, and committee memo |
| Guardrail posture | No investment advice, no named security recommendations, no fabricated facts, no compliance sign-off |
| Human control | Mandatory review before committee use |
| Escalation | Model proposes; human reviewer confirms or overrides with rationale |
| Evidence posture | Current prototype uses server-attached public market context; capstone deployment model uses curated uploaded packs |

## What The System Will Do

- analyze a structured institutional portfolio
- identify dominant macro and liquidity exposures
- generate three distinct macro regime scenarios
- assess first-order and second-order vulnerabilities
- produce governance-oriented escalation guidance
- preserve uncertainty and force human validation

## What The System Will Not Do

- recommend trades, tickers, or timing decisions
- answer retail-investor style questions
- predict benchmark outperformance
- invent missing holdings facts, side-letter terms, or manager-specific liquidity rights
- replace the committee, reviewer, legal, compliance, or fiduciary decision-maker

## Risks And Controls

| Key Risk | Why It Matters | Primary Controls |
|---|---|---|
| Advice slippage | Could create fiduciary or reputational risk | refusal policy, structured schema, human review gating |
| Plausible but weak reasoning | AI may sound convincing while being wrong or incomplete | validation checklist, escalation design, documented failure testing |
| Input incompleteness | Garbage-in can create false confidence | structured template, intake classification, reviewer accountability |
| Governance bypass | Unreviewed output may circulate as if approved | memo-state gating, reviewer identity, audit trail |
| Data-boundary confusion | Users may over-assume what evidence was available | provenance metadata, data-boundary documentation, curated-pack deployment plan |

## Evidence From The Current Prototype

| Evidence Item | Result |
|---|---|
| Automated regression suite | 16 / 16 checks passed |
| Production build | Passed |
| Local health checks | `/` and `/api/system-design` returned `200` |
| Required live scenario set | happy path, ambiguous input, adversarial input, and out-of-scope request all executed and documented |
| Guardrail leakage | 0 prohibited ticker/advice terms observed in the adversarial and out-of-scope live cases |

## Leadership Takeaway

This is not an “AI advisor.” It is a controlled portfolio-governance system designed to produce an auditable first draft of regime-risk reasoning. Its value is not raw model cleverness. Its value is disciplined workflow, explicit boundaries, human accountability, and repeatable committee preparation.
