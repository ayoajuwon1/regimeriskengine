# GenAI Portfolio Regime Risk Engine

A 4-stage AI-powered institutional portfolio risk analysis tool built for forward-looking regime vulnerability assessment.

**Columbia Business School — Team 1 Capstone Project**

---

## What It Does

| Stage | Output |
|-------|--------|
| 1. Exposure Decomposition | 6-factor macro sensitivity map with scores |
| 2. Regime Generation | 3 forward-looking macro scenarios with asset class impacts |
| 3. Vulnerability Assessment | First/second-order effects, drawdown estimates, liquidity stress |
| 4. Governance Metrics | RCI gauge, LCI gauge, escalation protocol (Level 1–4), governance actions |

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/regime-risk-engine.git
cd regime-risk-engine
npm install
```

### 2. Add your API key

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Runtime Notes

- The UI now calls a local `/api/analyze` backend instead of sending model requests directly from the browser.
- Set `OPENAI_API_KEY` in `.env`. Do not commit it.
- Override `OPENAI_MODEL` if you want a different OpenAI model.

---

## Architecture

```
server/
└── index.js      # Express API that calls OpenAI Responses
src/
├── App.jsx        # Product UI and workflow state
└── lib/
    └── riskAnalysis.js  # Prompting + JSON schemas for the 4 stages
index.html
vite.config.js
package.json
.env.example       # Copy to .env and add your API key
```

---

## Disclaimer

This tool is designed as a **decision augmentation layer** for institutional governance purposes only. All outputs require expert validation before use. Not investment advice.
