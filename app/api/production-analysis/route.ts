import { NextRequest, NextResponse } from "next/server";
import { analyzeProduction } from "../../../lib/api/agent-service";
import { ProductionAnalysisRequest } from "../../../types";
import { AgentServiceError } from "../../../lib/api/errors";

function validateResponseShape(data: unknown): boolean {
  try {
    if (!data || typeof data !== "object") return false;
    const obj = data as Record<string, unknown>;
    if (typeof obj.production_id !== "string" || typeof obj.scene_number !== "string") return false;
    
    // Director analysis checks
    const dir = obj.director_analysis as Record<string, unknown>;
    if (!dir || typeof dir !== "object") return false;
    if (!["High", "Medium", "Low"].includes(dir.scene_complexity as string)) return false;
    if (!Array.isArray(dir.location_requirements) || !Array.isArray(dir.production_requirements)) return false;
    if (!Array.isArray(dir.cast_background_requirements) || !Array.isArray(dir.risk_observations)) return false;

    // Producer analysis checks
    const prod = obj.producer_analysis as Record<string, unknown>;
    if (!prod || typeof prod !== "object") return false;
    if (!Array.isArray(prod.cost_concerns) || !Array.isArray(prod.expensive_requirements)) return false;
    if (typeof prod.financial_exposure !== "number" || !Array.isArray(prod.optimization_opportunities)) return false;
    if (typeof prod.potential_savings !== "number" || typeof prod.human_approval_required !== "boolean") return false;

    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  console.log(`[${requestId}] [ROUTE HANDLER] Received incoming production-analysis request.`);

  try {
    const payload = (await req.json()) as ProductionAnalysisRequest;
    
    // Server-side validation of client inputs
    if (!payload.production_id || !payload.scene_input || !payload.production_context) {
      console.warn(`[${requestId}] [ROUTE HANDLER] Missing required fields in client payload.`);
      return NextResponse.json(
        { error: "Invalid client request: Missing production_id, scene_input, or production_context." },
        { status: 400 }
      );
    }

    // Call the authoritative FastAPI agent-service
    const responseData = await analyzeProduction(payload);

    // Schema Validation Boundary
    if (!validateResponseShape(responseData)) {
      console.error(`[${requestId}] [ROUTE HANDLER] Schema validation failed for agent service output.`);
      return NextResponse.json(
        { error: "Schema Validation Boundary Violation: The backend agent service returned a malformed data structure." },
        { status: 502 }
      );
    }

    const duration = Date.now() - start;
    console.log(`[${requestId}] [ROUTE HANDLER] Request handled successfully in ${duration}ms.`);

    return NextResponse.json(responseData, {
      headers: {
        "X-Response-Time-Ms": duration.toString(),
        "X-Request-Id": requestId,
      }
    });

  } catch (error: unknown) {
    const duration = Date.now() - start;
    console.error(`[${requestId}] [ROUTE HANDLER] Exception caught after ${duration}ms:`, error);

    if (error instanceof AgentServiceError) {
      const status = error.status || 500;
      return NextResponse.json(
        { 
          error: error.message, 
          status,
          details: error.details || null 
        },
        { status }
      );
    }

    // General safe fallback to avoid leaking platform configurations, credentials, or traces
    return NextResponse.json(
      { error: "An unexpected communication or platform error occurred while orchestrating Vertex AI agents." },
      { status: 500 }
    );
  }
}
