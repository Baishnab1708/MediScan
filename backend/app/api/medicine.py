from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
import tempfile
import time
from pathlib import Path

from app.dependencies import get_current_user, get_db
from app.core.config import settings
from app.schemas.user import UserOut
from app.schemas.medicine import MedicineExtractionResponse, ExtractedMedicine
from extract import process_file

router = APIRouter(prefix="/medicine", tags=["medicine"])


def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        return False

    # Check file size (basic check, actual size checked during read)
    return True


@router.post("/extract", response_model=MedicineExtractionResponse)
async def extract_medicines(
        file: UploadFile = File(...),
        current_user: UserOut = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Extract medicine information from uploaded prescription image"""

    # Validate file
    if not validate_file(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024 * 1024)}MB"
        )

    # Reset file pointer
    await file.seek(0)

    # Create temporary file
    temp_file = None
    try:
        # Create temp directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # Create temporary file
        with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=Path(file.filename).suffix.lower(),
                dir=settings.UPLOAD_DIR
        ) as temp_file:
            # Write uploaded file content
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Process the file using your extraction pipeline
        start_time = time.time()
        extracted_text, detailed_medicines = process_file(
            temp_file_path,
        )
        processing_time = time.time() - start_time

        print("DEBUG: extracted_text length =", len(extracted_text or ""))
        print("DEBUG: detailed_medicines =", detailed_medicines)

        if not extracted_text:
            raise HTTPException(422, "No text could be extracted from the PDF/DOCX.")

        if detailed_medicines is None:
            raise HTTPException(422, "Internal error during medicine-detail lookup.")

        if detailed_medicines == []:
            # Perhaps change to a 200 with an empty list, or a clear 422
            raise HTTPException(422, "No medicines were recognized in the document.")

        # Format the response
        medicines = []
        for med_data in detailed_medicines:
            medicine = ExtractedMedicine(
                original_name=med_data.get("original", ""),
                matched_name=med_data.get("matched", ""),
                confidence_score=med_data.get("score", 0),
                rxnorm_validated=med_data.get("rxnorm_validated", False),
                rxcui=med_data.get("rxcui", ""),
                rxnorm_score=med_data.get("rxnorm_score", 0.0),
                details=med_data.get("details", {})
            )
            medicines.append(medicine)

        # Update user visit count (optional)
        current_user.visits += 1
        db.commit()

        return MedicineExtractionResponse(
            success=True,
            message="Medicine extraction completed successfully",
            extracted_text=extracted_text,
            medicines=medicines,
            processing_time=round(processing_time, 2),
            total_medicines_found=len([m for m in medicines if m.matched_name])
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Warning: Could not delete temp file {temp_file_path}: {e}")
