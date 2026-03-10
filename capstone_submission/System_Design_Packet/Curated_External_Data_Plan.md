# Curated External Data Plan

## Purpose

Satisfy the capstone requirement that the production system be grounded on curated uploaded evidence rather than unconstrained external retrieval.

## Operating Principle

For the capstone deployment, the model should reference only:

- structured portfolio input
- uploaded curated evidence packs
- internal governance policy artifacts

## Recommended Evidence Packs

### 1. Macro Snapshot Pack

Contents:

- latest selected inflation, labor, growth, and rates series
- short narrative summary of current macro conditions
- date-stamped source table

Suggested source base:

- BLS
- U.S. Treasury Fiscal Data
- BEA
- FRED

Why included:

- gives the system an explicit, versioned market context

### 2. Historical Regime Analog Pack

Contents:

- curated summaries of 1973–74 stagflation
- 1994 bond shock
- 2001–02 earnings recession
- 2008 global financial crisis
- March 2020 liquidity shock
- 2022 inflation reset

For each episode include:

- trigger
- transmission mechanism
- asset-class implications
- why it is comparable
- why it is not perfectly comparable

Why included:

- anchors scenario generation in real financial history
- reduces hallucinated analogies

### 3. Governance Policy Pack

Contents:

- human review checklist
- escalation rules
- disclosure language
- memo standards
- prohibited-use rules

Why included:

- keeps outputs aligned with institutional process, not just market reasoning

## What Cannot Be Answered From These Packs

- named security recommendations
- issuer-level fundamentals not included in the pack
- benchmark outperformance predictions
- legal or compliance opinions
- holdings-level analytics if only aggregate portfolio input is provided

## Versioning and Refresh

- Macro Snapshot Pack: refresh weekly or monthly for the capstone demo
- Historical Regime Analog Pack: versioned document, refreshed only when materially revised
- Governance Policy Pack: refresh only when policy changes

## Current Repository Position

The current repository uses live public market context as a reference workflow and evaluation harness. For the capstone submission, this curated-pack design is the enterprise-compliant deployment model to configure in the approved no-code / low-code tool.
