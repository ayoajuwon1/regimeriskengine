import test from "node:test";
import assert from "node:assert/strict";

import { executeConstraintScreening } from "./service.js";

test("executeConstraintScreening skips the model for obvious rule hits", async () => {
  let called = false;
  const client = {
    responses: {
      async create() {
        called = true;
        return { output_text: JSON.stringify({ decision: "allow", reasons: [], confidence: 0.99 }) };
      },
    },
  };

  const result = await executeConstraintScreening({
    client,
    model: "gpt-4.1-mini",
    screeningPrompt: "Screen constraints",
    constraints: "Should we buy NVDA right now?",
  });

  assert.equal(called, false);
  assert.equal(result.decision, "reject");
  assert.equal(result.source, "rules");
  assert.equal(result.confidence, null);
});

test("executeConstraintScreening returns a model-based reject for semantic edge cases", async () => {
  let capturedInstructions = "";
  let capturedInput = "";
  const client = {
    responses: {
      async create(input) {
        capturedInstructions = input.instructions;
        capturedInput = input.input;
        return {
          output_text: JSON.stringify({
            decision: "reject",
            reasons: ["Constraint text requests off-policy asset-allocation advice."],
            confidence: 0.97,
          }),
        };
      },
    },
  };

  const result = await executeConstraintScreening({
    client,
    model: "gpt-4.1-mini",
    screeningPrompt: "Classify the constraints field.",
    constraints: "Should we move into shitcoins?",
  });

  assert.equal(result.decision, "reject");
  assert.equal(result.source, "model");
  assert.equal(result.confidence, 0.97);
  assert.equal(capturedInstructions, "Classify the constraints field.");
  assert.match(capturedInput, /Should we move into shitcoins/);
});

test("executeConstraintScreening returns allow for clean policy constraints", async () => {
  const client = {
    responses: {
      async create() {
        return {
          output_text: JSON.stringify({
            decision: "allow",
            reasons: [],
            confidence: 0.93,
          }),
        };
      },
    },
  };

  const result = await executeConstraintScreening({
    client,
    model: "gpt-4.1-mini",
    screeningPrompt: "Classify the constraints field.",
    constraints: "Maintain quarterly distributions and avoid forced selling.",
  });

  assert.equal(result.decision, "allow");
  assert.equal(result.source, "model");
  assert.equal(result.confidence, 0.93);
  assert.deepEqual(result.reasons, []);
});
