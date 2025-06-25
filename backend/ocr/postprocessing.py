import re

def process_text(text):
    """
    Light postprocessing to clean up OCR text without losing information.
    Focuses only on essential cleanup that won't reduce accuracy.
    """
    if not text:
        return None

    # Clean extra whitespace (safe operation)
    cleaned_text = re.sub(r'\s+', ' ', text).strip()

    # Fix the most common OCR errors that are safe to correct
    common_fixes = {
        r'(\d)l\b': r'\1l',  # Fix '1' mistaken for 'l' at word boundaries
        r'\bl(\d)': r'1\1',  # Fix 'l' mistaken for '1' at word boundaries
    }

    for pattern, replacement in common_fixes.items():
        cleaned_text = re.sub(pattern, replacement, cleaned_text)

    # Fix broken paragraphs (lines ending without punctuation)
    # This joins lines that likely belong together
    cleaned_text = re.sub(r'([a-zA-Z0-9,;])$\n([a-z])', r'\1 \2', cleaned_text, flags=re.MULTILINE)

    # Make sure sentences start with capital letter
    sentences = re.split(r'([.!?]\s+)', cleaned_text)
    result = ""

    for i in range(0, len(sentences), 2):
        if i < len(sentences):
            # Capitalize first letter of sentence if not already capitalized
            if sentences[i] and not sentences[i][0].isupper() and sentences[i][0].isalpha():
                sentences[i] = sentences[i][0].upper() + sentences[i][1:]

            # Append sentence
            result += sentences[i]

            # Append punctuation and space
            if i + 1 < len(sentences):
                result += sentences[i + 1]

    return result