import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 dark:border-b-gray-700 px-4 sm:px-6 lg:px-10 py-4 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center gap-0.25 ml-[-8px] text-slate-800 dark:text-gray-100">
            <img src="/logo.png"  alt="MediScan Logo"  className="h-8 sm:h-10 sm:w-12 object-contain"/>
            <h2 className="text-green-700 dark:text-green-400 text-xl sm:text-2xl font-bold leading-tight tracking-tight">MediScan</h2>
          </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center py-8 sm:py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="py-4 px-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} MediScan. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;