import os

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.logging import logger
from app.screenplay.models import ScreenplayAnalysisResponse
from app.screenplay.service import analyze_screenplay_document

router = APIRouter()

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # Strict 5MB size limit

@router.post("/screenplays/analyze", response_model=ScreenplayAnalysisResponse)
@router.post("/api/v1/screenplays/analyze", response_model=ScreenplayAnalysisResponse)
async def upload_and_analyze_screenplay(
    production_id: str = Form(..., description="ID of the target production."),
    file: UploadFile = File(..., description="Binary screenplay PDF file.")
):
    """
    Ingests and analyzes a screenplay PDF.
    - Limits file sizes to 5MB.
    - Validates PDF extension.
    - Performs deterministic text-extraction and line parsing.
    - Resolves creative and logistical requirements via ADK/Gemini.
    """
    logger.info(f"[SCREENPLAY API] Received upload request for production '{production_id}'. File: {file.filename}")

    # 1. Enforce file size limit
    try:
        file_bytes = await file.read()
        file_size = len(file_bytes)
        logger.info(f"[SCREENPLAY API] Uploaded file size: {file_size} bytes.")

        if file_size > MAX_FILE_SIZE_BYTES:
            logger.warning(f"[SCREENPLAY API] Upload rejected. File exceeds 5MB limit: {file_size} bytes.")
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds the strict 5MB screenplay upload limit."
            )

        # 2. Enforce PDF extension validation
        if not file.filename.lower().endswith(".pdf"):
            logger.warning(f"[SCREENPLAY API] Upload rejected. Non-PDF document: {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Invalid document format. Only PDF screenplays are supported."
            )

        # 3. Trigger analysis pipeline
        gcp_project = os.getenv("GOOGLE_CLOUD_PROJECT")
        force_mock = os.getenv("MOCK_AGENTS", "false").lower() == "true"
        is_mock = force_mock or gcp_project is None

        response = await analyze_screenplay_document(
            pdf_bytes=file_bytes,
            production_id=production_id,
            is_mock=is_mock
        )
        return response

    except HTTPException as http_ex:
        raise http_ex
    except ValueError as val_err:
        logger.warning(f"[SCREENPLAY API] Processing failed due to validation/format: {val_err!s}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        ) from val_err
    except Exception as e:
        logger.error(f"[SCREENPLAY API] Internal error in screenplay pipeline: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Screenplay Intelligence parsing failed: {e!s}"
        ) from e
