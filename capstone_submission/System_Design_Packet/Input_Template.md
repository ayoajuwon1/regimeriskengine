# Structured Input Template

## Purpose

Constrain user input to the minimum portfolio and governance facts required to run the analysis workflow responsibly.

## Input Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | portfolio label |
| `allocations` | array | yes | at least one allocation row |
| `allocations[].assetClass` | string | yes | supported institutional asset sleeve |
| `allocations[].weight` | number | yes | expected to sum to ~100 |
| `allocations[].region` | string | yes | geography or focus |
| `duration` | number | yes | years |
| `leverage` | number | yes | `1.0` = unlevered |
| `liquidityProfile` | string | yes | one of the supported liquidity tiers |
| `constraints` | string | yes | policy, mandate, governance, or operational constraints |

## Supported Liquidity Values

- `High Liquidity (>80% liquid within 30 days)`
- `Mixed (40–80% liquid within 30 days)`
- `Illiquid-Heavy (<40% liquid within 30 days)`

## Validation Rules

| Rule | Why It Exists |
|---|---|
| allocation weights should sum to approximately 100% | catch malformed inputs |
| at least one allocation row is required | prevent empty analysis requests |
| duration and leverage must be numeric | preserve downstream calculations |
| liquidity profile must match a supported category | preserve classification consistency |

## Example Input

```json
{
  "name": "Global Balanced Endowment",
  "allocations": [
    { "assetClass": "Public Equity – Developed Markets", "weight": 35, "region": "Global DM" },
    { "assetClass": "Investment Grade Fixed Income", "weight": 20, "region": "US" },
    { "assetClass": "Private Equity", "weight": 15, "region": "North America" },
    { "assetClass": "Real Assets / Infrastructure", "weight": 10, "region": "Global" },
    { "assetClass": "High Yield / Credit", "weight": 10, "region": "US HY" },
    { "assetClass": "Cash & Equivalents", "weight": 5, "region": "USD" },
    { "assetClass": "Hedge Funds / Alternatives", "weight": 5, "region": "Global" }
  ],
  "duration": 5.5,
  "leverage": 1.0,
  "liquidityProfile": "Mixed (40–80% liquid within 30 days)",
  "constraints": "No short selling. Max 20% single asset class."
}
```

## Derived Intake Classification Artifact

Before model analysis, the system derives:

| Derived Field | Description |
|---|---|
| `classificationSummary` | plain-English summary |
| `portfolioComplexity` | Moderate / High |
| `liquidityTier` | high, mixed, or illiquid-heavy posture |
| `leverageClass` | unlevered, moderate, elevated |
| `durationBucket` | short, intermediate, long |
| `contextCoverage` | whether market context is sufficient |
| `concentrationFlags` | key structural warnings |

## Known Input Limitations

This template does not directly capture:

- manager-specific liquidity rights
- side-letter terms
- covenant packages
- issuer-level holdings detail
- benchmark-relative investment policy nuance

When those facts are important, the reviewer must treat them as unresolved evidence gaps.
