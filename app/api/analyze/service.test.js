import test from "node:test";
import assert from "node:assert/strict";

import { executeStructuredAnalysis } from "./service.js";

test("executeStructuredAnalysis injects macro context and returns metadata envelope", async () => {
  let capturedInput = "";
  let capturedInstructions = "";
  const client = {
    responses: {
      async create(input) {
        capturedInput = input.input;
        capturedInstructions = input.instructions;
        return { output_text: JSON.stringify({ result: "ok" }) };
      },
    },
  };

  const marketContext = {
    asOf: "2026-03-10",
    contextVersion: "public-data-v1",
    sourcesUsed: ["BLS", "U.S. Treasury Fiscal Data"],
    summary: "Inflation is cooling, labor is steady, and the curve remains mildly positive.",
    providerStatus: [],
    indicatorValues: {
      headline_cpi_yoy: { label: "Headline CPI YoY", formatted: "3.1%", trend: "falling", sourceName: "BLS", date: "2026-01-01" },
    },
  };

  const result = await executeStructuredAnalysis({
    client,
    model: "gpt-4o-mini",
    systemPrompt: "Respond in JSON",
    prompt: "Analyze this portfolio.",
    schemaName: "smoke_test",
    schema: { type: "object", additionalProperties: false, required: ["result"], properties: { result: { type: "string" } } },
    marketContext,
  });

  assert.equal(result.data.result, "ok");
  assert.equal(result.analysisContext.dataAsOf, "2026-03-10");
  assert.equal(capturedInstructions, "Respond in JSON");
  assert.match(capturedInput, /Public market context snapshot/);
  assert.match(capturedInput, /Headline CPI YoY: 3.1%/);
});
