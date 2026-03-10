import { blsProvider } from "./providers/bls.js";
import { treasuryProvider } from "./providers/treasury.js";
import { beaProvider } from "./providers/bea.js";
import { fredProvider } from "./providers/fred.js";
import { ecbProvider } from "./providers/ecb.js";
import { bisProvider } from "./providers/bis.js";
import { imfProvider } from "./providers/imf.js";
import { oecdProvider } from "./providers/oecd.js";
import { secProvider } from "./providers/sec.js";
import { worldBankProvider } from "./providers/worldBank.js";
import {
  buildMarketSummary,
  CONTEXT_VERSION,
  computeDifference,
  createSeries,
  formatValue,
  getLatestDate,
  MarketContextUnavailableError,
  summarizeIndicator,
} from "./helpers.js";
import {
  DERIVED_INDICATORS,
  getIndicatorDefinition,
  INDICATORS,
  listContextIndicators,
  MINIMUM_REQUIRED_CONTEXT_INDICATORS,
  REQUIRED_CONTEXT_INDICATORS,
} from "./registry.js";
import { initializeStatus, recordProviderError, recordProviderSuccess } from "./providers/base.js";

export const ACTIVE_PROVIDERS = {
  treasury: treasuryProvider,
  bls: blsProvider,
  bea: beaProvider,
  fred: fredProvider,
};

export const FUTURE_PROVIDERS = {
  sec: secProvider,
  "world-bank": worldBankProvider,
  oecd: oecdProvider,
  ecb: ecbProvider,
  bis: bisProvider,
  imf: imfProvider,
};

function createProviderStatusMap() {
  return Object.fromEntries(
    Object.values(ACTIVE_PROVIDERS).map((provider) => [provider.id, initializeStatus(provider)]),
  );
}

async function resolveIndicator(indicator, providerStatusMap) {
  for (const providerId of indicator.providers || []) {
    const provider = ACTIVE_PROVIDERS[providerId];
    if (!provider) continue;

    const statusEntry = providerStatusMap[provider.id];
    if (!provider.isConfigured()) {
      statusEntry.status = "unavailable";
      statusEntry.errors = [...statusEntry.errors, `${provider.label} is not configured.`];
      continue;
    }

    try {
      const series = await provider.fetchSeries(indicator);
      recordProviderSuccess(statusEntry);
      return series;
    } catch (error) {
      recordProviderError(statusEntry, error);
    }
  }

  return null;
}

function resolveDerivedIndicators(seriesMap) {
  const derived = {};
  const yieldCurve = DERIVED_INDICATORS.yield_curve_10y_2y;
  const tenYear = seriesMap.treasury_10y_yield;
  const twoYear = seriesMap.treasury_2y_yield;
  if (tenYear?.latest && twoYear?.latest) {
    const latestSpread = computeDifference(tenYear.latest, twoYear.latest);
    const previousSpread = computeDifference(tenYear.previous, twoYear.previous);
    derived.yield_curve_10y_2y = createSeries({
      indicatorId: yieldCurve.id,
      label: yieldCurve.label,
      category: yieldCurve.category,
      providerId: tenYear.providerId === twoYear.providerId ? tenYear.providerId : "derived",
      sourceName: tenYear.sourceName === twoYear.sourceName ? tenYear.sourceName : "Derived market context",
      unit: yieldCurve.unit,
      frequency: "derived",
      observations: [previousSpread, latestSpread].filter(Boolean),
      valueDigits: yieldCurve.valueDigits,
      note: `Derived from ${tenYear.label} minus ${twoYear.label}.`,
    });
  }
  return derived;
}

function validateMinimumContext(indicators) {
  const resolvedRequired = REQUIRED_CONTEXT_INDICATORS.filter((indicatorId) => Boolean(indicators[indicatorId]));
  if (resolvedRequired.length < MINIMUM_REQUIRED_CONTEXT_INDICATORS) {
    throw new MarketContextUnavailableError("Public market context unavailable. Core inflation, labor, and rates indicators could not be resolved.");
  }
}

