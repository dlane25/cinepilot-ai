import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE_URL = process.env.CINEPILOT_AGENT_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productionId = searchParams.get("production_id") || "prod-echopoint-001";
  const requestId = Math.random().toString(36).substring(2, 9);
  
  console.log(`[${requestId}] [PROXY MEMORY] Querying historical memory for production: ${productionId}...`);

  try {
    // parallel fetches over secure FastAPI endpoints
    const [analysesRes, risksRes, recsRes] = await Promise.all([
      fetch(`${AGENT_SERVICE_URL}/api/v1/memory/productions/${productionId}/analyses`),
      fetch(`${AGENT_SERVICE_URL}/api/v1/memory/productions/${productionId}/risks`),
      fetch(`${AGENT_SERVICE_URL}/api/v1/memory/productions/${productionId}/recommendations`),
    ]);

    // Handle any connection/server issues safely (graceful degradation)
    if (!analysesRes.ok || !risksRes.ok || !recsRes.ok) {
      console.warn(`[${requestId}] [PROXY MEMORY] One or more memory GET requests failed on the agent-service side.`);
      return NextResponse.json(
        { error: "Production memory service is currently offline or degraded." },
        { status: 503 }
      );
    }

    const [analysesData, risksData, recsData] = await Promise.all([
      analysesRes.json(),
      risksRes.json(),
      recsRes.json(),
    ]);

    return NextResponse.json({
      analyses: analysesData.analyses || [],
      risks: risksData.risks || [],
      recommendations: recsData.recommendations || [],
    });

  } catch (error) {
    console.error(`[${requestId}] [PROXY MEMORY] Error querying historical memory:`, error);
    return NextResponse.json(
      { error: "An unexpected communication issue occurred while querying production memory." },
      { status: 500 }
    );
  }
}
