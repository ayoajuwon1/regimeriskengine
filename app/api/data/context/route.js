import { NextResponse } from "next/server.js";

import { buildMarketContext } from "../../../../src/lib/publicData/contextBuilder.js";
import { MarketContextUnavailableError } from "../../../../src/lib/publicData/helpers.js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const context = await buildMarketContext();
    return NextResponse.json(context);
  } catch (error) {
    if (error instanceof MarketContextUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message = error instanceof Error ? error.message : "Failed to load public market context.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
