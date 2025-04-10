import React from 'react';
import ContextSwitchingAssistant from '@/components/adhd/ContextSwitchingAssistant';

export default function ContextSwitchingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Context Switching Assistant</h1>
      <p className="text-muted-foreground mb-6">
        Minimize cognitive load when switching between tasks
      </p>
      
      <ContextSwitchingAssistant />
    </div>
  );
} 