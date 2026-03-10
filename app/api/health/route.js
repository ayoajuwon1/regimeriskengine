import { NextResponse } from "next/server";

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export function GET() {
  return NextResponse.json({ ok: true, model: MODEL });
}
