# Regime Risk Engine Interaction Guide

## Who This Is For

Institutional investment advisors, CIO staff, and governance reviewers.

## How To Use The System

1. Enter the portfolio label, allocation mix, duration, leverage, liquidity profile, and investment constraints.
2. Review the attached public market context snapshot.
3. Let the system create an intake-classification artifact covering complexity, liquidity tier, leverage class, duration bucket, concentration flags, and market-context coverage.
4. Run the 4-stage analysis pipeline.
5. Inspect the structured outputs for exposures, regimes, vulnerabilities, governance metrics, and the saved intake classification.
6. Complete the human review checklist in the Governance tab.
7. Validate, escalate, or send back for revision.
8. Move the committee memo to `Ready for Committee` or `Sent to Committee` only after review is complete.

## What The System Produces

- Intake classification: complexity, liquidity tier, leverage class, duration bucket, concentration flags, market-context coverage
- Stage 1: exposure map, dominant exposures, hidden concentrations
- Stage 2: three macro regime scenarios with historical analogies
- Stage 3: vulnerability scores, liquidity stress, drawdown ranges, reasoning summaries
- Stage 4: RCI, LCI, escalation guidance, watch items, decision context, validation checks
- Committee memo: editable Markdown output connected to the audit trail

## Human Review Checkpoints

- Structural validity reviewed
- Scenario diversity confirmed
- Liquidity fragility assessed
- Governance communication ready
- Override rationale recorded if escalation is changed

## What The System Will Not Do

- Make investment decisions
- Sign off on compliance or legal sufficiency
- Answer questions that require proprietary or unavailable data sources
- Replace human committee review
