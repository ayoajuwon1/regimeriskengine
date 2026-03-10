import { createProvider, fetchJson } from "./base.js";
import { createSeries, safeNumber } from "../helpers.js";

const BASE_URL = "https://apps.bea.gov/api/data";

function buildBeaUrl(indicator) {
  const params = new URLSearchParams({
    UserID: process.env.BEA_API_KEY || "",
    method: "GETDATA",
    datasetname: indicator.bea.datasetName,
    TableName: indicator.bea.tableName,
    LineNumber: String(indicator.bea.lineNumber),
    Frequency: indicator.bea.frequency || "Q",
    Year: indicator.bea.year || "X",
    ResultFormat: "json",
  });
  return `${BASE_URL}?${params.toString()}`;
}

function normalizeObservations(payload) {
  const rows = payload.BEAAPI?.Results?.Data || [];
  return rows
    .map((entry) => ({
      date: entry.TimePeriod?.replace("Q", "-Q") || entry.TimePeriod,
      value: safeNumber(entry.DataValue),
    }))
    .filter((entry) => entry.date && Number.isFinite(entry.value))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export const beaProvider = createProvider({
  id: "bea",
  label: "BEA",
  configured: () => Boolean(process.env.BEA_API_KEY),
  async fetchSeries(indicator) {
    if (!process.env.BEA_API_KEY) {
      throw new Error("BEA_API_KEY is not configured.");
    }

    if (!indicator.bea) {
      throw new Error(`Indicator ${indicator.id} is not mapped to BEA.`);
    }

    const payload = await fetchJson(buildBeaUrl(indicator), {
      revalidate: indicator.revalidate,
    });
    const observations = normalizeObservations(payload);
    if (!observations.length) {
      throw new Error(`BEA response returned no usable observations for ${indicator.id}.`);
    }

    return createSeries({
      indicatorId: indicator.id,
      label: indicator.label,
      category: indicator.category,
      providerId: "bea",
      sourceName: "BEA",
      unit: indicator.unit,
      frequency: indicator.frequency,
      observations,
      valueDigits: indicator.valueDigits,
      note: `Loaded from BEA dataset ${indicator.bea.datasetName}/${indicator.bea.tableName}.`,
    });
  },
});
