# Shark Tank-Style Presentation

## Presentation Objective

Convince a skeptical faculty or investment-governance audience that Regime Risk Engine is a deployable, controlled GenAI system for institutional risk governance, not a prompt trick.

## Recommended Structure

Total time: `15 minutes`

- presentation: `10 minutes`
- Q&A: `5 minutes`

## Slide Plan

| Slide | Title | Core Message | Proof To Show | Time |
|---|---|---|---|---:|
| 1 | The Institutional Problem | Committees need forward-looking risk governance, not just backward-looking analytics | one-sentence problem statement + user persona | 0:45 |
| 2 | Why Existing Workflow Breaks | Current process is fragmented, manual, and hard to audit | spreadsheet + memo + macro-commentary workflow sketch | 0:45 |
| 3 | What We Built | This is a workflow-driven GenAI system, not open chat | four-stage workflow graphic | 0:50 |
| 4 | Who The User Is | The primary user is institutional, not retail | advisor / CIO support / reviewer persona | 0:35 |
| 5 | System Design Artifacts | The system is controlled by explicit artifacts | system instruction, input template, output schema, interaction guide | 0:55 |
| 6 | Workflow, Not Chat | Show the operating sequence and human gates | intake → classification → analysis → validation → memo → review | 0:50 |
| 7 | Guardrails | Explain what the model can do and must refuse | refusal examples, language boundaries | 0:55 |
| 8 | Human-in-the-Loop and Escalation | Accountability is operationalized | reviewer, override rationale, memo gating | 0:55 |
| 9 | Evaluation Discipline | We tested required and adversarial cases with exact inputs | test matrix and metrics | 1:10 |
| 10 | What We Learned | Show both strengths and honest watch items | ambiguity handling yellow, escalation calibration yellow | 0:55 |
| 11 | Curated Data and No-Code Deployment | Explain the enterprise deployment story | curated packs + approved tool configuration | 0:55 |
| 12 | Why This Should Exist | The product improves governance quality, not trade generation | concise close + call to action | 0:35 |

## Slide-By-Slide Script

### Slide 1. The Institutional Problem

**On screen**

- user: institutional investment advisor / CIO-office analyst
- job: prepare committee-ready forward-looking regime risk view
- current gap: backward-looking analytics plus inconsistent memo writing

**Speaker note**

“Most institutional risk tools tell committees what the portfolio survived. Fewer tools help them reason about what regime may come next, how the current portfolio is exposed, and what governance action is warranted before a problem becomes visible in historical data.”

### Slide 2. Why Existing Workflow Breaks

**On screen**

- quantitative analytics live in one tool
- macro commentary lives in another
- committee memo is assembled manually
- human review is inconsistent and rarely auditable

**Speaker note**

“Today, the workflow is not only inefficient; it is governance-weak. Judgment lives in email, committee language is inconsistent, and there is no disciplined refusal boundary when analysts start using generative tools informally.”

### Slide 3. What We Built

**On screen**

- structured input
- deterministic intake classification
- 4-stage analysis
- committee memo + audit metadata

**Speaker note**

“We intentionally avoided building a free-form finance chatbot. The unit of work is a portfolio analysis package, not a conversation.”

### Slide 4. Who The User Is

**On screen**

| User | JTBD |
|---|---|
| advisor / CIO support analyst | prepare committee-ready forward-looking risk package |
| reviewer / governance owner | validate whether the output is usable and properly escalated |
| committee | consume reviewed memo, not raw model output |

### Slide 5. System Design Artifacts

**On screen**

- system instruction
- user interaction guide
- structured input template
- structured output schema

**Speaker note**

“This matters because the rubric is testing whether we can design a system, not whether we can write a clever prompt.”

### Slide 6. Workflow, Not Chat

**On screen**

| Step | Actor | Output |
|---|---|---|
| intake | operator | structured portfolio input |
| classification | system | intake artifact |
| analysis | model | stage 1–4 outputs |
| validation | reviewer | checklist + status |
| output formatting | system | memo + audit |
| review checkpoint | reviewer | committee readiness |

### Slide 7. Guardrails

**On screen**

| Allowed | Refused |
|---|---|
| exposure analysis | trade recommendations |
| regime generation | named security advice |
| vulnerability reasoning | benchmark outperformance claims |
| governance guidance | legal/compliance sign-off |

**Speaker note**

“The point is not to make the AI ‘careful.’ The point is to specify exactly what it may and may not do.”

### Slide 8. Human-in-the-Loop and Escalation

**On screen**

- reviewer identity required
- override rationale required
- memo cannot become committee-ready until review is complete

**Speaker note**

“Our design principle is simple: the model proposes; the human is accountable.”

### Slide 9. Evaluation Discipline

**On screen**

| Evidence | Result |
|---|---|
| automated checks | 16 / 16 passed |
| build | passed |
| required live scenario classes | 4 / 4 executed |
| prohibited advice leakage in guarded scenarios | 0 observed |
| full pipeline average runtime | 36.6 seconds |

**Speaker note**

“We documented exact test inputs, not just ‘we tried some cases.’ We also included negative findings, because a strong evaluation framework is supposed to find weaknesses.”

### Slide 10. What We Learned

**On screen**

- strong: schema fidelity, refusal performance, review gating
- yellow: ambiguity should be surfaced more explicitly
- yellow: escalation calibration under severe liquidity stress should be tighter

**Speaker note**

“This is one of the strongest parts of the project. We are not pretending the system is perfect. We are showing that we know how to evaluate and govern it.”

### Slide 11. Curated Data and No-Code Deployment

**On screen**

- approved platform holds system artifacts and workflow
- uploaded packs: macro snapshot, historical analogs, governance policy
- model references packs plus structured input only

### Slide 12. Why This Should Exist

**On screen**

“A governed first draft of regime-risk reasoning is more realistic and more useful than an unconstrained financial chatbot.”

## Recommended Live Demo Flow

1. show the structured portfolio input form
2. show intake classification and current market-context summary
3. open one stage output from each of the four analysis stages
4. show reviewer gating in Governance
5. show the committee memo and PDF export path
6. show History as a record library, not just an event log
7. show Method / Guide or the system-design packet if challenged on controls

## Likely Q&A

### “Why is this better than just asking ChatGPT?”

Because the value is not the model alone. The value is the control stack: instruction hierarchy, structured IO, workflow, review, escalation, and evaluation.

### “How do you know it is safe?”

We do not claim it is universally safe. We claim it is controlled, tested, and governed for a specific institutional use case. We also documented where it still needs improvement.

### “Why not make it fully autonomous?”

Because the target problem is governance quality, not autonomous trading or autonomous investment advice.

### “What is the biggest current weakness?”

Ambiguity language and escalation calibration in severe-liquidity cases. We documented both explicitly.
