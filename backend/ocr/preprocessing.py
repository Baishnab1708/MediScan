import cv2
import numpy as np
import os


def get_file_size_mb(image_data):
    """Get the file size of encoded image in MB"""
    _, buffer = cv2.imencode(".jpg", image_data, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return len(buffer.tobytes()) / (1024 * 1024)


def adaptive_resize_for_api(image, target_size_mb=3.5, min_dimension=800):
    """
    Adaptively resize image to meet API size constraints while preserving OCR quality.

    Args:
        image: Input image (numpy array)
        target_size_mb: Target file size in MB (default 3.5MB to be safe under 4MB limit)
        min_dimension: Minimum dimension to maintain for OCR quality

    Returns:
        Resized image that meets size constraints
    """
    height, width = image.shape[:2]
    current_size = get_file_size_mb(image)

    # If already under target size, return as-is
    if current_size <= target_size_mb:
        return image

    # Calculate resize factor based on file size ratio
    # Since file size roughly scales with pixel count, we can estimate
    size_ratio = target_size_mb / current_size
    scale_factor = np.sqrt(size_ratio * 0.9)  # 0.9 for safety margin

    # Ensure we don't go below minimum dimensions
    new_width = max(int(width * scale_factor), min_dimension)
    new_height = max(int(height * scale_factor), min_dimension)

    # If min_dimension constraint makes image too large, adjust
    if min(new_width, new_height) == min_dimension:
        aspect_ratio = width / height
        if new_width == min_dimension:
            new_height = max(int(min_dimension / aspect_ratio), min_dimension)
        else:
            new_width = max(int(min_dimension * aspect_ratio), min_dimension)

    # Resize image
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Verify size and further reduce if needed
    iterations = 0
    max_iterations = 5

    while get_file_size_mb(resized) > target_size_mb and iterations < max_iterations:
        scale_factor *= 0.9
        new_width = max(int(width * scale_factor), min_dimension)
        new_height = max(int(height * scale_factor), min_dimension)

        if min(new_width, new_height) <= min_dimension:
            break

        resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        iterations += 1

    return resized


def process_image(image_path):
    """
    Process image for optimal OCR performance with Azure Read API.
    Now includes intelligent file size management for large images.

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

        print(f"Original image size: {image.shape[1]}x{image.shape[0]}")

        # First, handle large images by resizing to meet API constraints
        image = adaptive_resize_for_api(image, target_size_mb=3.5, min_dimension=800)
        print(f"After size optimization: {image.shape[1]}x{image.shape[0]}")

        height, width = image.shape[:2]

        # Additional resize for optimal OCR (if needed)
        max_dimension = 3000  # Reduced for better size management

        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            print(f"After dimension optimization: {new_width}x{new_height}")

        # Convert to grayscale for analysis
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Check image quality metrics
        contrast = np.std(gray)
        mean_brightness = np.mean(gray)

        print(f"Image metrics - Contrast: {contrast:.1f}, Brightness: {mean_brightness:.1f}")

        # Apply different processing based on image quality
        if contrast < 20:  # Low contrast image
            print("Applying enhanced processing for low contrast image...")

            # Apply bilateral filtering to reduce noise while preserving edges
            denoised = cv2.bilateralFilter(gray, 9, 75, 75)

            # Use Otsu's thresholding for better binarization
            _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # Morphological operations to clean up text
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

            # Convert back to color
            processed_image = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)

        elif contrast > 40:  # High contrast image
            print("Applying color enhancement for high contrast image...")

            # First try edge-preserving denoising
            denoised = cv2.edgePreservingFilter(image, flags=1, sigma_s=50, sigma_r=0.4)

            # Work with LAB color space for better contrast control
            lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)

            # Apply CLAHE with optimized settings for text
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(16, 16))
            enhanced_l = clahe.apply(l)

            # Merge and convert back
            enhanced_lab = cv2.merge((enhanced_l, a, b))
            color_enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

            # Apply unsharp masking for better text clarity
            gaussian = cv2.GaussianBlur(color_enhanced, (0, 0), 2.0)
            processed_image = cv2.addWeighted(color_enhanced, 1.5, gaussian, -0.5, 0)

            # Ensure we don't have any artifacts
            processed_image = np.clip(processed_image, 0, 255).astype(np.uint8)

        else:  # Medium contrast - minimal processing
            print("Applying minimal processing for good quality image...")

            # Light noise reduction only
            denoised = cv2.fastNlMeansDenoising(gray, None, h=5, searchWindowSize=21, templateWindowSize=7)
            processed_image = cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)

        # Final size check and compression if needed
        final_size = get_file_size_mb(processed_image)
        print(f"Final processed image size: {final_size:.2f}MB")

        if final_size > 3.8:  # Close to limit, apply additional compression
            print("Applying additional compression...")
            # Slight additional resize if very close to limit
            scale = 0.95
            h, w = processed_image.shape[:2]
            processed_image = cv2.resize(processed_image, (int(w * scale), int(h * scale)),
                                         interpolation=cv2.INTER_AREA)
            print(f"After final compression: {get_file_size_mb(processed_image):.2f}MB")

        return processed_image

    except Exception as e:
        print(f"Error during preprocessing: {str(e)}")
        return None


def validate_image_for_api(image):
    """
    Validate that the processed image meets API requirements.

    Args:
        image: Processed image

    Returns:
        bool: True if image meets requirements, False otherwise
    """
    if image is None:
        return False

    # Check file size
    size_mb = get_file_size_mb(image)
    if size_mb > 4.0:
        print(f"Warning: Image size {size_mb:.2f}MB exceeds API limit")
        return False

    # Check dimensions
    height, width = image.shape[:2]
    if width < 50 or height < 50:
        print("Warning: Image dimensions too small for reliable OCR")
        return False

    if width > 10000 or height > 10000:
        print("Warning: Image dimensions too large")
        return False

    print(f"✓ Image validation passed: {width}x{height}, {size_mb:.2f}MB")
    return True