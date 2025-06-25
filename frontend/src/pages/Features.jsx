import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye, Shield, FileImage, Dices as Devices, CheckSquare } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Zap className="text-5xl text-green-600 dark:text-green-500 mb-4" />,
      title: "Fast & Accurate",
      description: "Get your prescription details extracted in seconds with high accuracy."
    },
    {
      icon: <Eye className="text-5xl text-green-600 dark:text-green-500 mb-4" />,
      title: "Easy to Use",
      description: "Simple drag & drop or upload interface. No technical skills required."
    },
    {
      icon: <Shield className="text-5xl text-green-600 dark:text-green-500 mb-4" />,
      title: "Secure & Private",
      description: "Your data is processed securely and is not stored after extraction."
    },
    {
      icon: <FileImage className="text-5xl text-green-600 dark:text-green-500 mb-4" />,
      title: "Multiple Formats",
      description: "Supports various image formats (JPG, PNG) and PDF files."
    },
    {
      icon: <Devices className="text-5xl text-green-600 dark:text-green-500 mb-4" />,
      title: "Accessible Anywhere",
      description: "Use MediScan on your desktop, tablet, or smartphone."
    },
    {
      icon: <CheckSquare className="text-5xl text-green-600 dark:text-green-500 mb-4" />,
      title: "Validated Data",
      description: "Validated by RxNorm API and enriched with OpenFDA details."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-10"
    >
      <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-8 text-center">Key Features</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-green-200 dark:border-gray-700 text-center hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">{feature.title}</h3>
            <p className="text-green-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-green-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">
          Why Choose MediScan?
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-3">
              For Patients
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Quickly extract medication names and doses from prescriptions
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Better understand your prescriptions with matched RxNorm data
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Access detailed medication information instantly
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-500 mb-3">
              For Caregivers
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Quick reference for medication details
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  Reduce prescription reading errors
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default Features;