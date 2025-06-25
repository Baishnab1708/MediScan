import React from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-green-200 dark:border-gray-700 text-center"
    >
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-4">Contact Us</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Have any questions or feedback? Feel free to reach out to us at:
      </p>

      <div className="flex items-center justify-center gap-3">
        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
          <Mail className="h-6 w-6 text-green-700 dark:text-green-400" />
        </div>
        <a
          href="mailto:support@mediscan.example.com"
          className="text-green-600 dark:text-green-400 text-lg font-medium hover:underline"
        >
          baishnab1708@gmail.com
        </a>
      </div>
    </motion.section>
  );
};

export default Contact;
