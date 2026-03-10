import { useState, useEffect, useCallback } from "react";
import { stage1, stage2, stage3, stage4 } from "./lib/riskAnalysis";

const ASSET_CLASSES = ["Public Equity – Developed Markets","Public Equity – Emerging Markets","Investment Grade Fixed Income","High Yield / Credit","Private Equity","Private Credit","Real Assets / Infrastructure","Hedge Funds / Alternatives","Cash & Equivalents","Commodities"];
const LIQUIDITY_OPTIONS = ["High Liquidity (>80% liquid within 30 days)","Mixed (40–80% liquid within 30 days)","Illiquid-Heavy (<40% liquid within 30 days)"];
const DEFAULT_PORTFOLIO = {
  allocations:[
    {assetClass:"Public Equity – Developed Markets",weight:35,region:"Global DM"},
    {assetClass:"Investment Grade Fixed Income",weight:20,region:"US"},
    {assetClass:"Private Equity",weight:15,region:"North America"},
    {assetClass:"Real Assets / Infrastructure",weight:10,region:"Global"},
    {assetClass:"High Yield / Credit",weight:10,region:"US HY"},
    {assetClass:"Cash & Equivalents",weight:5,region:"USD"},
    {assetClass:"Hedge Funds / Alternatives",weight:5,region:"Global"},
  ],
  duration:5.5, leverage:1.0,
  liquidityProfile:"Mixed (40–80% liquid within 30 days)",
  constraints:"No short selling. Max 20% single asset class.",
};
const PIPE_LABELS = [
  "Decomposing structural macro exposures",
  "Generating forward-looking regime scenarios",
  "Simulating vulnerability vectors",
  "Computing governance metrics & escalation",
];

const C = {
  bg: "#03060D", surface: "#070C17", card: "#090F1C", border: "#13202F",
  borderBright: "#1E3045", text: "#CBD3DC", muted: "#4E6070",
  accent: "#C8961A", green: "#18785A", red: "#A83030", orange: "#C8621A", blue: "#2255A0",
};
const F = { serif: "'Crimson Pro', Georgia, serif", mono: "'IBM Plex Mono', 'Courier New', monospace" };

function Lbl({ c, children }) { return <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: c || C.muted, marginBottom: 6 }}>{children}</div>; }
function Card({ children, style, hl }) { return <div style={{ background: C.card, border: `1px solid ${hl ? hl + "40" : C.border}`, borderLeft: hl ? `3px solid ${hl}` : undefined, borderRadius: 8, padding: 20, ...style }}>{children}</div>; }
function ScorePill({ v, max = 10 }) { const p = v / max; const col = p > 0.7 ? C.red : p > 0.4 ? C.accent : C.green; return <span style={{ background: col + "1A", border: `1px solid ${col}50`, borderRadius: 4, padding: "2px 9px", color: col, fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>{v}/{max}</span>; }
function ProbBadge({ val }) { const m = { High: C.red, Medium: C.accent, Low: C.green }; const col = m[val] || C.green; return <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, padding: "2px 8px", background: col + "1A", border: `1px solid ${col}40`, borderRadius: 3, color: col }}>{(val || "").toUpperCase()} PROB</span>; }
function ImpactBadge({ val }) { const v = val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : "Neutral"; const m = { Bullish: { c: C.green, i: "↑" }, Neutral: { c: C.muted, i: "→" }, Bearish: { c: C.red, i: "↓" } }; const cfg = m[v] || m.Neutral; return <span style={{ background: cfg.c + "18", border: `1px solid ${cfg.c}40`, borderRadius: 4, padding: "2px 7px", color: cfg.c, fontSize: 10, fontFamily: F.mono, fontWeight: 600 }}>{cfg.i} {v}</span>; }
function LiqBadge({ val }) { const m = { Low: C.green, Medium: C.accent, High: C.orange, Critical: C.red }; return <span style={{ fontFamily: F.mono, fontSize: 11, color: m[val] || C.muted }}>● {val}</span>; }
function EscBanner({ level, label, rationale }) { const m = { 1: C.blue, 2: C.accent, 3: C.orange, 4: C.red }; const col = m[level] || C.blue; return <div style={{ background: col + "0D", border: `1px solid ${col}35`, borderLeft: `4px solid ${col}`, borderRadius: "0 8px 8px 0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}><span style={{ color: col, fontSize: 20 }}>◉</span><div><div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 2.5, color: col + "99", marginBottom: 2 }}>ESCALATION LEVEL {level}</div><div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: col, lineHeight: 1.1 }}>{label}</div>{rationale && <div style={{ fontFamily: F.serif, fontSize: 13, color: C.text, marginTop: 4, opacity: 0.8 }}>{rationale}</div>}</div></div>; }

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
      <text x={cx} y={cy - 4} textAnchor="middle" fill={C.text} style={{ fontSize: 24, fontFamily: F.mono, fontWeight: 700 }}>{score ?? '--'}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={col} style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: 2 }}>{(label || '').toUpperCase()}</text>
    </svg>
  );
}

