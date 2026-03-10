import { createProvider, fetchJson } from "./base.js";
import { createSeries, safeNumber } from "../helpers.js";

const BASE_URL = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query";

function buildTreasuryUrl(securityTerm) {
  const params = new URLSearchParams({
    fields: "record_date,security_term,auction_date,high_yield",
    filter: `security_term:eq:${securityTerm}`,
    sort: "-auction_date",
    "page[number]": "1",
    "page[size]": "24",
  });
  return `${BASE_URL}?${params.toString()}`;
}

function normalizeObservations(payload) {
  return (payload.data || [])
    .map((entry) => ({
      date: entry.auction_date || entry.record_date,
      value: safeNumber(entry.high_yield),
    }))
    .filter((entry) => entry.date && Number.isFinite(entry.value))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export const treasuryProvider = createProvider({
  id: "treasury",
  label: "U.S. Treasury Fiscal Data",
  configured: () => true,
  async fetchSeries(indicator) {
    if (!indicator.treasury?.securityTerm) {
      throw new Error(`Indicator ${indicator.id} is not mapped to Treasury.`);
    }

    const payload = await fetchJson(buildTreasuryUrl(indicator.treasury.securityTerm), {
      revalidate: indicator.revalidate,
    });

    return createSeries({
      indicatorId: indicator.id,
      label: indicator.label,
      category: indicator.category,
      providerId: "treasury",
      sourceName: "U.S. Treasury Fiscal Data",
      unit: indicator.unit,
      frequency: indicator.frequency,
      observations: normalizeObservations(payload),
      valueDigits: indicator.valueDigits,
      note: `Loaded from Treasury auction data for ${indicator.treasury.securityTerm}.`,
    });
  },
});
