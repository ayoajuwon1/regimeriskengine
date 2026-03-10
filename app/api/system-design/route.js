import { NextResponse } from "next/server.js";

import { getSystemDesignArtifacts } from "../../../src/lib/systemDesign/index.js";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getSystemDesignArtifacts());
}
