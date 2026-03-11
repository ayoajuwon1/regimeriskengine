# System Design Packet

## Purpose

This packet defines Regime Risk Engine as a governed system rather than an unconstrained model interaction.

A reviewer should be able to read this packet and answer:

- what the system is for
- what the model is allowed to do
- what it must refuse
- what inputs it accepts
- what outputs it returns
- where humans intervene
- how escalation works
- what evidence boundary applies

## Packet Contents

- [Instruction_Hierarchy.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Instruction_Hierarchy.md)
- [System_Instruction.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/System_Instruction.md)
- [User_Interaction_Guide.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/User_Interaction_Guide.md)
- [Input_Template.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Input_Template.md)
- [Output_Schema.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Output_Schema.md)
- [Workflow_Map.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Workflow_Map.md)
- [Refusal_Behavior_Policy.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Refusal_Behavior_Policy.md)
- [Language_and_Guardrails.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Language_and_Guardrails.md)
- [Human_in_the_Loop_Design.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Human_in_the_Loop_Design.md)
- [Escalation_Rules.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Escalation_Rules.md)
- [Curated_External_Data_Plan.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Curated_External_Data_Plan.md)

## Design Standard

This packet is intentionally more detailed than a standard product brief. The capstone rubric rewards:

- explicit boundaries
- non-overlapping control layers
- workflow clarity
- evaluation readiness

## Current Prototype vs Target Deployment

| Dimension | Current Prototype | Target Capstone / Enterprise Deployment |
|---|---|---|
| runtime | custom Next.js reference harness | approved enterprise no-code / low-code platform |
| data grounding | live public market context | uploaded curated packs |
| identity | browser-local / anonymous demo posture | authenticated reviewer and governed roles |
| persistence | browser-local history | platform-governed record and audit persistence |

The packet therefore does two jobs:

1. describes the current behavior precisely
2. translates that behavior into the deployment model the assignment requires
