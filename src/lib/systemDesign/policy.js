import { LIQUIDITY_OPTIONS } from "./constants.js";

export const REVIEW_READY_STATUSES = ["Validated", "Escalated"];
export const COMMITTEE_MEMO_STATUSES = ["Ready for Committee", "Sent to Committee"];

export const CONSTRAINT_PLACEHOLDER = "Out-of-scope request removed. Analyze only the portfolio policy constraints actually provided.";

const CONSTRAINT_FLAG_RULES = [
  {
    code: "prompt-injection",
    message: "Constraint text includes instruction-override language that is out of scope for this workflow.",
    pattern: /\b(?:ignore|forget|disregard)\b[^.!?\n]{0,80}\b(?:instructions?|previous|prior|above|system)\b/i,
  },
  {
    code: "trade-instructions",
    message: "Constraint text includes direct buy/sell or trade-instruction language that is out of scope for this workflow.",
    pattern: /\b(?:what should we buy|what should we sell|should we buy|should we sell|recommend(?:\s+which)?\s+(?:assets|securities|holdings)?(?:\s+to)?\s*(?:buy|sell)?|provide a trade list|tell (?:us|the committee) exactly what to do|which assets to buy and sell)\b/i,
  },
  {
    code: "named-security",
    message: "Constraint text asks for named-security commentary that is out of scope for the portfolio-governance workflow.",
    pattern: /\b(?:should we|buy|sell|recommend|trade)\b[^.!?\n]{0,80}\b(?:[A-Z]{2,5}|BTC|ETH|NVDA|AAPL|TSLA|SPY|QQQ)\b/,
  },
  {
    code: "benchmark-prediction",
    message: "Constraint text asks for benchmark-performance prediction that is out of scope for this workflow.",
    pattern: /\b(?:beat|outperform|underperform)\b[^.!?\n]{0,80}\b(?:s&p\s*500|benchmark|index)\b|\b(?:s&p\s*500|benchmark|index)\b[^.!?\n]{0,80}\b(?:beat|outperform|underperform)\b/i,
  },
  {
    code: "legal-compliance",
    message: "Constraint text asks for legal, compliance, or fiduciary sign-off that must remain with human reviewers.",
    pattern: /\b(?:is|are)\s+(?:this|it|the portfolio)\s+compliant\b|\b(?:compliance|legal|fiduciary)\b[^.!?\n]{0,40}\b(?:approval|sign[- ]?off|satisfied|cleared)\b/i,
  },
];

function isBlank(value) {
  return String(value || "").trim().length === 0;
}

function splitConstraintText(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+|\s*;\s*|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function screenConstraints(constraints) {
  const original = String(constraints || "").trim();
  if (!original) {
    return {
      constraintFlags: [],
      sanitizedConstraints: "",
      constraintsSanitized: false,
    };
  }

  const matchedRules = [];
  const retainedSegments = [];

  splitConstraintText(original).forEach((segment) => {
    const segmentMatches = CONSTRAINT_FLAG_RULES.filter((rule) => rule.pattern.test(segment));
    if (segmentMatches.length > 0) {
      segmentMatches.forEach((rule) => matchedRules.push(rule));
      return;
    }
    retainedSegments.push(segment);
  });

  const constraintFlags = [...new Map(matchedRules.map((rule) => [rule.code, rule.message])).values()];
  const constraintsSanitized = constraintFlags.length > 0;
  const sanitizedConstraints = constraintsSanitized
    ? (retainedSegments.join(" ").trim() || CONSTRAINT_PLACEHOLDER)
    : original;

  return {
    constraintFlags,
    sanitizedConstraints,
    constraintsSanitized,
  };
}

export function buildRuleBasedConstraintDecision(constraints) {
  const { constraintFlags } = screenConstraints(constraints);
  if (constraintFlags.length === 0) return null;

  return {
    decision: "reject",
    reasons: constraintFlags,
    source: "rules",
    confidence: null,
  };
}

export function validatePortfolioIntake(portfolio, {
  supportedLiquidityProfiles = LIQUIDITY_OPTIONS,
} = {}) {
  const blockingErrors = [];
  const allocations = Array.isArray(portfolio?.allocations) ? portfolio.allocations : [];

  if (isBlank(portfolio?.name)) {
    blockingErrors.push("Enter a portfolio label before running the analysis.");
  }

  if (allocations.length === 0) {
    blockingErrors.push("Add at least one asset allocation row before running the analysis.");
  }

  allocations.forEach((row, index) => {
    const rowNumber = index + 1;
    if (isBlank(row?.assetClass)) {
      blockingErrors.push(`Select an asset class for allocation row ${rowNumber}.`);
    }

    const weight = Number(row?.weight);
    if (!Number.isFinite(weight)) {
      blockingErrors.push(`Enter a numeric weight for allocation row ${rowNumber}.`);
    }

    if (isBlank(row?.region)) {
      blockingErrors.push(`Enter a region or focus for allocation row ${rowNumber}.`);
    }
  });

  const totalWeight = allocations.reduce((sum, row) => sum + (Number(row?.weight) || 0), 0);
  if (allocations.length > 0 && Math.abs(totalWeight - 100) >= 0.5) {
    blockingErrors.push("Allocation weights must sum to approximately 100% before analysis.");
  }

  const duration = Number(portfolio?.duration);
  if (!Number.isFinite(duration) || duration < 0) {
    blockingErrors.push("Enter a valid numeric duration before running the analysis.");
  }

  const leverage = Number(portfolio?.leverage);
  if (!Number.isFinite(leverage) || leverage <= 0) {
    blockingErrors.push("Enter a valid numeric leverage ratio before running the analysis.");
  }

  if (!supportedLiquidityProfiles.includes(portfolio?.liquidityProfile)) {
    blockingErrors.push("Select a supported liquidity profile before running the analysis.");
  }

  if (isBlank(portfolio?.constraints)) {
    blockingErrors.push("Enter portfolio policy or mandate constraints before running the analysis.");
  }

  const { constraintFlags, sanitizedConstraints, constraintsSanitized } = screenConstraints(portfolio?.constraints);
  const ruleDecision = buildRuleBasedConstraintDecision(portfolio?.constraints);
  if (ruleDecision) {
    blockingErrors.push("Remove out-of-scope requests from the constraints field before running the analysis.");
    blockingErrors.push(...ruleDecision.reasons);
  }

  const uniqueBlockingErrors = [...new Set(blockingErrors)];

  return {
    blockingErrors: uniqueBlockingErrors,
    constraintFlags,
    constraintsSanitized,
    sanitizedConstraints,
    isBlocked: uniqueBlockingErrors.length > 0,
  };
}

export function validateReviewDecision(reviewDraft) {
  if (reviewDraft?.escalationOverride && !reviewDraft?.escalationOverrideReason?.trim()) {
    return "Add an override reason before saving an escalation override.";
  }

  return null;
}

export function validateMemoStatusChange(memoDraft, reviewDraft) {
  if (
    COMMITTEE_MEMO_STATUSES.includes(memoDraft?.status) &&
    !REVIEW_READY_STATUSES.includes(reviewDraft?.status)
  ) {
    return "Set the review status to Validated or Escalated before marking the memo ready for committee use.";
  }

  return null;
}
