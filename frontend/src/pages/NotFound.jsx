import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <AlertTriangle className="h-20 w-20 text-amber-500 dark:text-amber-400 mb-6" />
      
      <h1 className="text-4xl font-bold text-green-800 dark:text-green-400 mb-4">
        404 - Page Not Found
      </h1>
      
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      
      <Link 
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
      >
        <Home className="h-5 w-5" />
        <span>Return to Home</span>
      </Link>
    </motion.div>
  );
};

export default NotFound;