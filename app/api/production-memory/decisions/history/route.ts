import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE_URL = process.env.CINEPILOT_AGENT_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productionId = searchParams.get("production_id") || "prod-echopoint-001";
  const requestId = Math.random().toString(36).substring(2, 9);

  console.log(`[${requestId}] [PROXY DECISIONS HISTORY] Querying historical human decisions for production: ${productionId}...`);

  try {
    const res = await fetch(`${AGENT_SERVICE_URL}/api/v1/memory/productions/${productionId}/decisions`);

    if (!res.ok) {
      console.warn(`[${requestId}] [PROXY DECISIONS HISTORY] ClickHouse memory GET decisions request failed.`);
      return NextResponse.json(
        { error: "Production memory decisions audit service is currently degraded." },
        { status: 503 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`[${requestId}] [PROXY DECISIONS HISTORY] Error querying decisions:`, error);
    return NextResponse.json(
      { error: "An unexpected connection issue occurred while querying decisions audit history." },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
