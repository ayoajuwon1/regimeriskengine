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

Additional prototype capabilities now included:

- Historical analogs and rationale summaries for every regime
- Local audit trail and saved analysis history
- Human review workflow with validation checklist and escalation override notes
- Editable committee memo with Markdown export
- Demo analysis path for proposal review when live API credits are unavailable

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

Open [http://localhost:3000](http://localhost:3000)

---

## Runtime Notes

- The app now runs as a single Next.js service with UI and API routes in one process.
- The UI calls the local `/api/analyze` route instead of sending model requests directly from the browser.
- Set `OPENAI_API_KEY` in `.env`. Do not commit it.
- Override `OPENAI_MODEL` if you want a different OpenAI model.
- `NEXT_PUBLIC_API_BASE_URL` is optional. If you set it, you can use the origin (`http://localhost:3000`), `/api`, or a full `/api/analyze` path.
- Use the in-app demo analysis flow if the OpenAI project is rate-limited or out of quota.

---

## Architecture

```text
app/
├── api/
│   ├── analyze/route.js # Next API route that calls OpenAI Responses
│   └── health/route.js  # Lightweight health check
├── globals.css          # Global resets
├── layout.js            # Root layout + metadata
└── page.jsx             # Next entrypoint that renders the product UI
src/
├── App.jsx              # Product UI, history, memo, and human review flows
└── lib/
    ├── analysisStore.js # Local persistence + audit trail helpers
    ├── memo.js          # Committee memo generation and export
    ├── riskAnalysis.js  # Prompting + JSON schemas for the 4 stages
    └── sampleAnalysis.js # Proposal-aligned demo dataset
package.json
.env.example             # Copy to .env and add your API key
```

---

## Disclaimer

This tool is designed as a **decision augmentation layer** for institutional governance purposes only. All outputs require expert validation before use. Not investment advice.
