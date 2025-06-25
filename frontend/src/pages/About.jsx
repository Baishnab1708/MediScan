import React from 'react';
import { motion } from 'framer-motion';
import { Activity, User, FileText } from 'lucide-react';

const About = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-green-200 dark:border-gray-700 px-6 sm:px-8 md:px-10"
    >
      <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-6 text-center">About MediScan</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <img 
            alt="MediScan illustration" 
            className="rounded-lg shadow-md border-2 border-green-200 dark:border-gray-600" 
            src="meds3.jpg"
          />
        </div>
        <div>
          <p className="text-green-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
            MediScan employs state-of-the-art Optical Character Recognition (OCR) technology to accurately extract and digitize text from prescription images and PDF documents. It seamlessly converts handwritten notes and printed scripts into clear, editable content, ensuring precision and efficiency for downstream processing.
          </p>
          <p className="text-green-700 dark:text-gray-300 leading-relaxed mb-4 text-lg">
            MediScan integrates advanced Named Entity Recognition (NER) models to automatically identify and extract critical medication details from the digitized prescription text. It highlights drug names, exact dosage strengths with units of measure, organizing this data into structured fields to facilitate easy review and reduce the risk of misinterpretation.
          </p>
          <p className="text-green-700 dark:text-gray-300 leading-relaxed text-lg">
            MediScan further validates extracted prescription data against RxNorm standards to ensure consistency in drug nomenclature and codification. It then enriches each entry with comprehensive OpenFDA information, including regulatory approval status, safety alerts, and guidelines. This integration provides users with authoritative drug details and enhances confidence in medication management and patient safety.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-green-700 dark:text-green-500 mb-6 text-center">Our Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-green-100 dark:border-gray-600">
            <div className="flex justify-center mb-4">
              <Activity className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2 text-center">Accuracy</h4>
            <p className="text-green-600 dark:text-gray-300 text-center">We prioritize precision in our extraction algorithms to ensure you get reliable medication information.</p>
          </div>
          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-green-100 dark:border-gray-600">
            <div className="flex justify-center mb-4">
              <User className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2 text-center">Privacy</h4>
            <p className="text-green-600 dark:text-gray-300 text-center">Your personal health information remains private. We don't store your prescriptions or extracted data.</p>
          </div>
          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-green-100 dark:border-gray-600">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2 text-center">Accessibility</h4>
            <p className="text-green-600 dark:text-gray-300 text-center">We believe everyone should have easy access to understand their medication details clearly.</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default About;