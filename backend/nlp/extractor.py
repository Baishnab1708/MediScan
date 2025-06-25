import json
import requests
import time
from app.core.config import settings

# Constants
DEFAULT_CONFIDENCE_SCORE = 95
FALLBACK_CONFIDENCE_SCORE = 90
MAX_TOKENS = 1000  # Roughly ~750–1000 words depending on language


class OpenRouterExtractor:
    """Class for extracting medicine names from OCR text using OpenRouter API."""

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.endpoint = settings.OPENROUTER_BASE_URL
        self.model = settings.OPENROUTER_MODEL
        self.base_prompt = """
Provided below is a scanned text from which you need to extract only the medicine names along with their dosages.

Perform the following tasks:

Accurately identify and extract names of medicines, including their dosages such as mg/ml/unit when present.
Ignore unrelated information like instructions, manufacturer’s names, or other entities not relevant to medicine names.
Correct any misspellings in medicine names when obvious, ensuring only valid names are included.
Return the results in JSON array format as illustrated in the example. Each object within the array must contain:
“name”: the exact name of the medicine with its dosage.
“position”: the location within the text where the medicine information appears (e.g., “line 1”, “paragraph 2”).
Output Format Example:
[
{“name”: “Paracetamol 500mg”, “position”: “line 3”},
{“name”: “Amoxicillin 250mg”, “position”: “paragraph 2”}
]
Enhance accuracy by understanding the context to determine whether the medicine information resides in a line or paragraph.
The text to analyze is surrounded by triple quotes below:
"""

    def _make_request(self, prompt, retries=3, delay=2):
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000,
            "temperature": 0.0
        }

        for attempt in range(retries):
            response = requests.post(
                url=self.endpoint,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                data=json.dumps(payload)
            )
            if response.status_code == 200:
                return response
            time.sleep(delay)
        return None

    def _truncate_text(self, text, max_tokens=MAX_TOKENS):
        """Roughly truncate text to max_tokens (word-based)."""
        words = text.split()
        if len(words) > max_tokens:
            return ' '.join(words[:max_tokens])
        return text

    def extract_medicine_names(self, text):
        text = self._truncate_text(text)
        prompt = f"{self.base_prompt}\n\nText to analyze:\n{text}"
        response = self._make_request(prompt)

        if response:
            try:
                result = response.json()
                output = result['choices'][0]['message']['content'].strip()

                # Try to extract JSON
                json_start = output.find('[')
                json_end = output.rfind(']') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = output[json_start:json_end]
                    medicines_data = json.loads(json_str)
                else:
                    medicines_data = json.loads(output)

                # Process results
                processed_results = []
                for idx, med in enumerate(medicines_data):
                    processed_results.append({
                        "original": med.get("name", ""),
                        "matched": med.get("name", ""),
                        "score": DEFAULT_CONFIDENCE_SCORE,
                        "position": med.get("position", f"position {idx + 1}")
                    })
                return processed_results

            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print("Attempting alternate parsing method...")
                medicines = [med.strip() for med in output.split(',')]
                processed_results = []
                for idx, med in enumerate(medicines):
                    if med:
                        processed_results.append({
                            "original": med,
                            "matched": med,
                            "score": FALLBACK_CONFIDENCE_SCORE,
                            "position": f"position {idx + 1}"
                        })
                return processed_results
        else:
            print("API Error: Failed after retries.")
            return []