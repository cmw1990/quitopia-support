import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Search size={48} className="text-primary" />
            </div>
            <div className="absolute top-0 right-0 -mr-3 -mt-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive text-destructive-foreground text-lg font-bold">
                ?
              </div>
            </div>
          </div>
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or you don't have permission to view it.
        </p>
        
        <div className="space-y-3">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <div>
            <Link to="/app/dashboard" className="text-sm text-primary hover:underline inline-block mt-4">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
