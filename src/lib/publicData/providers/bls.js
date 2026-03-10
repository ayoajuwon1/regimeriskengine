import { createProvider, fetchJson } from "./base.js";
import { createSeries, computeYearOverYear, safeNumber } from "../helpers.js";

const BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

function periodToDate(entry) {
  if (!entry?.year || !entry?.period?.startsWith("M")) return null;
  const month = entry.period.slice(1).padStart(2, "0");
  return `${entry.year}-${month}-01`;
}

function normalizeObservations(series = {}) {
  return (series.data || [])
    .map((entry) => ({
      date: periodToDate(entry),
      value: safeNumber(entry.value),
    }))
    .filter((entry) => entry.date && Number.isFinite(entry.value))
    .sort((left, right) => left.date.localeCompare(right.date));
}

async function fetchBlsSeries(seriesId, revalidate) {
  const payload = {
    seriesid: [seriesId],
    startyear: String(new Date().getFullYear() - 2),
    endyear: String(new Date().getFullYear()),
  };

  if (process.env.BLS_API_KEY) {
    payload.registrationkey = process.env.BLS_API_KEY;
  }

  const response = await fetchJson(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    revalidate,
  });

  if (response.status !== "REQUEST_SUCCEEDED") {
    throw new Error(response.message?.join(", ") || "BLS request failed.");
  }

  return response.Results?.series?.[0] || null;
}

export const blsProvider = createProvider({
  id: "bls",
  label: "BLS",
  configured: () => true,
  async fetchSeries(indicator) {
    if (!indicator.bls?.seriesId) {
      throw new Error(`Indicator ${indicator.id} is not mapped to BLS.`);
    }

    const series = await fetchBlsSeries(indicator.bls.seriesId, indicator.revalidate);
    if (!series) {
      throw new Error(`BLS series ${indicator.bls.seriesId} returned no data.`);
    }

    const observations = normalizeObservations(series);

    if (indicator.transform === "yoy") {
      const yoy = computeYearOverYear(observations);
      if (!yoy) {
        throw new Error(`BLS series ${indicator.bls.seriesId} does not have enough history for YoY calculation.`);
      }

      return createSeries({
        indicatorId: indicator.id,
        label: indicator.label,
        category: indicator.category,
        providerId: "bls",
        sourceName: "BLS",
        unit: indicator.unit,
        frequency: indicator.frequency,
        observations: [
          { date: yoy.prior.date, value: yoy.prior.value },
          { date: yoy.latest.date, value: yoy.value },
        ],
        valueDigits: indicator.valueDigits,
        note: `Computed from BLS series ${indicator.bls.seriesId}.`,
      });
    }

    return createSeries({
      indicatorId: indicator.id,
      label: indicator.label,
      category: indicator.category,
      providerId: "bls",
      sourceName: "BLS",
      unit: indicator.unit,
      frequency: indicator.frequency,
      observations,
      valueDigits: indicator.valueDigits,
      note: `Loaded from BLS series ${indicator.bls.seriesId}.`,
    });
  },
});
