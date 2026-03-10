import { createProvider, fetchJson } from "./base.js";
import { createSeries, computeYearOverYear, safeNumber } from "../helpers.js";

const BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

function buildFredUrl(seriesId, limit = 60) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: process.env.FRED_API_KEY || "",
    file_type: "json",
    sort_order: "asc",
    limit: String(limit),
  });
  return `${BASE_URL}?${params.toString()}`;
}

function normalizeObservations(payload) {
  return (payload.observations || [])
    .map((entry) => ({
      date: entry.date,
      value: safeNumber(entry.value),
    }))
    .filter((entry) => Number.isFinite(entry.value));
}

function createFredYoYSeries(indicator, payload) {
  const observations = normalizeObservations(payload);
  const yoy = computeYearOverYear(observations);
  if (!yoy) {
    throw new Error(`FRED series ${indicator.fred.seriesId} does not have enough history for YoY calculation.`);
  }

  return createSeries({
    indicatorId: indicator.id,
    label: indicator.label,
    category: indicator.category,
    providerId: "fred",
    sourceName: "FRED",
    unit: indicator.unit,
    frequency: indicator.frequency,
    observations: [
      { date: yoy.prior.date, value: yoy.prior.value },
      { date: yoy.latest.date, value: yoy.value },
    ],
    valueDigits: indicator.valueDigits,
    note: `Computed from FRED series ${indicator.fred.seriesId}.`,
  });
}

function createFredLevelSeries(indicator, payload) {
  return createSeries({
    indicatorId: indicator.id,
    label: indicator.label,
    category: indicator.category,
    providerId: "fred",
    sourceName: "FRED",
    unit: indicator.unit,
    frequency: indicator.frequency,
    observations: normalizeObservations(payload),
    valueDigits: indicator.valueDigits,
    note: `Loaded from FRED series ${indicator.fred.seriesId}.`,
  });
}

export const fredProvider = createProvider({
  id: "fred",
  label: "FRED",
  configured: () => Boolean(process.env.FRED_API_KEY),
  async fetchSeries(indicator) {
    if (!process.env.FRED_API_KEY) {
      throw new Error("FRED_API_KEY is not configured.");
    }

    if (!indicator.fred?.seriesId) {
      throw new Error(`Indicator ${indicator.id} is not mapped to FRED.`);
    }

    const payload = await fetchJson(buildFredUrl(indicator.fred.seriesId, indicator.fred.limit || 60), {
      revalidate: indicator.revalidate,
    });

    if (indicator.transform === "yoy") {
      return createFredYoYSeries(indicator, payload);
    }

    return createFredLevelSeries(indicator, payload);
  },
});