function ExposureBar({ label, score, drivers }) {
  const p = (score / 10) * 100;
  const col = p > 70 ? C.red : p > 40 ? C.accent : C.green;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontFamily: F.mono, fontSize: 11, color: C.text }}>{label}</span>
        <ScorePill v={score} />
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p}%`, background: col, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      {drivers && <div style={{ marginTop: 3, fontFamily: F.mono, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>{drivers.filter(Boolean).join("  ·  ")}</div>}
    </div>
  );
}

function PipeProgress({ step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500 }}>
      <style>{`@keyframes sweep{0%{transform:translateX(-120%)}100%{transform:translateX(260%)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
      <Card style={{ maxWidth: 480, width: "100%", padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Lbl>Running Analysis Pipeline</Lbl>
          <h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 600, margin: 0, color: C.text }}>Processing Portfolio Risk Profile</h2>
        </div>
        {PIPE_LABELS.map((lbl, i) => {
          const done = step > i + 1, active = step === i + 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, opacity: done || active ? 1 : 0.25, transition: "opacity 0.4s" }}>
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

function InputPanel({ portfolio, setPortfolio, onRun, error }) {
  const total = portfolio.allocations.reduce((s, a) => s + (Number(a.weight) || 0), 0);
  const valid = Math.abs(total - 100) < 0.5;
  const inp = { background: "#050810", border: `1px solid ${C.border}`, color: C.text, fontFamily: F.mono, fontSize: 12, padding: "6px 10px", borderRadius: 4, width: "100%" };
  const addRow = () => setPortfolio(p => ({ ...p, allocations: [...p.allocations, { assetClass: ASSET_CLASSES[0], weight: 0, region: "Global" }] }));
  const removeRow = i => setPortfolio(p => ({ ...p, allocations: p.allocations.filter((_, idx) => idx !== i) }));
  const updateRow = (i, f, v) => setPortfolio(p => { const a = [...p.allocations]; a[i] = { ...a[i], [f]: f === "weight" ? Number(v) : v }; return { ...p, allocations: a }; });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div><Lbl>Asset Allocation</Lbl><h2 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 600, margin: 0 }}>Portfolio Construction</h2></div>
          <div style={{ fontFamily: F.mono, fontSize: 12, padding: "5px 13px", borderRadius: 4, background: valid ? C.green + "18" : C.red + "18", border: `1px solid ${valid ? C.green + "50" : C.red + "50"}`, color: valid ? C.green : C.red }}>{total.toFixed(1)}% / 100%</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Asset Class", "Weight %", "Region / Focus", ""].map(h => (<th key={h} style={{ padding: "6px 8px", textAlign: "left", fontFamily: F.mono, fontSize: 9, letterSpacing: 2, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {portfolio.allocations.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                <td style={{ padding: "5px 8px" }}><select value={row.assetClass} onChange={e => updateRow(i, "assetClass", e.target.value)} style={{ ...inp, padding: "4px 6px", fontSize: 11 }}>{ASSET_CLASSES.map(a => <option key={a}>{a}</option>)}</select></td>
                <td style={{ padding: "5px 8px" }}><input type="number" min="0" max="100" step="1" value={row.weight} onChange={e => updateRow(i, "weight", e.target.value)} style={{ ...inp, width: 64, textAlign: "right" }} /></td>
                <td style={{ padding: "5px 8px" }}><input value={row.region} onChange={e => updateRow(i, "region", e.target.value)} style={{ ...inp, width: 130, fontSize: 11 }} /></td>
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
          <div style={{ marginBottom: 13 }}><Lbl>Duration (years)</Lbl><input type="number" min="0" max="30" step="0.25" value={portfolio.duration} onChange={e => setPortfolio(p => ({ ...p, duration: +e.target.value }))} style={inp} /></div>
          <div style={{ marginBottom: 13 }}><Lbl>Leverage Ratio</Lbl><input type="number" min="1" max="5" step="0.1" value={portfolio.leverage} onChange={e => setPortfolio(p => ({ ...p, leverage: +e.target.value }))} style={inp} /><div style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, marginTop: 3 }}>1.0 = unlevered</div></div>
          <div style={{ marginBottom: 13 }}><Lbl>Liquidity Profile</Lbl><select value={portfolio.liquidityProfile} onChange={e => setPortfolio(p => ({ ...p, liquidityProfile: e.target.value }))} style={{ ...inp, fontSize: 11 }}>{LIQUIDITY_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><Lbl>Investment Constraints</Lbl><textarea rows={3} value={portfolio.constraints} onChange={e => setPortfolio(p => ({ ...p, constraints: e.target.value }))} placeholder="ESG mandates, drawdown floors, no-short rules..." style={{ ...inp, resize: "vertical" }} /></div>
        </Card>
        {error && <div style={{ background: C.red + "15", border: `1px solid ${C.red}40`, borderRadius: 6, padding: "12px 14px", color: C.red, fontFamily: F.mono, fontSize: 11, lineHeight: 1.6 }}>⚠ {error}</div>}
        <button onClick={onRun} disabled={!valid} style={{ background: valid ? C.accent : C.border, border: "none", color: valid ? "#020509" : C.muted, padding: "14px 18px", borderRadius: 6, cursor: valid ? "pointer" : "not-allowed", fontFamily: F.mono, fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>◈ RUN REGIME ANALYSIS</button>
        <Card style={{ padding: 14 }}>
          <Lbl>4-Stage Pipeline</Lbl>
          {["Exposure Decomposition", "Regime Generation", "Vulnerability Assessment", "Governance Metrics"].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "center" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.borderBright, flexShrink: 0 }} />
              <span style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>{s}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const EXP_LABELS = { inflationSensitivity: "Inflation Sensitivity", growthSensitivity: "Growth Sensitivity", durationRisk: "Duration Risk", creditSpreadRisk: "Credit Spread Risk", currencyExposure: "Currency Exposure", liquidityDependence: "Liquidity Dependence" };

function ExposureTab({ data }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <Lbl>Stage 1 Output</Lbl>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 600, margin: "0 0 18px", color: C.text }}>Macro Factor Exposure Map</h3>
        {Object.entries(data.exposureMap || {}).map(([k, v]) => (
          <ExposureBar key={k} label={EXP_LABELS[k] || k} score={v.score || 0} drivers={v.drivers} />
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Lbl>Dominant Exposures</Lbl>
          {(data.dominantExposures || []).map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: C.accent, fontFamily: F.mono, fontSize: 13, flexShrink: 0 }}>▸</span>
              <span style={{ fontFamily: F.serif, fontSize: 15, lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </Card>
        <Card hl={C.accent}>
          <Lbl>Hidden Concentrations</Lbl>
          {(data.hiddenConcentrations || []).map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: C.accent, fontFamily: F.mono, fontSize: 12, flexShrink: 0 }}>⚑</span>
              <span style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function RegimeTab({ regimes }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(regimes || []).map((r, i) => (
        <Card key={i}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 2 }}>REGIME {i + 1}</span>
            <ProbBadge val={r.probability} />
            <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 3, padding: "2px 7px" }}>{r.timeHorizon}</span>
          </div>
          <h3 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, margin: "0 0 14px", color: C.text }}>{r.name}</h3>
          <div style={{ padding: "10px 14px", background: "#040710", borderRadius: 6, borderLeft: `3px solid ${C.accent}`, marginBottom: 14 }}>
            <Lbl>Trigger</Lbl>
            <p style={{ fontFamily: F.serif, fontSize: 15, margin: 0, lineHeight: 1.6 }}>{r.trigger}</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Transmission Mechanisms</Lbl>
            {(r.transmissionMechanisms || []).map((m, j) => (
              <div key={j} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, flexShrink: 0, marginTop: 4 }}>{j + 1}.</span>
                <span style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.55 }}>{m}</span>
              </div>
            ))}
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
          <div style={{ padding: "8px 12px", background: C.red + "0C", border: `1px solid ${C.red}22`, borderRadius: 4 }}>
            <span style={{ fontFamily: F.mono, fontSize: 9, color: C.red + "90", letterSpacing: 2 }}>KEY RISK  </span>
            <span style={{ fontFamily: F.serif, fontSize: 14 }}>{r.keyRisk}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function VulnTab({ vulnerabilities }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Lbl>Stage 3 Output</Lbl>
        <h3 style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 600, margin: "0 0 16px", color: C.text }}>Regime Stress Matrix</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Regime", "Est. Drawdown", "Vuln Score", "Liquidity Stress", "Primary Vulnerability"].map(h => (<th key={h} style={{ padding: "7px 10px", textAlign: "left", fontFamily: F.mono, fontSize: 9, letterSpacing: 1.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
          <tbody>
            {(vulnerabilities || []).map((v, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}18` }}>
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
        {(vulnerabilities || []).map((v, i) => (
          <Card key={i}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>REGIME {i + 1}</div>
            <h4 style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>{v.regimeName}</h4>
            <Lbl>First-Order Effects</Lbl>
            {(v.firstOrderEffects || []).map((e, j) => (
              <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: C.red, fontSize: 12, flexShrink: 0, marginTop: 3 }}>→</span>
                <span style={{ fontFamily: F.serif, fontSize: 13, lineHeight: 1.5 }}>{e}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <Lbl>Second-Order Effects</Lbl>
              {(v.secondOrderEffects || []).map((e, j) => (
                <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ color: C.accent, fontSize: 12, flexShrink: 0, marginTop: 3 }}>⟹</span>
                  <span style={{ fontFamily: F.serif, fontSize: 13, lineHeight: 1.5 }}>{e}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GovTab({ gov }) {
  if (!gov) return null;
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
          {(gov.escalationTriggers || []).map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{ color: C.accent, flexShrink: 0 }}>⚑</span>
              <span style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </Card>
        <Card>
          <Lbl>Governance Actions</Lbl>
          {(gov.governanceActions || []).map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 10, color: C.accent, flexShrink: 0, marginTop: 4 }}>{i + 1}.</span>
              <span style={{ fontFamily: F.serif, fontSize: 14, lineHeight: 1.5 }}>{a}</span>
            </div>
          ))}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <Lbl>Key Watch Items</Lbl>
            {(gov.keyWatchItems || []).map((w, i) => (
              <div key={i} style={{ fontFamily: F.mono, fontSize: 11, color: C.text, padding: "5px 9px", background: "#040710", borderRadius: 4, marginBottom: 6 }}>◎ {w}</div>
            ))}
          </Card>
          <Card hl={C.red}>
            <Lbl>Adversarial Counter-Scenario</Lbl>
            <p style={{ fontFamily: F.serif, fontSize: 14, margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>{gov.counterScenario}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');*,*::before,*::after{box-sizing:border-box}body{margin:0;background:${C.bg}}select,input,textarea{outline:none!important}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${C.surface}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [stage, setStage] = useState("input");
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  const run = useCallback(async () => {
    setError(null); setStage("running"); setStep(0);
    try {
      setStep(1);
      const exp = await stage1(portfolio);
      setStep(2);
      const reg = await stage2(portfolio, exp);
      setStep(3);
      const vuln = await stage3(portfolio, reg.regimes || []);
      setStep(4);
      const gov = await stage4(portfolio, exp, vuln);
      setResults({ exposures: exp, regimes: reg.regimes || [], vulnerabilities: vuln.vulnerabilities || [], governance: gov });
      setTab(0); setStage("results");
    } catch (e) {
      setError(e.message); setStage("input");
    }
  }, [portfolio]);

  const TABS = ["Exposure Map", "Regime Scenarios", "Vulnerability Matrix", "Governance"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: F.serif, padding: "0 0 60px" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${C.border}55 1px,transparent 1px),linear-gradient(90deg,${C.border}55 1px,transparent 1px)`, backgroundSize: "44px 44px", opacity: 0.35 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 3, color: C.muted, marginBottom: 5 }}>INSTITUTIONAL RISK INTELLIGENCE PLATFORM</div>
            <h1 style={{ fontFamily: F.serif, fontSize: 30, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>GenAI Portfolio <span style={{ color: C.accent }}>Regime Risk Engine</span></h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.muted }}>{new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: C.border, marginTop: 3 }}>ADVISORY ONLY · v1.1</div>
          </div>
        </div>

        {stage === "input" && <InputPanel portfolio={portfolio} setPortfolio={setPortfolio} onRun={run} error={error} />}
        {stage === "running" && <PipeProgress step={step} />}
        {stage === "results" && results && (
          <div>
            <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.border}`, marginBottom: 22 }}>
              {TABS.map((t, i) => (
                <button key={i} onClick={() => setTab(i)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "10px 18px", marginBottom: -1, fontFamily: F.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: tab === i ? C.accent : C.muted, borderBottom: `2px solid ${tab === i ? C.accent : "transparent"}`, transition: "color 0.2s" }}>{t}</button>
              ))}
              <button onClick={() => setStage("input")} style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontFamily: F.mono, fontSize: 9, letterSpacing: 1 }}>← EDIT PORTFOLIO</button>
            </div>
            {tab === 0 && <ExposureTab data={results.exposures} />}
            {tab === 1 && <RegimeTab regimes={results.regimes} />}
            {tab === 2 && <VulnTab vulnerabilities={results.vulnerabilities} />}
            {tab === 3 && <GovTab gov={results.governance} />}
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.muted, letterSpacing: 1 }}>ADVISORY ONLY · AI OUTPUT REQUIRES EXPERT VALIDATION · NOT INVESTMENT ADVICE</span>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.border }}>Team 1 · Columbia Business School</span>
        </div>
      </div>
    </div>
  );
}
