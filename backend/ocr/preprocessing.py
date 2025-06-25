import cv2
import numpy as np
import os


def process_image(image_path):
    """
    Process image for optimal OCR performance with Azure Read API.

    Args:
        image_path (str): Path to the input image

    Returns:
        numpy.ndarray: Enhanced image for OCR or None if processing fails
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Failed to load image: {image_path}")

        # Resize if image is too large (preserves aspect ratio)
        # Azure Read API works better with images that have sufficient resolution
        height, width = image.shape[:2]
        max_dimension = 4000  # Increased from 3000 for higher detail preservation
        min_dimension = 800  # Ensure minimum size for better OCR results

        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        elif min(height, width) < min_dimension and max(height, width) < max_dimension * 0.75:
            # Upscale small images if needed, but only if they won't exceed max_dimension
            scale = min_dimension / min(height, width)
            new_width = min(int(width * scale), max_dimension)
            new_height = min(int(height * scale), max_dimension)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_CUBIC)

        # Convert to grayscale for better OCR processing
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply noise reduction
        denoised = cv2.fastNlMeansDenoising(gray, None, h=10, searchWindowSize=21, templateWindowSize=7)

        # Adaptive thresholding to handle varying lighting conditions
        binary = cv2.adaptiveThreshold(
            denoised,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11,  # Block size
            2  # Constant subtracted from mean
        )

        # Morphological operations to clean up the image
        kernel = np.ones((1, 1), np.uint8)
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

        # Convert back to color format as Azure Read API expects color images
        enhanced_image = cv2.cvtColor(cleaned, cv2.COLOR_GRAY2BGR)

        # Check if the original image had good contrast, if so, use enhanced color version instead
        # This helps with colored documents where text color matters
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        # Calculate contrast
        contrast = np.std(l)

        if contrast > 30:  # Good contrast threshold
            # Apply CLAHE with optimized settings for Azure
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced_l = clahe.apply(l)

            # Merge channels and convert back to BGR
            enhanced_lab = cv2.merge((enhanced_l, a, b))
            color_enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

            # Sharpen the image to improve character edges
            kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
            sharpened = cv2.filter2D(color_enhanced, -1, kernel)

            return sharpened

        return enhanced_image

    except Exception as e:
        print(f"Error during preprocessing: {str(e)}")
        return None