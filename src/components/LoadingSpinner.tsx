import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Loading</span>
    </div>
  );
}; 