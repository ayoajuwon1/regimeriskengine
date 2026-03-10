import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const SYSTEM_PROMPT = "You are a senior institutional portfolio risk strategist. Respond only with strict JSON that matches the supplied schema. Keep outputs concise, analytically precise, and suitable for institutional governance review.";

export async function POST(request) {
  const { prompt, schema, schemaName } = await request.json().catch(() => ({}));

  if (!prompt || !schema || !schemaName) {
    return NextResponse.json({ error: "Missing prompt, schema, or schemaName." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in the server environment." }, { status: 500 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: MODEL,
      store: false,
      instructions: SYSTEM_PROMPT,
      input: prompt,
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

    return NextResponse.json(JSON.parse(outputText));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