function buildAnalysisContext(indicators, providerStatusMap) {
  const asOf = getLatestDate(indicators);
  const sourcesUsed = [...new Set(Object.values(indicators).map((indicator) => indicator.sourceName).filter(Boolean))];
  const indicatorValues = Object.fromEntries(
    Object.entries(indicators).map(([indicatorId, series]) => [indicatorId, summarizeIndicator(series)]),
  );
  const providerStatus = Object.values(providerStatusMap).map((entry) => ({
    ...entry,
    sourceName: entry.label,
  }));
  return {
    asOf,
    contextVersion: CONTEXT_VERSION,
    sourcesUsed,
    providerStatus,
    indicatorValues,
    summary: buildMarketSummary(indicators),
  };
}

export async function buildMarketContext({ indicatorIds = listContextIndicators() } = {}) {
  const providerStatusMap = createProviderStatusMap();
  const seriesMap = {};

  for (const indicatorId of indicatorIds) {
    const indicator = INDICATORS[indicatorId];
    if (!indicator) continue;
    const series = await resolveIndicator(indicator, providerStatusMap);
    if (series) {
      seriesMap[indicatorId] = series;
    }
  }

  const derivedIndicators = resolveDerivedIndicators(seriesMap);
  const indicators = { ...seriesMap, ...derivedIndicators };

  validateMinimumContext(indicators);

  return buildAnalysisContext(indicators, providerStatusMap);
}

export async function getIndicatorSeries(indicatorId) {
  const providerStatusMap = createProviderStatusMap();
  const indicator = getIndicatorDefinition(indicatorId);

  if (!indicator) {
    throw new Error(`Unknown indicator '${indicatorId}'.`);
  }

  if (DERIVED_INDICATORS[indicatorId]) {
    const required = DERIVED_INDICATORS[indicatorId].sourceIndicators || [];
    const baseIndicators = {};
    for (const requiredIndicatorId of required) {
      const baseIndicator = INDICATORS[requiredIndicatorId];
      const series = await resolveIndicator(baseIndicator, providerStatusMap);
      if (series) baseIndicators[requiredIndicatorId] = series;
    }

    const derived = resolveDerivedIndicators(baseIndicators)[indicatorId];
    if (!derived) {
      throw new MarketContextUnavailableError(`Derived indicator '${indicatorId}' could not be computed.`);
    }

    return {
      series: derived,
      providerStatus: Object.values(providerStatusMap),
    };
  }

  const series = await resolveIndicator(indicator, providerStatusMap);
  if (!series) {
    throw new MarketContextUnavailableError(`Indicator '${indicator.label}' is currently unavailable.`);
  }

  return {
    series,
    providerStatus: Object.values(providerStatusMap),
  };
}

export function formatContextForPrompt(context) {
  const lines = [
    `Public market context snapshot (version ${context.contextVersion})`,
    `As of: ${context.asOf || "Unavailable"}`,
    `Sources: ${context.sourcesUsed.join(", ") || "None"}`,
    `Summary: ${context.summary}`,
    "Key indicators:",
  ];

  for (const indicatorId of listContextIndicators()) {
    const value = context.indicatorValues[indicatorId];
    if (!value) continue;
    lines.push(`- ${value.label}: ${value.formatted} (${value.trend}, ${value.sourceName}, ${value.date})`);
  }

  lines.push("Use this market context to anchor the analysis. If a signal is missing, explicitly preserve uncertainty rather than inventing a substitute.");
  return lines.join("\n");
}

export function buildAnalysisMetadata(context) {
  return {
    dataSources: context.sourcesUsed,
    dataAsOf: context.asOf,
    contextVersion: context.contextVersion,
    marketSummary: context.summary,
    providerStatus: context.providerStatus,
    indicatorValues: context.indicatorValues,
  };
}

export function summarizeProviderStatus(providerStatus = []) {
  return providerStatus.map((entry) => `${entry.label}: ${entry.status}`).join(" · ");
}

export function formatIndicatorPreview(indicatorValues = {}) {
  return Object.values(indicatorValues)
    .slice(0, 6)
    .map((indicator) => `${indicator.label} ${indicator.formatted}`)
    .join(" · ");
}

export function formatMarketContextLine(item) {
  if (!item) return "N/A";
  return `${item.label}: ${item.formatted} (${item.sourceName})`;
}

export function formatDataAsOf(asOf) {
  return asOf ? new Date(asOf).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unavailable";
}
