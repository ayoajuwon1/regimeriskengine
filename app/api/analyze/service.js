import { buildAnalysisMetadata, formatContextForPrompt } from "../../../src/lib/publicData/contextBuilder.js";

export async function executeStructuredAnalysis({ client, model, systemPrompt, prompt, schemaName, schema, marketContext }) {
  const response = await client.responses.create({
    model,
    store: false,
    instructions: systemPrompt,
    input: `${prompt}\n\n${formatContextForPrompt(marketContext)}`,
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        schema,
        strict: true,
      },
    },
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new Error("OpenAI returned an empty response.");
  }

  return {
    data: JSON.parse(outputText),
    analysisContext: buildAnalysisMetadata(marketContext),
  };
}
