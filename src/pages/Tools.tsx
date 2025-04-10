import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ToolsProps {
  className?: string;
}

export const Tools: React.FC<ToolsProps> = ({ className }) => {
  return (
    <div className={cn('flex h-screen flex-col', className)}>
      {/* Tools header with navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <h1 className="text-2xl font-bold">Tools</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
