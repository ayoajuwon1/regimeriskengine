export function createConstraintScreeningCache(constraints = "", result = null) {
  return {
    constraints,
    result,
  };
}

export async function prepareConstraintPreflight({
  constraints,
  validation,
  cachedScreening,
  performScreening,
}) {
  if ((validation?.blockingErrors || []).length > 0) {
    return {
      shouldRunAnalysis: false,
      reasons: validation.blockingErrors,
      result: null,
      cache: cachedScreening || createConstraintScreeningCache(),
      reused: false,
    };
  }

  if (cachedScreening?.constraints === constraints && cachedScreening?.result) {
    return {
      shouldRunAnalysis: cachedScreening.result.decision === "allow",
      reasons: cachedScreening.result.reasons || [],
      result: cachedScreening.result,
      cache: cachedScreening,
      reused: true,
    };
  }

  const result = await performScreening(constraints);
  return {
    shouldRunAnalysis: result.decision === "allow",
    reasons: result.reasons || [],
    result,
    cache: createConstraintScreeningCache(constraints, result),
    reused: false,
  };
}
