# Instruction Hierarchy

## Objective

Prove that the system is controlled by layered artifacts with distinct jobs rather than a single mega-prompt.

## Precedence Order

| Layer | Artifact | Primary Responsibility | Why It Must Be Separate |
|---|---|---|---|
| 1 | System instruction | sets model role, capabilities, prohibitions, evidence boundary | prevents prompt sprawl and hidden policy drift |
| 2 | Workflow policy | defines step order, human checkpoints, and escalation flow | turns the product into a process, not chat |
| 3 | Structured input template | constrains what the user can submit | reduces ambiguity and attack surface |
| 4 | Structured output schema | constrains what the model may return | prevents narrative drift and uncontrolled formatting |
| 5 | Refusal and language guardrails | controls tone, certainty, and prohibited content | separates safety language from general task instructions |
| 6 | Human review and escalation controls | defines institutional accountability | ensures model output is not self-authorizing |

## Why This Matters

If a single artifact tries to carry all control responsibility, the system becomes fragile and hard to audit. A controlled institutional system needs different layers for:

- task definition
- workflow sequencing
- IO structure
- refusal behavior
- human accountability

## Example Of The Difference

### Weak design

One prompt that says:

> “Analyze the portfolio, be careful, do not hallucinate, provide scenarios, be compliant, and ask humans to review.”

### Strong design

- system instruction says what the model may and may not do
- input template says what the user must provide
- output schema says what the model must return
- workflow says when humans intervene
- escalation rules say what happens if risk is elevated

That is the difference between a prompt demo and a governed system.
