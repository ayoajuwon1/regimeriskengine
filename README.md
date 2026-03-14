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
- Public market context layer using Treasury, BLS, and optional FRED / BEA enrichment
- Explicit system-design artifacts for system instruction, operator guide, input template, and output schema
- Optional in-app `Method / Guide` panel controlled by `NEXT_PUBLIC_ENABLE_SYSTEM_GUIDE`

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
- The UI screens `constraints` through `/api/intake-screen` before any 4-stage analysis call begins.
- Public market context is available at `/api/data/context`, and individual indicator debugging is available at `/api/data/series?indicator=...`.
- System-design artifacts are available at `/api/system-design`.
- Set `OPENAI_API_KEY` in `.env`. Do not commit it.
- Override `OPENAI_MODEL` if you want a different OpenAI model.
- `NEXT_PUBLIC_API_BASE_URL` is optional. If you set it, you can use the origin (`http://localhost:3000`), `/api`, or a full `/api/analyze` path.
- `NEXT_PUBLIC_ENABLE_SYSTEM_GUIDE` is optional. Set it to `false` if you want to hide the in-app guide surface.
- Optional server-side public-data keys: `FRED_API_KEY`, `BLS_API_KEY`, `BEA_API_KEY`.
- Use the in-app demo analysis flow if the OpenAI project is rate-limited or out of quota.

---

## Architecture

```text
app/
├── api/
│   ├── analyze/route.js # Next API route that calls OpenAI Responses
│   ├── intake-screen/   # Preflight constraint-screening gate
│   ├── system-design/   # Read-only system instruction / guide / schema endpoint
│   └── health/route.js  # Lightweight health check
│   └── data/            # Public market context + indicator routes
├── globals.css          # Global resets
├── layout.js            # Root layout + metadata
└── page.jsx             # Next entrypoint that renders the product UI
src/
├── App.jsx              # Product UI, history, memo, and human review flows
└── lib/
    ├── analysisStore.js # Local persistence + audit trail helpers
    ├── memo.js          # Committee memo generation and export
    ├── publicData/      # Provider adapters, registry, and context builder
    ├── riskAnalysis.js  # Prompting + JSON schemas for the 4 stages
    ├── systemDesign/    # System instruction, operator guide, template, and policy helpers
    └── sampleAnalysis.js # Proposal-aligned demo dataset
package.json
.env.example             # Copy to .env and add your API key
```

## System Design Artifacts

The non-curated system-design requirements are implemented in both docs and runtime:

- [System_Instruction.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/System_Instruction.md)
- [Interaction_Guide.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/Interaction_Guide.md)
- [Input_Template.json](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/Input_Template.json)
- [Output_Schema.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/Output_Schema.md)

The runtime mirror is exposed at `/api/system-design`.

---

## Disclaimer

This tool is designed as a **decision augmentation layer** for institutional governance purposes only. All outputs require expert validation before use. Not investment advice.
