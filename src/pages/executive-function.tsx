import React from 'react';
import ExecutiveFunction from '@/components/adhd/ExecutiveFunction';

export default function ExecutiveFunctionPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Executive Function Support</h1>
      <p className="text-muted-foreground mb-6">
        Tools to help manage working memory, task initiation, and planning
      </p>
      
      <ExecutiveFunction />
    </div>
  );
} 