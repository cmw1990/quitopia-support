import React from 'react';
import ContextSwitchingAssistant from '@/components/adhd/ContextSwitchingAssistant';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

export default function ContextSwitchingAssistantPage() {
  return (
    <>
      <Helmet>
        <title>Context Switching Assistant | Easier Focus</title>
        <meta name="description" content="ADHD-friendly tools to manage transitions between tasks with minimal cognitive cost" />
      </Helmet>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4 md:px-6"
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Context Switching Assistant</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Minimize cognitive load and enhance productivity when transitioning between tasks or projects
          </p>
        </header>
        
        <ContextSwitchingAssistant />
      </motion.div>
    </>
  );
} 