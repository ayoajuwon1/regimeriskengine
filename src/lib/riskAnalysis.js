function normalizeApiBaseUrl(value) {
  return (value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api(?:\/analyze)?$/i, "");
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export const ANALYSIS_META = {
  provider: "OpenAI",
  mode: "live",
  modelLabel: process.env.NEXT_PUBLIC_ANALYSIS_MODEL_LABEL || "Configured OpenAI model",
  promptVersion: "v2.2",
  schemaVersion: "2026-03-10",
};

const exposureScoreSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "drivers", "interpretation"],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 10 },
    drivers: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 3,
    },
    interpretation: { type: "string" },
  },
};

const impactEnum = ["Bullish", "Neutral", "Bearish"];
const probabilityEnum = ["High", "Medium", "Low"];
const liquidityStressEnum = ["Low", "Medium", "High", "Critical"];

const historicalAnalogySchema = {
  type: "object",
  additionalProperties: false,
  required: ["episode", "matchScore", "parallels", "differences"],
  properties: {
    episode: { type: "string" },
    matchScore: { type: "integer", minimum: 0, maximum: 100 },
    parallels: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 3,
    },
    differences: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 2,
    },
  },
};

const stage1Schema = {
  type: "object",
  additionalProperties: false,
  required: ["analysisSummary", "exposureMap", "dominantExposures", "hiddenConcentrations"],
  properties: {
    analysisSummary: { type: "string" },
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
    "scenarioType",
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
    "rationaleSummary",
    "historicalAnalogy",
  ],
  properties: {
    id: { type: "integer", minimum: 1, maximum: 3 },
    name: { type: "string" },
    scenarioType: { type: "string" },
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
    rationaleSummary: { type: "string" },
    historicalAnalogy: historicalAnalogySchema,
  },
};

const stage2Schema = {
  type: "object",
  additionalProperties: false,
  required: ["regimeSetSummary", "regimes"],
  properties: {
    regimeSetSummary: { type: "string" },
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
    "reasoningSummary",
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
    reasoningSummary: { type: "string" },
  },
};

const stage3Schema = {
  type: "object",
  additionalProperties: false,
  required: ["analysisSummary", "vulnerabilities"],
  properties: {
    analysisSummary: { type: "string" },
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
    "decisionContext",
    "humanValidationChecks",
    "committeeMemoHeadline",
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
    decisionContext: { type: "string" },
    humanValidationChecks: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 4,
    },
    committeeMemoHeadline: { type: "string" },
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
Return concise, decision-useful rationales that surface implicit factor bets and hidden concentrations.`,
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
      liquidityProfile: portfolio.liquidityProfile,
    })}
Top exposures: ${JSON.stringify(exposures.dominantExposures)}
Hidden concentrations: ${JSON.stringify(exposures.hiddenConcentrations)}

Generate exactly 3 forward-looking macro regimes.
Diversify the regime set across different scenario types rather than producing three versions of the same risk.
For each regime include a short historical analogy with parallels and differences.`,
    "portfolio_regimes",
    stage2Schema,
  );
}

export function stage3(portfolio, regimes) {
  return requestStructuredJson(
    `Portfolio liquidity: ${portfolio.liquidityProfile}
Portfolio leverage: ${portfolio.leverage}
Portfolio constraints: ${portfolio.constraints}
Regimes: ${JSON.stringify(regimes.map((regime) => ({
      id: regime.id,
      name: regime.name,
      scenarioType: regime.scenarioType,
      probability: regime.probability,
      keyRisk: regime.keyRisk,
      historicalAnalogy: regime.historicalAnalogy,
    })))}

Score the first-order and second-order vulnerabilities for each regime.
Make the liquidity implications explicit and concise.`,
    "portfolio_vulnerabilities",
    stage3Schema,
  );
}

export function stage4(portfolio, exposures, vulnerabilities) {
  return requestStructuredJson(
    `Portfolio name: ${portfolio.name || "Institutional Portfolio"}
Portfolio leverage: ${portfolio.leverage}
Portfolio liquidity: ${portfolio.liquidityProfile}
Dominant exposures: ${JSON.stringify(exposures.dominantExposures)}
Hidden concentrations: ${JSON.stringify(exposures.hiddenConcentrations)}
Vulnerabilities: ${JSON.stringify(vulnerabilities.vulnerabilities)}

Compute governance metrics, escalation guidance, and the human validation checks an investment committee should complete before acting.`,
    "portfolio_governance_metrics",
    stage4Schema,
  );
}
