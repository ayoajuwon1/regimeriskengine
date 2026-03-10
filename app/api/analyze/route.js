import OpenAI from "openai";
import { NextResponse } from "next/server.js";

import { executeStructuredAnalysis } from "./service.js";
import { buildMarketContext } from "../../../src/lib/publicData/contextBuilder.js";
import { MarketContextUnavailableError } from "../../../src/lib/publicData/helpers.js";
import { systemInstruction } from "../../../src/lib/systemDesign/index.js";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
export const SYSTEM_PROMPT = systemInstruction.text;

export async function POST(request) {
  const { prompt, schema, schemaName } = await request.json().catch(() => ({}));

  if (!prompt || !schema || !schemaName) {
    return NextResponse.json({ error: "Missing prompt, schema, or schemaName." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY in the server environment." }, { status: 500 });
  }

  try {
    const marketContext = await buildMarketContext();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await executeStructuredAnalysis({
      client,
      model: MODEL,
      systemPrompt: SYSTEM_PROMPT,
      prompt,
      schemaName,
      schema,
      marketContext,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MarketContextUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message = error instanceof Error ? error.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
