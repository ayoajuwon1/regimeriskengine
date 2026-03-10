export const CONTEXT_VERSION = "public-data-v1";

export const CATEGORY_LABELS = {
  inflation: "Inflation",
  growth: "Growth",
  labor: "Labor",
  rates: "Rates",
  credit: "Credit / Liquidity",
};

export function safeNumber(value) {
  const next = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(next) ? next : null;
}

export function sortObservations(observations = []) {
  return [...observations]
    .filter((observation) => observation?.date && Number.isFinite(observation?.value))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function latestObservation(observations = [], offset = 0) {
  const sorted = sortObservations(observations);
  const index = sorted.length - 1 - offset;
  return index >= 0 ? sorted[index] : null;
}

export function computeYearOverYear(observations = []) {
  const sorted = sortObservations(observations);
  if (sorted.length < 13) return null;

  const latest = sorted[sorted.length - 1];
  const prior = sorted[sorted.length - 13];
  if (!latest || !prior || prior.value === 0) return null;

  return {
    latest,
    prior,
    value: ((latest.value - prior.value) / Math.abs(prior.value)) * 100,
  };
}

export function computeDifference(left, right) {
  if (!left || !right || !Number.isFinite(left.value) || !Number.isFinite(right.value)) return null;
  return {
    date: left.date >= right.date ? left.date : right.date,
    value: left.value - right.value,
  };
}

export function formatValue(value, unit = "pct", digits = 1) {
  if (!Number.isFinite(value)) return "N/A";
  if (unit === "pct") return `${value.toFixed(digits)}%`;
  if (unit === "bps") return `${value.toFixed(digits)} bps`;
  if (unit === "x") return `${value.toFixed(digits)}x`;
  return value.toFixed(digits);
}

export function inferTrend(latestValue, previousValue, epsilon = 0.05) {
  if (!Number.isFinite(latestValue) || !Number.isFinite(previousValue)) return "stable";
  const delta = latestValue - previousValue;
  if (delta > epsilon) return "rising";
  if (delta < -epsilon) return "falling";
  return "stable";
}

export function createSeries({
  indicatorId,
  label,
  category,
  providerId,
  sourceName,
  unit = "pct",
  frequency = "monthly",
  observations = [],
  valueDigits = 1,
  note = "",
}) {
  const sorted = sortObservations(observations);
  const latest = latestObservation(sorted);
  const previous = latestObservation(sorted, 1);
  const trend = inferTrend(latest?.value, previous?.value);

  return {
    indicatorId,
    label,
    category,
    providerId,
    sourceName,
    unit,
    frequency,
    observations: sorted,
    latest,
    previous,
    latestFormatted: latest ? formatValue(latest.value, unit, valueDigits) : "N/A",
    trend,
    note,
  };
}

export function getLatestDate(seriesMap = {}) {
  return Object.values(seriesMap).reduce((latest, series) => {
    const current = series?.latest?.date;
    if (!current) return latest;
    if (!latest) return current;
    return current > latest ? current : latest;
  }, null);
}

export function summarizeIndicator(series) {
  if (!series?.latest) return null;
  return {
    label: series.label,
    category: series.category,
    providerId: series.providerId,
    sourceName: series.sourceName,
    date: series.latest.date,
    value: series.latest.value,
    formatted: series.latestFormatted,
    trend: series.trend,
    note: series.note,
  };
}

export function buildStatusEntry({ id, label, configured = false, planned = false }) {
  return {
    id,
    label,
    configured,
    planned,
    status: planned ? "planned" : configured ? "idle" : "unavailable",
    indicatorsResolved: 0,
    errors: [],
    used: false,
  };
}

export function compactError(error) {
  if (!error) return "Unknown provider error";
  if (typeof error === "string") return error;
  return error.message || "Unknown provider error";
}

export function buildMarketSummary(indicators = {}) {
  const headline = indicators.headline_cpi_yoy?.latest?.value;
  const core = indicators.core_cpi_yoy?.latest?.value;
  const unemployment = indicators.unemployment_rate?.latest?.value;
  const payroll = indicators.payroll_growth_yoy?.latest?.value;
  const curve = indicators.yield_curve_10y_2y?.latest?.value;
  const spread = indicators.credit_spread_proxy?.latest?.value;

  const inflationText = Number.isFinite(headline)
    ? `Inflation is running at ${formatValue(headline)}${Number.isFinite(core) ? ` with core at ${formatValue(core)}` : ""}.`
    : "Inflation data is partially unavailable.";
  const laborText = Number.isFinite(unemployment)
    ? `Labor conditions show unemployment at ${formatValue(unemployment)}${Number.isFinite(payroll) ? ` and payroll growth at ${formatValue(payroll)}` : ""}.`
    : "Labor-market data is partially unavailable.";
  const ratesText = Number.isFinite(curve)
    ? `The 10Y-2Y curve sits at ${formatValue(curve, "pct")}, signaling a ${curve < 0 ? "still-inverted" : "positively sloped"} rates backdrop.`
    : "Yield-curve slope data is partially unavailable.";
  const creditText = Number.isFinite(spread)
    ? `Credit conditions are proxied by a spread of ${formatValue(spread)}.`
    : "Credit-spread context is unavailable, so liquidity conclusions should be treated more cautiously.";

  return `${inflationText} ${laborText} ${ratesText} ${creditText}`.replace(/\s+/g, " ").trim();
}

export class MarketContextUnavailableError extends Error {
  constructor(message = "Public market context unavailable. Add at least one configured macro data source or try again later.") {
    super(message);
    this.name = "MarketContextUnavailableError";
  }
}
