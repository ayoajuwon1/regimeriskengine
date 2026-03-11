function bulletList(items = [], emptyText = "- None recorded") {
  if (!items.length) return emptyText;
  return items.filter(Boolean).map((item) => `- ${item}`).join("\n");
}

function formatAllocationTable(allocations = []) {
  if (!allocations.length) return "| Asset Class | Weight | Region |\n| --- | ---: | --- |\n| None | 0% | - |";
  const lines = allocations.map((row) => `| ${row.assetClass} | ${row.weight}% | ${row.region} |`);
  return ["| Asset Class | Weight | Region |", "| --- | ---: | --- |", ...lines].join("\n");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHtmlList(items = []) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return "<p class=\"muted\">None recorded.</p>";
  return `<ul>${filtered.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function humanDateTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-US");
}

function humanDate(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-US");
}

function sortExposureScores(exposureMap = {}) {
  return Object.entries(exposureMap)
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      score: value?.score || 0,
      interpretation: value?.interpretation || "No interpretation recorded.",
    }))
    .sort((left, right) => right.score - left.score);
}

function pickPrimaryVulnerability(vulnerabilities = []) {
  return [...vulnerabilities].sort((left, right) => (right.vulnerabilityScore || 0) - (left.vulnerabilityScore || 0))[0] || null;
}

function reviewChecklistEntries(checklist = {}) {
  return [
    `Structural validity: ${checklist.structuralValidity ? "Complete" : "Pending"}`,
    `Scenario diversity: ${checklist.scenarioDiversity ? "Complete" : "Pending"}`,
    `Liquidity fragility reviewed: ${checklist.liquidityFragility ? "Complete" : "Pending"}`,
    `Governance communication ready: ${checklist.governanceCommunication ? "Complete" : "Pending"}`,
  ];
}

function formatDocumentId(recordId, createdAt) {
  const idFragment = String(recordId || "memo").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() || "MEMO";
  const dateFragment = createdAt ? new Date(createdAt).toISOString().slice(0, 10).replaceAll("-", "") : "UNDATED";
  return `RRE-${dateFragment}-${idFragment}`;
}

function renderEmptyTableRow(colspan, message = "No data recorded.") {
  return `<tr><td colspan="${colspan}" class="empty-cell">${escapeHtml(message)}</td></tr>`;
}

function renderMetricRows(entries = []) {
  return entries
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");
}

function getEscalationToneClass(level) {
  const numeric = Number(level);
  if (numeric >= 3) return "tone-alert";
  if (numeric === 2) return "tone-watch";
  return "tone-clear";
}

export function buildMemoDocumentModel(record) {
  const { portfolio, results, review, analysisMeta, createdAt, updatedAt } = record;
  const governance = results.governance || {};
  const exposureMap = results.exposures?.exposureMap || {};
  const regimes = results.regimes || [];
  const vulnerabilities = results.vulnerabilities || [];
  const sortedExposures = sortExposureScores(exposureMap);
  const primaryVulnerability = pickPrimaryVulnerability(vulnerabilities);
  const leadExposure = sortedExposures[0] || null;
  const accessContext = analysisMeta.accessContext || {
    mode: "local-demo",
    displayLabel: "Local Demo Workspace",
    identityStatus: "Anonymous browser session",
  };

  return {
    header: {
      documentId: formatDocumentId(record.id, createdAt),
      title: record.memo?.title || `Committee Memo - ${portfolio.name || "Portfolio Review"}`,
      preparedFor: "Investment Committee",
      preparedBy: "Regime Risk Engine",
      confidentiality: "Internal use only",
      portfolioName: portfolio.name || "Institutional Portfolio",
      generatedAt: humanDateTime(createdAt),
      updatedAt: humanDateTime(record.memo?.updatedAt || updatedAt || createdAt),
      status: record.memo?.status || "Draft",
      provider: analysisMeta.provider,
      modelLabel: analysisMeta.modelLabel,
      promptVersion: analysisMeta.promptVersion,
      schemaVersion: analysisMeta.schemaVersion,
      systemDesignVersion: analysisMeta.systemDesignVersion || "Not recorded",
      accessContextLabel: accessContext.displayLabel,
      identityStatus: accessContext.identityStatus,
    },
    executiveSummary: {
      headline: governance.committeeMemoHeadline || `${portfolio.name || "Portfolio"} requires ${governance.escalationLabel || "committee review"}.`,
      decisionContext: governance.decisionContext || "Committee review should focus on the portfolio's governance implications under the modeled regime set.",
      exposureSummary: results.exposures?.analysisSummary || "Exposure mapping completed.",
      marketSummary: analysisMeta.marketSummary || "No market-summary narrative recorded.",
      recommendedAction: governance.governanceActions?.[0] || governance.escalationRationale || "No specific governance action has been recorded.",
      topExposure: leadExposure ? `${leadExposure.label} (${leadExposure.score}/10)` : "No dominant exposure recorded.",
      primaryVulnerability: primaryVulnerability
        ? `${primaryVulnerability.regimeName}: ${primaryVulnerability.primaryVulnerability} (${primaryVulnerability.vulnerabilityScore}/10)`
        : "No primary vulnerability recorded.",
    },
    portfolio: {
      name: portfolio.name || "Institutional Portfolio",
      duration: `${portfolio.duration} years`,
      leverage: `${portfolio.leverage}x`,
      liquidityProfile: portfolio.liquidityProfile,
      constraints: portfolio.constraints,
      allocations: portfolio.allocations || [],
      intakeClassification: analysisMeta.intakeClassification?.classificationSummary || "Not recorded",
      concentrationFlags: analysisMeta.intakeClassification?.concentrationFlags || [],
    },
    marketContext: {
      asOf: humanDate(analysisMeta.dataAsOf),
      dataSources: analysisMeta.dataSources || [],
      summary: analysisMeta.marketSummary || "No market context summary recorded.",
    },
    keyIndicators: {
      leadExposureLabel: leadExposure?.label || "Not recorded",
      leadExposureScore: leadExposure?.score ?? "N/A",
      primaryVulnerabilityLabel: primaryVulnerability?.primaryVulnerability || "Not recorded",
      primaryVulnerabilityScore: primaryVulnerability?.vulnerabilityScore ?? "N/A",
      forcedSellingRisk: governance.lci?.forcedSellingRisk || "Not recorded",
      uncertaintyBand: governance.rci?.uncertaintyBand || "Not recorded",
    },
    exposures: sortedExposures,
    dominantExposures: results.exposures?.dominantExposures || [],
    hiddenConcentrations: results.exposures?.hiddenConcentrations || [],
    regimes: regimes.map((regime) => ({
      name: regime.name,
      scenarioType: regime.scenarioType,
      probability: regime.probability,
      timeHorizon: regime.timeHorizon,
      trigger: regime.trigger,
      keyRisk: regime.keyRisk,
      rationaleSummary: regime.rationaleSummary,
      historicalAnalogy: regime.historicalAnalogy || {},
    })),
    vulnerabilities: vulnerabilities.map((vulnerability) => ({
      regimeName: vulnerability.regimeName,
      vulnerabilityScore: vulnerability.vulnerabilityScore,
      estimatedDrawdown: vulnerability.estimatedDrawdown,
      liquidityStress: vulnerability.liquidityStress,
      primaryVulnerability: vulnerability.primaryVulnerability,
      reasoningSummary: vulnerability.reasoningSummary,
    })),
    governance: {
      escalationLevel: governance.escalationLevel,
      escalationLabel: governance.escalationLabel,
      escalationRationale: governance.escalationRationale,
      rci: governance.rci || {},
      lci: governance.lci || {},
      escalationTriggers: governance.escalationTriggers || [],
      governanceActions: governance.governanceActions || [],
      keyWatchItems: governance.keyWatchItems || [],
      validationChecks: governance.humanValidationChecks || [],
      counterScenario: governance.counterScenario || "No counter-scenario recorded.",
      primaryRecommendation: primaryVulnerability
        ? `Focus committee discussion on ${primaryVulnerability.regimeName.toLowerCase()} because it combines ${String(primaryVulnerability.liquidityStress || "elevated").toLowerCase()} liquidity stress with ${String(primaryVulnerability.primaryVulnerability || "material portfolio fragility").toLowerCase()}.`
        : "No primary vulnerability recorded.",
    },
    review: {
      reviewer: review.reviewer || "Unassigned",
      status: review.status,
      reviewedAt: humanDateTime(review.reviewedAt),
      override: review.escalationOverride || "None",
      overrideReason: review.escalationOverrideReason || "No override rationale recorded.",
      checklistEntries: reviewChecklistEntries(review.checklist || {}),
      notes: review.notes || "No reviewer notes recorded.",
    },
  };
}

export function buildCommitteeMemo(record) {
  const model = buildMemoDocumentModel(record);

  return `# ${model.header.title}

Document ID: ${model.header.documentId}
Prepared For: ${model.header.preparedFor}
Prepared By: ${model.header.preparedBy}
Confidentiality: ${model.header.confidentiality}
Generated: ${model.header.generatedAt}
Last Updated: ${model.header.updatedAt}
Access Context: ${model.header.accessContextLabel}
Identity Status: ${model.header.identityStatus}
Status: ${model.header.status}
Model: ${model.header.provider} (${model.header.modelLabel})
Prompt Version: ${model.header.promptVersion}
Schema Version: ${model.header.schemaVersion}
System Design Version: ${model.header.systemDesignVersion}

## Executive Summary
${model.executiveSummary.headline}

${model.executiveSummary.decisionContext}

Recommended Action: ${model.executiveSummary.recommendedAction}

Exposure framing: ${model.executiveSummary.exposureSummary}

Market context: ${model.executiveSummary.marketSummary}

Lead Exposure: ${model.executiveSummary.topExposure}

Primary Vulnerability: ${model.executiveSummary.primaryVulnerability}

## Committee Question / Decision Context
${model.executiveSummary.decisionContext}

## Portfolio Snapshot
Portfolio: ${model.portfolio.name}
Duration: ${model.portfolio.duration}
Leverage: ${model.portfolio.leverage}
Liquidity Profile: ${model.portfolio.liquidityProfile}
Constraints: ${model.portfolio.constraints}
Intake Classification: ${model.portfolio.intakeClassification}

Concentration Flags
${bulletList(model.portfolio.concentrationFlags)}

${formatAllocationTable(model.portfolio.allocations)}

## Market Context and Data Provenance
Market Data As Of: ${model.marketContext.asOf}
Data Sources: ${model.marketContext.dataSources.join(", ") || "Not recorded"}
Summary: ${model.marketContext.summary}

## Exposure Assessment
Dominant Exposures
${bulletList(model.dominantExposures)}

Hidden Concentrations
${bulletList(model.hiddenConcentrations)}

Exposure Scorecard
${bulletList(model.exposures.map((exposure) => `${exposure.label}: ${exposure.score}/10. ${exposure.interpretation}`))}

## Regime Summary
${model.regimes.map((regime) => `### ${regime.name}
- Scenario Type: ${regime.scenarioType}
- Probability: ${regime.probability}
- Horizon: ${regime.timeHorizon}
- Trigger: ${regime.trigger}
- Key Risk: ${regime.keyRisk}
- Historical Analogy: ${regime.historicalAnalogy.episode || "Not recorded"} (${regime.historicalAnalogy.matchScore ?? "N/A"}% match)
- Rationale: ${regime.rationaleSummary}`).join("\n\n")}

## Vulnerability Summary
${model.vulnerabilities.map((vulnerability) => `### ${vulnerability.regimeName}
- Vulnerability Score: ${vulnerability.vulnerabilityScore}/10
- Estimated Drawdown: ${vulnerability.estimatedDrawdown}
- Liquidity Stress: ${vulnerability.liquidityStress}
- Primary Vulnerability: ${vulnerability.primaryVulnerability}
- Reasoning Summary: ${vulnerability.reasoningSummary}`).join("\n\n")}

## Governance Recommendation and Escalation
- Escalation: Level ${model.governance.escalationLevel} - ${model.governance.escalationLabel}
- Escalation Rationale: ${model.governance.escalationRationale}
- RCI: ${model.governance.rci.score} (${model.governance.rci.label}) - ${model.governance.rci.rationale}
- LCI: ${model.governance.lci.score} (${model.governance.lci.label}) - ${model.governance.lci.rationale}
- Primary Recommendation: ${model.governance.primaryRecommendation}
- Lead Exposure Signal: ${model.keyIndicators.leadExposureLabel} (${model.keyIndicators.leadExposureScore}/10)
- Primary Vulnerability Signal: ${model.keyIndicators.primaryVulnerabilityLabel} (${model.keyIndicators.primaryVulnerabilityScore}/10)
- Forced Selling Risk: ${model.keyIndicators.forcedSellingRisk}
- Uncertainty Band: ${model.keyIndicators.uncertaintyBand}

Escalation Triggers
${bulletList(model.governance.escalationTriggers)}

Governance Actions
${bulletList(model.governance.governanceActions)}

Key Watch Items
${bulletList(model.governance.keyWatchItems)}

Human Validation Checks
${bulletList(model.governance.validationChecks)}

Counter-Scenario
- ${model.governance.counterScenario}

## Human Validation and Reviewer Section
Reviewer: ${model.review.reviewer}
Review Status: ${model.review.status}
Reviewed At: ${model.review.reviewedAt}
Escalation Override: ${model.review.override}
Override Rationale: ${model.review.overrideReason}

Checklist
${bulletList(model.review.checklistEntries)}

Reviewer Notes
${model.review.notes}

## Advisory Notice
Advisory only. AI outputs require expert validation before committee use. This document is a governance aid and not investment advice, legal advice, or compliance sign-off.`;
}

export function buildMemoDocumentHtml(record) {
  const model = buildMemoDocumentModel(record);
  const controlRows = renderMetricRows([
    ["Document ID", model.header.documentId],
    ["Prepared For", model.header.preparedFor],
    ["Prepared By", model.header.preparedBy],
    ["Generated", model.header.generatedAt],
    ["Updated", model.header.updatedAt],
    ["Status", model.header.status],
    ["Workspace", model.header.accessContextLabel],
    ["Identity", model.header.identityStatus],
    ["Model", `${model.header.provider} (${model.header.modelLabel})`],
    ["Prompt / Schema", `${model.header.promptVersion} / ${model.header.schemaVersion}`],
    ["System Design", model.header.systemDesignVersion],
  ]);
  const allocationRows = model.portfolio.allocations.length
    ? model.portfolio.allocations
        .map((allocation) => `<tr><td>${escapeHtml(allocation.assetClass)}</td><td>${escapeHtml(allocation.weight)}%</td><td>${escapeHtml(allocation.region)}</td></tr>`)
        .join("")
    : renderEmptyTableRow(3, "No allocation data recorded.");
  const regimeRows = model.regimes.length
    ? model.regimes
        .map(
          (regime) =>
            `<tr><td>${escapeHtml(regime.name)}</td><td>${escapeHtml(regime.probability)}</td><td>${escapeHtml(regime.timeHorizon)}</td><td>${escapeHtml(regime.trigger)}</td><td>${escapeHtml(regime.keyRisk)}</td></tr>`,
        )
        .join("")
    : renderEmptyTableRow(5, "No regime scenarios recorded.");
  const vulnerabilityRows = model.vulnerabilities.length
    ? model.vulnerabilities
        .map(
          (vulnerability) =>
            `<tr><td>${escapeHtml(vulnerability.regimeName)}</td><td>${escapeHtml(vulnerability.vulnerabilityScore)}/10</td><td>${escapeHtml(vulnerability.estimatedDrawdown)}</td><td>${escapeHtml(vulnerability.liquidityStress)}</td><td>${escapeHtml(vulnerability.primaryVulnerability)}</td></tr>`,
        )
        .join("")
    : renderEmptyTableRow(5, "No vulnerabilities recorded.");
  const exposureRows = model.exposures.length
    ? model.exposures
        .map((exposure) => `<tr><td>${escapeHtml(exposure.label)}</td><td>${escapeHtml(exposure.score)}/10</td><td>${escapeHtml(exposure.interpretation)}</td></tr>`)
        .join("")
    : renderEmptyTableRow(3, "No exposure scores recorded.");
  const escalationToneClass = getEscalationToneClass(model.governance.escalationLevel);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(model.header.title)}</title>
    <style>
      @page { size: letter; margin: 0.55in; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
        color: #18212b;
        background: #ffffff;
      }
      .memo-shell {
        max-width: 8in;
        margin: 0 auto;
        border: 1px solid #d8dee6;
        padding: 28px 32px 34px;
      }
      .topline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        color: #516070;
        margin-bottom: 18px;
      }
      .topline-rule {
        flex: 1;
        height: 1px;
        background: #d5dce5;
      }
      .hero {
        border-top: 4px solid #10273c;
        border-bottom: 1px solid #d9e0e8;
        padding: 20px 0 22px;
        margin-bottom: 22px;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.4fr 0.9fr;
        gap: 24px;
      }
      .eyebrow {
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: #5a6775;
        margin-bottom: 10px;
      }
      h1 {
        margin: 0;
        font-size: 32px;
        line-height: 1.06;
        color: #0f2236;
      }
      .hero-subtitle {
        margin: 14px 0 0;
        font-size: 16px;
        line-height: 1.65;
        color: #2b3a48;
      }
      .status-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 18px;
      }
      .status-pill {
        display: inline-block;
        border: 1px solid #c4ced9;
        border-radius: 999px;
        padding: 6px 12px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #15304c;
        background: #ffffff;
      }
      .status-pill.primary {
        background: #10273c;
        border-color: #10273c;
        color: #ffffff;
      }
      .tone-alert {
        border-color: #9a3f3f;
        color: #7d2222;
      }
      .tone-watch {
        border-color: #a97812;
        color: #7d5a0c;
      }
      .tone-clear {
        border-color: #2f6b52;
        color: #1f5a42;
      }
      .control-table,
      .data-table,
      .detail-table {
        width: 100%;
        border-collapse: collapse;
      }
      .control-table th,
      .control-table td {
        padding: 8px 0;
        border-bottom: 1px solid #e5eaf0;
        font-size: 12px;
        vertical-align: top;
      }
      .control-table th {
        width: 42%;
        text-align: left;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        color: #596777;
      }
      .control-table td {
        color: #1f2d3a;
      }
      .section {
        margin-top: 24px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .section-label {
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        color: #556474;
        white-space: nowrap;
      }
      .section-line {
        flex: 1;
        height: 1px;
        background: #dde4eb;
      }
      .section-title {
        margin: 0 0 10px;
        font-size: 23px;
        line-height: 1.18;
        color: #10253a;
      }
      .section-copy {
        margin: 0;
        font-size: 15px;
        line-height: 1.72;
        color: #253443;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-top: 16px;
      }
      .summary-card {
        border: 1px solid #d8e0e8;
        border-top: 3px solid #274a70;
        padding: 14px 14px 16px;
        min-height: 122px;
      }
      .summary-label {
        margin: 0 0 9px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.3px;
        text-transform: uppercase;
        color: #5c6a79;
      }
      .summary-value {
        margin: 0;
        font-size: 24px;
        line-height: 1.05;
        color: #10253a;
      }
      .summary-note {
        margin: 8px 0 0;
        font-size: 12px;
        line-height: 1.5;
        color: #445463;
      }
      .matrix {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 18px;
      }
      .callout,
      .note-panel {
        border: 1px solid #d8e0e8;
        padding: 16px 18px;
      }
      .callout {
        border-left: 4px solid #173856;
      }
      .note-panel {
        background: #fafbfd;
      }
      .callout-title,
      .panel-title {
        margin: 0 0 8px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 1.3px;
        text-transform: uppercase;
        color: #596979;
      }
      .callout-copy,
      .panel-copy,
      .metric-list li {
        margin: 0;
        font-size: 14px;
        line-height: 1.64;
        color: #243240;
      }
      .metric-list {
        margin: 10px 0 0 18px;
        padding: 0;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .info-card {
        border: 1px solid #d8e0e8;
        padding: 16px 18px;
      }
      .info-card h3 {
        margin: 0 0 12px;
        font-size: 15px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        color: #536273;
      }
      .info-row {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.55;
      }
      .detail-table {
        margin-top: 10px;
      }
      .detail-table th,
      .detail-table td,
      .data-table th,
      .data-table td {
        border-bottom: 1px solid #dde4ea;
        padding: 9px 10px;
        text-align: left;
        font-size: 12px;
        vertical-align: top;
      }
      .detail-table th,
      .data-table th {
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        color: #546272;
      }
      .detail-table td,
      .data-table td {
        line-height: 1.5;
        color: #233240;
      }
      .empty-cell {
        color: #667381;
        font-style: italic;
      }
      .two-column-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .list-card {
        border: 1px solid #d8e0e8;
        padding: 16px 18px;
        break-inside: avoid;
      }
      .list-card h3 {
        margin: 0 0 10px;
        font-size: 15px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        letter-spacing: 1.1px;
        text-transform: uppercase;
        color: #536273;
      }
      ul {
        margin: 10px 0 0 18px;
        padding: 0;
      }
      li {
        margin-bottom: 7px;
        font-size: 13px;
        line-height: 1.55;
      }
      .muted {
        color: #66717c;
        font-size: 12px;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      .release-grid {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 18px;
      }
      .footer {
        margin-top: 26px;
        border-top: 1px solid #d9e0e7;
        padding-top: 14px;
        display: flex;
        justify-content: space-between;
        gap: 18px;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 0.65px;
        color: #5a6672;
        text-transform: uppercase;
      }
      @media print {
        body { background: #ffffff; }
        .memo-shell { border: none; padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="memo-shell">
      <div class="topline">
        <span>${escapeHtml(model.header.confidentiality)}</span>
        <span class="topline-rule"></span>
        <span>${escapeHtml(model.header.documentId)}</span>
      </div>

      <section class="hero">
        <div class="hero-grid">
          <div>
            <div class="eyebrow">Institutional Portfolio Regime Risk Memorandum</div>
            <h1>${escapeHtml(model.header.title)}</h1>
            <p class="hero-subtitle"><strong>${escapeHtml(model.executiveSummary.headline)}</strong> ${escapeHtml(model.executiveSummary.decisionContext)}</p>
            <div class="status-row">
              <span class="status-pill primary">${escapeHtml(model.header.preparedFor)}</span>
              <span class="status-pill ${escapeHtml(escalationToneClass)}">Level ${escapeHtml(model.governance.escalationLevel)} - ${escapeHtml(model.governance.escalationLabel)}</span>
              <span class="status-pill">${escapeHtml(model.header.status)}</span>
            </div>
          </div>
          <div>
            <table class="control-table">
              <tbody>${controlRows}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Committee Action Summary</span>
          <span class="section-line"></span>
        </div>
        <div class="summary-grid">
          <div class="summary-card">
            <p class="summary-label">Recommended Action</p>
            <p class="summary-value">${escapeHtml(model.governance.escalationLabel)}</p>
            <p class="summary-note">${escapeHtml(model.executiveSummary.recommendedAction)}</p>
          </div>
          <div class="summary-card">
            <p class="summary-label">RCI</p>
            <p class="summary-value">${escapeHtml(model.governance.rci.score)}</p>
            <p class="summary-note">${escapeHtml(model.governance.rci.label)}. ${escapeHtml(model.governance.rci.rationale)}</p>
          </div>
          <div class="summary-card">
            <p class="summary-label">LCI</p>
            <p class="summary-value">${escapeHtml(model.governance.lci.score)}</p>
            <p class="summary-note">${escapeHtml(model.governance.lci.label)}. ${escapeHtml(model.governance.lci.rationale)}</p>
          </div>
          <div class="summary-card">
            <p class="summary-label">Primary Vulnerability</p>
            <p class="summary-value">${escapeHtml(model.keyIndicators.primaryVulnerabilityScore)}</p>
            <p class="summary-note">${escapeHtml(model.executiveSummary.primaryVulnerability)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Decision Framing</span>
          <span class="section-line"></span>
        </div>
        <div class="matrix">
          <div class="callout">
            <p class="callout-title">Committee Question</p>
            <p class="callout-copy">${escapeHtml(model.executiveSummary.decisionContext)}</p>
          </div>
          <div class="note-panel">
            <p class="panel-title">Decision Boundary</p>
            <ul class="metric-list">
              <li>Use this memorandum as a governance and scenario-planning aid, not a trade recommendation.</li>
              <li>Escalate when liquidity resilience, forced-selling risk, or exposure overlap exceeds committee tolerance.</li>
              <li>Confirm model outputs against current manager reporting and portfolio cash-flow data before release.</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Portfolio and Market Context</span>
          <span class="section-line"></span>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <h3>Portfolio Snapshot</h3>
            <p class="info-row"><strong>Portfolio:</strong> ${escapeHtml(model.portfolio.name)}</p>
            <p class="info-row"><strong>Duration:</strong> ${escapeHtml(model.portfolio.duration)}</p>
            <p class="info-row"><strong>Leverage:</strong> ${escapeHtml(model.portfolio.leverage)}</p>
            <p class="info-row"><strong>Liquidity Profile:</strong> ${escapeHtml(model.portfolio.liquidityProfile)}</p>
            <p class="info-row"><strong>Constraints:</strong> ${escapeHtml(model.portfolio.constraints)}</p>
            <p class="info-row"><strong>Intake Classification:</strong> ${escapeHtml(model.portfolio.intakeClassification)}</p>
          </div>
          <div class="info-card">
            <h3>Market Context and Provenance</h3>
            <p class="info-row"><strong>Data As Of:</strong> ${escapeHtml(model.marketContext.asOf)}</p>
            <p class="info-row"><strong>Sources:</strong> ${escapeHtml(model.marketContext.dataSources.join(", ") || "Not recorded")}</p>
            <p class="info-row"><strong>Lead Exposure:</strong> ${escapeHtml(model.executiveSummary.topExposure)}</p>
            <p class="info-row"><strong>Forced Selling Risk:</strong> ${escapeHtml(model.keyIndicators.forcedSellingRisk)}</p>
            <p class="info-row"><strong>Uncertainty Band:</strong> ${escapeHtml(model.keyIndicators.uncertaintyBand)}</p>
            <p class="section-copy">${escapeHtml(model.marketContext.summary)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Committee Actions and Watch Items</span>
          <span class="section-line"></span>
        </div>
        <div class="two-column-list">
          <div class="list-card">
            <h3>Governance Actions</h3>
            ${renderHtmlList(model.governance.governanceActions)}
          </div>
          <div class="list-card">
            <h3>Key Watch Items</h3>
            ${renderHtmlList(model.governance.keyWatchItems)}
          </div>
        </div>
      </section>

      <section class="section page-break">
        <div class="section-header">
          <span class="section-label">Scenario Register</span>
          <span class="section-line"></span>
        </div>
        <h2 class="section-title">Regime Summary and Vulnerability Register</h2>
        <p class="section-copy">The following tables are intended for committee review, challenge, and scenario comparison. They should be read alongside human validation checks and current portfolio cash-flow evidence.</p>

        <table class="data-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Probability</th>
              <th>Horizon</th>
              <th>Trigger</th>
              <th>Key Risk</th>
            </tr>
          </thead>
          <tbody>${regimeRows}</tbody>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th>Regime</th>
              <th>Score</th>
              <th>Estimated Drawdown</th>
              <th>Liquidity Stress</th>
              <th>Primary Vulnerability</th>
            </tr>
          </thead>
          <tbody>${vulnerabilityRows}</tbody>
        </table>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Exposure Detail</span>
          <span class="section-line"></span>
        </div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>Exposure</th>
              <th>Score</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>${exposureRows}</tbody>
        </table>

        <div class="two-column-list">
          <div class="list-card">
            <h3>Dominant Exposures</h3>
            ${renderHtmlList(model.dominantExposures)}
          </div>
          <div class="list-card">
            <h3>Hidden Concentrations</h3>
            ${renderHtmlList(model.hiddenConcentrations)}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Portfolio Allocation</span>
          <span class="section-line"></span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Asset Class</th>
              <th>Weight</th>
              <th>Region / Focus</th>
            </tr>
          </thead>
          <tbody>${allocationRows}</tbody>
        </table>
      </section>

      <section class="section">
        <div class="section-header">
          <span class="section-label">Release Controls</span>
          <span class="section-line"></span>
        </div>
        <div class="release-grid">
          <div class="info-card">
            <h3>Human Validation</h3>
            <p class="info-row"><strong>Reviewer:</strong> ${escapeHtml(model.review.reviewer)}</p>
            <p class="info-row"><strong>Status:</strong> ${escapeHtml(model.review.status)}</p>
            <p class="info-row"><strong>Reviewed At:</strong> ${escapeHtml(model.review.reviewedAt)}</p>
            <p class="info-row"><strong>Override:</strong> ${escapeHtml(model.review.override)}</p>
            <p class="info-row"><strong>Override Rationale:</strong> ${escapeHtml(model.review.overrideReason)}</p>
            <p class="section-copy">${escapeHtml(model.review.notes)}</p>
          </div>
          <div class="info-card">
            <h3>Validation and Escalation Controls</h3>
            ${renderHtmlList(model.review.checklistEntries)}
            <h3 style="margin-top:18px;">Escalation Triggers</h3>
            ${renderHtmlList(model.governance.escalationTriggers)}
            <h3 style="margin-top:18px;">Counter-Scenario</h3>
            <p class="section-copy">${escapeHtml(model.governance.counterScenario)}</p>
          </div>
        </div>
      </section>

      <div class="footer">
        <span>Advisory only. Human review required before committee use.</span>
        <span>Not investment advice, legal advice, or compliance sign-off.</span>
      </div>
    </div>
  </body>
</html>`;
}

export function exportMemoPdf(record) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Popup blocked. Allow pop-ups to export the committee memo as PDF.");
  }

  printWindow.document.open();
  printWindow.document.write(buildMemoDocumentHtml(record));
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.setTimeout(() => {
      printWindow.print();
    }, 150);
  };
}

export function downloadTextFile(filename, content, mimeType = "text/markdown;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
