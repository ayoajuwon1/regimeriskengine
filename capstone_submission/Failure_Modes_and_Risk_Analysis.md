# Failure Modes and Risk Analysis

## 1. Objective

Identify how the system can fail in practice, including model, workflow, governance, data, and user-misuse failures.

This document is intentionally broader than “AI hallucination.” In institutional finance, the highest-risk failures are often human and procedural.

## 2. Risk Rating Method

Each risk is rated on three dimensions:

| Dimension | Scale |
|---|---|
| Severity (`S`) | `1` low to `5` severe institutional impact |
| Likelihood (`L`) | `1` rare to `5` likely under normal usage |
| Detectability (`D`) | `1` easy to detect to `5` hard to detect before harm |

`Risk Priority Number (RPN) = S × L × D`

## 3. Risk Register

| ID | Failure Mode | S | L | D | RPN | Why It Matters | Current Controls | Residual View |
|---|---|---:|---:|---:|---:|---|---|---|
| FM-01 | User treats output as investment advice | 5 | 3 | 3 | 45 | Converts a governance aid into a fiduciary/reputational risk event | refusal policy, advisory-only labeling, human review, memo gating | material residual risk if users ignore process |
| FM-02 | Prompt injection attempts to override policy | 5 | 2 | 2 | 20 | Could coerce advice or unrestricted output | system instruction, schema control, live adversarial testing | low-to-moderate residual risk |
| FM-03 | Missing portfolio facts create false confidence | 5 | 4 | 4 | 80 | Garbage-in can lead to wrong committee framing | structured template, intake classification, review checklist | one of the most important residual risks |
| FM-04 | Ambiguous liquidity terms are not explicitly surfaced | 4 | 3 | 4 | 48 | Users may over-read precision that is not actually present | classification flags, reviewer checks | still needs stronger language calibration |
| FM-05 | Escalation is under-calibrated in a severe stress case | 5 | 2 | 4 | 40 | Governance urgency may be understated | human override, escalation rationale, validation checks | observed as a real watch item |
| FM-06 | Historical analogy sounds plausible but is weakly matched | 4 | 3 | 4 | 48 | Narrative authority can mask thin reasoning | structured analogy fields, reviewer oversight | moderate residual risk |
| FM-07 | Live market context is stale or incomplete | 4 | 3 | 3 | 36 | Analysis may appear more current than it is | data-as-of, provenance, source listing | moderate residual risk until curated packs are enforced |
| FM-08 | Review becomes perfunctory and humans over-trust the memo | 5 | 3 | 4 | 60 | Human-in-the-loop exists on paper but not in practice | checklist, review status, override rationale, memo gating | high governance risk if incentives are weak |
| FM-09 | Memo is circulated before substantive review | 4 | 2 | 2 | 16 | Unreviewed AI narrative may be treated as institutionally approved | memo-state gating, audit metadata | low-to-moderate residual risk |
| FM-10 | Output tone becomes too certain or too authoritative | 4 | 3 | 4 | 48 | Strong language can distort committee perception even when facts are thin | language guardrails, examples, reviewer check | moderate residual risk |
| FM-11 | Users repurpose the tool for ticker commentary | 4 | 3 | 2 | 24 | Product drifts from governance use case to unauthorized advice use case | refusal design, out-of-scope evaluation cases | moderate residual risk |
| FM-12 | Browser-local prototype is mistaken for enterprise system of record | 3 | 3 | 3 | 27 | Users may over-assume persistence, identity, and audit assurances | explicit local-demo labeling, no-code operationalization doc | acceptable in prototype, not in production |

## 4. Highest-Priority Risks

### 4.1 FM-03: Missing Portfolio Facts Create False Confidence

This is the dominant structural risk. The system can remain fully inside schema and still produce a convincing but incomplete analysis if the input omits key liquidity, side-letter, refinancing, or governance facts.

**Why it is dangerous**

- it is common
- it is hard to detect automatically
- it can still look polished

**Primary mitigation**

- force structured input
- derive intake classification
- require reviewer validation of liquidity assumptions
- explicitly document unsupported precision

### 4.2 FM-08: Human Review Becomes Performative

The human-in-the-loop control is only meaningful if reviewers actually interrogate the output rather than rubber-stamp it.

**Why it is dangerous**

- creates a false sense of governance
- moves the failure from the model to the operating process

**Primary mitigation**

- named reviewer
- checklist completion
- override rationale
- committee-ready memo gating

### 4.3 FM-04 and FM-05: Calibration Risk

The current evaluation evidence surfaced two calibration watch items:

- ambiguity is not always called out strongly enough
- escalation can remain moderate in a severe liquidity case

These are not catastrophic failures, but they are exactly the kind of issues that should be found and documented before enterprise rollout.

## 5. User Misuse Scenarios

| Scenario | Abuse Pattern | Why It Is Realistic | Mitigation |
|---|---|---|---|
| UM-01 Advisory shortcut | User pastes “Should we buy NVDA?” into a constraints field | Users often test tools by asking the thing they most want answered | refusal policy, structured output, out-of-scope test case |
| UM-02 Governance bypass | User exports memo and shares it before review | Time pressure encourages shortcut behavior | memo-state gating, audit trail, reviewer workflow |
| UM-03 False precision | User assumes manager-level facts exist because output is polished | Narrative quality can be mistaken for evidence quality | explicit scope boundary, validation checks, uncertainty language |
| UM-04 Role confusion | Analyst uses prototype as if it were enterprise-approved production tooling | Prototype polish can blur governance boundaries | local-demo labeling, operationalization note |
| UM-05 Policy laundering | User cites AI output as justification for a preferred action | AI can be used to legitimize an already desired decision | reviewer accountability, committee ownership, advisory-only framing |

## 6. Detection Signals And Monitoring

| Signal | Why It Matters |
|---|---|
| repeated out-of-scope queries | indicates advice-seeking misuse |
| high override frequency | may indicate weak model calibration or weak policy alignment |
| high rate of committee-ready memos with minimal reviewer notes | may indicate rubber-stamp review behavior |
| repeated mention of unsupported liquidity precision | indicates ambiguity handling weakness |
| mismatch between severity of portfolio profile and escalation outcome | indicates escalation calibration drift |

## 7. Mitigation Roadmap

### Immediate

- strengthen ambiguity prompts and evaluation scoring
- add escalation-calibration checks to the regression/evaluation suite
- make uncertainty phrasing a first-class evaluation criterion

### Before Enterprise Deployment

- move to curated uploaded packs
- add authenticated reviewer identity and shared audit controls
- add recurring evaluation runs in the approved no-code / low-code platform

## 8. Conclusion

The most important risks are not exotic model failures. They are:

- misuse
- over-trust
- incomplete input
- weak review discipline
- calibration drift

That is why this submission emphasizes not only model behavior, but also workflow, escalation, and governance design.
