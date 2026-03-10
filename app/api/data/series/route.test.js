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

test("GET /api/data/series returns an indicator series", async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url, options = {}) => {
    if (String(url).startsWith("https://api.bls.gov/publicAPI/v2/timeseries/data/")) {
      const body = JSON.parse(options.body);
      const seriesId = body.seriesid[0];
      const data = {
        CUUR0000SA0: monthlySeries([315.526, 316.1, 316.8, 317.4, 318.2, 319.0, 319.8, 320.5, 321.2, 322.0, 323.1, 324.0, 325.252]),
      };
      return Response.json({ status: "REQUEST_SUCCEEDED", Results: { series: [{ data: data[seriesId] || [] }] } });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  try {
    const response = await GET(new Request("http://localhost/api/data/series?indicator=headline_cpi_yoy"));
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.series.label, "Headline CPI YoY");
    assert.equal(payload.series.latestFormatted, "3.1%");
  } finally {
    global.fetch = originalFetch;
  }
});
