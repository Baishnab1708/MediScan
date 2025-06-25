import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';

const FunFactPopup = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.5 }}
          className="fixed bottom-4 right-4 z-50 max-w-xs sm:max-w-sm"
        >
          <div className="bg-green-400/20 dark:bg-green-300/15 backdrop-blur-lg text-green-800 dark:text-green-100 p-4 rounded-xl shadow-2xl border border-green-300/30 dark:border-green-400/20">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
              <p className="flex-1 text-base font-medium leading-relaxed text-green-800 dark:text-green-100">
                You can also upload the back side of the medicine!
              </p>
              <button
                onClick={handleClose}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 p-1 rounded-full hover:bg-green-300/20 dark:hover:bg-green-400/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FunFactPopup;