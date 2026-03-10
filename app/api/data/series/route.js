import { NextResponse } from "next/server.js";

import { getIndicatorSeries } from "../../../../src/lib/publicData/contextBuilder.js";
import { MarketContextUnavailableError } from "../../../../src/lib/publicData/helpers.js";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const indicatorId = url.searchParams.get("indicator");

  if (!indicatorId) {
    return NextResponse.json({ error: "Missing required 'indicator' query parameter." }, { status: 400 });
  }

  try {
    const result = await getIndicatorSeries(indicatorId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MarketContextUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    const message = error instanceof Error ? error.message : "Failed to load indicator series.";
    const status = message.startsWith("Unknown indicator") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
