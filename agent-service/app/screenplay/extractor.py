from pypdf import PdfReader

from app.core.logging import logger


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Deterministically extracts text page-by-page from a binary PDF.
    If the document has zero text extracted (i.e., scanned image PDF),
    it raises a clear ValueError indicating OCR is not supported.
    """
    import io
    logger.info("[EXTRACTOR] Initiating deterministic text extraction via pypdf...")

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        total_pages = len(reader.pages)
        logger.info(f"[EXTRACTOR] PDF reader loaded successfully. Total pages: {total_pages}")

        extracted_pages = []
        for page in reader.pages:
            text = page.extract_text() or ""
            extracted_pages.append(text)

        full_text = "\n".join(extracted_pages).strip()

        if not full_text:
            # Strictly assert scanned document failure
            logger.error("[EXTRACTOR] Extracted zero text. Document appears to be a scanned-image only PDF.")
            raise ValueError("OCR NOT IMPLEMENTED — scanned screenplay unsupported in Milestone 5")

        logger.info(f"[EXTRACTOR] Text extraction successful. Total characters extracted: {len(full_text)}")
        return full_text

    except ValueError as val_err:
        raise val_err
    except Exception as e:
        logger.error(f"[EXTRACTOR] PDF text extraction failed: {e!s}")
        raise ValueError(f"Failed to read PDF document: {e!s}") from e
