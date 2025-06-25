import requests
import time


class RxNormValidator:
    """
    Class to validate medicine names against the RxNorm database and retrieve RxCUI identifiers.
    Falls back to 1mg.com search when RxNorm validation fails.
    """

    def __init__(self, base_url="https://rxnav.nlm.nih.gov/REST"):
        self.base_url = base_url
        self.request_delay = 0.5  # Delay between requests to avoid rate limiting

    def validate_with_rxnorm(self, medicine_name):
        """
        Query RxNorm API to check if the medicine name is valid.

        Args:
            medicine_name (str): The medicine name to validate

        Returns:
            dict: Dictionary containing rxcui, score, and name if found, otherwise None
        """
        if not medicine_name or not isinstance(medicine_name, str):
            return None

        # Clean medicine name for URL
        cleaned_name = medicine_name.strip()

        url = f"{self.base_url}/approximateTerm.json?term={cleaned_name}"

        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise exception for HTTP errors

            # Add delay to avoid rate limiting
            time.sleep(self.request_delay)

            data = response.json()
            candidates = data.get("approximateGroup", {}).get("candidate", [])

            if candidates:
                # Return the best match (first candidate)
                best_match = candidates[0]
                return {
                    "rxcui": best_match.get("rxcui"),
                    "score": float(best_match.get("score", 0)),
                    "name": best_match.get("name")
                }

            return None

        except Exception as e:
            print(f"RxNorm validation error for '{medicine_name}': {e}")
            return None

    def validate_with_1mg(self, medicine_name):
        """
        Fallback validation using 1mg.com search when RxNorm fails.

        Args:
            medicine_name (str): The medicine name to validate

        Returns:
            dict: Dictionary containing validation details or None if not found
        """
        if not medicine_name or not isinstance(medicine_name, str):
            return None

        # Clean medicine name for URL
        cleaned_name = medicine_name.strip().replace(" ", "+")

        search_url = f"https://www.1mg.com/search/all?name={cleaned_name}"

        try:
            # Add headers to mimic browser request
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }

            response = requests.get(search_url, headers=headers)

            # Add delay to avoid rate limiting
            time.sleep(self.request_delay)

            # If page exists (HTTP 200) and has content, consider it validated
            if response.status_code == 200 and len(response.text) > 500:  # Basic check for content
                return {
                    "1mg_validated": True,
                    "1mg_url": search_url,
                    "1mg_status_code": response.status_code
                }

            return None

        except Exception as e:
            print(f"1mg validation error for '{medicine_name}': {e}")
            return None

    def validate_medicines(self, medicine_list):
        """
        Validates a list of medicine dictionaries against RxNorm database.
        Falls back to 1mg.com validation when RxNorm fails.

        Args:
            medicine_list (list): List of medicine dictionaries from previous processing

        Returns:
            list: Enhanced list with RxNorm and fallback validation information
        """
        validated_list = []

        for medicine in medicine_list:
            # Store original medicine dict
            validated_medicine = medicine.copy()

            # Only validate if we have a matched medicine
            if medicine["matched"]:
                medicine_name = medicine["matched"]
                rxnorm_info = self.validate_with_rxnorm(medicine_name)

                if rxnorm_info:
                    # Add RxNorm information to the medicine dict
                    validated_medicine["rxnorm_validated"] = True
                    validated_medicine["rxcui"] = rxnorm_info["rxcui"]
                    validated_medicine["rxnorm_score"] = rxnorm_info["score"]
                    validated_medicine["rxnorm_name"] = rxnorm_info["name"]
                    validated_medicine["1mg_validated"] = False  # No need for 1mg validation
                else:
                    # RxNorm validation failed, try 1mg fallback
                    validated_medicine["rxnorm_validated"] = False
                    validated_medicine["rxcui"] = None
                    validated_medicine["rxnorm_score"] = 0
                    validated_medicine["rxnorm_name"] = None

                    # Attempt 1mg validation as fallback
                    mg_info = self.validate_with_1mg(medicine_name)

                    if mg_info:
                        # Add 1mg validation information
                        validated_medicine["1mg_validated"] = True
                        validated_medicine["1mg_url"] = mg_info["1mg_url"]
                        validated_medicine["1mg_status_code"] = mg_info["1mg_status_code"]
                    else:
                        validated_medicine["1mg_validated"] = False
            else:
                # No matched medicine to validate
                validated_medicine["rxnorm_validated"] = False
                validated_medicine["rxcui"] = None
                validated_medicine["rxnorm_score"] = 0
                validated_medicine["rxnorm_name"] = None
                validated_medicine["1mg_validated"] = False

            validated_list.append(validated_medicine)

        return validated_list