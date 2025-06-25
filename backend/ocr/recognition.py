import requests
import time
import cv2
from app.core.config import settings


def recognize_text(image):
    """
    Send image to Azure Computer Vision API for OCR with minimal conversion.
    Directly encodes the image with high quality to preserve details.
    """
    subscription_key = settings.AZURE_SUBSCRIPTION_KEY
    endpoint = settings.AZURE_ENDPOINT

    if not subscription_key or not endpoint:
        raise ValueError("Azure subscription key and endpoint are required")

    # Ensure no trailing slash in endpoint
    if endpoint.endswith('/'):
        endpoint = endpoint[:-1]

    # Construct the API URL for Read operation
    read_url = f"{endpoint}/vision/v3.2/read/analyze"

    # Set request headers
    headers = {
        'Ocp-Apim-Subscription-Key': subscription_key,
        'Content-Type': 'application/octet-stream'
    }

    try:
        # Encode image with highest quality to preserve details
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 100]
        success, buffer = cv2.imencode(".jpg", image, encode_param)
        if not success:
            raise ValueError("Failed to encode image")

        image_bytes = buffer.tobytes()

        # Send the API request
        print("Sending image to Azure...")
        response = requests.post(read_url, headers=headers, data=image_bytes)

        # Check for successful response
        if response.status_code != 202:
            print(f"Error: {response.status_code} - {response.text}")
            return None

        # Get the operation location
        operation_location = response.headers["Operation-Location"]
        print("Image sent successfully. Waiting for results...")

        # Optimized polling - faster initial checks, then slower
        analysis = {}
        poll_intervals = [0.5, 1, 2, 3, 4, 5]  # Start fast, then slow down

        for wait_time in poll_intervals:
            time.sleep(wait_time)

            # Get the analysis result
            analysis_response = requests.get(operation_location, headers={
                "Ocp-Apim-Subscription-Key": subscription_key
            })

            if analysis_response.status_code != 200:
                print(f"Error polling: {analysis_response.status_code} - {analysis_response.text}")
                continue

            analysis = analysis_response.json()

            if "status" in analysis:
                if analysis["status"] == "succeeded":
                    print("Text recognition completed successfully")
                    break
                elif analysis["status"] == "failed":
                    print(f"Analysis failed: {analysis.get('error', {}).get('message', 'Unknown error')}")
                    return None
                elif analysis["status"] == "running":
                    print("Still processing...")
                    continue

        # Extract text from the results
        result_text = ""
        if "analyzeResult" in analysis:
            read_results = analysis["analyzeResult"]["readResults"]
            for page in read_results:
                for line in page["lines"]:
                    result_text += line["text"] + "\n"

        return result_text.strip()

    except Exception as e:
        print(f"Error during recognition: {str(e)}")
        return None