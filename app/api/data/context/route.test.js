import test from "node:test";
import assert from "node:assert/strict";

import { GET } from "./route.js";

function monthlySeries(values, startYear = 2025, startMonth = 1) {
  return values.map((value, index) => {
    const monthIndex = startMonth - 1 + index;
    const year = startYear + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    return {
      year: String(year),
      period: `M${String(month).padStart(2, "0")}`,
      value: String(value),
    };
  }).reverse();
}

test("GET /api/data/context returns normalized market context", async () => {
  const originalFetch = global.fetch;
  delete process.env.FRED_API_KEY;
  delete process.env.BEA_API_KEY;

  global.fetch = async (url, options = {}) => {
    if (String(url).startsWith("https://api.bls.gov/publicAPI/v2/timeseries/data/")) {
      const body = JSON.parse(options.body);
      const seriesId = body.seriesid[0];
      const data = {
        CUUR0000SA0: monthlySeries([315.526, 316.1, 316.8, 317.4, 318.2, 319.0, 319.8, 320.5, 321.2, 322.0, 323.1, 324.0, 325.252]),
        CUUR0000SA0L1E: monthlySeries([320.01, 320.5, 321.1, 321.6, 322.1, 322.8, 323.4, 324.1, 325.0, 326.1, 327.2, 329.0, 332.111]),
        WPUFD4: monthlySeries([198.5, 198.9, 199.2, 199.7, 200.1, 200.8, 201.4, 202.0, 202.8, 203.1, 203.7, 204.2, 205.0]),
        LNS14000000: [{ year: "2026", period: "M01", value: "4.1" }, { year: "2025", period: "M12", value: "4.0" }],
        CES0000000001: monthlySeries([157000, 157180, 157360, 157540, 157720, 157880, 158040, 158220, 158410, 158600, 158790, 158920, 159000]),
        CES0500000003: monthlySeries([29.9, 30.0, 30.1, 30.2, 30.25, 30.35, 30.45, 30.6, 30.75, 30.9, 31.0, 31.12, 31.25]),
      };
      return Response.json({ status: "REQUEST_SUCCEEDED", Results: { series: [{ data: data[seriesId] || [] }] } });
    }

    if (String(url).startsWith("https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query")) {
      const securityTerm = new URL(String(url)).searchParams.get("filter")?.split("eq:")[1];
      return Response.json({
        data: [
          { auction_date: "2026-01-15", high_yield: securityTerm === "10-Year" ? "4.05" : "3.75" },
          { auction_date: "2026-02-15", high_yield: securityTerm === "10-Year" ? "4.20" : "3.85" },
        ],
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  try {
    const response = await GET();
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(Array.isArray(payload.sourcesUsed), true);
    assert.equal(Boolean(payload.indicatorValues.headline_cpi_yoy), true);
  } finally {
    global.fetch = originalFetch;
  }
});
