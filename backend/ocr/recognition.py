import requests
import time
import cv2
from app.core.config import settings


def get_optimal_jpeg_quality(image):
    """
    Determine optimal JPEG quality based on image characteristics to balance
    file size and OCR accuracy.
    """
    # Test different quality levels to find optimal
    height, width = image.shape[:2]
    pixel_count = height * width

    # Start with different qualities based on image size
    if pixel_count > 2000000:  # Large images
        test_qualities = [75, 80, 85]
    elif pixel_count > 1000000:  # Medium images
        test_qualities = [80, 85, 90]
    else:  # Small images
        test_qualities = [85, 90, 95]

    target_size_bytes = 3.8 * 1024 * 1024  # 3.8MB target

    for quality in test_qualities:
        _, buffer = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
        size_bytes = len(buffer.tobytes())

        if size_bytes <= target_size_bytes:
            print(f"Selected JPEG quality: {quality}% (Size: {size_bytes / 1024 / 1024:.2f}MB)")
            return quality

    # If all qualities are too large, use the lowest
    print(f"Using minimum quality: {test_qualities[0]}%")
    return test_qualities[0]


def recognize_text(image):
    """
    Send image to Azure Computer Vision API for OCR with dynamic quality optimization.
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
        # Get optimal JPEG quality for this image
        optimal_quality = get_optimal_jpeg_quality(image)

        # Encode image with optimal quality
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), optimal_quality]
        success, buffer = cv2.imencode(".jpg", image, encode_param)
        if not success:
            raise ValueError("Failed to encode image")

        image_bytes = buffer.tobytes()

        # Final size check
        size_mb = len(image_bytes) / (1024 * 1024)
        print(f"Sending image: {size_mb:.2f}MB")

        if size_mb > 4.0:
            raise ValueError(f"Image size {size_mb:.2f}MB exceeds API limit of 4MB")

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