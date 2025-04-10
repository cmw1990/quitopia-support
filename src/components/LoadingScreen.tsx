import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin mb-4">
        <Loader2 size={32} className="text-primary" />
      </div>
      <p className="text-lg text-center">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">This may take a moment...</p>
    </div>
  );
};

export default LoadingScreen;
