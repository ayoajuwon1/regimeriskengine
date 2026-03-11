# Structured Output Schema

## Purpose

Constrain the model to a known set of reviewable outputs.

## Output Families

| Output Family | Purpose |
|---|---|
| intake classification | deterministic pre-analysis artifact |
| stage 1 output | exposure decomposition |
| stage 2 output | regime generation |
| stage 3 output | vulnerability assessment |
| stage 4 output | governance metrics and validation checks |
| memo / audit metadata | committee preparation and traceability |

## Intake Classification

| Field | Type | Meaning |
|---|---|---|
| `classificationSummary` | string | one-line summary |
| `portfolioComplexity` | string | structural complexity posture |
| `liquidityTier` | string | high / mixed / illiquid-heavy |
| `leverageClass` | string | leverage category |
| `durationBucket` | string | short / intermediate / long |
| `contextCoverage` | string | evidence sufficiency |
| `concentrationFlags` | array[string] | specific warnings |

## Stage 1: Exposure Decomposition

Required top-level fields:

- `analysisSummary`
- `exposureMap`
- `dominantExposures`
- `hiddenConcentrations`

### `exposureMap` fields

| Field | Type | Range |
|---|---|---|
| `inflationSensitivity` | object | score `0–10` plus drivers and interpretation |
| `growthSensitivity` | object | score `0–10` plus drivers and interpretation |
| `durationRisk` | object | score `0–10` plus drivers and interpretation |
| `creditSpreadRisk` | object | score `0–10` plus drivers and interpretation |
| `currencyExposure` | object | score `0–10` plus drivers and interpretation |
| `liquidityDependence` | object | score `0–10` plus drivers and interpretation |

## Stage 2: Regime Generation

Required top-level fields:

- `regimeSetSummary`
- `regimes`

Each regime must include:

| Field | Type |
|---|---|
| `id` | integer |
| `name` | string |
| `scenarioType` | string |
| `probability` | enum (`High`, `Medium`, `Low`) |
| `timeHorizon` | string |
| `trigger` | string |
| `transmissionMechanisms` | array[string] |
| asset-class impact fields | enum values |
| `keyRisk` | string |
| `rationaleSummary` | string |
| `historicalAnalogy` | object |

## Stage 3: Vulnerability Assessment

Required top-level fields:

- `analysisSummary`
- `vulnerabilities`

Each vulnerability must include:

| Field | Type |
|---|---|
| `regimeId` | integer |
| `regimeName` | string |
| `firstOrderEffects` | array[string] |
| `secondOrderEffects` | array[string] |
| `liquidityStress` | enum (`Low`, `Medium`, `High`, `Critical`) |
| `estimatedDrawdown` | string |
| `vulnerabilityScore` | integer `0–10` |
| `primaryVulnerability` | string |
| `reasoningSummary` | string |

## Stage 4: Governance Metrics

Required top-level fields:

- `rci`
- `lci`
- `escalationLevel`
- `escalationLabel`
- `escalationRationale`
- `escalationTriggers`
- `governanceActions`
- `counterScenario`
- `keyWatchItems`
- `decisionContext`
- `humanValidationChecks`
- `committeeMemoHeadline`

### Governance sub-objects

| Field | Type | Notes |
|---|---|---|
| `rci.score` | integer | regime confidence |
| `rci.label` | string | confidence label |
| `lci.score` | integer | liquidity compression indicator |
| `lci.label` | string | liquidity label |
| `escalationLevel` | integer | `1–4` |
| `humanValidationChecks` | array[string] | minimum 3 items |

## Memo And Audit Outputs

The system also produces:

- committee memo draft
- memo status
- review metadata
- audit trail entries
- analysis metadata, including market-data provenance and access-context posture
