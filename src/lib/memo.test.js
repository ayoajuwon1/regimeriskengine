import test from "node:test";
import assert from "node:assert/strict";

import { getAccessContext } from "./accessContext.js";
import { createAnalysisRecord } from "./analysisStore.js";
import { buildCommitteeMemo, buildMemoDocumentHtml, buildMemoDocumentModel } from "./memo.js";
import { DEMO_PORTFOLIO, DEMO_RESULTS } from "./sampleAnalysis.js";

function makeRecord() {
  return createAnalysisRecord({
    portfolio: DEMO_PORTFOLIO,
    results: DEMO_RESULTS,
    analysisMeta: {
      provider: "OpenAI",
      mode: "live",
      modelLabel: "gpt-4o-mini",
      promptVersion: "v2.2",
      schemaVersion: "2026-03-10",
      systemDesignVersion: "2026-03-10",
      accessContext: getAccessContext("local-demo"),
      intakeClassification: {
        classificationSummary: "Moderate complexity, mixed liquidity profile, moderate leverage, intermediate duration, sufficient market-context coverage.",
        concentrationFlags: ["Illiquid sleeves exceed 20%."],
      },
      dataSources: ["BLS", "U.S. Treasury Fiscal Data"],
      dataAsOf: "2026-03-10",
      contextVersion: "public-data-v1",
      marketSummary: "Rates remain restrictive and credit conditions are guarded.",
    },
  });
}

test("buildMemoDocumentModel returns a canonical committee memo view model", () => {
  const model = buildMemoDocumentModel(makeRecord());

  assert.equal(model.header.accessContextLabel, "Local Demo Workspace");
  assert.match(model.header.documentId, /^RRE-/);
  assert.equal(model.marketContext.dataSources.length, 2);
  assert.equal(model.regimes.length, 3);
  assert.equal(model.governance.escalationLevel, 3);
  assert.equal(model.keyIndicators.forcedSellingRisk, "High");
});

test("memo renderers include committee-ready sections", () => {
  const record = makeRecord();
  const markdown = buildCommitteeMemo(record);
  const html = buildMemoDocumentHtml(record);

  assert.match(markdown, /Committee Question \/ Decision Context/);
  assert.match(markdown, /Recommended Action:/);
  assert.match(markdown, /Lead Exposure Signal:/);
  assert.match(html, /Institutional Portfolio Regime Risk Memorandum/);
  assert.match(html, /Committee Action Summary/);
  assert.match(html, /Scenario Register/);
  assert.match(html, /Human review required before committee use/);
});
