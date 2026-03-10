# Failure Modes and Risk Analysis

## Objective

Identify realistic ways the system can fail in a financial setting, including user misuse and governance breakdowns, not just technical bugs.

## Rating Scale

- `Severity 5`: material governance, regulatory, or reputational risk
- `Severity 4`: high business or decision-quality risk
- `Severity 3`: meaningful but contained risk
- `Severity 2`: moderate operational risk
- `Severity 1`: low-severity inconvenience

## Risk Register

| Failure Mode | Severity | Why It Matters | Current / Planned Mitigation |
|---|---:|---|---|
| User treats output as investment advice rather than decision support | 5 | Creates fiduciary and reputational risk | Explicit refusal policy, advisory-only labeling, human review before committee use, memo gating |
| Prompt injection through structured fields attempts to override policy | 5 | Could coerce impermissible output if controls are weak | System instruction, structured schema, live adversarial testing, output limited to known fields |
| Portfolio input is incomplete or misleading, especially around liquidity | 5 | Garbage-in can create false confidence and poor committee decisions | Intake classification, human validation checks, ambiguity handling, reviewer accountability |
| Model produces plausible but weak historical analogies | 4 | Narrative authority can hide poor reasoning | Structured regime schema, human review, RCI/LCI framing, planned curated historical analog pack |
| Stale or misaligned market context biases the analysis | 4 | Analysis may appear current while using outdated assumptions | Market-context provenance, data-as-of metadata, source listing, planned curated snapshot versioning |
| User asks out-of-scope questions about named securities or performance | 4 | Slippage from portfolio governance into unauthorized advice | Refusal policy, schema constraints, workflow design, evaluation tests for out-of-scope requests |
| Review process becomes perfunctory and humans over-trust the memo | 4 | Human-in-the-loop exists on paper but not in practice | Required validation checklist, explicit review states, override rationale, committee-readiness gating |
| Committee memo is shared before review completion | 4 | Unreviewed AI output could circulate as firm-sanctioned content | Memo status controls, review-state gating, audit trail |
| Concentration or leverage risk is understated because inputs are too aggregated | 3 | The system may miss holdings-level nuance | Scope limitation stated clearly; system is for aggregated institutional portfolio review, not holdings analytics |
| Output schema passes, but language becomes too strong or too certain | 3 | High-confidence tone can mislead decision-makers | Guardrail language examples, uncertainty framing, human review checkpoint |

## User Misuse Scenarios

### 1. Advisory Shortcut

A user pastes “Should we buy NVDA?” into constraints and hopes the model answers directly.

Mitigation:

- refuse by system policy
- constrain output to portfolio-risk schema
- document as out-of-scope in interaction guide

### 2. Governance Bypass

A user exports the memo without substantive review and presents it as committee-ready.

Mitigation:

- memo-status gating
- review-state requirement
- audit record of reviewer and timestamp

### 3. False Precision

A user assumes manager-level liquidity precision exists even when the portfolio input is only aggregate.

Mitigation:

- human validation checks
- intake classification flags
- explicit scope limitation in system and interaction artifacts

## Residual Risks That Need Ongoing Monitoring

- model drift over time
- reviewer fatigue
- stale macro context
- overuse outside intended portfolio-governance use case
- eventual mismatch between documented policy and live platform configuration

## Conclusion

The dominant risks are human and governance risks, not just model hallucination. The system is strongest when treated as an auditable first-draft engine with enforced review. It is weakest when a user tries to repurpose it as a recommendation engine or bypass the review workflow.
