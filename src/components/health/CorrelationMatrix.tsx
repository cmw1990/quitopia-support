import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CorrelationData } from '@/types/dataTypes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, HelpCircle, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CorrelationMatrixProps {
  correlations: CorrelationData[];
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ correlations }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Helper function to determine the background color based on correlation strength
  const getCorrelationColor = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return value > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
    if (absValue >= 0.4) return value > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
    return 'bg-gray-50 dark:bg-gray-800/50';
  };

  // Helper function to determine the text color based on correlation strength
  const getCorrelationTextColor = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return value > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
    if (absValue >= 0.4) return value > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Helper function to format the correlation value for display
  const formatCorrelation = (value: number): string => {
    const formattedValue = (value >= 0 ? '+' : '') + value.toFixed(2);
    return formattedValue;
  };

  // Get the appropriate trend icon based on correlation
  const getTrendIcon = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue < 0.3) return <Minus className="h-4 w-4 text-gray-500" />;
    return value > 0 ? 
      <TrendingUp className={`h-4 w-4 ${absValue >= 0.7 ? 'text-green-600' : 'text-green-500'}`} /> : 
      <TrendingDown className={`h-4 w-4 ${absValue >= 0.7 ? 'text-red-600' : 'text-red-500'}`} />;
  };

  // Get description of correlation strength
  const getStrengthDescription = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'Strong';
    if (absValue >= 0.4) return 'Moderate';
    if (absValue >= 0.2) return 'Weak';
    return 'None/Negligible';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Health Data Correlations</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="max-w-xs">
                  These values show how different health metrics relate to each other.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Discover connections between different aspects of your health
        </CardDescription>
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md"
            >
              <p className="mb-1"><strong>How to read correlations:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>+0.7 to +1.0</strong>: Strong positive correlation — as one metric increases, the other typically increases as well</li>
                <li><strong>+0.4 to +0.7</strong>: Moderate positive correlation</li>
                <li><strong>-0.4 to +0.4</strong>: Weak or no correlation</li>
                <li><strong>-0.7 to -0.4</strong>: Moderate negative correlation</li>
                <li><strong>-1.0 to -0.7</strong>: Strong negative correlation — as one metric increases, the other typically decreases</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent>
        {correlations.length === 0 ? (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Track more health data to reveal correlations between different metrics.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {correlations.map((correlation, index) => (
              <div key={index}>
                <motion.div 
                  className={`rounded-lg p-3 ${getCorrelationColor(correlation.coefficient)} cursor-pointer transition-colors`}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      {getTrendIcon(correlation.coefficient)}
                      <span className="font-medium ml-1.5">{correlation.factor1}</span>
                      <span className="mx-2 text-gray-500">·</span>
                      <span className="font-medium">{correlation.factor2}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-medium ${getCorrelationTextColor(correlation.coefficient)}`}>
                        {formatCorrelation(correlation.coefficient)}
                      </span>
                      {expanded === index ? 
                        <ChevronUp className="h-4 w-4 ml-1.5 text-muted-foreground" /> : 
                        <ChevronDown className="h-4 w-4 ml-1.5 text-muted-foreground" />
                      }
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        correlation.coefficient >= 0.7 ? 'bg-green-500' :
                        correlation.coefficient >= 0.4 ? 'bg-green-400' :
                        correlation.coefficient >= 0 ? 'bg-green-300' :
                        correlation.coefficient >= -0.4 ? 'bg-red-300' :
                        correlation.coefficient >= -0.7 ? 'bg-red-400' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.abs(correlation.coefficient) * 100}%`, 
                        marginLeft: correlation.coefficient < 0 ? `${50 - Math.abs(correlation.coefficient) * 50}%` : '50%'
                      }}
                    />
                    <div 
                      className="h-full bg-gray-400 dark:bg-gray-500" 
                      style={{ width: '1px', marginLeft: '50%', transform: 'translateX(-50%)' }}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {expanded === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 text-sm"
                      >
                        <p className="text-gray-600 dark:text-gray-300">
                          {correlation.interpretation}
                        </p>
                        <div className="mt-2 text-xs flex items-center">
                          <span className="font-medium text-muted-foreground">Strength:</span>
                          <span className={`ml-2 ${getCorrelationTextColor(correlation.coefficient)}`}>
                            {getStrengthDescription(correlation.coefficient)}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Tap on a correlation to see more details
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CorrelationMatrix; 