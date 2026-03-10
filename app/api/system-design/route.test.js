import test from "node:test";
import assert from "node:assert/strict";

import { GET } from "./route.js";

test("GET /api/system-design returns the documented system artifacts", async () => {
  const response = await GET();
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.version, "2026-03-10");
  assert.equal(payload.systemInstruction.title, "Regime Risk Engine System Instruction");
  assert.equal(Array.isArray(payload.interactionGuide.steps), true);
  assert.equal(Array.isArray(payload.inputTemplate.requiredFields), true);
  assert.equal(Array.isArray(payload.outputSchemaSummary.stages), true);
  assert.equal(Array.isArray(payload.workflow.steps), true);
  assert.equal(payload.workflow.steps.some((step) => step.id === "classification"), true);
  assert.equal(payload.workflow.steps.some((step) => step.id === "human-review-checkpoint"), true);
});
