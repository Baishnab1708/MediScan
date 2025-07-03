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
Extract only valid medicine names along with their dosages from the given text.

Strictly follow these rules:
1. Ignore all unrelated content such as names, addresses, contact info, instructions, manufacturer details, pharmacy details, and appointment-related data.
2. Discard words or phrases that are likely noise: single words or 2–4 letter tokens that do not resemble medicines or dosages.
3. Only include items that clearly indicate a medicine and optionally its strength or dosage, e.g., “Paracetamol 500mg”, “Insulin 30/70”, “Amoxicillin 250 mg/5ml”.
4. Correct minor OCR errors or misspellings if the intended medicine is clear.
5. Be 90% certain before including an item. If unsure, discard it.
6. Return output as a JSON array. Each entry must include:
   - "name": cleaned and corrected medicine name with dosage.
   - "position": approximate location like "line 4" or "paragraph 2".

Example output:
[
  {"name": "Paracetamol 500mg", "position": "line 3"},
  {"name": "Ciprofloxacin 250mg", "position": "paragraph 1"}
]

Text to analyze is given below:
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