import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE_URL = process.env.CINEPILOT_AGENT_SERVICE_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`[${requestId}] [PROXY DECISION] Forwarding human-in-the-loop governance decision...`);

  try {
    const body = await req.json();
    const res = await fetch(`${AGENT_SERVICE_URL}/api/v1/memory/decisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[${requestId}] [PROXY DECISION] FastAPI rejected decision log: ${errText}`);
      return NextResponse.json(
        { error: "Failed to persist human decision in production memory." },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`[${requestId}] [PROXY DECISION] Decision logged successfully.`);
    return NextResponse.json(data);

  } catch (error) {
    console.error(`[${requestId}] [PROXY DECISION] Error forwarding decision:`, error);
    return NextResponse.json(
      { error: "An unexpected connection issue occurred while logging human decision." },
      { status: 500 }
    );
  }
}
