"use client";

import { useCallback, useEffect, useState } from "react";

import {
  archiveAnalysisRecord,
  buildAuditExport,
  createDemoAnalysisRecord,
  createAnalysisRecord,
  loadAnalysisHistory,
  regenerateMemoRecord,
  saveAnalysisHistory,
  updateMemoRecord,
  updateReviewRecord,
  upsertAnalysisRecord,
} from "./lib/analysisStore";
import { downloadTextFile, exportMemoPdf } from "./lib/memo";
import { getAccessContext } from "./lib/accessContext.js";
import { ANALYSIS_META, fetchMarketContext, stage1, stage2, stage3, stage4 } from "./lib/riskAnalysis";
import { fetchSystemDesign } from "./lib/systemDesign/client.js";
import { buildIntakeClassification } from "./lib/systemDesign/classification.js";
import { isSystemGuideEnabled } from "./lib/systemDesign/constants.js";
import { validateMemoStatusChange, validateReviewDecision } from "./lib/systemDesign/policy.js";

const ASSET_CLASSES = ["Public Equity – Developed Markets","Public Equity – Emerging Markets","Investment Grade Fixed Income","High Yield / Credit","Private Equity","Private Credit","Real Assets / Infrastructure","Hedge Funds / Alternatives","Cash & Equivalents","Commodities"];
const LIQUIDITY_OPTIONS = ["High Liquidity (>80% liquid within 30 days)","Mixed (40–80% liquid within 30 days)","Illiquid-Heavy (<40% liquid within 30 days)"];
const REVIEW_STATUSES = ["Pending Review", "Validated", "Escalated", "Needs Revision"];
const ESCALATION_OVERRIDES = ["", "Maintain Current Level", "Downgrade to Level 1", "Downgrade to Level 2", "Escalate to Level 3", "Escalate to Level 4"];
const PIPE_LABELS = [
  "Decomposing structural macro exposures",
  "Generating diversified regime scenarios",
  "Simulating vulnerabilities and liquidity stress",
  "Drafting governance metrics and memo package",
];
const SYSTEM_GUIDE_ENABLED = isSystemGuideEnabled();
const ACCESS_CONTEXT = getAccessContext();
const DEFAULT_PORTFOLIO = {
  name: "Global Balanced Endowment",
  allocations:[
    {assetClass:"Public Equity – Developed Markets",weight:35,region:"Global DM"},
    {assetClass:"Investment Grade Fixed Income",weight:20,region:"US"},
    {assetClass:"Private Equity",weight:15,region:"North America"},
    {assetClass:"Real Assets / Infrastructure",weight:10,region:"Global"},
    {assetClass:"High Yield / Credit",weight:10,region:"US HY"},
    {assetClass:"Cash & Equivalents",weight:5,region:"USD"},
    {assetClass:"Hedge Funds / Alternatives",weight:5,region:"Global"},
  ],
  duration:5.5,
  leverage:1.0,
  liquidityProfile:"Mixed (40–80% liquid within 30 days)",
  constraints:"No short selling. Max 20% single asset class.",
};

const C = {
  bg: "#03060D",
  surface: "#070C17",
  card: "#090F1C",
  border: "#13202F",
  borderBright: "#1E3045",
  text: "#CBD3DC",
  muted: "#4E6070",
  accent: "#C8961A",
  green: "#18785A",
  red: "#A83030",
  orange: "#C8621A",
  blue: "#2255A0",
};
const F = { serif: "'Crimson Pro', Georgia, serif", mono: "'IBM Plex Mono', 'Courier New', monospace" };
const DEFAULT_MEMO_ACTION_STATE = {
  saveState: "idle",
  regenerateState: "idle",
  exportState: { markdown: "idle", pdf: "idle" },
  lastSavedAt: null,
  lastMessage: "",
  lastMessageTone: "muted",
};

const EXP_LABELS = {
  inflationSensitivity: "Inflation Sensitivity",
  growthSensitivity: "Growth Sensitivity",
  durationRisk: "Duration Risk",
  creditSpreadRisk: "Credit Spread Risk",
  currencyExposure: "Currency Exposure",
  liquidityDependence: "Liquidity Dependence",
};

function formatDateTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(value) {
  if (!value) return "Unavailable";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function safeFilename(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getArchiveActionLabel(accessContext) {
  return accessContext.mode === "local-demo" ? "REMOVE FROM THIS BROWSER" : "ARCHIVE ANALYSIS";
}

function getTopExposureSummaries(exposureMap = {}) {
  return Object.entries(exposureMap)
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      score: value?.score || 0,
      interpretation: value?.interpretation || "No interpretation recorded.",
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

function getPrimaryVulnerability(vulnerabilities = []) {
  return [...vulnerabilities].sort((left, right) => (right.vulnerabilityScore || 0) - (left.vulnerabilityScore || 0))[0] || null;
}

function getReviewStatusColor(status) {
  switch (status) {
    case "Validated":
      return C.green;
    case "Escalated":
      return C.red;
    case "Needs Revision":
      return C.orange;
    default:
      return C.accent;
  }
}

function getModeColor(mode) {
  return mode === "demo" ? C.blue : C.accent;
}

function Lbl({ c, children }) {
  return <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: c || C.muted, marginBottom: 6 }}>{children}</div>;
}

function Card({ children, style, hl }) {
  return <div style={{ background: C.card, border: `1px solid ${hl ? hl + "40" : C.border}`, borderLeft: hl ? `3px solid ${hl}` : undefined, borderRadius: 8, padding: 20, ...style }}>{children}</div>;
}

function Tag({ children, color = C.borderBright }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, border: `1px solid ${color}55`, background: `${color}18`, color, fontFamily: F.mono, fontSize: 10, letterSpacing: 1 }}>{children}</span>;
}

function ScorePill({ v, max = 10 }) {
  const p = v / max;
  const col = p > 0.7 ? C.red : p > 0.4 ? C.accent : C.green;
  return <span style={{ background: col + "1A", border: `1px solid ${col}50`, borderRadius: 4, padding: "2px 9px", color: col, fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{v}/{max}</span>;
}

function StatusPill({ label, color }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${color}14`, border: `1px solid ${color}45`, color, borderRadius: 999, padding: "4px 10px", fontFamily: F.mono, fontSize: 10, letterSpacing: 1 }}>{label}</span>;
}

function ProbBadge({ val }) {
  const m = { High: C.red, Medium: C.accent, Low: C.green };
  const col = m[val] || C.green;
  return <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, padding: "2px 8px", background: col + "1A", border: `1px solid ${col}40`, borderRadius: 3, color: col }}>{(val || "").toUpperCase()} PROB</span>;
}

function ImpactBadge({ val }) {
  const v = val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : "Neutral";
  const m = { Bullish: { c: C.green, i: "↑" }, Neutral: { c: C.muted, i: "→" }, Bearish: { c: C.red, i: "↓" } };
  const cfg = m[v] || m.Neutral;
  return <span style={{ background: cfg.c + "18", border: `1px solid ${cfg.c}40`, borderRadius: 4, padding: "2px 7px", color: cfg.c, fontSize: 10, fontFamily: F.mono, fontWeight: 600 }}>{cfg.i} {v}</span>;
}

function LiqBadge({ val }) {
  const m = { Low: C.green, Medium: C.accent, High: C.orange, Critical: C.red };
  return <span style={{ fontFamily: F.mono, fontSize: 11, color: m[val] || C.muted }}>● {val}</span>;
}

function EscBanner({ level, label, rationale }) {
  const m = { 1: C.blue, 2: C.accent, 3: C.orange, 4: C.red };
  const col = m[level] || C.blue;
  return <div style={{ background: col + "0D", border: `1px solid ${col}35`, borderLeft: `4px solid ${col}`, borderRadius: "0 8px 8px 0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}><span style={{ color: col, fontSize: 20 }}>◉</span><div><div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2.5, color: col + "99", marginBottom: 2 }}>ESCALATION LEVEL {level}</div><div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: col, lineHeight: 1.1 }}>{label}</div>{rationale && <div style={{ fontFamily: F.serif, fontSize: 13, color: C.text, marginTop: 4, opacity: 0.8 }}>{rationale}</div>}</div></div>;
}

function Gauge({ score, label }) {
  const cx = 70, cy = 65, r = 50;
  const p = Math.min(Math.max((score || 0) / 100, 0.001), 0.9999);
  const vx = cx - r * Math.cos(p * Math.PI);
  const vy = cy - r * Math.sin(p * Math.PI);
  const col = (score || 0) > 70 ? C.red : (score || 0) > 40 ? C.accent : C.green;
  return (
    <svg width="140" height="90" viewBox="0 0 140 90">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`} fill="none" stroke={C.border} strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${vx} ${vy}`} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" />
      <circle cx={vx} cy={vy} r="4" fill={col} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={C.text} style={{ fontSize: 24, fontFamily: F.mono, fontWeight: 700 }}>{score ?? "--"}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={col} style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 2 }}>{(label || "").toUpperCase()}</text>
    </svg>
  );
}

function SectionBullets({ items, color = C.accent }) {
  return (items || []).map((item, index) => (
    <div key={`${item}-${index}`} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
      <span style={{ color, fontFamily: F.mono, fontSize: 12, flexShrink: 0, marginTop: 3 }}>▸</span>
      <span style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.55 }}>{item}</span>
    </div>
  ));
}

function ExposureBar({ label, score, drivers, interpretation }) {
  const p = (score / 10) * 100;
  const col = p > 70 ? C.red : p > 40 ? C.accent : C.green;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontFamily: F.mono, fontSize: 11, color: C.text }}>{label}</span>
        <ScorePill v={score} />
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p}%`, background: col, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>{(drivers || []).filter(Boolean).join("  ·  ")}</div>
      {interpretation && <div style={{ marginTop: 6, fontFamily: F.serif, fontSize: 13, color: C.text, lineHeight: 1.55, opacity: 0.82 }}>{interpretation}</div>}
    </div>
  );
}

