import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pill,
  Thermometer,
  AlertCircle,
  Clock,
  GitBranch,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

const MedicineCard = ({ medicine }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const { details = {} } = medicine;

  const renderListSection = (title, items, Icon) => {
    if (!items || items.length === 0) return null;
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">
          <Icon className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
          {title}
        </h4>
        <ul className="list-disc list-inside space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
              {medicine.matched_name}
            </h3>
            {medicine.original_name !== medicine.matched_name && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Original: {medicine.original_name}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {medicine.rxnorm_validated && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                Validated
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
              {medicine.confidence_score}% match
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>RxNorm ID:</strong> {medicine.rxcui}</p>
          {details.dosage_forms?.length > 0 && (
            <p><strong>Dosage Forms:</strong> {details.dosage_forms.join(', ')}</p>
          )}
        </div>

        <button
          className="flex items-center justify-between w-full mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
          onClick={toggleExpanded}
        >
          <span className="text-sm font-medium">
            {expanded ? 'Hide Details' : 'Show Details'}
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700 mt-3 space-y-4 pt-3"
          >
            {renderListSection('Generic Names', details.generic_names, Layers)}
            {renderListSection('Brand Names', details.brand_names, Layers)}
            {renderListSection('Indications', details.indications, Thermometer)}
            {renderListSection('Dosage Forms', details.dosage_forms, Pill)}
            {renderListSection('Side Effects', details.side_effects, AlertCircle)}

            {details.mechanism_of_action && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">
                  <Clock className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
                  Mechanism of Action
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {details.mechanism_of_action}
                </p>
              </div>
            )}

            {typeof details.drug_interactions_count === 'number' && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">
                  <GitBranch className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
                  Drug Interactions
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {details.drug_interactions_count} interaction{details.drug_interactions_count !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {details.composition?.ingredients?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-1">
                  <Pill className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
                  Composition
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {details.composition.ingredients.map((ing, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                      {ing.name} {ing.rxcui ? `(RxCUI: ${ing.rxcui})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MedicineCard;
