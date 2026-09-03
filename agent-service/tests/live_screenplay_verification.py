import asyncio
import json
import os
import sys
import urllib.request

# Add agent-service root to python path to avoid import errors when running directly
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

MINIMAL_SCREENPLAY_PDF_BYTES = b"""%PDF-1.4
1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj
2 0 obj <</Type/Pages/Count 1/Kids [3 0 R]>> endobj
3 0 obj <</Type/Page/Parent 2 0 R/Resources <</Font <</F1 4 0 R>>>>/MediaBox [0 0 612 792]/Contents 5 0 R>> endobj
4 0 obj <</Type/Font/Subtype/Type1/BaseFont/Helvetica>> endobj
5 0 obj <</Length 81>> stream
BT
/F1 12 Tf
72 712 Td
(INT. CABINET - DAY) Tj
0 -18 Td
(MAYA) Tj
0 -18 Td
(I found the key.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
0000000277 00000 n
trailer <</Size 6/Root 1 0 R>>
startxref
408
%%EOF
"""

async def main():
    print("=========================================================")
    print("CinePilot AI - Live Screenplay Ingestion Verification")
    print("=========================================================")

    # 1. Setup local tmp PDF
    pdf_path = "tests/test_screenplay_climax.pdf"
    with open(pdf_path, "wb") as f:
        f.write(MINIMAL_SCREENPLAY_PDF_BYTES)
    print(f"[INFO] Created tiny text-based test PDF under: {pdf_path}")

    # 2. Verify pypdf extracts it successfully
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        extracted = reader.pages[0].extract_text()
        print("\nExtracted text verification:")
        print("---------------------------------------------------------")
        print(extracted.strip())
        print("---------------------------------------------------------")
        if "INT. CABINET - DAY" not in extracted:
            raise ValueError("pypdf failed to extract text from the minimal PDF template.")
    except Exception as e:
        print("[ERROR] Failed to run local PDF extraction test:", str(e))
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        sys.exit(1)

    # 3. Trigger E2E Live Screenplay Ingestion over HTTP to running FastAPI server
    print("\n[INFO] Triggering live E2E Screenplay Analysis POST request to http://127.0.0.1:8000...")

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"

    # Construct raw multipart/form-data body manually to avoid third-party requests dependency
    body_parts = []
    body_parts.append(f"--{boundary}".encode())
    body_parts.append(b'Content-Disposition: form-data; name="production_id"')
    body_parts.append(b'')
    body_parts.append(b'prod-echopoint-001')

    body_parts.append(f"--{boundary}".encode())
    body_parts.append(b'Content-Disposition: form-data; name="file"; filename="test_screenplay_climax.pdf"')
    body_parts.append(b'Content-Type: application/pdf')
    body_parts.append(b'')
    body_parts.append(MINIMAL_SCREENPLAY_PDF_BYTES)
    body_parts.append(f"--{boundary}--".encode())
    body_parts.append(b'')

    body = b"\r\n".join(body_parts)

    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/screenplays/analyze",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body))
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode("utf-8"))
            print("\n[SUCCESS] E2E Live Screenplay Ingestion completed with 100% success!")
            print("=========================================================")
            print("Production ID: ", data.get("production_id"))
            print("Screenplay Title:", data.get("metadata", {}).get("title"))
            print("Author:", data.get("metadata", {}).get("author"))
            print("Total Scenes Extracted:", data.get("metadata", {}).get("total_scenes"))
            print("Total Characters Extracted:", data.get("metadata", {}).get("total_characters"))
            print("---------------------------------------------------------")

            # Print the live analyzed scene creative & department logistics!
            if data.get("scene_analyses"):
                analysis = data["scene_analyses"][0]
                print(f"Parsed Scene {analysis.get('scene_number')} - Creative Complexity: {analysis.get('creative_complexity')}")
                print(f"Production Complexity: {analysis.get('production_complexity')}")
                print(f"Cast Requirements:     {analysis.get('cast_requirements')}")
                print(f"props:                 {analysis.get('props')}")
                print(f"wardrobe:              {analysis.get('wardrobe')}")
                print(f"Estimated Setup:       {analysis.get('estimated_setup_complexity')}")
                print(f"Risk Warning Signals:  {analysis.get('production_risk_signals')}")
            print("=========================================================")
            print("[PASS] Milestone 5 Live Screenplay Ingestion verified successfully!")

    except Exception as e:
        print("\n[FAILURE] Live E2E screenplay upload failed:", str(e))
        if hasattr(e, "read"):
            print("Server response:", e.read().decode("utf-8"))
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        sys.exit(1)

    finally:
        # Clean up tmp PDF
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

if __name__ == "__main__":
    asyncio.run(main())
