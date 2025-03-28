import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from './progress';
import { Button } from './button';
import { DonutChart } from './donut-chart';
import { SectionCard } from './section-card';
import { BarChart3 } from 'lucide-react';
import { MetricCard } from './metric-card';

interface HealthMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  description: string;
  improvement: number;
}

interface HealthMetricsSectionProps {
  healthImprovement: number;
  healthMetrics: HealthMetric[];
  onViewAllClick: () => void;
}

export const HealthMetricsSection: React.FC<HealthMetricsSectionProps> = ({
  healthImprovement,
  healthMetrics,
  onViewAllClick
}) => {
  return (
    <SectionCard
      title="Health Metrics Dashboard"
      description="Real-time indicators of your improving health"
      icon={<BarChart3 className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h3 className="font-medium text-lg mb-3">Recovery Progress</h3>
          <div className="flex justify-center">
            <div className="relative inline-flex flex-col items-center">
              <DonutChart 
                value={healthImprovement}
                gradientStart="#3b82f6"
                gradientEnd="#10b981"
                size={180}
                centerText={
                  <div className="text-center">
                    <div className="text-2xl font-bold">{healthImprovement}%</div>
                    <div className="text-xs text-gray-500">Recovery</div>
                  </div>
                }
              />
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Heart Rate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span>Oxygen</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mr-1"></div>
                  <span>Lung Function</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                  <span>Circulation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h3 className="font-medium text-lg mb-3">Key Health Improvements</h3>
          <div className="space-y-3">
            {healthMetrics.slice(0, 4).map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {metric.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{metric.title}</span>
                    <span className="text-sm font-medium">{Math.round(metric.improvement)}%</span>
                  </div>
                  <Progress 
                    value={metric.improvement} 
                    className="h-2"
                    indicatorClassName={
                      metric.improvement > 75 ? 'bg-green-500' : 
                      metric.improvement > 50 ? 'bg-blue-500' : 
                      metric.improvement > 25 ? 'bg-amber-500' : 'bg-red-500'
                    }
                  />
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-primary"
              onClick={onViewAllClick}
            >
              View All Health Metrics
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}; 