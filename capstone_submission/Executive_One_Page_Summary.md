# Executive One-Page Summary

## Regime Risk Engine

### User and Business Problem

The primary user is an institutional investment advisor or CIO-support team member responsible for preparing risk narratives and governance materials for an investment committee. Today, these users rely on backward-looking tools such as VaR, historical stress tests, and ad hoc committee memos. Those tools are useful for explaining what has already happened, but weak at framing what could happen next and how a specific multi-asset portfolio is exposed.

The business problem is straightforward: advisors need a repeatable, auditable way to translate a portfolio’s asset mix, liquidity profile, leverage, and constraints into forward-looking regime scenarios, vulnerability analysis, and governance actions that a regulated institution can review and defend.

### Solution in Plain English

Regime Risk Engine is a workflow-driven GenAI system for institutional portfolio regime-risk analysis. A user enters a structured portfolio template rather than free-form chat. The system first creates an intake-classification artifact that summarizes portfolio complexity, liquidity tier, leverage, duration bucket, concentration flags, and market-context coverage. It then runs a four-step analysis:

1. Exposure decomposition
2. Regime generation
3. Vulnerability assessment
4. Governance and escalation scoring

The output is not a conversation. It is a structured set of artifacts for committee use: exposure map, three regime scenarios, vulnerability matrix, governance metrics, human validation checks, and an editable committee memo tied to an audit trail.

### Key Risks and Controls

The main risk is not that the model fails noisily. The main risk is that it sounds plausible while being used beyond its mandate. The design therefore emphasizes control over creativity.

- Structured input template limits ambiguity and reduces prompt drift.
- Structured output schemas force the model into known response shapes.
- Explicit refusal policy prohibits investment advice, fabricated facts, performance predictions, and legal or compliance sign-off.
- Human review is mandatory before committee circulation.
- Escalation overrides require written rationale.
- Memo release to committee is gated by validated or escalated review status.
- Audit trail records analysis metadata, market-context provenance, classification summary, review actions, and memo lifecycle changes.

### What the System Will Do

- Analyze a structured institutional portfolio.
- Generate forward-looking but schema-constrained macro regime scenarios.
- Highlight vulnerability drivers and liquidity fragility.
- Produce governance-oriented outputs for investment committee review.
- Preserve uncertainty and force human review.

### What the System Will Not Do

- Provide personalized investment advice.
- Recommend trades, tickers, or timing decisions.
- Predict benchmark outperformance.
- Invent missing data.
- Replace fiduciary, legal, compliance, or committee judgment.

### Why This Matters in a Regulated Institution

This system is designed as a decision-support layer, not an autonomous advisor. That distinction is central. In a regulated environment, the question is not whether the AI can generate impressive narratives. The question is whether the institution can explain how the output was produced, what constraints applied, where humans intervened, and how misuse is prevented. Regime Risk Engine is designed to answer those questions clearly.
