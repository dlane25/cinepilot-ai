import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE_URL = process.env.CINEPILOT_AGENT_SERVICE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 60000; // Strict 60s timeout for complex multi-agent reasoning

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`[${requestId}] [PROXY OPTIMIZE] Triggering E2E Multi-Agent Optimization...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const body = await req.json();
    const res = await fetch(`${AGENT_SERVICE_URL}/api/v1/agents/optimize-production`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[${requestId}] [PROXY OPTIMIZE] FastAPI rejected optimization: ${errText}`);
      return NextResponse.json(
        { error: "Multi-Agent optimization pipeline failed on the agent-service side." },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`[${requestId}] [PROXY OPTIMIZE] Proposal synthesized and returned successfully.`);
    return NextResponse.json(data);

  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.error(`[${requestId}] [PROXY OPTIMIZE] Subprocess aborted due to timeout (${REQUEST_TIMEOUT_MS}ms).`);
      return NextResponse.json(
        { error: "The request to the multi-agent optimization service timed out." },
        { status: 408 }
      );
    }

    console.error(`[${requestId}] [PROXY OPTIMIZE] Error forwarding optimization:`, error);
    return NextResponse.json(
      { error: "An unexpected connection issue occurred while connecting to the optimization service." },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
