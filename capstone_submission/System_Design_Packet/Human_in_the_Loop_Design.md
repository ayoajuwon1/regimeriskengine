# Human-in-the-Loop Design

## Principle

The system is a governance aid. It does not replace accountable human decision-makers.

## Role Design

| Role | Responsibility |
|---|---|
| operator | enters the portfolio and initiates analysis |
| reviewer | validates structural soundness, challenge points, escalation, and memo readiness |
| committee / decision owner | consumes reviewed output and makes the actual institutional decision |

## RACI View

| Activity | Operator | Reviewer | Committee |
|---|---|---|---|
| enter portfolio | R | I | I |
| run analysis | R | I | I |
| inspect intake classification | R | C | I |
| validate output quality | I | R | I |
| set review status | I | R | I |
| override escalation | I | R | I |
| approve committee circulation | I | R | I |
| make final investment / governance decision | I | C | R |

`R = responsible`, `C = consulted`, `I = informed`

## Mandatory Human Controls

- reviewer identity must be recorded
- review status must be explicit
- escalation overrides require written rationale
- committee-ready memo states require validated or escalated review status

## Why Human Review Exists

Human review is not cosmetic. It exists because:

- portfolio input may be incomplete
- ambiguity may need to be challenged
- escalation may require human judgment
- institutional accountability cannot be outsourced to model output

## Minimum Reviewer Questions

Before committee use, the reviewer should ask:

1. does the output overclaim what is actually known?
2. are the regime scenarios genuinely distinct?
3. does the liquidity analysis reflect the real funding and governance context?
4. is the escalation level directionally right?
5. is the memo safe to circulate as institutional content?