function PipeProgress({ step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500 }}>
      <style>{`@keyframes sweep{0%{transform:translateX(-120%)}100%{transform:translateX(260%)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
      <Card style={{ maxWidth: 520, width: "100%", padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Lbl>Running Analysis Pipeline</Lbl>
          <h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 600, margin: 0, color: C.text }}>Processing Portfolio Risk Profile</h2>
          <div style={{ marginTop: 10, fontFamily: F.serif, fontSize: 14, color: C.muted }}>Outputs will be saved into the local audit trail automatically.</div>
        </div>
        {PIPE_LABELS.map((lbl, i) => {
          const done = step > i + 1;
          const active = step === i + 1;
          return (
            <div key={lbl} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, opacity: done || active ? 1 : 0.25, transition: "opacity 0.4s" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.green + "20" : active ? C.accent + "20" : C.border + "30", border: `1px solid ${done ? C.green + "60" : active ? C.accent + "60" : C.border}`, color: done ? C.green : active ? C.accent : C.muted, fontFamily: F.mono, fontSize: 11, fontWeight: 700, animation: active ? "blink 1.4s ease infinite" : "none" }}>{done ? "✓" : i + 1}</div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontFamily: F.mono, fontSize: 12, color: done ? C.green : active ? C.text : C.muted }}>{lbl}</div>
                {active && <div style={{ height: 2, background: C.border, borderRadius: 2, marginTop: 8, overflow: "hidden" }}><div style={{ height: "100%", width: "45%", background: C.accent, borderRadius: 2, animation: "sweep 1.6s ease-in-out infinite" }} /></div>}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function MarketContextCard({ marketContext, loading, loadError, onRefresh }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <Lbl>Public Market Context</Lbl>
          <div style={{ fontFamily: F.serif, fontSize: 18, color: C.text }}>Macro Snapshot</div>
        </div>
        <button onClick={onRefresh} style={{ background: "transparent", border: `1px solid ${C.borderBright}`, color: C.text, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10 }}>REFRESH</button>
      </div>
      {loading && <div style={{ fontFamily: F.serif, fontSize: 14, color: C.muted }}>Loading public market context...</div>}
      {!loading && loadError && <div style={{ fontFamily: F.mono, fontSize: 11, color: C.red, lineHeight: 1.6 }}>⚠ {loadError}</div>}
      {!loading && marketContext && (
        <>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, marginBottom: 10 }}>As of {formatShortDate(marketContext.asOf)}</div>
          <p style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>{marketContext.summary}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {(marketContext.sourcesUsed || []).map((source) => <Tag key={source} color={C.green}>{source}</Tag>)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(marketContext.providerStatus || []).map((entry) => (
              <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: F.mono, fontSize: 10, color: C.text }}>
                <span>{entry.label}</span>
                <span style={{ color: entry.status === "used" ? C.green : entry.status === "partial" ? C.orange : entry.status === "idle" ? C.blue : entry.status === "unavailable" ? C.red : C.muted }}>{entry.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function AccessContextCard({ accessContext }) {
  return (
    <Card hl={accessContext.mode === "local-demo" ? C.orange : C.blue}>
      <Lbl>Workspace Access</Lbl>
      <div style={{ fontFamily: F.serif, fontSize: 18, color: C.text, marginBottom: 8 }}>{accessContext.displayLabel}</div>
      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, marginBottom: 12 }}>{accessContext.identityStatus}</div>
      <SectionBullets items={accessContext.limitations} color={accessContext.mode === "local-demo" ? C.orange : C.blue} />
      <div style={{ marginTop: 12, fontFamily: F.mono, fontSize: 10, color: C.muted }}>Target operating posture</div>
      <SectionBullets items={accessContext.expectations} color={C.green} />
    </Card>
  );
}

function MethodGuidePanel({ open, onClose, systemDesign, loading, loadError }) {
  if (!open) return null;

  return (
    <Card style={{ marginBottom: 20 }} hl={C.blue}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <div>
          <Lbl c={C.blue}>Method / Guide</Lbl>
          <div style={{ fontFamily: F.serif, fontSize: 24, color: C.text, fontWeight: 600 }}>System Design Overview</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.borderBright}`, color: C.text, padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10 }}>CLOSE</button>
      </div>

      {loading && <div style={{ fontFamily: F.serif, fontSize: 14, color: C.muted }}>Loading system design artifacts...</div>}
      {!loading && loadError && <div style={{ fontFamily: F.mono, fontSize: 11, color: C.red, lineHeight: 1.6 }}>⚠ {loadError}</div>}
      {!loading && systemDesign && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color={C.blue}>v{systemDesign.version}</Tag>
            <Tag color={C.accent}>{systemDesign.dataBoundary.currentMode}</Tag>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <Lbl>What The System Does</Lbl>
              <p style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.65, margin: "0 0 12px" }}>{systemDesign.interactionGuide.overview}</p>
              <SectionBullets items={systemDesign.systemInstruction.capabilities} color={C.green} />
            </Card>
            <Card style={{ padding: 16 }} hl={C.red}>
              <Lbl>What It Refuses</Lbl>
              <SectionBullets items={systemDesign.systemInstruction.refusals} color={C.red} />
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <Lbl>How To Use It</Lbl>
              <SectionBullets items={systemDesign.interactionGuide.steps} color={C.blue} />
            </Card>
            <Card style={{ padding: 16 }}>
              <Lbl>Human Review Checkpoints</Lbl>
              <SectionBullets items={systemDesign.interactionGuide.reviewCheckpoints} color={C.accent} />
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <Lbl>Required Inputs</Lbl>
              <SectionBullets items={systemDesign.inputTemplate.requiredFields.map((field) => `${field.field} (${field.type}) — ${field.description}`)} color={C.green} />
              <div style={{ marginTop: 12, fontFamily: F.mono, fontSize: 10, color: C.muted }}>Validation rules</div>
              <SectionBullets items={systemDesign.inputTemplate.validationRules} color={C.blue} />
            </Card>
            <Card style={{ padding: 16 }}>
              <Lbl>Output Schema</Lbl>
              <SectionBullets items={systemDesign.outputSchemaSummary.stages.map((stage) => `${stage.label}: ${stage.requiredTopLevelFields.join(", ")}`)} color={C.accent} />
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <Lbl>Workflow</Lbl>
              <SectionBullets items={systemDesign.workflow.steps.map((step) => `${step.label}: ${step.description}`)} color={C.blue} />
            </Card>
            <Card style={{ padding: 16 }}>
              <Lbl>Data Boundary</Lbl>
              <SectionBullets items={systemDesign.dataBoundary.whyIncluded} color={C.green} />
              <div style={{ marginTop: 12, fontFamily: F.mono, fontSize: 10, color: C.muted }}>Cannot answer from current sources</div>
              <SectionBullets items={systemDesign.dataBoundary.cannotAnswer} color={C.red} />
            </Card>
          </div>

          <Card style={{ padding: 16 }}>
            <Lbl>Structured Input Example</Lbl>
            <pre style={{ margin: 0, padding: 16, background: "#050810", border: `1px solid ${C.border}`, borderRadius: 6, overflowX: "auto", fontFamily: F.mono, fontSize: 11, lineHeight: 1.6, color: C.text }}>{JSON.stringify(systemDesign.inputTemplate.sample, null, 2)}</pre>
          </Card>
        </div>
      )}
    </Card>
  );
}

