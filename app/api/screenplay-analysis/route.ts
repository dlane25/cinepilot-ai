import { NextRequest, NextResponse } from "next/server";
import { uploadAndAnalyzeScreenplay } from "../../../lib/api/screenplay-service";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Strict 5MB limit

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`[${requestId}] [PROXY UPLOAD] Receiving binary upload from browser...`);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productionId = formData.get("production_id") as string | null;

    if (!file || !productionId) {
      return NextResponse.json(
        { error: "Invalid request payload. Missing 'file' or 'production_id' parameters." },
        { status: 400 }
      );
    }

    // 1. Enforce file size limit in Next.js Server proxy
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`[${requestId}] [PROXY UPLOAD] Rejected. File size ${file.size} exceeds 5MB limit.`);
      return NextResponse.json(
        { error: "Upload rejected: File size exceeds the strict 5MB screenplay limit." },
        { status: 413 }
      );
    }

    // 2. Validate PDF format extension
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      console.warn(`[${requestId}] [PROXY UPLOAD] Rejected. Non-PDF format: ${file.name}`);
      return NextResponse.json(
        { error: "Unsupported Media Type: Only text-based PDF screenplay uploads are supported." },
        { status: 415 }
      );
    }

    // Forward multipart binary stream securely to authoritative FastAPI
    const responseData = await uploadAndAnalyzeScreenplay(file, productionId);
    console.log(`[${requestId}] [PROXY UPLOAD] Successful E2E analysis returned to client.`);
    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error(`[${requestId}] [PROXY UPLOAD] Exception caught in proxy layer:`, error);
    const msg = error instanceof Error ? error.message : "An unexpected error occurred during screenplay analysis.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
