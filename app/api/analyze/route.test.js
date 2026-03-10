import test from "node:test";
import assert from "node:assert/strict";

import { POST, SYSTEM_PROMPT } from "./route.js";
import { systemInstruction } from "../../../src/lib/systemDesign/index.js";

test("POST /api/analyze rejects malformed requests before calling the model", async () => {
  const request = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const response = await POST(request);
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, "Missing prompt, schema, or schemaName.");
});

test("POST /api/analyze uses the documented system instruction", () => {
  assert.equal(SYSTEM_PROMPT, systemInstruction.text);
});
