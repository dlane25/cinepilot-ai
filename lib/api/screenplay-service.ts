import { ScreenplayAnalysisResponse } from "../../types";

const AGENT_SERVICE_URL = process.env.CINEPILOT_AGENT_SERVICE_URL || "http://127.0.0.1:8000";

export async function uploadAndAnalyzeScreenplay(
  file: File,
  productionId: string
): Promise<ScreenplayAnalysisResponse> {
  const endpoint = `${AGENT_SERVICE_URL}/api/v1/screenplays/analyze`;
  const requestId = Math.random().toString(36).substring(2, 9);

  console.log(`[${requestId}] [SCREENPLAY SERVICE] Uploading screenplay PDF: ${file.name} (${file.size} bytes)...`);

  const formData = new FormData();
  formData.append("production_id", productionId);
  formData.append("file", file);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[${requestId}] [SCREENPLAY SERVICE] FastAPI rejected upload. Status: ${res.status}. Body: ${errText}`);

      let msg = "FastAPI screenplay ingestion failed.";
      try {
        const errObj = JSON.parse(errText);
        if (errObj.detail) msg = errObj.detail;
      } catch {
        // fallback
      }
      throw new Error(msg);
    }

    const data = (await res.json()) as ScreenplayAnalysisResponse;
    console.log(`[${requestId}] [SCREENPLAY SERVICE] Analysis completed successfully.`);
    return data;

  } catch (error) {
    console.error(`[${requestId}] [SCREENPLAY SERVICE] Communication failed:`, error);
    throw error;
  }
}
