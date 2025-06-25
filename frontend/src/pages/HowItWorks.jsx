import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Database, FileSearch, CheckCircle, Upload, List } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: <Upload className="h-6 w-6 text-white" />,
      title: "Upload Your Prescription",
      description: "Securely upload a clear image or PDF of your prescription for optimal OCR accuracy."
    },
    {
      number: 2,
      icon: <Scan className="h-6 w-6 text-white" />,
      title: "OCR Processing",
      description: "Our OCR engine converts the uploaded file into machine-readable text with high precision."
    },
    {
      number: 3,
      icon: <FileSearch className="h-6 w-6 text-white" />,
      title: "Medicine Name Extraction",
      description: "A powerful NER model identifies potential medication names and dosages from the extracted text."
    },
    {
      number: 4,
      icon: <Database className="h-6 w-6 text-white" />,
      title: "Standardization via RxNorm",
      description: "Extracted names are cross-checked against RxNorm to ensure standardized, accurate drug naming."
    },
    {
      number: 5,
      icon: <List className="h-6 w-6 text-white" />,
      title: "Detailed Info Lookup",
      description: "Fetch comprehensive details—composition, form, usage—from RxNorm and OpenFDA databases."
    },
    {
      number: 6,
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      title: "Review & Display",
      description: "Present validated medicines and their key details in a clean, user-friendly layout."
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-10 bg-green-50 dark:bg-gray-800 rounded-xl shadow-inner px-6 sm:px-8 md:px-10"
    >
      <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-12 text-center">
        How MediScan Works
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-green-600 dark:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
              {step.number}
            </div>
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2 text-center">
              {step.title}
            </h3>
            <p className="text-green-600 dark:text-gray-300 text-sm leading-relaxed text-center">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-white dark:bg-gray-700 p-8 rounded-xl shadow-xl">
        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">
          The Tech Stack Behind MediScan
        </h3>
        
        <div className="space-y-6">
          <div className="border-l-4 border-green-500 dark:border-green-600 pl-4">
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-2">
              Optical Character Recognition (OCR)
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              Converts prescription images into accurate text data, forming the foundation for further analysis.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 dark:border-green-600 pl-4">
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-2">
              Named Entity Recognition (NER)
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              Identifies medication names and dosages using advanced NLP, ensuring precise extraction from raw text.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 dark:border-green-600 pl-4">
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-2">
              RxNorm Integration
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              Validates and standardizes drug names against the RxNorm database, maintained by the National Library of Medicine.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 dark:border-green-600 pl-4">
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-2">
              OpenFDA API
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              Retrieves detailed drug information—usage, side effects, composition—to enrich user insights.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;