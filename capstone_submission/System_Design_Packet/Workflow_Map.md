# Workflow Map

## Objective

Define the operating workflow so clearly that the tool can be reviewed as a system, not as a sequence of ad hoc prompts.

## Workflow Table

| Step | Actor | Input | Process | Output | Gate |
|---|---|---|---|---|---|
| 1. Intake | operator | structured portfolio template | collect portfolio facts and constraints | portfolio record | input completeness |
| 2. Classification | system | portfolio + market context | derive deterministic intake artifact | classification summary and flags | reviewer can challenge if obviously wrong |
| 3. Analysis | model | structured portfolio + evidence | run stage 1–4 generation | structured stage outputs | schema and policy constraints |
| 4. Validation | reviewer | structured outputs | complete review checklist and notes | review state | mandatory before committee use |
| 5. Output Formatting | system | outputs + review state | generate memo and persist metadata | memo draft and audit updates | memo state rules |
| 6. Human Review Checkpoint | reviewer | memo + outputs | validate, escalate, or return for revision | reviewed / escalated / needs revision state | committee readiness |

## Expanded Workflow Logic

### Step 1. Intake

The operator submits the structured portfolio template. The system does not accept free-form financial questions as the primary input.

### Step 2. Classification

The system derives a deterministic classification artifact. This step exists to make structural risk obvious before any model narrative is generated.

### Step 3. Analysis

The model runs four fixed stages:

1. exposure decomposition
2. regime generation
3. vulnerability assessment
4. governance metrics

### Step 4. Validation

The human reviewer checks:

- structural validity
- scenario diversity
- liquidity fragility
- governance communication readiness

### Step 5. Output Formatting

The system assembles the memo and updates the audit trail. This is a formatting and persistence step, not an authorization step.

### Step 6. Human Review Checkpoint

This is the real institutional gate.

Required before committee use:

- reviewer identified
- review status recorded
- escalation override rationale recorded if applicable
- memo state consistent with review state

## Failure Handling

| Failure | Workflow Response |
|---|---|
| malformed input | reject or request correction before analysis |
| missing market context | fail gracefully and state context unavailable |
| prohibited request inside input | remain inside structured workflow and refusal boundary |
| review not complete | block committee-ready memo state |
