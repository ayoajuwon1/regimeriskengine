import test from "node:test";
import assert from "node:assert/strict";

import { getAccessContext } from "./accessContext.js";
import {
  archiveAnalysisRecord,
  createAnalysisRecord,
  normalizeAnalysisRecord,
} from "./analysisStore.js";
import { DEMO_PORTFOLIO, DEMO_RESULTS } from "./sampleAnalysis.js";

test("archiveAnalysisRecord applies archive lifecycle metadata and audit logging", () => {
  const record = createAnalysisRecord({
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
      intakeClassification: null,
      dataSources: ["BLS", "U.S. Treasury Fiscal Data"],
      dataAsOf: "2026-03-10",
      contextVersion: "public-data-v1",
    },
  });

  const archived = archiveAnalysisRecord(record, {
    actor: "Reviewer",
    reason: "Removed from local workspace.",
  });

  assert.ok(archived.archivedAt);
  assert.equal(archived.archivedBy, "Reviewer");
  assert.equal(archived.archiveReason, "Removed from local workspace.");
  assert.equal(archived.auditTrail[0].type, "analysis.archived");
});

test("normalizeAnalysisRecord backfills archive and access context fields for older records", () => {
  const normalized = normalizeAnalysisRecord({
    id: "scan-1",
    title: "Older Record",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
    portfolio: DEMO_PORTFOLIO,
    results: DEMO_RESULTS,
    analysisMeta: {
      provider: "OpenAI",
      mode: "live",
      modelLabel: "Configured OpenAI model",
      promptVersion: "v2.1",
      schemaVersion: "2026-03-10",
    },
    review: {
      status: "Pending Review",
    },
    memo: {
      title: "Memo",
      content: "Body",
      status: "Draft",
    },
  });

  assert.equal(normalized.archivedAt, null);
  assert.equal(normalized.analysisMeta.accessContext.mode, "local-demo");
  assert.equal(normalized.review.checklist.structuralValidity, false);
});
