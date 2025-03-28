import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppHeader: React.FC = () => {
  return (
    <motion.header 
      className="bg-white shadow-sm border-b border-gray-100"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120 }}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/logo.svg" 
            alt="Mission Fresh Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              // Fallback if logo isn't available
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM0YzUxYmYiPjwvcmVjdD48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5NRjwvdGV4dD48L3N2Zz4=';
            }}
          />
          <span className="ml-2 font-semibold text-xl text-indigo-600">Mission Fresh</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition duration-150">
            Dashboard
          </Link>
          <Link to="/health" className="text-gray-600 hover:text-indigo-600 transition duration-150">
            Health
          </Link>
          <Link to="/community" className="text-gray-600 hover:text-indigo-600 transition duration-150">
            Community
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition duration-150">
            Profile
          </Link>
        </nav>
        
        <div className="flex items-center">
          <Link
            to="/profile"
            className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-150"
          >
            <span className="text-xs font-medium">MF</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader; 