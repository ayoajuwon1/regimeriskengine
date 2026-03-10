import { buildStatusEntry, compactError } from "../helpers.js";

export function createProvider({ id, label, configured = () => true, fetchSeries }) {
  return {
    id,
    label,
    isConfigured: configured,
    async fetchSeries(indicator, range = {}) {
      return fetchSeries(indicator, range);
    },
  };
}

export function createStubProvider(id, label) {
  return {
    id,
    label,
    isConfigured() {
      return false;
    },
    async fetchSeries() {
      throw new Error(`${label} adapter is scaffolded but not enabled in v1.`);
    },
  };
}

export async function fetchJson(url, { method = "GET", headers, body, revalidate = 60 * 60 * 4 } = {}) {
  const response = await fetch(url, {
    method,
    headers,
    body,
    next: { revalidate },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text || "Upstream request failed"}`);
  }

  return response.json();
}

export function initializeStatus(provider) {
  return buildStatusEntry({
    id: provider.id,
    label: provider.label,
    configured: provider.isConfigured(),
  });
}

export function recordProviderSuccess(statusEntry) {
  statusEntry.status = "used";
  statusEntry.used = true;
  statusEntry.indicatorsResolved += 1;
}

export function recordProviderError(statusEntry, error) {
  statusEntry.status = statusEntry.indicatorsResolved > 0 ? "partial" : "error";
  statusEntry.errors = [...statusEntry.errors, compactError(error)];
}
