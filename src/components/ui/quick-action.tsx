import React from 'react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Plus } from 'lucide-react';

export interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  children?: React.ReactNode;
  className?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  onClick,
  href,
  variant = 'outline',
  tooltipSide = 'bottom',
  children,
  className,
}) => {
  // If children are provided, we render a popover
  if (children) {
    return (
      <TooltipProvider>
        <Tooltip>
          <Popover>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant={variant}
                  size="icon"
                  className={cn("h-10 w-10", className)}
                  onClick={onClick}
                >
                  {icon}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide}>
              <p>{label}</p>
            </TooltipContent>
            <PopoverContent className="w-80" align="end">
              {children}
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If href is provided, we render a link
  if (href) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="icon"
              className={cn("h-10 w-10", className)}
              asChild
            >
              <Link to={href}>{icon}</Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={tooltipSide}>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Otherwise, we render a button
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            className={cn("h-10 w-10", className)}
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export interface QuickActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
};

interface QuickActionMenuProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({ 
  children, 
  label = "Actions", 
  className 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn("h-10 w-10", className)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{label}</p>
          </TooltipContent>
          <PopoverContent className="w-56" align="end">
            <div className="flex flex-col gap-1">
              {children}
            </div>
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
}; 