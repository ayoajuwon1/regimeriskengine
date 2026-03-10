import test from "node:test";
import assert from "node:assert/strict";

import { buildIntakeClassification } from "./classification.js";

test("buildIntakeClassification produces a persisted intake artifact from portfolio inputs", () => {
  const classification = buildIntakeClassification(
    {
      allocations: [
        { assetClass: "Public Equity – Developed Markets", weight: 35, region: "US" },
        { assetClass: "Investment Grade Fixed Income", weight: 20, region: "US" },
        { assetClass: "Private Equity", weight: 15, region: "North America" },
        { assetClass: "Private Credit", weight: 10, region: "North America" },
        { assetClass: "Real Assets / Infrastructure", weight: 10, region: "Global" },
        { assetClass: "Cash & Equivalents", weight: 10, region: "USD" },
      ],
      duration: 5.5,
      leverage: 1.2,
      liquidityProfile: "Mixed (40–80% liquid within 30 days)",
      constraints: "Preserve annual spending stability and avoid forced selling.",
    },
    {
      asOf: "2026-03-10",
      sourcesUsed: ["BLS", "U.S. Treasury Fiscal Data"],
    },
  );

  assert.equal(classification.portfolioComplexity, "High");
  assert.equal(classification.liquidityTier, "Mixed");
  assert.equal(classification.leverageClass, "Moderate");
  assert.equal(classification.durationBucket, "Intermediate");
  assert.equal(classification.contextCoverage, "Sufficient");
  assert.equal(classification.allocationCount, 6);
  assert.equal(classification.creditSensitiveWeight, 30);
  assert.match(classification.classificationSummary, /market-context coverage/);
  assert.equal(Array.isArray(classification.concentrationFlags), true);
  assert.ok(classification.concentrationFlags.some((flag) => flag.includes("Illiquid sleeves exceed 20%")));
});
