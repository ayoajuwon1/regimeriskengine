const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const exposureScoreSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "drivers"],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 10 },
    drivers: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 3,
    },
  },
};

const impactEnum = ["Bullish", "Neutral", "Bearish"];
const probabilityEnum = ["High", "Medium", "Low"];
const liquidityStressEnum = ["Low", "Medium", "High", "Critical"];

const stage1Schema = {
  type: "object",
  additionalProperties: false,
  required: ["exposureMap", "dominantExposures", "hiddenConcentrations"],
  properties: {
    exposureMap: {
      type: "object",
      additionalProperties: false,
      required: [
        "inflationSensitivity",
        "growthSensitivity",
        "durationRisk",
        "creditSpreadRisk",
        "currencyExposure",
        "liquidityDependence",
      ],
      properties: {
        inflationSensitivity: exposureScoreSchema,
        growthSensitivity: exposureScoreSchema,
        durationRisk: exposureScoreSchema,
        creditSpreadRisk: exposureScoreSchema,
        currencyExposure: exposureScoreSchema,
        liquidityDependence: exposureScoreSchema,
      },
    },
    dominantExposures: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
    hiddenConcentrations: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
  },
};

const regimeSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "name",
    "probability",
    "timeHorizon",
    "trigger",
    "transmissionMechanisms",
    "equityImpact",
    "fixedIncomeImpact",
    "privateMarketsImpact",
    "creditImpact",
    "realAssetsImpact",
    "keyRisk",
  ],
  properties: {
    id: { type: "integer", minimum: 1, maximum: 3 },
    name: { type: "string" },
    probability: { type: "string", enum: probabilityEnum },
    timeHorizon: { type: "string" },
    trigger: { type: "string" },
    transmissionMechanisms: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
    equityImpact: { type: "string", enum: impactEnum },
    fixedIncomeImpact: { type: "string", enum: impactEnum },
    privateMarketsImpact: { type: "string", enum: impactEnum },
    creditImpact: { type: "string", enum: impactEnum },
    realAssetsImpact: { type: "string", enum: impactEnum },
    keyRisk: { type: "string" },
  },
};

const stage2Schema = {
  type: "object",
  additionalProperties: false,
  required: ["regimes"],
  properties: {
    regimes: {
      type: "array",
      items: regimeSchema,
      minItems: 3,
      maxItems: 3,
    },
  },
};

const vulnerabilitySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "regimeId",
    "regimeName",
    "firstOrderEffects",
    "secondOrderEffects",
    "liquidityStress",
    "estimatedDrawdown",
    "vulnerabilityScore",
    "primaryVulnerability",
  ],
  properties: {
    regimeId: { type: "integer", minimum: 1, maximum: 3 },
    regimeName: { type: "string" },
    firstOrderEffects: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
    secondOrderEffects: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 2,
    },
    liquidityStress: { type: "string", enum: liquidityStressEnum },
    estimatedDrawdown: { type: "string" },
    vulnerabilityScore: { type: "integer", minimum: 0, maximum: 10 },
    primaryVulnerability: { type: "string" },
  },
};

const stage3Schema = {
  type: "object",
  additionalProperties: false,
  required: ["vulnerabilities"],
  properties: {
    vulnerabilities: {
      type: "array",
      items: vulnerabilitySchema,
      minItems: 3,
      maxItems: 3,
    },
  },
};

const stage4Schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "rci",
    "lci",
    "escalationLevel",
    "escalationLabel",
    "escalationRationale",
    "escalationTriggers",
    "governanceActions",
    "counterScenario",
    "keyWatchItems",
  ],
  properties: {
    rci: {
      type: "object",
      additionalProperties: false,
      required: ["score", "label", "rationale", "uncertaintyBand"],
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        label: { type: "string" },
        rationale: { type: "string" },
        uncertaintyBand: { type: "string" },
      },
    },
    lci: {
      type: "object",
      additionalProperties: false,
      required: ["score", "label", "rationale", "forcedSellingRisk"],
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        label: { type: "string" },
        rationale: { type: "string" },
        forcedSellingRisk: { type: "string" },
      },
    },
    escalationLevel: { type: "integer", minimum: 1, maximum: 4 },
    escalationLabel: { type: "string" },
    escalationRationale: { type: "string" },
    escalationTriggers: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
    governanceActions: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 4,
    },
    counterScenario: { type: "string" },
    keyWatchItems: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 4,
    },
  },
};

async function requestStructuredJson(prompt, schemaName, schema) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, schemaName, schema }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function stage1(portfolio) {
  return requestStructuredJson(
    `Portfolio: ${JSON.stringify(portfolio)}

Assess the portfolio's macro-factor exposure map for an institutional investment committee.
Keep every string concise and decision-useful.`,
    "portfolio_exposure_map",
    stage1Schema,
  );
}

export function stage2(portfolio, exposures) {
  return requestStructuredJson(
    `Portfolio: ${JSON.stringify({
      allocations: portfolio.allocations,
      duration: portfolio.duration,
      leverage: portfolio.leverage,
      constraints: portfolio.constraints,
    })}
Top exposures: ${JSON.stringify(exposures.dominantExposures)}

Generate exactly 3 forward-looking macro regimes with distinct probabilities, triggers, and transmission mechanisms.`,
    "portfolio_regimes",
    stage2Schema,
  );
}

export function stage3(portfolio, regimes) {
  return requestStructuredJson(
    `Portfolio liquidity: ${portfolio.liquidityProfile}
Portfolio leverage: ${portfolio.leverage}
Regimes: ${JSON.stringify(regimes.map((regime) => ({
      id: regime.id,
      name: regime.name,
      probability: regime.probability,
      keyRisk: regime.keyRisk,
    })))}

Score the first-order and second-order vulnerabilities for each regime.`,
    "portfolio_vulnerabilities",
    stage3Schema,
  );
}

export function stage4(portfolio, exposures, vulnerabilities) {
  return requestStructuredJson(
    `Portfolio leverage: ${portfolio.leverage}
Portfolio liquidity: ${portfolio.liquidityProfile}
Dominant exposures: ${JSON.stringify(exposures.dominantExposures)}
Vulnerabilities: ${JSON.stringify(vulnerabilities.vulnerabilities)}

Compute governance metrics, escalation guidance, and watch items for an institutional risk committee.`,
    "portfolio_governance_metrics",
    stage4Schema,
  );
}
