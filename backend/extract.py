import os
import time
import json
from ocr.preprocessing import process_image
from ocr.recognition import recognize_text
from ocr.pdf_extractor import extract_text_from_pdf
from ocr.preprocessing import validate_image_for_api
from nlp.corrections import OCRCorrector
from nlp.rxnorm_validator import RxNormValidator
from nlp.extractor import OpenRouterExtractor
from nlp.rxnorm_details import RxNormDetailsValidator



def process_file(file_path):
    """Process a single PDF or image file through the OCR pipeline."""
    start_time = time.time()
    print(f"Processing: {file_path}")
    is_pdf = file_path.lower().endswith(".pdf")

    if is_pdf:
        # PDF Handling: Directly extract text using pdf_extract
        print("Detected PDF file. Skipping image preprocessing and correction.")
        print("Step 2: Recognizing text from PDF with Azure OCR...")
        final_text = extract_text_from_pdf(file_path)

    else:
        # Step 1: Image preprocessing
        print("Step 1: Enhancing image for OCR...")
        enhanced_image = process_image(file_path)
        if enhanced_image is None:
            print(f"Error: Failed to process image {file_path}")
            return None, None
        if not validate_image_for_api(enhanced_image):
            print(f"Error: Processed image doesn't meet API requirements")
            return None, None

        # Step 2: OCR Recognition
        print("Step 2: Recognizing text with Azure OCR...")
        recognized_text = recognize_text(enhanced_image)
        if not recognized_text:
            print(f"Error: Failed to recognize text in image {file_path}")
            return None, None
        print("after recognition:")
        print(recognized_text)

        # Step 3: OCR correction
        print("Step 3: Applying OCR corrections...")
        corrector = OCRCorrector()
        final_text = corrector.correct_text(recognized_text)
        print("after correction:")
        print(final_text)


    # Step 4: Medicine extraction using OpenRouter API
    print("Step 4: Extracting medicine names using OpenRouter API...")
    extractor = OpenRouterExtractor()
    processed_results = extractor.extract_medicine_names(final_text)
    print(processed_results)

    # Step 5: Validate medicines with RxNorm API
    print("Step 5: Validating medicines with RxNorm API...")
    validator = RxNormValidator()
    validated_medicines = validator.validate_medicines(processed_results)

    # Step 6: Get detailed medicine information
    print("Step 6: Fetching detailed medicine information...")
    details_validator = RxNormDetailsValidator()
    detailed_medicines = details_validator.validate_medicines_with_details(validated_medicines)

    # Print time taken
    elapsed_time = time.time() - start_time
    print(f"\nProcessing completed in {elapsed_time:.2f} seconds")

    # Print extracted text
    print(f"\nExtracted Text:")
    print(final_text)

    # Print extracted, validated, and detailed medicines
    print("\nExtracted Medicine Names with Details:")
    for idx, medicine in enumerate(detailed_medicines):
        status = "✓" if medicine["matched"] else "✗"
        original = medicine["original"]
        matched = medicine["matched"] if medicine["matched"] else "No match"
        score = f"{medicine['score']}%" if medicine["score"] > 0 else "N/A"

        print(f"\n{idx + 1}. {status} {original} → {matched} ({score})")

        # RxNorm information
        if medicine["matched"] and medicine["rxnorm_validated"]:
            print(f"   ✓ Verified in RxNorm (RxCUI: {medicine['rxcui']}, Score: {medicine['rxnorm_score']:.1f}%)")

            # Print detailed information if available
            details = medicine.get('details')
            if details:
                if details['generic_names']:
                    print(f"   🧬 Active Ingredients: {', '.join(details['generic_names'][:3])}")

                if details['brand_names']:
                    print(f"   🏷️  Brand Names: {', '.join(details['brand_names'][:3])}")

                if details['dosage_forms']:
                    print(f"   💊 Dosage Forms: {', '.join(details['dosage_forms'][:3])}")

                if details.get('mechanism_of_action'):
                    print(f"   ⚙️  Mechanism: {details['mechanism_of_action']}")

                if details.get('indications'):
                    print(f"   🎯 Used For: {', '.join(details['indications'])}")

                if details.get('side_effects'):
                    print(f"   ⚠️  Side Effects: {', '.join(details['side_effects'][:5])}")

                if details.get('drug_interactions'):
                    print(f"   🔄 Interactions: {len(details['drug_interactions'])} found")
                    for interaction in details['drug_interactions'][:2]:
                        print(f"      • {interaction[:100]}...")

                # Composition details
                comp = details.get('composition', {})
                if comp.get('ingredients'):
                    ingredients = [ing['name'] for ing in comp['ingredients'][:3]]
                    print(f"   🧪 Ingredients: {', '.join(ingredients)}")

        elif medicine["matched"]:
            print(f"   ✗ Not found in RxNorm")

    return final_text, detailed_medicines


def main():
    # Azure Computer Vision credentials
    subscription_key = "5UiemOohZ2Ln2KqSRyMut4RYspnHxD2Xs98UnU1CAbBOBACRDgsQJQQJ99BEACGhslBXJ3w3AAAFACOGUaeZ"
    endpoint = "https://medicineprescriptionreader.cognitiveservices.azure.com/"

    # Image path
    img_path = "ocr/prep.jpg"  # Update this to your image path

    # Process the file
    text, medicines = process_file(img_path)

    # If processing was successful, save results
    if text and medicines:
        try:
            result_dir = "results"
            os.makedirs(result_dir, exist_ok=True)

            # Save extracted text
            with open(os.path.join(result_dir, "extracted_text.txt"), "w") as f:
                f.write(text)

            # Save detailed medicine information as JSON
            with open(os.path.join(result_dir, "detailed_medicines.json"), "w") as f:
                json.dump(medicines, f, indent=2)

            # Create a comprehensive summary report
            summary = []
            for med in medicines:
                if med['matched'] and med['rxnorm_validated']:
                    summary_item = {
                        'original_name': med['original'],
                        'matched_name': med['matched'],
                        'rxcui': med['rxcui'],
                        'confidence': f"{med['rxnorm_score']:.1f}%"
                    }

                    details = med.get('details', {})
                    if details:
                        summary_item.update({
                            'generic_names': details.get('generic_names', []),
                            'brand_names': details.get('brand_names', []),
                            'dosage_forms': details.get('dosage_forms', []),
                            'indications': details.get('indications', []),
                            'side_effects': details.get('side_effects', []),
                            'mechanism_of_action': details.get('mechanism_of_action', ''),
                            'drug_interactions_count': len(details.get('drug_interactions', [])),
                            'composition': details.get('composition', {})
                        })

                    summary.append(summary_item)

            with open(os.path.join(result_dir, "medicine_summary.json"), "w") as f:
                json.dump(summary, f, indent=2)

            print(f"\nResults saved to {result_dir} directory")
            print(f"- extracted_text.txt: Raw extracted text")
            print(f"- detailed_medicines.json: Complete medicine data with details")
            print(f"- medicine_summary.json: Clean summary of validated medicines")

        except Exception as e:
            print(f"Error saving results: {e}")


if __name__ == "__main__":
    main()