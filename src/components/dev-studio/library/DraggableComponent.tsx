import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DraggableComponentProps {
  type: string;
  label: string;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ type, label }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `component-${type}`,
    data: {
      type,
      label,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "p-2 border border-border rounded-md",
        "flex items-center justify-center",
        "bg-card hover:bg-accent cursor-move",
        "text-sm font-medium",
        isDragging && "opacity-50"
      )}
    >
      {label}
    </div>
  );
};
