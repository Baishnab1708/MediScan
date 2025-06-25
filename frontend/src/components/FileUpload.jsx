import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUpload = ({ onFileSelect, accept = "image/*,application/pdf", maxSize = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file) => {
    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the ${maxSize}MB limit`);
      return false;
    }

    // Check file type
    const fileType = file.type;
    const acceptedTypes = accept.split(',');
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('/*')) {
        // Handle wildcards like image/*
        const baseType = type.split('/')[0];
        return fileType.startsWith(`${baseType}/`);
      }
      return type === fileType;
    });

    if (!isAccepted) {
      setError('File type not accepted');
      return false;
    }

    return true;
  };

  const processFile = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setError('');
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  const getFileIcon = () => {
    if (selectedFile?.type.startsWith('image/')) {
      return <Image className="h-10 w-10 text-green-600 dark:text-green-500" />;
    }
    return <FileText className="h-10 w-10 text-green-600 dark:text-green-500" />;
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept={accept}
        onChange={handleFileChange}
      />

      {!selectedFile ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 ${
            isDragging 
              ? 'border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ minHeight: '200px' }}
        >
          <Upload className="h-12 w-12 text-green-600 dark:text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Drag & Drop your prescription
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            or <button onClick={handleButtonClick} className="text-green-600 dark:text-green-500 font-medium hover:underline">browse files</button>
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Supports JPG, PNG, PDF files up to {maxSize}MB
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg w-full max-w-md">
              {error}
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          className="border rounded-xl p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {selectedFile.name}
                </h4>
                <button 
                  onClick={removeFile}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;