import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';


const checkpoints = [
  { id: 'checkpoint-ocr', name: 'OCR', duration: 10000 },        
  { id: 'checkpoint-analysis', name: 'Analysis', duration: 10000 }, 
  { id: 'checkpoint-extract', name: 'Extract', duration: 10000 },  
  { id: 'checkpoint-details', name: 'Details', duration: 10000 }, 
];

const TOTAL_DURATION = 20000;
const HOLD_PERCENT = 97; // hold at 97% until backend responds

export default function ProcessingAnimation({ onComplete, backendResponseReceived }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Starting...');
  const [isDone, setIsDone] = useState(false);

  // Define manual percent thresholds so Analysis ends at 55%
  const thresholdsPercent = useMemo(() => [25, 55, 75, 95], []);

  // Trigger complete when backend response arrives
  useEffect(() => {
    if (backendResponseReceived) {
      setIsDone(true);
      setProgress(100);
      setStatusText('Complete!');
      onComplete?.();
    }
  }, [backendResponseReceived, onComplete]);

  useEffect(() => {
    if (isDone) return; // pause animation when done

    let animationFrame;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const clampedTime = Math.min(elapsed, TOTAL_DURATION);
      const rawPercent = (clampedTime / TOTAL_DURATION) * 100;
      const displayPercent = Math.min(rawPercent, HOLD_PERCENT);

      setProgress(displayPercent);

      // Update status based on raw percent and new thresholds
      for (let i = 0; i < thresholdsPercent.length; i++) {
        if (rawPercent <= thresholdsPercent[i]) {
          setStatusText(`${checkpoints[i].name}...`);
          break;
        }
      }

      if (!isDone) animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isDone, thresholdsPercent]);

  return (
    <div className="mx-auto max-w-lg mt-10 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-green-200 dark:border-gray-700 flex flex-col items-center">
      <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-6 text-center animate-pulse">
        Extracting Information
      </h2>

      {/* Progress Bar */}
      <div className="w-full mb-4">
        <div className="relative w-full h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-green-600 to-green-800"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
        <div className="text-right text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Checkpoint Indicators */}
      <div className="w-full grid grid-cols-4 gap-4 mt-6">
        {checkpoints.map((cp, idx) => {
          const activated = progress >= thresholdsPercent[idx];
          return (
            <motion.div
              key={cp.id}
              className="flex flex-col items-center text-sm"
              animate={activated ? { scale: 1.2 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`w-4 h-4 rounded-full mb-1 transition-colors duration-300 ${
                  activated ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <span className={`${activated ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {cp.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Status Text */}
      <motion.div
        className="mt-4 text-center text-green-600 dark:text-green-300 font-semibold text-lg"
        animate={{ opacity: [0, 1, 0.8, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {statusText}
      </motion.div>
    </div>
  );
}
