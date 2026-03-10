import test from "node:test";
import assert from "node:assert/strict";

import { isSystemGuideEnabled } from "./constants.js";
import { validateMemoStatusChange, validateReviewDecision } from "./policy.js";

test("system guide flag defaults to enabled and respects explicit false values", () => {
  assert.equal(isSystemGuideEnabled(undefined), true);
  assert.equal(isSystemGuideEnabled("true"), true);
  assert.equal(isSystemGuideEnabled("false"), false);
  assert.equal(isSystemGuideEnabled("0"), false);
});

test("review decision requires an override reason when escalation is overridden", () => {
  assert.equal(
    validateReviewDecision({
      escalationOverride: "Escalate to Level 4",
      escalationOverrideReason: "",
    }),
    "Add an override reason before saving an escalation override.",
  );

  assert.equal(
    validateReviewDecision({
      escalationOverride: "Escalate to Level 4",
      escalationOverrideReason: "Liquidity conditions changed after review.",
    }),
    null,
  );
});

test("memo status cannot advance to committee states before review is complete", () => {
  assert.equal(
    validateMemoStatusChange(
      { status: "Ready for Committee" },
      { status: "Pending Review" },
    ),
    "Set the review status to Validated or Escalated before marking the memo ready for committee use.",
  );

  assert.equal(
    validateMemoStatusChange(
      { status: "Sent to Committee" },
      { status: "Validated" },
    ),
    null,
  );
});
