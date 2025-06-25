from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class ExtractedMedicine(BaseModel):
    original_name: str = Field(..., description="Original medicine name from OCR")
    matched_name: Optional[str] = Field(None, description="Matched medicine name")
    confidence_score: float = Field(0, description="Confidence score of extraction")
    rxnorm_validated: bool = Field(False, description="Whether validated against RxNorm")
    rxcui: Optional[str] = Field(None, description="RxNorm concept unique identifier")
    rxnorm_score: float = Field(0.0, description="RxNorm validation score")
    details: Dict[str, Any]


class MedicineExtractionResponse(BaseModel):
    success: bool
    message: str
    extracted_text: str = Field(..., description="Full extracted text from image")
    medicines: List[ExtractedMedicine] = Field(..., description="List of extracted medicines")
    processing_time: float = Field(..., description="Processing time in seconds")
    total_medicines_found: int = Field(..., description="Number of successfully matched medicines")