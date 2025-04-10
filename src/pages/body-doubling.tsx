import React from 'react';
import BodyDoubling from '@/components/adhd/BodyDoubling';

export default function BodyDoublingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Body Doubling</h1>
      <p className="text-muted-foreground mb-6">
        Work alongside others to improve focus and accountability
      </p>
      
      <BodyDoubling />
    </div>
  );
} 