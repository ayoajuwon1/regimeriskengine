import { buildRuleBasedConstraintDecision } from "../../../src/lib/systemDesign/policy.js";

const SCREENING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["decision", "reasons", "confidence"],
  properties: {
    decision: {
      type: "string",
      enum: ["allow", "reject"],
    },
    reasons: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
    },
    confidence: {
      anyOf: [
        { type: "number", minimum: 0, maximum: 1 },
        { type: "null" },
      ],
    },
  },
};

export async function executeConstraintScreening({ client, model, screeningPrompt, constraints }) {
  const ruleDecision = buildRuleBasedConstraintDecision(constraints);
  if (ruleDecision) {
    return ruleDecision;
  }

  if (!client) {
    throw new Error("Constraint screening unavailable. Missing OPENAI_API_KEY in the server environment.");
  }

  const response = await client.responses.create({
    model,
    store: false,
    instructions: screeningPrompt,
    input: `Constraints field:\n${constraints}`,
    text: {
      format: {
        type: "json_schema",
        name: "constraint_screening_decision",
        schema: SCREENING_SCHEMA,
        strict: true,
      },
    },
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new Error("OpenAI returned an empty constraint-screening response.");
  }

  const payload = JSON.parse(outputText);
  return {
    decision: payload.decision,
    reasons: Array.isArray(payload.reasons) ? payload.reasons.filter(Boolean) : [],
    source: "model",
    confidence: typeof payload.confidence === "number" ? payload.confidence : null,
  };
}
