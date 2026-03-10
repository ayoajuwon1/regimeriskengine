const ILLIQUID_ASSET_CLASSES = new Set([
  "Private Equity",
  "Private Credit",
  "Real Assets / Infrastructure",
  "Hedge Funds / Alternatives",
]);

const CREDIT_SENSITIVE_ASSET_CLASSES = new Set([
  "Investment Grade Fixed Income",
  "High Yield / Credit",
  "Private Credit",
]);

const PUBLIC_EQUITY_ASSET_CLASSES = new Set([
  "Public Equity – Developed Markets",
  "Public Equity – Emerging Markets",
]);

function sumWeights(allocations = [], matcher) {
  return allocations.reduce((total, row) => {
    const weight = Number(row.weight) || 0;
    return matcher(row) ? total + weight : total;
  }, 0);
}

function classifyLiquidityTier(liquidityProfile = "") {
  if (liquidityProfile.startsWith("High Liquidity")) return "High Liquidity";
  if (liquidityProfile.startsWith("Illiquid-Heavy")) return "Illiquid-Heavy";
  return "Mixed";
}

function classifyLeverage(leverage = 1) {
  if (leverage <= 1.05) return "Unlevered";
  if (leverage <= 1.5) return "Moderate";
  return "Elevated";
}

function classifyDuration(duration = 0) {
  if (duration < 3) return "Short";
  if (duration <= 7) return "Intermediate";
  return "Long";
}

function classifyContextCoverage(marketContext) {
  const sourceCount = marketContext?.sourcesUsed?.length || 0;
  if (marketContext?.asOf && sourceCount >= 2) return "Sufficient";
  if (sourceCount >= 1) return "Partial";
  return "Unavailable";
}

function classifyComplexity({
  allocationCount,
  illiquidWeight,
  creditSensitiveWeight,
  leverageClass,
  constraints,
}) {
  let score = 0;

  if (allocationCount >= 6) score += 1;
  if (allocationCount >= 8) score += 1;
  if (illiquidWeight >= 20) score += 1;
  if (creditSensitiveWeight >= 20) score += 1;
  if (leverageClass !== "Unlevered") score += 1;
  if ((constraints || "").trim().length >= 30) score += 1;

  if (score >= 5) return "High";
  if (score >= 2) return "Moderate";
  return "Low";
}

function buildConcentrationFlags({
  largestAllocationWeight,
  illiquidWeight,
  creditSensitiveWeight,
  publicEquityWeight,
}) {
  const flags = [];

  if (largestAllocationWeight >= 30) {
    flags.push("Single asset class concentration above 30% of portfolio weight.");
  }
  if (illiquidWeight >= 20) {
    flags.push("Illiquid sleeves exceed 20% of portfolio weight.");
  }
  if (creditSensitiveWeight >= 20) {
    flags.push("Credit-sensitive sleeves exceed 20% of portfolio weight.");
  }
  if (publicEquityWeight >= 40) {
    flags.push("Public equity exposure exceeds 40% of portfolio weight.");
  }

  if (!flags.length) {
    flags.push("No material concentration flags detected from intake inputs.");
  }

  return flags;
}

export function buildIntakeClassification(portfolio, marketContext = null) {
  const allocations = portfolio?.allocations || [];
  const allocationCount = allocations.length;
  const largestAllocationWeight = allocations.reduce((largest, row) => Math.max(largest, Number(row.weight) || 0), 0);
  const illiquidWeight = sumWeights(allocations, (row) => ILLIQUID_ASSET_CLASSES.has(row.assetClass));
  const creditSensitiveWeight = sumWeights(allocations, (row) => CREDIT_SENSITIVE_ASSET_CLASSES.has(row.assetClass));
  const publicEquityWeight = sumWeights(allocations, (row) => PUBLIC_EQUITY_ASSET_CLASSES.has(row.assetClass));
  const liquidityTier = classifyLiquidityTier(portfolio?.liquidityProfile);
  const leverageClass = classifyLeverage(Number(portfolio?.leverage) || 1);
  const durationBucket = classifyDuration(Number(portfolio?.duration) || 0);
  const contextCoverage = classifyContextCoverage(marketContext);
  const portfolioComplexity = classifyComplexity({
    allocationCount,
    illiquidWeight,
    creditSensitiveWeight,
    leverageClass,
    constraints: portfolio?.constraints,
  });
  const concentrationFlags = buildConcentrationFlags({
    largestAllocationWeight,
    illiquidWeight,
    creditSensitiveWeight,
    publicEquityWeight,
  });

  return {
    classificationSummary: `${portfolioComplexity} complexity, ${liquidityTier.toLowerCase()} liquidity profile, ${leverageClass.toLowerCase()} leverage, ${durationBucket.toLowerCase()} duration, ${contextCoverage.toLowerCase()} market-context coverage.`,
    portfolioComplexity,
    liquidityTier,
    leverageClass,
    durationBucket,
    contextCoverage,
    allocationCount,
    largestAllocationWeight,
    illiquidWeight,
    creditSensitiveWeight,
    concentrationFlags,
  };
}
