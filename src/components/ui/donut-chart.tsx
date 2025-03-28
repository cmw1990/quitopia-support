import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  centerText?: React.ReactNode;
  gradientStart?: string;
  gradientEnd?: string;
  bgColor?: string;
}

export const DonutChart = ({
  value,
  maxValue = 100,
  size = 150,
  strokeWidth = 10,
  centerText,
  gradientStart = "#3b82f6",
  gradientEnd = "#2dd4bf",
  bgColor = "#e2e8f0",
  className,
  ...props
}: DonutChartProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const valuePercentage = Math.min(Math.max(value / maxValue, 0), 1);
  const dashOffset = circumference * (1 - valuePercentage);
  const uniqueId = `donut-gradient-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)} 
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center text content */}
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          {centerText}
        </div>
      )}
    </div>
  );
}; 