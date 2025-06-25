import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, Server } from 'lucide-react';

const Privacy = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-green-200 dark:border-gray-700"
    >
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-6">Privacy Policy</h2>
      
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <Shield className="h-6 w-6 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">Your Data Protection</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your privacy is important to us. MediScan is committed to protecting your personal information. We do not store your uploaded prescription files or the extracted data after your session ends. All processing is done in real-time, and your data is discarded once the information is displayed to you. We do not share your information with any third parties.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <Server className="h-6 w-6 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">Data Processing</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              When you upload a prescription to MediScan, it is temporarily processed on our secure servers for the sole purpose of extracting medication information. This processing includes OCR text extraction, medicine name identification, and validation against medical databases. Once this process is complete and the results are delivered to you, all copies of your prescription and extracted data are permanently deleted from our systems.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <Clock className="h-6 w-6 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">Session-Only Storage</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Any data related to your prescription is only kept for the duration of your active session. We do not maintain a database of user prescriptions or medication information. Once you close your browser or navigate away from MediScan, all your data is automatically purged from our temporary storage.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <Lock className="h-6 w-6 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500 mb-2">Usage Statistics</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may collect anonymous usage statistics to improve our service, but this data will not contain any personally identifiable information or prescription details. This statistical information helps us understand how users interact with our application and allows us to make improvements to the user experience.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
              By using MediScan, you consent to this privacy policy. If you have any questions about our privacy practices, please contact us.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Last Updated:</strong> July 25, 2025
        </p>
      </div>
    </motion.section>
  );
};

export default Privacy;