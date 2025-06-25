import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, RefreshCcw, Pill } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ProcessingAnimation from '../components/ProcessingAnimation';
import MedicineCard from '../components/MedicineCard';
import FunFactPopup from '../components/FunFactPopup';
import { uploadPrescription } from '../services/api';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showFunFact, setShowFunFact] = useState(false);

  // Show fun fact popup when component mounts (after login/signup)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFunFact(true);
    }, 1000); // Show popup 1 second after landing on dashboard

    return () => clearTimeout(timer);
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResults(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const data = await uploadPrescription(file);
      setResults(data);
    } catch (err) {
      setError('Failed to process prescription. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setError('');
  };

  const handleCloseFunFact = () => {
    setShowFunFact(false);
  };

  const renderContent = () => {
    if (isProcessing) {
      return <ProcessingAnimation onComplete={() => {}} />;
    }
    
    if (results) {
      return (
        <motion.div 
          className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-green-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between border-b border-green-200 dark:border-gray-700 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
              <Pill className="h-6 w-6 text-green-600 dark:text-green-500" />
              Extracted Medicine Details
            </h2>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg px-4 py-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 text-sm font-medium transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Start New</span>
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.medicines.map((medicine, index) => (
                <MedicineCard key={index} medicine={medicine} />
              ))}
            </div>
            
            {results.extracted_text && (
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                  Extracted Text
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {results.extracted_text}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    return (
      <div className="space-y-8">
        <div className="text-center relative">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-30 flex">
            <div className="pill-decoration transform rotate-45"></div>
            <div className="pill-decoration transform -rotate-30"></div>
          </div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-40 flex">
            <div className="plus-decoration"></div>
            <div className="plus-decoration transform scale-75"></div>
          </div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-extrabold text-green-800 dark:text-green-400 leading-tight tracking-tight mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Unlock Your Prescription Details Instantly
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-green-700 dark:text-green-500 font-normal leading-relaxed mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            MediScan uses advanced OCR technology to quickly and accurately extract medication information from your prescription image or PDF.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FileUpload onFileSelect={handleFileSelect} />
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={handleUpload}
              disabled={!file}
              className={`inline-flex items-center gap-3 min-w-[240px] cursor-pointer justify-center overflow-hidden rounded-xl h-14 px-8 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white text-xl font-semibold leading-normal tracking-wide shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="h-6 w-6" />
              <span>Process Prescription</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {renderContent()}
      
      {/* Fun Fact Popup */}
      {showFunFact && <FunFactPopup onClose={handleCloseFunFact} />}
    </div>
  );
};

export default Dashboard;