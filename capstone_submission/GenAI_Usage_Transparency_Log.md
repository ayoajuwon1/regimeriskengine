# GenAI Usage Transparency Log

Date: March 10, 2026

## 1. Purpose

Document the tools, models, prompts, data sources, and human-vs-AI authorship split used to create the prototype evidence and submission packet.

## 2. System Runtime Components

| Component | Version / Mode | Purpose |
|---|---|---|
| Next.js | `16.1.6` | app runtime and API routes |
| React | `19.2.4` | UI layer |
| OpenAI JavaScript SDK | `6.6.0` | model integration |
| Test runner | `node --test` | regression validation |
| Build pipeline | `next build` | production compilation check |

## 3. Model Usage

| Use Case | Model / Interface | Notes |
|---|---|---|
| Structured stage generation | OpenAI Responses API | server-side, JSON-schema constrained |
| Local observed runtime label | `gpt-4o-mini` | as documented in local environment during testing |
| Output format enforcement | `json_schema` response formatting | strict schema mode |

## 4. External Data Used By The Current Prototype

| Source | Current Role | Notes |
|---|---|---|
| BLS | inflation / labor context | active in observed runtime |
| U.S. Treasury Fiscal Data | rates curve context | active in observed runtime |
| FRED | optional | configured as fallback / enhancement when key present |
| BEA | optional | configured as fallback / enhancement when key present |

## 5. Authoring Tasks Where AI Assistance Was Used

| Deliverable Area | AI Role | Human Role |
|---|---|---|
| System-design packet drafting | draft structure and initial language | review, correction, acceptance |
| Evaluation report | synthesized test evidence into report format | validated framing, selected what to emphasize |
| Risk analysis | drafted first-pass failure register | reviewed realism, severity, and mitigations |
| Presentation content | drafted slide narrative and Q&A | final presentation judgment and speaking style |

## 6. Prompt Categories Used During Packet Development

The AI was used for the following classes of prompt work:

- system-design artifact drafting
- workflow and guardrail articulation
- evaluation evidence synthesis
- failure-mode enumeration
- executive-summary and presentation writing

No claim is made that AI authored the project idea, user selection, or business rationale independently.

## 7. Human Authorship And Accountability

### Human-owned decisions

- product problem selection
- target user and financial context
- control posture and desired risk appetite
- decision to emphasize enterprise realism
- final acceptance of submission materials

### AI-assisted drafting

- first-draft language for markdown deliverables
- restructuring of documents into submission-ready format
- synthesis of observed test outputs into tables and narratives

## 8. Transparency Boundary

This log is intentionally explicit: the deliverables are AI-assisted, but they remain human-directed and human-accountable. The use of AI drafting does not transfer authorship responsibility away from the submitting team.

## 9. Reviewer Checklist For Final Submission

Before final submission, a human team member should confirm:

- every file matches the demo you will actually show
- the no-code / low-code deployment story matches the approved platform you will present
- the curated-pack story is reflected consistently across docs and demo
- any course-policy requirements around AI disclosure are fully satisfied
