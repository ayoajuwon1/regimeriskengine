# System Design Packet

This packet is the system-design core of the capstone submission.

## Contents

- [System_Instruction.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/System_Instruction.md)
- [Instruction_Hierarchy.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Instruction_Hierarchy.md)
- [User_Interaction_Guide.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/User_Interaction_Guide.md)
- [Input_Template.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Input_Template.md)
- [Output_Schema.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Output_Schema.md)
- [Workflow_Map.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Workflow_Map.md)
- [Refusal_Behavior_Policy.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Refusal_Behavior_Policy.md)
- [Human_in_the_Loop_Design.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Human_in_the_Loop_Design.md)
- [Escalation_Rules.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Escalation_Rules.md)
- [Language_and_Guardrails.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Language_and_Guardrails.md)
- [Curated_External_Data_Plan.md](/Users/ayodejiajuwon/Documents/GitHub/regimeriskengine/capstone_submission/System_Design_Packet/Curated_External_Data_Plan.md)

## Packet Objective

Define the system so clearly that a reviewer can understand:

- what the model is allowed to do
- what it must refuse
- what inputs it accepts
- what outputs it returns
- where humans intervene
- how escalation is handled
- what data the model is allowed to rely on

## Design Principle

This packet is intentionally layered. The system is controlled by an instruction hierarchy rather than a single prompt:

1. system instruction
2. workflow policy
3. structured input template
4. structured output schema
5. refusal and language guardrails
6. human review and escalation controls
