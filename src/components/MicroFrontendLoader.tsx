import React, { useEffect, useState } from 'react';

interface MicroFrontendProps {
  name: string;
  remoteName: string;
  modulePath: string;
  fallback?: React.ReactNode;
}

export const MicroFrontendLoader = ({ 
  name, 
  remoteName, 
  modulePath,
  fallback = <div>Loading {name} micro-frontend...</div>
}: MicroFrontendProps) => {
  const [MicroFrontend, setMicroFrontend] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import the micro-frontend
    const loadMicroFrontend = async () => {
      try {
        // @ts-ignore
        const module = await import(/* @vite-ignore */ remoteName + '/' + modulePath);
        setMicroFrontend(() => module.default);
      } catch (err) {
        console.error(`Failed to load ${name} micro-frontend:`, err);
        setError(`Failed to load ${name} micro-frontend. Please try again later.`);
      }
    };

    loadMicroFrontend();
  }, [name, remoteName, modulePath]);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Micro-Frontend</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!MicroFrontend) {
    return <>{fallback}</>;
  }

  return <MicroFrontend />;
};

// For dynamic import usage
export default {
  MicroFrontendLoader
}; 