# Escalation Rules

## Objective

Define when the system flags elevated governance attention and what human action follows.

## Escalation Inputs

- Regime Confidence Index (`RCI`)
- Liquidity Compression Index (`LCI`)
- reviewer judgment
- intake-classification concentration flags
- human validation findings

## Proposed Levels

| Level | Trigger | Expected Human Action |
|---|---|---|
| 1. Monitor | Well-supported output, low liquidity concern | retain as monitored analysis |
| 2. Review | Moderate uncertainty or moderate liquidity concern | reviewer validates and prepares committee context |
| 3. Committee Review | elevated fragility, higher uncertainty, or material concentration flags | move to committee discussion |
| 4. Immediate Escalation | severe liquidity compression, low confidence, or material governance concern | immediate senior review and formal committee escalation |

## Override Rules

- reviewer may override the model’s escalation level
- every override requires written rationale
- override is preserved in the audit trail

## Accountability

- model proposes
- human reviewer confirms or overrides
- committee receives only reviewed content
