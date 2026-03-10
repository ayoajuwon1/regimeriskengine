# Workflow Map

## Workflow Objective

Create a predictable, reviewable system workflow that can be executed inside a tool UI without relying on unconstrained chat.

## Step 1: Intake

Purpose:

- collect the structured portfolio template
- verify that the input is complete enough for analysis

Human role:

- operator confirms that the portfolio entered is the intended committee-review target

## Step 2: Classification

Purpose:

- generate a deterministic intake-classification artifact
- summarize complexity, liquidity tier, leverage class, duration bucket, concentration flags, and context coverage

Human role:

- reviewer confirms the classification looks directionally reasonable

## Step 3: Analysis

Purpose:

- run the four model-driven analysis stages
- stage 1: exposure decomposition
- stage 2: regime generation
- stage 3: vulnerability assessment
- stage 4: governance metrics

Human role:

- no intervention during generation
- human review happens after structured outputs are returned

## Step 4: Validation

Purpose:

- confirm structural validity
- confirm scenario diversity
- confirm liquidity fragility review
- confirm governance communication readiness

Human role:

- mandatory reviewer action

## Step 5: Output Formatting

Purpose:

- persist analysis metadata
- draft the committee memo
- record audit entries

Human role:

- decide whether memo remains draft or is ready for committee use

## Step 6: Human Review Checkpoint

Required before committee use:

- reviewer identified
- review status set
- override rationale recorded if escalation is changed
- memo state remains blocked from committee-ready status until review is complete
