import test from "node:test";
import assert from "node:assert/strict";

import { POST, SCREENING_PROMPT } from "./route.js";
import { intakeScreeningInstruction } from "../../../src/lib/systemDesign/index.js";

test("POST /api/intake-screen rejects malformed requests", async () => {
  const request = new Request("http://localhost/api/intake-screen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const response = await POST(request);
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, "Missing constraints.");
});

test("POST /api/intake-screen can reject obvious rule hits without an API key", async () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const request = new Request("http://localhost/api/intake-screen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ constraints: "Should we buy NVDA right now?" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.decision, "reject");
    assert.equal(payload.source, "rules");
    assert.ok(payload.reasons.length >= 1);
  } finally {
    if (originalApiKey != null) {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }
});

test("POST /api/intake-screen uses the dedicated screening instruction", () => {
  assert.equal(SCREENING_PROMPT, intakeScreeningInstruction.text);
});
