import { ProductionAnalysisRequest, ProductionAnalysisResponse } from "../../types";
import { AgentServiceError, TimeoutError, NetworkError } from "./errors";

// Determine agent service target URL from environmental configuration safely
const AGENT_SERVICE_URL = process.env.CINEPILOT_AGENT_SERVICE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 60000; // 60-second limit for complex Vertex AI reasoning

export async function analyzeProduction(
  payload: ProductionAnalysisRequest
): Promise<ProductionAnalysisResponse> {
  const requestId = Math.random().toString(36).substring(2, 9);
  const endpoint = `${AGENT_SERVICE_URL}/api/v1/agents/analyze-production`;

  console.log(`[${requestId}] [API CLIENT] Initiating live analysis on endpoint: ${endpoint}`);
  console.log(`[${requestId}] [API CLIENT] Payload context: scene_number=${payload.scene_input.scene_number}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let details: unknown = null;
      try {
        details = await response.json();
      } catch {
        // Fallback if not JSON
      }

      console.error(`[${requestId}] [API CLIENT] Error from FastAPI service. Status: ${response.status}`);
      throw new AgentServiceError(
        `FastAPI service responded with error state. Status: ${response.status}`,
        response.status,
        details
      );
    }

    const data = (await response.json()) as ProductionAnalysisResponse;
    console.log(`[${requestId}] [API CLIENT] Live analysis completed successfully in client layer.`);
    return data;

  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof AgentServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      console.error(`[${requestId}] [API CLIENT] Request aborted due to timeout (${REQUEST_TIMEOUT_MS}ms).`);
      throw new TimeoutError();
    }

    console.error(`[${requestId}] [API CLIENT] Communication failure:`, error);
    throw new NetworkError();
  }
}
