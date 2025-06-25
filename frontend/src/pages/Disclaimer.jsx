import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

const Disclaimer = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-green-200 dark:border-gray-700"
    >
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-6">Disclaimer & Limitation of Liability</h2>
      
      <div className="space-y-8">
        {/* No Warranty Section */}
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">No Warranties</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              MediScan is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind,
              express or implied. We disclaim all warranties, including but not limited to warranties
              of accuracy, completeness, merchantability, fitness for a particular purpose, non-infringement,
              and any warranties arising from course of dealing or usage of trade.
            </p>
          </div>
        </div>
        
        {/* Accuracy Limitations */}
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
            <Info className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">Accuracy & Verification</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              While MediScan uses best-in-class OCR and NER technologies, we do not guarantee the
              accuracy or completeness of extracted information. Users must verify all results
              against the original prescription and consult a qualified healthcare professional
              before making any decisions.
            </p>
          </div>
        </div>
        
        {/* No Liability Section */}
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
            <HelpCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">Limitation of Liability</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, MediScan, its affiliates, officers,
              employees and agents shall not be liable for any direct, indirect, incidental,
              special, consequential or punitive damages, or any loss of profits or revenues,
              whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
              intangible losses, resulting from (i) your use of or inability to use MediScan; (ii)
              any unauthorized access to or use of our servers and/or any personal information stored within;
              or (iii) any errors or omissions in the Service's content.
            </p>
          </div>
        </div>
      </div>
      
      {/* Emergency Notice */}
      <div className="mt-8 p-5 bg-green-50 dark:bg-gray-700 rounded-lg border border-green-100 dark:border-gray-600">
        <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">Emergency Notice</h4>
        <p className="text-gray-700 dark:text-gray-300">
          In case of a medical emergency, dial your local emergency services immediately.
          MediScan is not designed for emergency use and should not be used as a substitute
          for immediate professional medical care.
        </p>
      </div>
      
      {/* Acknowledgment */}
      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        By accessing or using MediScan, you acknowledge that you have read, understood,
        and agree to this disclaimer and limitation of liability. If you do not agree,
        please discontinue use immediately.
      </p>
    </motion.section>
  );
};

export default Disclaimer;
