import time
import requests
from app.core.config import settings
def extract_text_from_pdf(file_path: str) -> str:
    subscription_key = settings.AZURE_SUBSCRIPTION_KEY
    endpoint = settings.AZURE_ENDPOINT
    analyze_url = endpoint + "vision/v3.2/read/analyze"

    # Read PDF file
    with open(file_path, "rb") as f:
        pdf_data = f.read()

    headers = {
        "Ocp-Apim-Subscription-Key": subscription_key,
        "Content-Type": "application/pdf"
    }

    # Step 1: Submit PDF for analysis
    response = requests.post(analyze_url, headers=headers, data=pdf_data)
    response.raise_for_status()
    operation_url = response.headers["Operation-Location"]

    # Step 2: Poll for results
    while True:
        result = requests.get(operation_url, headers={"Ocp-Apim-Subscription-Key": subscription_key})
        result.raise_for_status()
        status = result.json().get("status")
        if status in ["succeeded", "failed"]:
            break
        time.sleep(1)

    # Step 3: Extract and return text
    if status == "succeeded":
        result_json = result.json()
        all_text = []
        for page in result_json["analyzeResult"]["readResults"]:
            for line in page["lines"]:
                all_text.append(line["text"])
        return "\n".join(all_text)
    else:
        raise Exception("Text extraction failed.")
