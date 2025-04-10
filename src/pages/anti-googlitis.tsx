import React from 'react';
import { AntiGooglitis } from '@/components/AntiGooglitis';

export default function AntiGooglitisPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Anti-Googlitis</h1>
      <p className="text-muted-foreground mb-6">
        Manage digital distractions and reduce mindless browsing habits
      </p>
      
      <AntiGooglitis />
    </div>
  );
} 