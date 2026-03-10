# Regime Risk Engine Output Schema

Version: `2026-03-10`

The system produces structured JSON outputs across four fixed stages.

## Stage 1: Exposure Decomposition

Required top-level fields:

- `analysisSummary`
- `exposureMap`
- `dominantExposures`
- `hiddenConcentrations`

Notable nested fields:

- `exposureMap.inflationSensitivity`
- `exposureMap.growthSensitivity`
- `exposureMap.durationRisk`
- `exposureMap.creditSpreadRisk`
- `exposureMap.currencyExposure`
- `exposureMap.liquidityDependence`

## Stage 2: Regime Generation

Required top-level fields:

- `regimeSetSummary`
- `regimes`

Notable nested fields:

- `regimes[].name`
- `regimes[].scenarioType`
- `regimes[].probability`
- `regimes[].historicalAnalogy`

## Stage 3: Vulnerability Assessment

Required top-level fields:

- `analysisSummary`
- `vulnerabilities`

Notable nested fields:

- `vulnerabilities[].regimeName`
- `vulnerabilities[].liquidityStress`
- `vulnerabilities[].estimatedDrawdown`
- `vulnerabilities[].vulnerabilityScore`

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

Notable nested fields:

- `rci.score`
- `lci.score`
- `escalationTriggers[]`
- `humanValidationChecks[]`
