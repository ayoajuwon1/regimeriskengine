import OpenAI from "openai";
import { NextResponse } from "next/server.js";

import { executeConstraintScreening } from "./service.js";
import { intakeScreeningInstruction } from "../../../src/lib/systemDesign/index.js";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_GUARDRAIL_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
export const SCREENING_PROMPT = intakeScreeningInstruction.text;

export async function POST(request) {
  const { constraints } = await request.json().catch(() => ({}));

  if (typeof constraints !== "string" || !constraints.trim()) {
    return NextResponse.json({ error: "Missing constraints." }, { status: 400 });
  }

  try {
    const client = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    const result = await executeConstraintScreening({
      client,
      model: MODEL,
      screeningPrompt: SCREENING_PROMPT,
      constraints,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Constraint screening failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
