import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-primary-600 dark:text-primary-400 text-xl font-bold">
              MindfulAI
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Your AI-powered mental health companion
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link 
              to="/privacy-policy" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/resources" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
            >
              Resources
            </Link>
            <a 
              href="mailto:support@mindfulai.com" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © {year} MindfulAI. All rights reserved.
          </p>
          <p className="text-center text-gray-500 dark:text-gray-500 text-xs mt-2">
            Disclaimer: This application is not a substitute for professional mental health care. 
            Always consult with qualified healthcare providers for medical advice and treatment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 