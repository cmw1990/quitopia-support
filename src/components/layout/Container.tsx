import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={cn(
      "container px-4 mx-auto max-w-7xl", 
      className
    )}>
      {children}
    </div>
  );
}; 