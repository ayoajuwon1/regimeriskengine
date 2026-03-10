function bulletList(items = [], emptyText = "- None recorded") {
  if (!items.length) return emptyText;
  return items.filter(Boolean).map((item) => `- ${item}`).join("\n");
}

function formatAllocationTable(allocations = []) {
  if (!allocations.length) return "| Asset Class | Weight | Region |\n| --- | ---: | --- |\n| None | 0% | - |";
  const lines = allocations.map((row) => `| ${row.assetClass} | ${row.weight}% | ${row.region} |`);
  return ["| Asset Class | Weight | Region |", "| --- | ---: | --- |", ...lines].join("\n");
}

export function buildCommitteeMemo(record) {
  const { portfolio, results, review, analysisMeta, createdAt } = record;
  const governance = results.governance || {};
  const exposureMap = results.exposures?.exposureMap || {};
  const dominantExposures = results.exposures?.dominantExposures || [];
  const hiddenConcentrations = results.exposures?.hiddenConcentrations || [];
  const regimes = results.regimes || [];
  const vulnerabilities = results.vulnerabilities || [];
  const primaryVulnerability = [...vulnerabilities].sort((a, b) => (b.vulnerabilityScore || 0) - (a.vulnerabilityScore || 0))[0];
  const headline = governance.committeeMemoHeadline || `${portfolio.name || "Portfolio"} requires ${governance.escalationLabel || "governance review"}`;

  return `# ${record.memo?.title || `Committee Memo - ${portfolio.name || "Portfolio Review"}`}

Generated: ${new Date(createdAt).toLocaleString("en-US")}
Model: ${analysisMeta.provider} (${analysisMeta.modelLabel})
Prompt Version: ${analysisMeta.promptVersion}
Review Status: ${review.status}

## Executive Summary
${headline}

${governance.decisionContext || "The portfolio requires a committee-ready summary before any action is taken."}

## Portfolio Snapshot
Portfolio: ${portfolio.name || "Institutional Portfolio"}
Duration: ${portfolio.duration} years
Leverage: ${portfolio.leverage}x
Liquidity Profile: ${portfolio.liquidityProfile}
Constraints: ${portfolio.constraints}

${formatAllocationTable(portfolio.allocations)}

## Exposure Assessment
${results.exposures?.analysisSummary || "Exposure mapping was completed."}

Dominant Exposures
${bulletList(dominantExposures)}

Hidden Concentrations
${bulletList(hiddenConcentrations)}

Macro Driver Notes
${bulletList(
    Object.entries(exposureMap).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
      return `${label}: ${value.score}/10. ${value.interpretation}`;
    }),
  )}

## Regime Scenarios
${regimes.map((regime) => `### ${regime.name}
- Scenario Type: ${regime.scenarioType}
- Probability: ${regime.probability}
- Horizon: ${regime.timeHorizon}
- Trigger: ${regime.trigger}
- Rationale: ${regime.rationaleSummary}
- Historical Analogy: ${regime.historicalAnalogy.episode} (${regime.historicalAnalogy.matchScore}% match)
- Parallels:
${bulletList(regime.historicalAnalogy.parallels)}
- Differences:
${bulletList(regime.historicalAnalogy.differences)}`).join("\n\n")}

## Vulnerability Assessment
${results.vulnerabilityAssessment?.analysisSummary || "Vulnerability scoring was completed for each regime."}

${vulnerabilities.map((vulnerability) => `### ${vulnerability.regimeName}
- Vulnerability Score: ${vulnerability.vulnerabilityScore}/10
- Estimated Drawdown: ${vulnerability.estimatedDrawdown}
- Liquidity Stress: ${vulnerability.liquidityStress}
- Primary Vulnerability: ${vulnerability.primaryVulnerability}
- Reasoning Summary: ${vulnerability.reasoningSummary}
- First Order Effects:
${bulletList(vulnerability.firstOrderEffects)}
- Second Order Effects:
${bulletList(vulnerability.secondOrderEffects)}`).join("\n\n")}

## Governance Metrics
- RCI: ${governance.rci?.score} (${governance.rci?.label}) - ${governance.rci?.rationale}
- Uncertainty Band: ${governance.rci?.uncertaintyBand}
- LCI: ${governance.lci?.score} (${governance.lci?.label}) - ${governance.lci?.rationale}
- Forced Selling Risk: ${governance.lci?.forcedSellingRisk}
- Escalation: Level ${governance.escalationLevel} - ${governance.escalationLabel}
- Escalation Rationale: ${governance.escalationRationale}

Escalation Triggers
${bulletList(governance.escalationTriggers)}

Governance Actions
${bulletList(governance.governanceActions)}

Human Validation Checks
${bulletList(governance.humanValidationChecks)}

Counter-Scenario
- ${governance.counterScenario}

Key Watch Items
${bulletList(governance.keyWatchItems)}

## Human Review
Reviewer: ${review.reviewer || "Unassigned"}
Status: ${review.status}
Reviewed At: ${review.reviewedAt ? new Date(review.reviewedAt).toLocaleString("en-US") : "Not yet reviewed"}
Escalation Override: ${review.escalationOverride || "None"}

Checklist
- Structural validity: ${review.checklist.structuralValidity ? "Complete" : "Pending"}
- Scenario diversity: ${review.checklist.scenarioDiversity ? "Complete" : "Pending"}
- Liquidity fragility reviewed: ${review.checklist.liquidityFragility ? "Complete" : "Pending"}
- Governance communication ready: ${review.checklist.governanceCommunication ? "Complete" : "Pending"}

Reviewer Notes
${review.notes || "No reviewer notes recorded."}

## Recommendation
${primaryVulnerability ? `Focus committee discussion on ${primaryVulnerability.regimeName.toLowerCase()} because it combines ${primaryVulnerability.liquidityStress.toLowerCase()} liquidity stress with ${primaryVulnerability.primaryVulnerability.toLowerCase()}.` : "No recommendation generated."}

Advisory Only. AI outputs require expert validation before use.`;
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
