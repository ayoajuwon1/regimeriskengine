# GenAI Usage Transparency Log

Date: March 10, 2026

## Purpose

Document how GenAI was used in the creation of the system, the packet, and the evaluation materials.

## Tools Used

### 1. Product / Prototype Repository

- Next.js 16.1.6 application
- OpenAI JavaScript SDK 6.6.0
- Local automated test runner: `node --test`
- Local production build: `next build`

### 2. Runtime Model

- Application runtime model: `gpt-4o-mini` in the current local environment
- Runtime interface: OpenAI Responses API via server-side route

### 3. External Data Sources Used By The System

- U.S. Treasury Fiscal Data
- BLS
- Optional FRED
- Optional BEA

### 4. AI-Assisted Authoring

- AI-assisted drafting and structuring of capstone markdown deliverables
- AI-assisted synthesis of evaluation evidence into the final report

## Key Prompts / Tasks Used In The Authoring Process

- define the system instruction, interaction guide, input template, and structured output schema
- document the workflow, refusal rules, human review, and escalation design
- generate executive-summary and presentation-ready capstone materials
- evaluate the current implementation against the rubric and document test results
- convert implementation evidence into a governance-ready capstone packet

## Human vs AI Authorship

### Human Authorship

- product idea and problem framing
- target user selection
- project direction and acceptance criteria
- selection of which deliverables to include
- final judgment on whether the packet is submission-ready

### AI-Assisted Content

- first-draft markdown for capstone deliverables
- structure and wording of system packet documents
- synthesis of live and automated test evidence
- first-draft failure-mode register and rubric crosswalk

### Human Review Required

All submission artifacts should be treated as AI-assisted first drafts until a team member confirms:

- course compliance
- tone and presentation style
- factual consistency with the demo you will present
- alignment with the enterprise no-code / low-code tool you intend to show

## Limitations

- AI-assisted writing does not substitute for faculty-required human authorship accountability.
- The runtime model and public data sources are documented as observed in the local environment on March 10, 2026.
