# Escalation Rules

## Objective

Define how elevated governance concern is surfaced, reviewed, and acted on.

## Inputs To Escalation

- Regime Confidence Index (`RCI`)
- Liquidity Compression Index (`LCI`)
- intake-classification concentration flags
- vulnerability findings
- reviewer judgment

## Escalation Levels

| Level | Label | Typical Trigger | Expected Action |
|---|---|---|---|
| 1 | Monitor | low fragility, strong confidence | keep under monitoring |
| 2 | Review | moderate fragility or uncertainty | reviewer validates and prepares committee context |
| 3 | Committee Review | material liquidity, leverage, or concentration concern | take to committee with explicit discussion points |
| 4 | Immediate Escalation | severe governance concern or acute liquidity stress | urgent senior review and committee escalation |

## Escalation Principles

- the model proposes an escalation level
- the reviewer owns final escalation treatment
- if the reviewer overrides the level, the rationale must be recorded
- the audit trail must preserve both proposal and override context

## Examples

| Situation | Expected Escalation Direction |
|---|---|
| moderate mixed-liquidity portfolio with manageable stress | Level 1–2 |
| alternatives-heavy portfolio with unresolved liquidity assumptions | Level 2–3 |
| leveraged illiquid portfolio with distribution pressure and covenant concern | Level 3–4 |

## Review Questions For Escalation

- is the model under-reacting to liquidity fragility?
- is the model over-reacting to manageable diversification?
- are concentration flags being translated into the right governance urgency?
- does the memo clearly explain why the escalation level is what it is?
