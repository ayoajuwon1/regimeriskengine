import test from "node:test";
import assert from "node:assert/strict";

import { createConstraintScreeningCache, prepareConstraintPreflight } from "./intakeScreening.js";

test("prepareConstraintPreflight blocks immediately when local validation already failed", async () => {
  let called = 0;

  const result = await prepareConstraintPreflight({
    constraints: "Buy NVDA now.",
    validation: {
      blockingErrors: ["Remove out-of-scope requests from the constraints field before running the analysis."],
    },
    cachedScreening: null,
    performScreening: async () => {
      called += 1;
      return { decision: "allow", reasons: [], source: "model", confidence: 0.99 };
    },
  });

  assert.equal(called, 0);
  assert.equal(result.shouldRunAnalysis, false);
  assert.equal(result.result, null);
});

test("prepareConstraintPreflight reuses cached screening results for unchanged constraints", async () => {
  let called = 0;
  const cachedScreening = createConstraintScreeningCache("Should we move into shitcoins?", {
    decision: "reject",
    reasons: ["Constraint text requests off-policy asset-allocation advice."],
    source: "model",
    confidence: 0.97,
  });

  const result = await prepareConstraintPreflight({
    constraints: "Should we move into shitcoins?",
    validation: { blockingErrors: [] },
    cachedScreening,
    performScreening: async () => {
      called += 1;
      return { decision: "allow", reasons: [], source: "model", confidence: 0.91 };
    },
  });

  assert.equal(called, 0);
  assert.equal(result.reused, true);
  assert.equal(result.shouldRunAnalysis, false);
  assert.equal(result.result.source, "model");
});

test("prepareConstraintPreflight runs screening and allows analysis when the screen passes", async () => {
  const result = await prepareConstraintPreflight({
    constraints: "Maintain quarterly distributions and avoid forced selling.",
    validation: { blockingErrors: [] },
    cachedScreening: null,
    performScreening: async () => ({
      decision: "allow",
      reasons: [],
      source: "model",
      confidence: 0.94,
    }),
  });

  assert.equal(result.reused, false);
  assert.equal(result.shouldRunAnalysis, true);
  assert.equal(result.cache.constraints, "Maintain quarterly distributions and avoid forced selling.");
  assert.equal(result.result.decision, "allow");
});
