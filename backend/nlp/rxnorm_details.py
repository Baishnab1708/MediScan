import requests
import time
from typing import Dict, List, Optional


class RxNormDetailsValidator:
    """Enhanced RxNorm validator that fetches detailed medicine information."""

    def __init__(self):
        self.base_url = "https://rxnav.nlm.nih.gov/REST"
        self.session = requests.Session()

    def get_drug_interactions(self, rxcui: str) -> List[str]:
        """Get drug interactions for a given RxCUI."""
        interactions = []
        try:
            url = f"{self.base_url}/interaction/interaction.json?rxcui={rxcui}"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                if 'interactionTypeGroup' in data:
                    for group in data['interactionTypeGroup']:
                        if 'interactionType' in group:
                            for interaction in group['interactionType']:
                                if 'interactionPair' in interaction:
                                    for pair in interaction['interactionPair']:
                                        desc = pair.get('description', '')
                                        if desc and desc not in interactions and len(interactions) < 5:
                                            interactions.append(desc)
            time.sleep(0.2)
        except Exception as e:
            print(f"Error fetching interactions for {rxcui}: {e}")

        return interactions

    def get_detailed_composition(self, rxcui: str) -> Dict:
        """Get detailed composition and strength information."""
        composition = {}
        try:
            # Get all properties
            url = f"{self.base_url}/rxcui/{rxcui}/allProperties.json?prop=all"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                data = response.json()
                if 'propConceptGroup' in data and 'propConcept' in data['propConceptGroup']:
                    for prop in data['propConceptGroup']['propConcept']:
                        prop_name = prop.get('propName', '')
                        prop_value = prop.get('propValue', '')

                        if prop_name == 'RxNorm Name':
                            composition['name'] = prop_value
                        elif prop_name == 'Prescribable Name':
                            composition['prescribable_name'] = prop_value
                        elif 'strength' in prop_name.lower():
                            composition['strength'] = prop_value

            # Get ingredients with strengths
            ing_url = f"{self.base_url}/rxcui/{rxcui}/allrelated.json"
            ing_response = self.session.get(ing_url, timeout=10)

            if ing_response.status_code == 200:
                ing_data = ing_response.json()
                composition['ingredients'] = []

                if 'allRelatedGroup' in ing_data and 'conceptGroup' in ing_data['allRelatedGroup']:
                    for group in ing_data['allRelatedGroup']['conceptGroup']:
                        if group.get('tty') in ['IN', 'PIN', 'MIN']:
                            if 'conceptProperties' in group:
                                for concept in group['conceptProperties']:
                                    ingredient = {
                                        'name': concept.get('name', ''),
                                        'rxcui': concept.get('rxcui', '')
                                    }
                                    if ingredient['name'] and ingredient not in composition['ingredients']:
                                        composition['ingredients'].append(ingredient)

            time.sleep(0.2)
        except Exception as e:
            print(f"Error fetching composition for {rxcui}: {e}")

        return composition

    def get_clinical_info(self, drug_name: str) -> Dict:
        """Get clinical information from external sources (simplified version)."""
        # This is a placeholder for clinical info that would typically come from
        # medical databases like DrugBank, FDA, or clinical references
        clinical_info = {
            'indications': [],
            'contraindications': [],
            'side_effects': [],
            'mechanism_of_action': ''
        }

        # Basic mapping for common drugs (you can expand this or integrate with other APIs)
        drug_mappings = {
            'metoprolol': {
                'indications': ['Hypertension', 'Heart failure', 'Angina', 'Post-myocardial infarction'],
                'side_effects': ['Fatigue', 'Dizziness', 'Depression', 'Cold hands/feet', 'Slow heart rate'],
                'mechanism_of_action': 'Selective beta-1 adrenergic receptor blocker'
            },
            'dorzolamide': {
                'indications': ['Glaucoma', 'Ocular hypertension'],
                'side_effects': ['Eye irritation', 'Bitter taste', 'Blurred vision', 'Eye pain'],
                'mechanism_of_action': 'Carbonic anhydrase inhibitor - reduces aqueous humor production'
            },
            'cimetidine': {
                'indications': ['Peptic ulcer', 'GERD', 'Heartburn', 'Zollinger-Ellison syndrome'],
                'side_effects': ['Diarrhea', 'Dizziness', 'Drowsiness', 'Headache', 'Gynecomastia'],
                'mechanism_of_action': 'H2 receptor antagonist - reduces stomach acid production'
            },
            'oxprenolol': {
                'indications': ['Hypertension', 'Angina', 'Arrhythmias', 'Anxiety'],
                'side_effects': ['Fatigue', 'Dizziness', 'Cold extremities', 'Sleep disturbances'],
                'mechanism_of_action': 'Non-selective beta-adrenergic receptor blocker with ISA'
            }
        }

        # Look for matches in drug name
        drug_lower = drug_name.lower()
        for key, info in drug_mappings.items():
            if key in drug_lower:
                clinical_info.update(info)
                break

        return clinical_info

    def get_medicine_details(self, rxcui: str) -> Dict:
        """Get detailed information about a medicine using its RxCUI."""
        details = {
            'composition': {},
            'indications': [],
            'dosage_forms': [],
            'brand_names': [],
            'generic_names': [],
            'drug_interactions': [],
            'side_effects': [],
            'mechanism_of_action': '',
            'contraindications': []
        }

        try:
            # Get basic properties
            props_url = f"{self.base_url}/rxcui/{rxcui}/properties.json"
            props_response = self.session.get(props_url, timeout=10)

            if props_response.status_code == 200:
                props_data = props_response.json()
                if 'properties' in props_data and props_data['properties']:
                    prop = props_data['properties']
                    details['composition']['basic_info'] = {
                        'name': prop.get('name', ''),
                        'synonym': prop.get('synonym', ''),
                        'tty': prop.get('tty', '')
                    }

            # Get detailed composition
            detailed_comp = self.get_detailed_composition(rxcui)
            details['composition'].update(detailed_comp)

            # Get related concepts using allrelated endpoint
            related_url = f"{self.base_url}/rxcui/{rxcui}/allrelated.json"
            related_response = self.session.get(related_url, timeout=10)

            if related_response.status_code == 200:
                related_data = related_response.json()
                if 'allRelatedGroup' in related_data and 'conceptGroup' in related_data['allRelatedGroup']:
                    concept_groups = related_data['allRelatedGroup']['conceptGroup']

                    for group in concept_groups:
                        tty = group.get('tty', '')
                        if 'conceptProperties' in group:
                            concepts = group['conceptProperties']

                            for concept in concepts:
                                name = concept.get('name', '').strip()
                                if name:
                                    if tty in ['BN', 'BPCK', 'SBD', 'SBDC']:  # Brand names
                                        if name not in details['brand_names']:
                                            details['brand_names'].append(name)
                                    elif tty in ['IN', 'PIN', 'MIN']:  # Generic ingredients
                                        if name not in details['generic_names']:
                                            details['generic_names'].append(name)
                                    elif tty in ['DF']:  # Dosage forms
                                        if name not in details['dosage_forms']:
                                            details['dosage_forms'].append(name)

            # Get drug interactions
            details['drug_interactions'] = self.get_drug_interactions(rxcui)

            # Get clinical information based on generic names
            if details['generic_names']:
                main_ingredient = details['generic_names'][0]
                clinical_info = self.get_clinical_info(main_ingredient)
                details['indications'] = clinical_info.get('indications', [])
                details['side_effects'] = clinical_info.get('side_effects', [])
                details['mechanism_of_action'] = clinical_info.get('mechanism_of_action', '')
                details['contraindications'] = clinical_info.get('contraindications', [])

            # Try alternative approach for ingredients if empty
            if not details['generic_names']:
                ing_url = f"{self.base_url}/rxcui/{rxcui}/allProperties.json?prop=all"
                ing_response = self.session.get(ing_url, timeout=10)

                if ing_response.status_code == 200:
                    ing_data = ing_response.json()
                    if 'propConceptGroup' in ing_data and 'propConcept' in ing_data['propConceptGroup']:
                        for prop in ing_data['propConceptGroup']['propConcept']:
                            if prop.get('propName') == 'RxNorm Name':
                                name = prop.get('propValue', '').strip()
                                if name and name not in details['generic_names']:
                                    details['generic_names'].append(name)
                                    # Get clinical info for this ingredient too
                                    clinical_info = self.get_clinical_info(name)
                                    if clinical_info['indications']:
                                        details['indications'] = clinical_info.get('indications', [])
                                        details['side_effects'] = clinical_info.get('side_effects', [])
                                        details['mechanism_of_action'] = clinical_info.get('mechanism_of_action', '')

            time.sleep(0.3)  # Rate limiting

        except Exception as e:
            print(f"Error fetching details for RxCUI {rxcui}: {e}")

        return details

    def validate_medicines_with_details(self, medicines: List[Dict]) -> List[Dict]:
        """Validate medicines and fetch detailed information for matched ones."""
        enhanced_medicines = []

        for medicine in medicines:
            enhanced_medicine = medicine.copy()

            # If medicine was validated and has RxCUI, get details
            if medicine.get('rxnorm_validated') and medicine.get('rxcui'):
                print(f"Fetching details for {medicine['original']}...")
                details = self.get_medicine_details(medicine['rxcui'])
                enhanced_medicine['details'] = details
            else:
                enhanced_medicine['details'] = None

            enhanced_medicines.append(enhanced_medicine)

        return enhanced_medicines