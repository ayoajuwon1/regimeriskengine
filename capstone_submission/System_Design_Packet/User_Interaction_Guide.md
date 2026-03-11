# User Interaction Guide

## Intended User

This system is designed for:

- institutional investment advisors
- CIO-office analysts
- investment-governance reviewers

It is not designed for retail investors, discretionary trading, or personal financial planning.

## Before You Begin

The operator should confirm:

- the portfolio being entered is the actual committee-review target
- the allocation mix is current enough to support analysis
- liquidity and leverage values are directionally correct
- the system is being used for governance support, not recommendation generation

## Standard Workflow

| Step | User Action | System Output | User Responsibility |
|---|---|---|---|
| 1 | enter structured portfolio input | portfolio record | provide accurate input |
| 2 | review market context and intake classification | classification artifact | challenge obvious mismatches |
| 3 | run analysis | four stage outputs | inspect before accepting |
| 4 | review governance output | escalation and validation checks | complete checklist |
| 5 | update review state | saved review metadata | own the decision |
| 6 | prepare committee memo | draft memo / PDF export | release only after review |

## What The User Should Expect

- the system will produce a portfolio-governance package, not a conversational answer
- the system will not answer ticker-selection or performance-prediction questions
- the system may return uncertainty rather than pretending to know missing facts
- the final user remains accountable for review and institutional use

## What The User Must Provide

| Required Input | Why It Matters |
|---|---|
| portfolio label | anchors the analysis record |
| asset allocation rows | defines the portfolio structure |
| region / focus | helps interpret macro transmission channels |
| duration | informs rates sensitivity |
| leverage | informs fragility and escalation |
| liquidity profile | informs forced-selling and governance risk |
| constraints | informs what the committee must respect |

## What The User Must Not Do

- do not ask for named security recommendations
- do not treat output as self-authorizing
- do not assume hidden precision exists just because the writing is polished
- do not bypass the review workflow

## Reviewer Best Practices

- challenge missing liquidity assumptions
- challenge weak historical analogies
- inspect escalation logic, not just narrative quality
- use override rationale when the model’s escalation calibration is directionally wrong
