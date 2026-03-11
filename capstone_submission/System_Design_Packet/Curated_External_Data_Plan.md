# Curated External Data Plan

## Objective

Define the evidence packs that the capstone deployment should upload into the approved platform so the model is grounded on curated materials rather than unrestricted retrieval.

## Operating Rule

The capstone deployment should allow the model to reference only:

- structured portfolio input
- uploaded curated packs
- internal governance artifacts

## Pack 1. Macro Snapshot Pack

### Purpose

Provide a versioned macro context snapshot that is explicit, reviewable, and time-stamped.

### Suggested Contents

- inflation summary
- labor-market summary
- rates curve snapshot
- growth snapshot
- date-stamped source table
- short narrative summary of current conditions

### Suggested Sources

- BLS
- U.S. Treasury Fiscal Data
- BEA
- FRED

### Refresh Cadence

weekly or monthly for the demo

## Pack 2. Historical Regime Analog Pack

### Purpose

Anchor scenario generation in real financial history instead of improvised analogies.

### Suggested Episodes

- 1973–74 stagflation
- 1994 bond shock
- 2001–02 earnings recession
- 2008 global financial crisis
- March 2020 liquidity shock
- 2022 inflation reset

### For Each Episode Include

- trigger
- transmission mechanism
- asset-class implications
- why the episode is comparable
- why it is not perfectly comparable

## Pack 3. Governance Policy Pack

### Purpose

Constrain the model to the institution’s review, escalation, and disclosure norms.

### Suggested Contents

- human review checklist
- escalation rules
- memo standards
- refusal rules
- disclosure language
- prohibited-use rules

## What The Packs Cannot Answer

- named security recommendations
- issuer-level fundamentals not included in the pack
- benchmark outperformance claims
- legal or compliance judgments
- holdings-level analytics if the input is only aggregate

## Metadata Recommendation

Each pack should include:

- version
- as-of date
- source list
- owner
- refresh policy

## Current Repository Position

The current repository uses live public market context as a reference harness. The curated-pack design described here is the target deployment posture for the capstone and for a more enterprise-aligned operating model.
