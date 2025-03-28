import React from 'react';
import { cn } from '../../utils/cn';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  subtitle, 
  className = "",
  actions
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-2", className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}; 