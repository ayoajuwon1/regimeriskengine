# Instruction Hierarchy

## Purpose

Show that the system is controlled through layered artifacts with distinct responsibilities, not a single mega-prompt.

## Control Stack

### Layer 1: System Instruction

Defines the model's role, scope, prohibitions, and behavioral constraints.

Responsibilities:

- what the model is allowed to do
- what it must refuse
- how uncertainty must be handled
- the requirement for human review before committee use

### Layer 2: Workflow Policy

Defines the fixed operating sequence:

1. intake
2. classification
3. analysis
4. validation
5. output formatting
6. human review checkpoint

Responsibilities:

- prevent free-form chat drift
- make classification and review explicit system steps
- specify where humans intervene and how escalation occurs

### Layer 3: Structured Input Template

Defines the required portfolio fields and validation expectations.

Responsibilities:

- constrain user input to portfolio-governance facts
- reduce ambiguity and prompt injection surface area
- standardize intake across operators

### Layer 4: Structured Output Schema

Defines the only acceptable response format.

Responsibilities:

- force the model to return known stage outputs
- preserve governance metadata and validation checks
- prevent unconstrained narrative drift

### Layer 5: Refusal and Language Policies

Defines prohibited content, acceptable tone, and financial guardrails.

Responsibilities:

- prohibit investment advice and false certainty
- prohibit legal or compliance sign-off
- require risk-aware institutional language

### Layer 6: Human Review and Escalation Controls

Defines the operating boundary between model output and institutional use.

Responsibilities:

- require reviewer confirmation before committee circulation
- require written rationale for escalation overrides
- block committee-ready memo states until review is complete

## Why This Matters

This hierarchy is what turns the solution into a governed system rather than a prompt demo. No single artifact is allowed to carry the full control burden. The system instruction constrains behavior, the workflow constrains process, the schemas constrain IO, and the human-review layer constrains institutional use.
