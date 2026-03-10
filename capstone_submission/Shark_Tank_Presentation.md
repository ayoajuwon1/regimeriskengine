# Shark Tank-Style Presentation

## Presentation Goal

Convince a skeptical investment-committee audience that this is a deployable, governed GenAI system for institutional regime-risk analysis, not a prompt demo.

## Timing

- Total: 15 minutes
- Presentation: 10 minutes
- Q&A: 5 minutes

## Slide Outline

### Slide 1: Title and Problem

**Title:** Regime Risk Engine  
**Subtitle:** Workflow-driven GenAI for institutional portfolio regime-risk governance

Speaker points:

- Traditional risk tools are backward-looking.
- Advisors still handcraft forward-looking regime narratives.
- That creates inconsistency, weak auditability, and governance risk.

### Slide 2: User and Job-to-Be-Done

Speaker points:

- Primary user: institutional investment advisor / CIO support lead.
- JTBD: prepare a defensible committee-ready view of portfolio vulnerability before the regime shift arrives.
- Current pain: fragmented workflow across spreadsheets, macro commentary, and memo writing.

### Slide 3: Why Existing Approaches Fail

Speaker points:

- VaR and historical stress tests replay known crises.
- They do not connect current portfolio structure to plausible next-regime narratives.
- They also do not operationalize human review and escalation.

### Slide 4: What the System Does

Speaker points:

- Structured input, not open chat.
- Deterministic intake classification.
- Four-step analysis pipeline.
- Structured outputs plus editable committee memo.
- Audit trail and reviewer gates.

### Slide 5: Workflow Map

Speaker points:

- Intake
- Classification
- Analysis
- Validation
- Output formatting
- Human review checkpoint before committee use

Callout:

- This is a system with controls, not a single prompt.

### Slide 6: Guardrails and Refusals

Speaker points:

- The model may analyze portfolio exposures and regime vulnerability.
- It may not provide investment advice, security recommendations, performance promises, legal sign-off, or fabricated facts.
- Structured schema and refusal policy constrain output shape and content.

### Slide 7: Human-in-the-Loop and Escalation

Speaker points:

- Reviewer must validate output before committee use.
- Escalation overrides require written rationale.
- Memo cannot move to committee-ready state until review status is validated or escalated.
- Accountability is explicit.

### Slide 8: Curated External Data Strategy

Speaker points:

- Capstone deployment uses curated packs rather than unrestricted browsing.
- Packs include macro snapshot, historical analogs, and governance policy.
- The model is limited to those packs plus the structured input template.

### Slide 9: Failure Testing

Speaker points:

- Happy path: full 4-stage run completed successfully.
- Ambiguous input: uncertainty preserved, no false precision.
- Adversarial input: prompt injection ignored.
- Out-of-scope request: no security recommendation emitted.
- Schema remained intact across observed tests.

### Slide 10: Why This Is Deployable

Speaker points:

- Strong system design artifacts
- Explicit refusal boundaries
- Human review and escalation design
- Evaluation discipline
- Financial realism and governance focus

Close:

- This is not trying to replace the committee.
- It gives the committee a disciplined, auditable first draft of regime-risk reasoning.

## Suggested Demo Flow

1. Show structured portfolio input.
2. Show intake classification and public market context.
3. Show the four analysis tabs in sequence.
4. Open Governance tab and highlight reviewer gating.
5. Open Committee Memo and audit log.
6. Open Method / Guide to prove artifact completeness.

## Likely Q&A and Recommended Answers

### “Isn’t this just a prompt?”

No. The system has distinct artifacts, structured schemas, deterministic classification, review workflow, refusal policy, and auditability. The prompt is only one component in a controlled stack.

### “What stops the model from making recommendations?”

Three things: system instruction, schema constraints, and workflow gating. Even if a user tries to inject advisory intent through a field, the model is constrained to portfolio-risk analysis outputs and cannot move content to committee use without human review.

### “How is this safe for a regulated institution?”

It is designed as decision support, not autonomous advice. It records provenance, forces human review, documents escalation, and avoids personalized investment recommendations.

### “How do you know it works?”

We defined explicit success and failure criteria, tested happy path, ambiguity, adversarial behavior, and out-of-scope requests, and documented both expected and unacceptable outputs.