function InputPanel({ portfolio, setPortfolio, onRun, error, onLoadDemo, onOpenLatest, historyCount, marketContext, marketContextLoading, marketContextError, onRefreshMarketContext, accessContext }) {
  const total = portfolio.allocations.reduce((s, a) => s + (Number(a.weight) || 0), 0);
  const valid = Math.abs(total - 100) < 0.5;
  const inp = { background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "6px 10px", borderRadius: 4, width: "100%" };
  const addRow = () => setPortfolio((p) => ({ ...p, allocations: [...p.allocations, { assetClass: ASSET_CLASSES[0], weight: 0, region: "Global" }] }));
  const removeRow = (i) => setPortfolio((p) => ({ ...p, allocations: p.allocations.filter((_, idx) => idx !== i) }));
  const updateRow = (i, f, v) => setPortfolio((p) => { const a = [...p.allocations]; a[i] = { ...a[i], [f]: f === "weight" ? Number(v) : v }; return { ...p, allocations: a }; });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <Lbl>Asset Allocation</Lbl>
            <h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 600, margin: 0 }}>Portfolio Construction</h2>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 12, padding: "5px 13px", borderRadius: 4, background: valid ? C.green + "18" : C.red + "18", border: `1px solid ${valid ? C.green + "50" : C.red + "50"}`, color: valid ? C.green : C.red }}>{total.toFixed(1)}% / 100%</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Lbl>Portfolio Label</Lbl>
          <input value={portfolio.name} onChange={(e) => setPortfolio((p) => ({ ...p, name: e.target.value }))} style={inp} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Asset Class", "Weight %", "Region / Focus", ""].map((h) => (<th key={h} style={{ padding: "6px 8px", textAlign: "left", fontFamily: F.mono, fontSize: 9, letterSpacing: 2, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {portfolio.allocations.map((row, i) => (
              <tr key={`${row.assetClass}-${i}`} style={{ borderBottom: `1px solid ${C.border}22` }}>
                <td style={{ padding: "5px 8px" }}><select value={row.assetClass} onChange={(e) => updateRow(i, "assetClass", e.target.value)} style={{ ...inp, padding: "4px 6px", fontSize: 11 }}>{ASSET_CLASSES.map((a) => <option key={a}>{a}</option>)}</select></td>
                <td style={{ padding: "5px 8px" }}><input type="number" min="0" max="100" step="1" value={row.weight} onChange={(e) => updateRow(i, "weight", e.target.value)} style={{ ...inp, width: 64, textAlign: "right" }} /></td>
                <td style={{ padding: "5px 8px" }}><input value={row.region} onChange={(e) => updateRow(i, "region", e.target.value)} style={{ ...inp, width: 130, fontSize: 11 }} /></td>
                <td style={{ padding: "5px 4px" }}><button onClick={() => removeRow(i)} style={{ background: "transparent", border: "none", color: C.red + "70", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} style={{ marginTop: 12, background: "transparent", border: `1px dashed ${C.border}`, color: C.muted, padding: "7px 12px", borderRadius: 4, cursor: "pointer", fontFamily: F.mono, fontSize: 11, width: "100%" }}>+ Add Asset Class</button>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Lbl>Portfolio Parameters</Lbl>
          <div style={{ marginBottom: 13 }}><Lbl>Duration (years)</Lbl><input type="number" min="0" max="30" step="0.25" value={portfolio.duration} onChange={(e) => setPortfolio((p) => ({ ...p, duration: +e.target.value }))} style={inp} /></div>
          <div style={{ marginBottom: 13 }}><Lbl>Leverage Ratio</Lbl><input type="number" min="1" max="5" step="0.1" value={portfolio.leverage} onChange={(e) => setPortfolio((p) => ({ ...p, leverage: +e.target.value }))} style={inp} /><div style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, marginTop: 3 }}>1.0 = unlevered</div></div>
          <div style={{ marginBottom: 13 }}><Lbl>Liquidity Profile</Lbl><select value={portfolio.liquidityProfile} onChange={(e) => setPortfolio((p) => ({ ...p, liquidityProfile: e.target.value }))} style={{ ...inp, fontSize: 11 }}>{LIQUIDITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select></div>
          <div><Lbl>Investment Constraints</Lbl><textarea rows={3} value={portfolio.constraints} onChange={(e) => setPortfolio((p) => ({ ...p, constraints: e.target.value }))} placeholder="ESG mandates, drawdown floors, no-short rules..." style={{ ...inp, resize: "vertical" }} /></div>
        </Card>

        <Card>
          <Lbl>Governance Coverage</Lbl>
          <SectionBullets items={["Live analysis saves into a local audit trail", "Review workflow supports validation and escalation overrides", "Committee memo is editable and exportable", "Historical analogs and rationale summaries are preserved per scenario"]} color={C.blue} />
        </Card>

        <AccessContextCard accessContext={accessContext} />

        <MarketContextCard
          marketContext={marketContext}
          loading={marketContextLoading}
          loadError={marketContextError}
          onRefresh={onRefreshMarketContext}
        />

        {error && <div style={{ background: C.red + "15", border: `1px solid ${C.red}40`, borderRadius: 6, padding: "12px 14px", color: C.red, fontFamily: F.mono, fontSize: 11, lineHeight: 1.6 }}>⚠ {error}</div>}

        <button onClick={onRun} disabled={!valid} style={{ background: valid ? C.accent : C.border, border: "none", color: valid ? "#020509" : C.muted, padding: "14px 18px", borderRadius: 6, cursor: valid ? "pointer" : "not-allowed", fontFamily: F.mono, fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>◈ RUN REGIME ANALYSIS</button>
        <button onClick={onLoadDemo} style={{ background: "transparent", border: `1px solid ${C.blue}55`, color: C.blue, padding: "12px 18px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 11, letterSpacing: 1.2 }}>LOAD PROPOSAL DEMO ANALYSIS</button>
        {historyCount > 0 && <button onClick={onOpenLatest} style={{ background: "transparent", border: `1px solid ${C.borderBright}`, color: C.text, padding: "12px 18px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 11, letterSpacing: 1.2 }}>OPEN LATEST SAVED ANALYSIS ({historyCount})</button>}
      </div>
    </div>
  );
}

function ExposureTab({ data }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <Lbl>Stage 1 Output</Lbl>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 600, margin: "0 0 10px", color: C.text }}>Macro Factor Exposure Map</h3>
        <p style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 18px", lineHeight: 1.6 }}>{data.analysisSummary}</p>
        {Object.entries(data.exposureMap || {}).map(([k, v]) => (
          <ExposureBar key={k} label={EXP_LABELS[k] || k} score={v.score || 0} drivers={v.drivers} interpretation={v.interpretation} />
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Lbl>Dominant Exposures</Lbl>
          <SectionBullets items={data.dominantExposures} />
        </Card>
        <Card hl={C.accent}>
          <Lbl>Hidden Concentrations</Lbl>
          <SectionBullets items={data.hiddenConcentrations} />
        </Card>
      </div>
    </div>
  );
}

function RegimeTab({ assessment }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Lbl>Stage 2 Summary</Lbl>
        <p style={{ fontFamily: F.serif, fontSize: 15, margin: 0, lineHeight: 1.65 }}>{assessment.regimeSetSummary}</p>
      </Card>
      {(assessment.regimes || []).map((r, i) => (
        <Card key={r.id || i}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 2 }}>REGIME {i + 1}</span>
            <ProbBadge val={r.probability} />
            <Tag color={C.blue}>{r.scenarioType}</Tag>
            <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 7px" }}>{r.timeHorizon}</span>
          </div>
          <h3 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, margin: "0 0 14px", color: C.text }}>{r.name}</h3>
          <div style={{ padding: "10px 14px", background: "#040710", borderRadius: 6, borderLeft: `3px solid ${C.accent}`, marginBottom: 14 }}>
            <Lbl>Trigger</Lbl>
            <p style={{ fontFamily: F.serif, fontSize: 15, margin: 0, lineHeight: 1.6 }}>{r.trigger}</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Rationale Summary</Lbl>
            <p style={{ fontFamily: F.serif, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{r.rationaleSummary}</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Transmission Mechanisms</Lbl>
            <SectionBullets items={r.transmissionMechanisms} color={C.blue} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Asset Class Impact Matrix</Lbl>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {[["Equity", r.equityImpact], ["Fixed Inc.", r.fixedIncomeImpact], ["Private", r.privateMarketsImpact], ["Credit", r.creditImpact], ["Real Assets", r.realAssetsImpact]].map(([l, imp]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, marginBottom: 5 }}>{l}</div>
                  <ImpactBadge val={imp || "Neutral"} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <Card style={{ padding: 14 }}>
              <Lbl>Historical Analogy</Lbl>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: F.serif, fontSize: 16 }}>{r.historicalAnalogy.episode}</span>
                <ScorePill v={r.historicalAnalogy.matchScore} max={100} />
              </div>
              <Lbl>Parallels</Lbl>
              <SectionBullets items={r.historicalAnalogy.parallels} color={C.green} />
              <Lbl>Differences</Lbl>
              <SectionBullets items={r.historicalAnalogy.differences} color={C.orange} />
            </Card>
            <Card hl={C.red} style={{ padding: 14 }}>
              <Lbl>Key Risk</Lbl>
              <p style={{ fontFamily: F.serif, fontSize: 15, margin: 0, lineHeight: 1.6 }}>{r.keyRisk}</p>
            </Card>
          </div>
        </Card>
      ))}
    </div>
  );
}

function VulnTab({ assessment }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Lbl>Stage 3 Summary</Lbl>
        <p style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px", lineHeight: 1.6 }}>{assessment.analysisSummary}</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Regime", "Est. Drawdown", "Vuln Score", "Liquidity Stress", "Primary Vulnerability"].map((h) => (<th key={h} style={{ padding: "7px 10px", textAlign: "left", fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {(assessment.vulnerabilities || []).map((v, i) => (
              <tr key={`${v.regimeId}-${i}`} style={{ borderBottom: `1px solid ${C.border}18` }}>
                <td style={{ padding: "11px 10px", fontFamily: F.serif, fontSize: 15, fontWeight: 600 }}>{v.regimeName}</td>
                <td style={{ padding: "11px 10px", fontFamily: F.mono, fontSize: 12, color: C.red }}>{v.estimatedDrawdown}</td>
                <td style={{ padding: "11px 10px" }}><ScorePill v={v.vulnerabilityScore || 0} /></td>
                <td style={{ padding: "11px 10px" }}><LiqBadge val={v.liquidityStress} /></td>
                <td style={{ padding: "11px 10px", fontFamily: F.serif, fontSize: 13, color: C.text, opacity: 0.8 }}>{v.primaryVulnerability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {(assessment.vulnerabilities || []).map((v, i) => (
          <Card key={`${v.regimeId}-${i}`}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>REGIME {i + 1}</div>
            <h4 style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>{v.regimeName}</h4>
            <p style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>{v.reasoningSummary}</p>
            <Lbl>First-Order Effects</Lbl>
            <SectionBullets items={v.firstOrderEffects} color={C.red} />
            <Lbl>Second-Order Effects</Lbl>
            <SectionBullets items={v.secondOrderEffects} color={C.accent} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChecklistRow({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontFamily: F.serif, fontSize: 14, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function AuditTrail({ events, title = "Audit Trail" }) {
  return (
    <Card>
      <Lbl>{title}</Lbl>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(events || []).length === 0 && <div style={{ fontFamily: F.serif, fontSize: 14, color: C.muted }}>No audit entries yet.</div>}
        {(events || []).map((event) => (
          <div key={event.id} style={{ paddingBottom: 12, borderBottom: `1px solid ${C.border}33` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 4 }}>
              <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 1.4, color: C.accent }}>{event.type}</span>
              <span style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>{formatDateTime(event.timestamp)}</span>
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 14, color: C.text, lineHeight: 1.5 }}>{event.message}</div>
            <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 10, color: C.muted }}>Actor: {event.actor}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GovernanceTab({ gov, reviewDraft, onReviewChange, onSaveReview, onExportAudit, auditTrail }) {
  if (!gov) return null;
  const reviewColor = getReviewStatusColor(reviewDraft.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <Lbl>Regime Confidence Index (RCI)</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Gauge score={gov.rci?.score} label={gov.rci?.label} />
            <div>
              <p style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 8px", lineHeight: 1.5 }}>{gov.rci?.rationale}</p>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>Uncertainty Band: <span style={{ color: C.text }}>{gov.rci?.uncertaintyBand}</span></div>
            </div>
          </div>
        </Card>
        <Card>
          <Lbl>Liquidity Compression Index (LCI)</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Gauge score={gov.lci?.score} label={gov.lci?.label} />
            <div>
              <p style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 8px", lineHeight: 1.5 }}>{gov.lci?.rationale}</p>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>Forced Selling Risk: <span style={{ color: C.text }}>{gov.lci?.forcedSellingRisk}</span></div>
            </div>
          </div>
        </Card>
      </div>

      <EscBanner level={gov.escalationLevel} label={gov.escalationLabel} rationale={gov.escalationRationale} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Card hl={C.accent}>
          <Lbl>Escalation Triggers</Lbl>
          <SectionBullets items={gov.escalationTriggers} />
        </Card>
        <Card>
          <Lbl>Governance Actions</Lbl>
          <SectionBullets items={gov.governanceActions} color={C.green} />
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <Lbl>Key Watch Items</Lbl>
            {(gov.keyWatchItems || []).map((w, i) => (
              <div key={`${w}-${i}`} style={{ fontFamily: F.mono, fontSize: 11, color: C.text, padding: "5px 9px", background: "#040710", borderRadius: 4, marginBottom: 6 }}>◎ {w}</div>
            ))}
          </Card>
          <Card hl={C.red}>
            <Lbl>Adversarial Counter-Scenario</Lbl>
            <p style={{ fontFamily: F.serif, fontSize: 14, margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>{gov.counterScenario}</p>
          </Card>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <Lbl>Decision Context</Lbl>
          <p style={{ fontFamily: F.serif, fontSize: 15, margin: "0 0 16px", lineHeight: 1.6 }}>{gov.decisionContext}</p>
          <Lbl>Human Validation Checks</Lbl>
          <SectionBullets items={gov.humanValidationChecks} color={C.blue} />
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <Lbl>Human Review Workflow</Lbl>
              <StatusPill label={reviewDraft.status} color={reviewColor} />
            </div>
            <button onClick={onExportAudit} style={{ background: "transparent", border: `1px solid ${C.borderBright}`, color: C.text, padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10 }}>EXPORT AUDIT LOG</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Reviewer</Lbl>
            <input value={reviewDraft.reviewer} onChange={(e) => onReviewChange("reviewer", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "8px 10px", borderRadius: 4 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>Status</Lbl>
              <select value={reviewDraft.status} onChange={(e) => onReviewChange("status", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "8px 10px", borderRadius: 4 }}>{REVIEW_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
            </div>
            <div>
              <Lbl>Escalation Override</Lbl>
              <select value={reviewDraft.escalationOverride} onChange={(e) => onReviewChange("escalationOverride", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "8px 10px", borderRadius: 4 }}>{ESCALATION_OVERRIDES.map((option) => <option key={option} value={option}>{option || "None"}</option>)}</select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Override Reason</Lbl>
            <textarea rows={2} value={reviewDraft.escalationOverrideReason} onChange={(e) => onReviewChange("escalationOverrideReason", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "8px 10px", borderRadius: 4, resize: "vertical" }} />
            <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 10, color: C.muted }}>Required when an escalation override is selected.</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Validation Checklist</Lbl>
            <ChecklistRow label="Structural validity reviewed" checked={reviewDraft.checklist.structuralValidity} onChange={(checked) => onReviewChange("checklist", { ...reviewDraft.checklist, structuralValidity: checked })} />
            <ChecklistRow label="Scenario diversity confirmed" checked={reviewDraft.checklist.scenarioDiversity} onChange={(checked) => onReviewChange("checklist", { ...reviewDraft.checklist, scenarioDiversity: checked })} />
            <ChecklistRow label="Liquidity fragility assessed" checked={reviewDraft.checklist.liquidityFragility} onChange={(checked) => onReviewChange("checklist", { ...reviewDraft.checklist, liquidityFragility: checked })} />
            <ChecklistRow label="Governance communication ready" checked={reviewDraft.checklist.governanceCommunication} onChange={(checked) => onReviewChange("checklist", { ...reviewDraft.checklist, governanceCommunication: checked })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Reviewer Notes</Lbl>
            <textarea rows={4} value={reviewDraft.notes} onChange={(e) => onReviewChange("notes", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "8px 10px", borderRadius: 4, resize: "vertical" }} />
          </div>
          <button onClick={onSaveReview} style={{ background: C.accent, border: "none", color: "#020509", padding: "12px 14px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, width: "100%" }}>SAVE REVIEW DECISION</button>
        </Card>
      </div>

      <AuditTrail events={auditTrail.slice(0, 6)} title="Recent Audit Events" />
    </div>
  );
}

function MemoTab({
  memoDraft,
  onMemoChange,
  onSaveMemo,
  onRegenerateMemo,
  onExportMarkdown,
  onExportPdf,
  reviewDraft,
  analysisMeta,
  accessContext,
  memoUiState,
}) {
  const statusColorMap = {
    idle: C.muted,
    working: C.blue,
    success: C.green,
    error: C.red,
  };
  const saveDisabled = memoUiState.saveState === "working";
  const regenerateDisabled = memoUiState.regenerateState === "working";
  const exportMarkdownDisabled = memoUiState.exportState.markdown === "working";
  const exportPdfDisabled = memoUiState.exportState.pdf === "working";
  const helperColor = statusColorMap[memoUiState.lastMessageTone] || C.muted;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
          <div>
            <Lbl>Committee Memo</Lbl>
            <input value={memoDraft.title} onChange={(e) => onMemoChange("title", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.serif, fontSize: 22, padding: "8px 10px", borderRadius: 4 }} />
          </div>
          <StatusPill label={memoDraft.status} color={getReviewStatusColor(reviewDraft.status)} />
        </div>
        <textarea rows={28} value={memoDraft.content} onChange={(e) => onMemoChange("content", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "10px 12px", borderRadius: 4, resize: "vertical", lineHeight: 1.6 }} />
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Lbl>Memo Controls</Lbl>
          <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 6, background: `${helperColor}14`, border: `1px solid ${helperColor}35` }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: helperColor, marginBottom: memoUiState.lastSavedAt ? 4 : 0 }}>
              {memoUiState.lastMessage || "Markdown remains the editable working memo. PDF export uses the structured analysis and review state for committee-ready formatting."}
            </div>
            {memoUiState.lastSavedAt && (
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>
                Last memo update: {formatDateTime(memoUiState.lastSavedAt)}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <Lbl>Status</Lbl>
            <select value={memoDraft.status} onChange={(e) => onMemoChange("status", e.target.value)} style={{ width: "100%", background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "8px 10px", borderRadius: 4 }}>
              {["Draft", "Ready for Committee", "Sent to Committee"].map((status) => <option key={status}>{status}</option>)}
            </select>
            <div style={{ marginTop: 4, fontFamily: F.mono, fontSize: 10, color: C.muted }}>Committee-ready memo states require a review status of Validated or Escalated.</div>
          </div>
          <button onClick={onSaveMemo} disabled={saveDisabled} style={{ background: C.accent, border: "none", color: "#020509", padding: "12px 14px", borderRadius: 6, cursor: saveDisabled ? "wait" : "pointer", fontFamily: F.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, width: "100%", marginBottom: 10, opacity: saveDisabled ? 0.8 : 1 }}>{memoUiState.saveState === "working" ? "SAVING MEMO..." : memoUiState.saveState === "success" ? "MEMO SAVED" : "SAVE MEMO"}</button>
          <button onClick={onRegenerateMemo} disabled={regenerateDisabled} style={{ background: "transparent", border: `1px solid ${C.borderBright}`, color: C.text, padding: "12px 14px", borderRadius: 6, cursor: regenerateDisabled ? "wait" : "pointer", fontFamily: F.mono, fontSize: 11, letterSpacing: 1.2, width: "100%", marginBottom: 10, opacity: regenerateDisabled ? 0.8 : 1 }}>{memoUiState.regenerateState === "working" ? "REGENERATING..." : memoUiState.regenerateState === "success" ? "MEMO REGENERATED" : "REGENERATE FROM ANALYSIS"}</button>
          <button onClick={onExportPdf} disabled={exportPdfDisabled} style={{ background: "transparent", border: `1px solid ${C.green}55`, color: C.green, padding: "12px 14px", borderRadius: 6, cursor: exportPdfDisabled ? "wait" : "pointer", fontFamily: F.mono, fontSize: 11, letterSpacing: 1.2, width: "100%", marginBottom: 10, opacity: exportPdfDisabled ? 0.8 : 1 }}>{memoUiState.exportState.pdf === "working" ? "PREPARING PDF..." : memoUiState.exportState.pdf === "success" ? "PDF EXPORT READY" : "EXPORT PDF"}</button>
          <button onClick={onExportMarkdown} disabled={exportMarkdownDisabled} style={{ background: "transparent", border: `1px solid ${C.blue}55`, color: C.blue, padding: "12px 14px", borderRadius: 6, cursor: exportMarkdownDisabled ? "wait" : "pointer", fontFamily: F.mono, fontSize: 11, letterSpacing: 1.2, width: "100%", opacity: exportMarkdownDisabled ? 0.8 : 1 }}>{memoUiState.exportState.markdown === "working" ? "EXPORTING MARKDOWN..." : memoUiState.exportState.markdown === "success" ? "MARKDOWN EXPORTED" : "EXPORT MARKDOWN"}</button>
          <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
            {accessContext.mode === "local-demo"
              ? "PDF export opens a print dialog for browser-local save-as-PDF."
              : "PDF export uses the committee-ready renderer aligned to the target enterprise memo format."}
          </div>
        </Card>
        <Card>
          <Lbl>Metadata</Lbl>
          <div style={{ fontFamily: F.mono, fontSize: 11, lineHeight: 1.8, color: C.text }}>
            <div>Workspace: {accessContext.displayLabel}</div>
            <div>Identity: {accessContext.identityStatus}</div>
            <div>Provider: {analysisMeta.provider}</div>
            <div>Mode: {analysisMeta.mode}</div>
            <div>Model: {analysisMeta.modelLabel}</div>
            <div>Prompt Version: {analysisMeta.promptVersion}</div>
            <div>Schema Version: {analysisMeta.schemaVersion}</div>
            <div>System Design: {analysisMeta.systemDesignVersion || "Not recorded"}</div>
            <div>Intake Classification: {analysisMeta.intakeClassification?.classificationSummary || "Not recorded"}</div>
            <div>Data As Of: {formatShortDate(analysisMeta.dataAsOf)}</div>
            <div>Data Sources: {(analysisMeta.dataSources || []).join(", ") || "Not recorded"}</div>
          </div>
        </Card>
        {analysisMeta.intakeClassification && (
          <Card>
            <Lbl>Intake Classification</Lbl>
            <div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{analysisMeta.intakeClassification.classificationSummary}</div>
            <SectionBullets items={analysisMeta.intakeClassification.concentrationFlags} color={C.blue} />
          </Card>
        )}
        {analysisMeta.marketSummary && <Card><Lbl>Market Summary</Lbl><div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.6 }}>{analysisMeta.marketSummary}</div></Card>}
        <Card>
          <Lbl>Review Snapshot</Lbl>
          <SectionBullets items={[
            `Reviewer: ${reviewDraft.reviewer || "Unassigned"}`,
            `Status: ${reviewDraft.status}`,
            `Reviewed: ${reviewDraft.reviewedAt ? formatDateTime(reviewDraft.reviewedAt) : "Pending"}`,
            `Override: ${reviewDraft.escalationOverride || "None"}`,
          ]} color={C.green} />
        </Card>
      </div>
    </div>
  );
}

function HistoryTab({ history, currentRecordId, onOpenRecord, onOpenAnalysis, onLoadDemo, onArchiveRecord, accessContext }) {
  const [showArchived, setShowArchived] = useState(false);
  const visibleHistory = showArchived ? history : history.filter((record) => !record.archivedAt);
  const archivedCount = history.filter((record) => record.archivedAt).length;
  const selected = visibleHistory.find((record) => record.id === currentRecordId) || visibleHistory[0] || null;
  const selectedPrimaryVulnerability = selected ? getPrimaryVulnerability(selected.results.vulnerabilities || []) : null;
  const selectedTopExposures = selected ? getTopExposureSummaries(selected.results.exposures?.exposureMap || {}) : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
      <Card style={{ maxHeight: 780, overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <Lbl>Saved Analyses</Lbl>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>Record library for the current {accessContext.mode === "local-demo" ? "browser workspace" : "workspace scope"}.</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {archivedCount > 0 && (
              <button onClick={() => setShowArchived((current) => !current)} style={{ background: showArchived ? `${C.orange}18` : "transparent", border: `1px solid ${C.orange}55`, color: C.orange, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10 }}>
                {showArchived ? "HIDE ARCHIVED" : `SHOW ARCHIVED (${archivedCount})`}
              </button>
            )}
            <button onClick={onLoadDemo} style={{ background: "transparent", border: `1px solid ${C.blue}55`, color: C.blue, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10 }}>LOAD DEMO</button>
          </div>
        </div>
        {!visibleHistory.length && !history.length && <div style={{ fontFamily: F.serif, fontSize: 14, color: C.muted }}>No saved analyses yet. Run a live scan or load the demo analysis.</div>}
        {!visibleHistory.length && history.length > 0 && <div style={{ fontFamily: F.serif, fontSize: 14, color: C.muted }}>All saved analyses are archived. Toggle archived records to inspect them.</div>}
        {visibleHistory.map((record) => {
          const active = record.id === currentRecordId;
          const reviewColor = getReviewStatusColor(record.review.status);
          return (
            <button key={record.id} onClick={() => onOpenRecord(record.id)} style={{ width: "100%", textAlign: "left", background: active ? C.border + "50" : "transparent", border: `1px solid ${active ? C.accent : C.border}55`, borderRadius: 8, padding: 14, marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontFamily: F.serif, fontSize: 16, color: C.text }}>{record.title}</div>
                <Tag color={getModeColor(record.analysisMeta.mode)}>{record.analysisMeta.mode}</Tag>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <StatusPill label={record.review.status} color={reviewColor} />
                <StatusPill label={`L${record.results.governance.escalationLevel}`} color={getReviewStatusColor(record.review.status)} />
                {record.archivedAt && <StatusPill label="ARCHIVED" color={C.orange} />}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, lineHeight: 1.8 }}>
                <div>{formatDateTime(record.updatedAt)}</div>
                <div>{record.analysisMeta.modelLabel}</div>
                <div>{record.analysisMeta.accessContext?.displayLabel || accessContext.displayLabel}</div>
              </div>
            </button>
          );
        })}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {selected ? (
          <>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
                <div>
                  <Lbl>Selected Analysis</Lbl>
                  <h3 style={{ fontFamily: F.serif, fontSize: 22, margin: 0 }}>{selected.title}</h3>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "flex-start" }}>
                  <button onClick={() => onOpenAnalysis(selected.id)} style={{ background: "transparent", border: `1px solid ${C.green}55`, color: C.green, padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10, letterSpacing: 1 }}>
                    OPEN FULL ANALYSIS
                  </button>
                  <button onClick={() => onArchiveRecord(selected.id)} style={{ background: "transparent", border: `1px solid ${C.orange}55`, color: C.orange, padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10, letterSpacing: 1 }}>
                    {getArchiveActionLabel(accessContext)}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-start" }}>
                <Tag color={getModeColor(selected.analysisMeta.mode)}>{selected.analysisMeta.mode}</Tag>
                <Tag color={C.accent}>{selected.analysisMeta.modelLabel}</Tag>
                <Tag color={getReviewStatusColor(selected.review.status)}>{selected.review.status}</Tag>
                {selected.archivedAt && <Tag color={C.orange}>Archived {formatShortDate(selected.archivedAt)}</Tag>}
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Lbl>Overview</Lbl>
                <div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.75 }}>
                  <div>Saved: {formatDateTime(selected.updatedAt)}</div>
                  <div>Workspace: {selected.analysisMeta.accessContext?.displayLabel || accessContext.displayLabel}</div>
                  <div>Identity: {selected.analysisMeta.accessContext?.identityStatus || accessContext.identityStatus}</div>
                  <div>Review Status: {selected.review.status}</div>
                  <div>Escalation: Level {selected.results.governance.escalationLevel} - {selected.results.governance.escalationLabel}</div>
                  <div>Data As Of: {formatShortDate(selected.analysisMeta.dataAsOf)}</div>
                  <div>Data Sources: {(selected.analysisMeta.dataSources || []).join(", ") || "Not recorded"}</div>
                </div>
              </Card>
              <Card>
                <Lbl>Review Snapshot</Lbl>
                <div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.75 }}>
                  <div>Reviewer: {selected.review.reviewer || "Unassigned"}</div>
                  <div>Memo Status: {selected.memo.status}</div>
                  <div>Reviewed At: {selected.review.reviewedAt ? formatDateTime(selected.review.reviewedAt) : "Pending"}</div>
                  <div>Override: {selected.review.escalationOverride || "None"}</div>
                  <div>Override Reason: {selected.review.escalationOverrideReason || "Not recorded"}</div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Lbl>Checklist</Lbl>
                  <SectionBullets items={[
                    `Structural validity: ${selected.review.checklist.structuralValidity ? "Complete" : "Pending"}`,
                    `Scenario diversity: ${selected.review.checklist.scenarioDiversity ? "Complete" : "Pending"}`,
                    `Liquidity fragility: ${selected.review.checklist.liquidityFragility ? "Complete" : "Pending"}`,
                    `Governance communication: ${selected.review.checklist.governanceCommunication ? "Complete" : "Pending"}`,
                  ]} color={C.green} />
                </div>
              </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <Lbl>Portfolio Snapshot</Lbl>
                <div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.75, marginBottom: 12 }}>
                  <div>Name: {selected.portfolio.name}</div>
                  <div>Duration: {selected.portfolio.duration} years</div>
                  <div>Leverage: {selected.portfolio.leverage}x</div>
                  <div>Liquidity: {selected.portfolio.liquidityProfile}</div>
                  <div>Constraints: {selected.portfolio.constraints}</div>
                  <div>Classification: {selected.analysisMeta.intakeClassification?.classificationSummary || "Not recorded"}</div>
                </div>
                <Lbl>Allocations</Lbl>
                <SectionBullets items={(selected.portfolio.allocations || []).map((row) => `${row.assetClass} — ${row.weight}% — ${row.region}`)} color={C.blue} />
              </Card>
              <Card>
                <Lbl>Analysis Snapshot</Lbl>
                <div style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.75, marginBottom: 12 }}>
                  <div>RCI / LCI: {selected.results.governance.rci.score} / {selected.results.governance.lci.score}</div>
                  <div>Primary Vulnerability: {selectedPrimaryVulnerability?.primaryVulnerability || "Not recorded"}</div>
                  <div>Top Scenario: {selected.results.regimes?.[0]?.name || "Not recorded"}</div>
                  <div>Market Summary: {selected.analysisMeta.marketSummary || "Not recorded"}</div>
                </div>
                <Lbl>Top Exposures</Lbl>
                <SectionBullets items={selectedTopExposures.map((exposure) => `${exposure.label}: ${exposure.score}/10 — ${exposure.interpretation}`)} color={C.accent} />
                <Lbl>Scenario Names</Lbl>
                <SectionBullets items={(selected.results.regimes || []).map((regime) => `${regime.name} (${regime.probability}, ${regime.timeHorizon})`)} color={C.green} />
              </Card>
            </div>
            <AuditTrail events={selected.auditTrail} />
          </>
        ) : (
          <Card><Lbl>Selected Analysis</Lbl><div style={{ fontFamily: F.serif, fontSize: 14, color: C.muted }}>Choose an analysis on the left to inspect its overview, portfolio snapshot, review state, and audit trail.</div></Card>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${C.bg}}select,input,textarea{outline:none!important}button{transition:all 0.2s ease}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${C.surface}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`;
    document.head.appendChild(s);
    setTodayLabel(new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }));
    return () => document.head.removeChild(s);
  }, []);

  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [stage, setStage] = useState("input");
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [reviewDraft, setReviewDraft] = useState({
    reviewer: "",
    status: "Pending Review",
    notes: "",
    escalationOverride: "",
    escalationOverrideReason: "",
    reviewedAt: null,
    checklist: {
      structuralValidity: false,
      scenarioDiversity: false,
      liquidityFragility: false,
      governanceCommunication: false,
    },
  });
  const [memoDraft, setMemoDraft] = useState({
    title: "",
    content: "",
    status: "Draft",
    updatedAt: null,
  });
  const [memoUiState, setMemoUiState] = useState(DEFAULT_MEMO_ACTION_STATE);
  const [marketContext, setMarketContext] = useState(null);
  const [marketContextLoading, setMarketContextLoading] = useState(true);
  const [marketContextError, setMarketContextError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [systemDesign, setSystemDesign] = useState(null);
  const [systemDesignLoading, setSystemDesignLoading] = useState(SYSTEM_GUIDE_ENABLED);
  const [systemDesignError, setSystemDesignError] = useState(null);

  useEffect(() => {
    const stored = loadAnalysisHistory();
    setHistory(stored);
  }, []);

  const loadMarketContext = useCallback(async () => {
    setMarketContextLoading(true);
    setMarketContextError(null);
    try {
      const context = await fetchMarketContext();
      setMarketContext(context);
    } catch (nextError) {
      setMarketContextError(nextError.message);
    } finally {
      setMarketContextLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketContext();
  }, [loadMarketContext]);

  useEffect(() => {
    if (!SYSTEM_GUIDE_ENABLED) {
      setSystemDesignLoading(false);
      return;
    }

    let active = true;

    async function loadSystemDesign() {
      setSystemDesignLoading(true);
      setSystemDesignError(null);
      try {
        const nextSystemDesign = await fetchSystemDesign();
        if (active) setSystemDesign(nextSystemDesign);
      } catch (nextError) {
        if (active) setSystemDesignError(nextError.message);
      } finally {
        if (active) setSystemDesignLoading(false);
      }
    }

    loadSystemDesign();
    return () => {
      active = false;
    };
  }, []);

  const persistHistory = useCallback((nextHistory) => {
    setHistory(nextHistory);
    saveAnalysisHistory(nextHistory);
  }, []);

  const currentRecord = history.find((record) => record.id === currentRecordId) || null;
  const activeHistory = history.filter((record) => !record.archivedAt);

  useEffect(() => {
    if (!currentRecord) return;
    setReviewDraft(currentRecord.review);
    setMemoDraft(currentRecord.memo);
    setMemoUiState({
      ...DEFAULT_MEMO_ACTION_STATE,
      lastSavedAt: currentRecord.memo?.updatedAt || null,
    });
  }, [currentRecord]);

  const openRecord = useCallback((recordId) => {
    const selected = history.find((record) => record.id === recordId);
    if (!selected) return;
    setCurrentRecordId(recordId);
    setPortfolio(selected.portfolio);
    setStage("results");
    setError(null);
  }, [history]);

  const openAnalysisFromHistory = useCallback((recordId) => {
    openRecord(recordId);
    setTab(0);
  }, [openRecord]);

  const loadDemoAnalysis = useCallback(() => {
    const record = createDemoAnalysisRecord();
    const nextHistory = upsertAnalysisRecord(history, record);
    persistHistory(nextHistory);
    setCurrentRecordId(record.id);
    setPortfolio(record.portfolio);
    setStage("results");
    setTab(0);
    setError(null);
  }, [history, persistHistory]);

  const onRun = useCallback(async () => {
    setError(null);
    setStage("running");
    setStep(0);
    try {
      setStep(1);
      const intakeClassification = buildIntakeClassification(portfolio, marketContext);
      const expResponse = await stage1(portfolio, intakeClassification);
      const exp = expResponse.data;
      setStep(2);
      const regResponse = await stage2(portfolio, exp, intakeClassification);
      const reg = regResponse.data;
      setStep(3);
      const vulnResponse = await stage3(portfolio, reg.regimes || [], intakeClassification);
      const vuln = vulnResponse.data;
      setStep(4);
      const govResponse = await stage4(portfolio, exp, vuln, intakeClassification);
      const gov = govResponse.data;
      const analysisContext = govResponse.analysisContext || vulnResponse.analysisContext || regResponse.analysisContext || expResponse.analysisContext || marketContext;

      const results = {
        exposures: exp,
        regimeAssessment: reg,
        regimes: reg.regimes || [],
        vulnerabilityAssessment: vuln,
        vulnerabilities: vuln.vulnerabilities || [],
        governance: gov,
      };
      const record = createAnalysisRecord({
        portfolio,
        results,
        analysisMeta: {
          ...ANALYSIS_META,
          accessContext: ACCESS_CONTEXT,
          intakeClassification,
          ...(analysisContext || {}),
        },
      });
      const nextHistory = upsertAnalysisRecord(history, record);
      persistHistory(nextHistory);
      setCurrentRecordId(record.id);
      setTab(0);
      setError(null);
      setStage("results");
    } catch (e) {
      setError(e.message);
      setStage("input");
    }
  }, [history, marketContext, persistHistory, portfolio]);

  const updateCurrentRecord = useCallback((updater) => {
    if (!currentRecord) return null;
    const updatedRecord = updater(currentRecord);
    const nextHistory = upsertAnalysisRecord(history, updatedRecord);
    persistHistory(nextHistory);
    setCurrentRecordId(updatedRecord.id);
    return updatedRecord;
  }, [currentRecord, history, persistHistory]);

  const handleReviewChange = useCallback((field, value) => {
    setError(null);
    setReviewDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveReview = useCallback(() => {
    const reviewError = validateReviewDecision(reviewDraft);
    if (reviewError) {
      setError(reviewError);
      return;
    }

    const updated = updateCurrentRecord((record) => updateReviewRecord(record, reviewDraft));
    if (updated) setReviewDraft(updated.review);
    setError(null);
  }, [reviewDraft, updateCurrentRecord]);

  const handleMemoChange = useCallback((field, value) => {
    setError(null);
    setMemoDraft((prev) => ({ ...prev, [field]: value }));
    setMemoUiState((prev) => ({
      ...prev,
      saveState: "idle",
      regenerateState: "idle",
      exportState: { ...prev.exportState, markdown: "idle", pdf: "idle" },
      lastMessage: "",
      lastMessageTone: "muted",
    }));
  }, []);

  const withCurrentDraftRecord = useCallback(() => {
    if (!currentRecord) return null;
    return {
      ...currentRecord,
      review: reviewDraft,
      memo: {
        ...currentRecord.memo,
        ...memoDraft,
      },
      analysisMeta: {
        ...currentRecord.analysisMeta,
        accessContext: currentRecord.analysisMeta.accessContext || ACCESS_CONTEXT,
      },
    };
  }, [currentRecord, memoDraft, reviewDraft]);

  const handleSaveMemo = useCallback(() => {
    setMemoUiState((prev) => ({
      ...prev,
      saveState: "working",
      lastMessage: "Saving memo draft to the local analysis record...",
      lastMessageTone: "working",
    }));
    const memoError = validateMemoStatusChange(memoDraft, reviewDraft);
    if (memoError) {
      setError(memoError);
      setMemoUiState((prev) => ({
        ...prev,
        saveState: "error",
        lastMessage: memoError,
        lastMessageTone: "error",
      }));
      return;
    }

    const actor = reviewDraft.reviewer?.trim() || "Analyst";
    const updated = updateCurrentRecord((record) => updateMemoRecord({ ...record, review: reviewDraft }, memoDraft, actor));
    if (updated) {
      setMemoDraft(updated.memo);
      setMemoUiState((prev) => ({
        ...prev,
        saveState: "success",
        lastSavedAt: updated.memo.updatedAt,
        lastMessage: "Memo saved to the active record library entry.",
        lastMessageTone: "success",
      }));
    }
    setError(null);
  }, [memoDraft, reviewDraft, updateCurrentRecord]);

  const handleRegenerateMemo = useCallback(() => {
    setMemoUiState((prev) => ({
      ...prev,
      regenerateState: "working",
      lastMessage: "Regenerating the working markdown memo from structured analysis outputs...",
      lastMessageTone: "working",
    }));
    const updated = updateCurrentRecord((record) => regenerateMemoRecord({ ...record, review: reviewDraft, memo: memoDraft }));
    if (updated) {
      setMemoDraft(updated.memo);
      setMemoUiState((prev) => ({
        ...prev,
        regenerateState: "success",
        lastSavedAt: updated.memo.updatedAt,
        lastMessage: "Memo regenerated from the current structured analysis.",
        lastMessageTone: "success",
      }));
    }
  }, [memoDraft, reviewDraft, updateCurrentRecord]);

  const handleExportMemoMarkdown = useCallback(() => {
    if (!currentRecord) return;
    setMemoUiState((prev) => ({
      ...prev,
      exportState: { ...prev.exportState, markdown: "working" },
      lastMessage: "Exporting the editable markdown working memo...",
      lastMessageTone: "working",
    }));
    const filename = `${safeFilename(memoDraft.title || currentRecord.title || "committee-memo")}.md`;
    downloadTextFile(filename, memoDraft.content);
    setMemoUiState((prev) => ({
      ...prev,
      exportState: { ...prev.exportState, markdown: "success" },
      lastMessage: `Markdown exported as ${filename}.`,
      lastMessageTone: "success",
    }));
  }, [currentRecord, memoDraft]);

  const handleExportMemoPdf = useCallback(() => {
    const exportRecord = withCurrentDraftRecord();
    if (!exportRecord) return;
    try {
      setMemoUiState((prev) => ({
        ...prev,
        exportState: { ...prev.exportState, pdf: "working" },
        lastMessage: "Opening the committee-ready PDF export dialog...",
        lastMessageTone: "working",
      }));
      exportMemoPdf(exportRecord);
      setMemoUiState((prev) => ({
        ...prev,
        exportState: { ...prev.exportState, pdf: "success" },
        lastMessage: "PDF export prepared. Use the print dialog to save the committee memo as a PDF.",
        lastMessageTone: "success",
      }));
      setError(null);
    } catch (nextError) {
      setError(nextError.message);
      setMemoUiState((prev) => ({
        ...prev,
        exportState: { ...prev.exportState, pdf: "error" },
        lastMessage: nextError.message,
        lastMessageTone: "error",
      }));
    }
  }, [withCurrentDraftRecord]);

  const handleExportAudit = useCallback(() => {
    if (!currentRecord) return;
    const filename = `${safeFilename(currentRecord.title || "audit-log")}-audit.json`;
    downloadTextFile(filename, buildAuditExport(currentRecord), "application/json;charset=utf-8");
  }, [currentRecord]);

  const handleArchiveRecord = useCallback((recordId) => {
    const target = history.find((record) => record.id === recordId);
    if (!target) return;

    const actionLabel = getArchiveActionLabel(ACCESS_CONTEXT).toLowerCase();
    const confirmed = window.confirm(`This will ${actionLabel} for "${target.title}". Continue?`);
    if (!confirmed) return;

    const actor = reviewDraft.reviewer?.trim() || "Analyst";
    const archivedRecord = archiveAnalysisRecord(target, {
      actor,
      reason: ACCESS_CONTEXT.mode === "local-demo"
        ? "Removed from the browser-local workspace."
        : "Archived from the active enterprise record library.",
    });
    const nextHistory = upsertAnalysisRecord(history, archivedRecord);
    persistHistory(nextHistory);

    const nextActive = nextHistory.find((record) => !record.archivedAt);
    if (nextActive) {
      setCurrentRecordId(nextActive.id);
      setPortfolio(nextActive.portfolio);
      setStage("results");
      setTab(5);
    } else {
      setCurrentRecordId(null);
      setStage("input");
      setTab(0);
    }
  }, [history, persistHistory, reviewDraft.reviewer]);

  const TABS = ["Exposure Map", "Regime Scenarios", "Vulnerability Matrix", "Governance", "Committee Memo", "History"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: F.serif, padding: "0 0 60px" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`, backgroundSize: "44px 44px", opacity: 0.35 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 3, color: C.muted, marginBottom: 5 }}>
              {ACCESS_CONTEXT.mode === "local-demo" ? "LOCAL DEMO WORKSPACE · BROWSER-LOCAL" : "ENTERPRISE TARGET OPERATING MODEL"}
            </div>
            <h1 style={{ fontFamily: F.serif, fontSize: 30, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>GenAI Portfolio <span style={{ color: C.accent }}>Regime Risk Engine</span></h1>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color={ACCESS_CONTEXT.mode === "local-demo" ? C.orange : C.blue}>{ACCESS_CONTEXT.displayLabel}</Tag>
              <Tag color={C.accent}>4-stage analytics</Tag>
              <Tag color={C.blue}>audit trail + history</Tag>
              <Tag color={C.green}>human review</Tag>
              <Tag color={C.orange}>committee memo</Tag>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {SYSTEM_GUIDE_ENABLED && (
              <button onClick={() => setShowGuide((current) => !current)} style={{ marginBottom: 10, background: showGuide ? `${C.blue}16` : "transparent", border: `1px solid ${C.blue}55`, color: C.blue, padding: "7px 12px", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10, letterSpacing: 1.1 }}>
                {showGuide ? "HIDE METHOD / GUIDE" : "OPEN METHOD / GUIDE"}
              </button>
            )}
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>{todayLabel || " "}</div>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: C.border, marginTop: 3 }}>{ACCESS_CONTEXT.identityStatus} · v2.0</div>
          </div>
        </div>

        {SYSTEM_GUIDE_ENABLED && (
          <MethodGuidePanel
            open={showGuide}
            onClose={() => setShowGuide(false)}
            systemDesign={systemDesign}
            loading={systemDesignLoading}
            loadError={systemDesignError}
          />
        )}

        {stage === "input" && <InputPanel portfolio={portfolio} setPortfolio={setPortfolio} onRun={onRun} error={error} onLoadDemo={loadDemoAnalysis} onOpenLatest={() => activeHistory[0] && openRecord(activeHistory[0].id)} historyCount={activeHistory.length} marketContext={marketContext} marketContextLoading={marketContextLoading} marketContextError={marketContextError} onRefreshMarketContext={loadMarketContext} accessContext={ACCESS_CONTEXT} />}
        {stage === "running" && <PipeProgress step={step} />}
        {stage === "results" && currentRecord && (
          <div>
            {error && <div style={{ background: C.red + "15", border: `1px solid ${C.red}40`, borderRadius: 6, padding: "12px 14px", color: C.red, fontFamily: F.mono, fontSize: 11, lineHeight: 1.6, marginBottom: 16 }}>⚠ {error}</div>}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <Lbl>Current Analysis</Lbl>
                  <h2 style={{ fontFamily: F.serif, fontSize: 24, margin: "0 0 8px" }}>{currentRecord.title}</h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Tag color={ACCESS_CONTEXT.mode === "local-demo" ? C.orange : C.blue}>{currentRecord.analysisMeta.accessContext?.displayLabel || ACCESS_CONTEXT.displayLabel}</Tag>
                    <Tag color={getModeColor(currentRecord.analysisMeta.mode)}>{currentRecord.analysisMeta.mode}</Tag>
                    <Tag color={C.accent}>{currentRecord.analysisMeta.modelLabel}</Tag>
                    <Tag color={getReviewStatusColor(currentRecord.review.status)}>{currentRecord.review.status}</Tag>
                    <Tag color={C.red}>Escalation L{currentRecord.results.governance.escalationLevel}</Tag>
                    {(currentRecord.analysisMeta.dataSources || []).map((source) => <Tag key={source} color={C.green}>{source}</Tag>)}
                  </div>
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 11, lineHeight: 1.8, color: C.text, textAlign: "right" }}>
                  <div>Saved: {formatDateTime(currentRecord.updatedAt)}</div>
                  <div>Reviewer: {currentRecord.review.reviewer || "Unassigned"}</div>
                  <div>Audit Entries: {currentRecord.auditTrail.length}</div>
                  <div>Market Data: {formatShortDate(currentRecord.analysisMeta.dataAsOf)}</div>
                </div>
              </div>
            </Card>

            <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.border}`, marginBottom: 22, gap: 4, flexWrap: "wrap" }}>
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "10px 18px", marginBottom: -1, fontFamily: F.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: tab === i ? C.accent : C.muted, borderBottom: `2px solid ${tab === i ? C.accent : "transparent"}`, transition: "color 0.2s" }}>{t}</button>
              ))}
              <button onClick={() => { setStage("input"); setError(null); }} style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontFamily: F.mono, fontSize: 9, letterSpacing: 1 }}>← EDIT PORTFOLIO</button>
            </div>

            {tab === 0 && <ExposureTab data={currentRecord.results.exposures} />}
            {tab === 1 && <RegimeTab assessment={currentRecord.results.regimeAssessment} />}
            {tab === 2 && <VulnTab assessment={currentRecord.results.vulnerabilityAssessment} />}
            {tab === 3 && <GovernanceTab gov={currentRecord.results.governance} reviewDraft={reviewDraft} onReviewChange={handleReviewChange} onSaveReview={handleSaveReview} onExportAudit={handleExportAudit} auditTrail={currentRecord.auditTrail} />}
            {tab === 4 && <MemoTab memoDraft={memoDraft} onMemoChange={handleMemoChange} onSaveMemo={handleSaveMemo} onRegenerateMemo={handleRegenerateMemo} onExportMarkdown={handleExportMemoMarkdown} onExportPdf={handleExportMemoPdf} reviewDraft={reviewDraft} analysisMeta={currentRecord.analysisMeta} accessContext={ACCESS_CONTEXT} memoUiState={memoUiState} />}
            {tab === 5 && <HistoryTab history={history} currentRecordId={currentRecordId} onOpenRecord={openRecord} onOpenAnalysis={openAnalysisFromHistory} onLoadDemo={loadDemoAnalysis} onArchiveRecord={handleArchiveRecord} accessContext={ACCESS_CONTEXT} />}
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 1 }}>ADVISORY ONLY · AI OUTPUT REQUIRES EXPERT VALIDATION · NOT INVESTMENT ADVICE</span>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.border }}>
            {ACCESS_CONTEXT.mode === "local-demo"
              ? "Browser-local storage preserves memo drafts, reviews, and history for this workspace only."
              : "This prototype reflects the enterprise target workflow, but still runs with browser-local storage in this build."}
          </span>
        </div>
      </div>
    </div>
  );
}
