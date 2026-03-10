# Structured Input Template

## Required Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Portfolio label |
| `allocations[]` | array | Asset allocation rows |
| `allocations[].assetClass` | string | Asset class name |
| `allocations[].weight` | number | Portfolio weight |
| `allocations[].region` | string | Region / focus |
| `duration` | number | Effective duration in years |
| `leverage` | number | Leverage ratio |
| `liquidityProfile` | string | Liquidity tier selection |
| `constraints` | string | Mandates, policy limits, or governance constraints |

## Validation Rules

- allocation weights should sum to approximately 100%
- at least one allocation row is required
- duration and leverage must be numeric
- liquidity profile must match a supported operating category

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

## Intake Classification Artifact

Before analysis, the system derives:

- portfolio complexity
- liquidity tier
- leverage class
- duration bucket
- concentration flags
- market-context coverage
