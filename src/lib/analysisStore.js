import { buildCommitteeMemo } from "./memo";
import { DEMO_ANALYSIS_META, DEMO_PORTFOLIO, DEMO_RESULTS } from "./sampleAnalysis";

const STORAGE_KEY = "regime-risk-engine.history.v2";

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function sortByUpdatedAt(records) {
  return [...records].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

function defaultChecklist() {
  return {
    structuralValidity: false,
    scenarioDiversity: false,
    liquidityFragility: false,
    governanceCommunication: false,
  };
}

function defaultReview() {
  return {
    reviewer: "",
    status: "Pending Review",
    notes: "",
    escalationOverride: "",
    escalationOverrideReason: "",
    reviewedAt: null,
    checklist: defaultChecklist(),
  };
}

export function createAuditEvent(type, actor, message, details = {}) {
  return {
    id: makeId("evt"),
    timestamp: nowIso(),
    type,
    actor,
    message,
    details,
  };
}

function buildRecordTitle(portfolio, createdAt) {
  const dateLabel = new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${portfolio.name || "Portfolio"} - ${dateLabel}`;
}

export function createAnalysisRecord({ portfolio, results, analysisMeta }) {
  const createdAt = nowIso();
  const review = defaultReview();
  const record = {
    id: makeId("scan"),
    title: buildRecordTitle(portfolio, createdAt),
    createdAt,
    updatedAt: createdAt,
    portfolio,
    results,
    analysisMeta,
    review,
    memo: {
      title: `Committee Memo - ${portfolio.name || "Portfolio Review"}`,
      content: "",
      status: "Draft",
      updatedAt: createdAt,
    },
    auditTrail: [],
  };

  record.memo.content = buildCommitteeMemo(record);
  record.auditTrail = [
    createAuditEvent("analysis.completed", "System", `Analysis saved in ${analysisMeta.mode} mode.`, {
      model: analysisMeta.modelLabel,
      promptVersion: analysisMeta.promptVersion,
      systemDesignVersion: analysisMeta.systemDesignVersion || null,
      intakeClassification: analysisMeta.intakeClassification || null,
      dataSources: analysisMeta.dataSources || [],
      dataAsOf: analysisMeta.dataAsOf || null,
    }),
    createAuditEvent(
      "intake.classified",
      "System",
      analysisMeta.intakeClassification?.classificationSummary || "Intake classification recorded for this analysis.",
      {
        intakeClassification: analysisMeta.intakeClassification || null,
      },
    ),
    createAuditEvent("market.context.loaded", "System", analysisMeta.marketSummary || "Public market context attached to the analysis.", {
      contextVersion: analysisMeta.contextVersion || null,
      dataSources: analysisMeta.dataSources || [],
      dataAsOf: analysisMeta.dataAsOf || null,
    }),
    createAuditEvent("memo.generated", "System", "Committee memo drafted from the latest analysis.", {}),
  ];

  return record;
}

export function createDemoAnalysisRecord() {
  return createAnalysisRecord({
    portfolio: DEMO_PORTFOLIO,
    results: DEMO_RESULTS,
    analysisMeta: DEMO_ANALYSIS_META,
  });
}

export function loadAnalysisHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortByUpdatedAt(parsed) : [];
  } catch {
    return [];
  }
}

export function saveAnalysisHistory(records) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortByUpdatedAt(records)));
}

export function upsertAnalysisRecord(records, record) {
  const next = records.filter((entry) => entry.id !== record.id);
  next.unshift(record);
  return sortByUpdatedAt(next);
}

export function updateReviewRecord(record, reviewDraft) {
  const updatedAt = nowIso();
  const actor = reviewDraft.reviewer?.trim() || "Reviewer";
  return {
    ...record,
    updatedAt,
    review: {
      ...reviewDraft,
      checklist: { ...defaultChecklist(), ...(reviewDraft.checklist || {}) },
      reviewedAt: updatedAt,
    },
    auditTrail: [
      createAuditEvent("review.updated", actor, `Review saved with status ${reviewDraft.status}.`, {
        escalationOverride: reviewDraft.escalationOverride || null,
      }),
      ...record.auditTrail,
    ],
  };
}

export function updateMemoRecord(record, memoDraft, actor = "Analyst") {
  const updatedAt = nowIso();
  return {
    ...record,
    updatedAt,
    memo: {
      ...record.memo,
      ...memoDraft,
      updatedAt,
    },
    auditTrail: [
      createAuditEvent("memo.updated", actor, "Committee memo content updated.", {
        status: memoDraft.status,
      }),
      ...record.auditTrail,
    ],
  };
}

export function regenerateMemoRecord(record, actor = "System") {
  const updatedAt = nowIso();
  const nextRecord = {
    ...record,
    updatedAt,
    memo: {
      ...record.memo,
      content: "",
      updatedAt,
    },
  };
  nextRecord.memo.content = buildCommitteeMemo(nextRecord);
  nextRecord.auditTrail = [
    createAuditEvent("memo.regenerated", actor, "Committee memo regenerated from current analysis.", {}),
    ...record.auditTrail,
  ];
  return nextRecord;
}

export function buildAuditExport(record) {
  return JSON.stringify(
    {
      analysis: {
        id: record.id,
        title: record.title,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        analysisMeta: record.analysisMeta,
      },
      review: record.review,
      auditTrail: record.auditTrail,
    },
    null,
    2,
  );
}
