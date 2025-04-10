import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

export const Canvas: React.FC = () => {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-1 bg-background",
        "overflow-auto p-4",
        "grid grid-cols-12 gap-4",
        "relative"
      )}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      {/* Components will be rendered here */}
    </div>
  );
};
