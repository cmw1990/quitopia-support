import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import MainNav from '../nav/MainNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-lg">EasierFocus</span>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Energy Level: 7/10
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      <MainNav />
    </div>
  );
};

export default MainLayout;
