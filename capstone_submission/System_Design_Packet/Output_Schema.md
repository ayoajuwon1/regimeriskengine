# Structured Output Schema

## Intake Classification

The system records a deterministic classification artifact before model analysis.

Required fields:

- `classificationSummary`
- `portfolioComplexity`
- `liquidityTier`
- `leverageClass`
- `durationBucket`
- `contextCoverage`
- `concentrationFlags`

## Stage 1: Exposure Decomposition

Required top-level fields:

- `analysisSummary`
- `exposureMap`
- `dominantExposures`
- `hiddenConcentrations`

## Stage 2: Regime Generation

Required top-level fields:

- `regimeSetSummary`
- `regimes`

Each regime must include:

- `name`
- `scenarioType`
- `probability`
- `timeHorizon`
- `trigger`
- `transmissionMechanisms`
- asset-class impact fields
- `keyRisk`
- `rationaleSummary`
- `historicalAnalogy`

## Stage 3: Vulnerability Assessment

Required top-level fields:

- `analysisSummary`
- `vulnerabilities`

Each vulnerability must include:

- `regimeName`
- `firstOrderEffects`
- `secondOrderEffects`
- `liquidityStress`
- `estimatedDrawdown`
- `vulnerabilityScore`
- `primaryVulnerability`
- `reasoningSummary`

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

## Memo and Audit Outputs

The system also produces:

- committee memo draft
- analysis metadata
- audit trail entries
- review state metadata
