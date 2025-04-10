import React, { useState } from 'react';
import { Card } from '../ui/card';
import { motion } from 'framer-motion';

interface EnvironmentFactor {
  id: string;
  name: string;
  category: 'physical' | 'digital' | 'environmental' | 'social';
  status: 'optimal' | 'needs-attention' | 'critical';
  currentValue: string;
  optimalRange: string;
  tips: string[];
}

interface EnvironmentScore {
  category: string;
  score: number;
  recommendations: string[];
}

export const FocusEnvironment: React.FC = () => {
  const [factors, setFactors] = useState<EnvironmentFactor[]>([
    {
      id: '1',
      name: 'Lighting',
      category: 'environmental',
      status: 'optimal',
      currentValue: 'Natural light with adjustable task lighting',
      optimalRange: '300-500 lux for office work',
      tips: [
        'Position desk near natural light source',
        'Use adjustable task lighting',
        'Avoid harsh overhead lighting',
        'Consider light therapy lamp for darker days',
      ],
    },
    {
      id: '2',
      name: 'Temperature',
      category: 'environmental',
      status: 'needs-attention',
      currentValue: '76°F',
      optimalRange: '68-72°F',
      tips: [
        'Use a small fan for air circulation',
        'Adjust thermostat if possible',
        'Keep water nearby for hydration',
        'Use layered clothing for comfort',
      ],
    },
    {
      id: '3',
      name: 'Digital Distractions',
      category: 'digital',
      status: 'critical',
      currentValue: 'Multiple notifications active',
      optimalRange: 'Minimal essential notifications',
      tips: [
        'Enable Do Not Disturb mode',
        'Use website blockers',
        'Close unnecessary tabs',
        'Set specific check-in times for messages',
      ],
    },
    {
      id: '4',
      name: 'Desk Organization',
      category: 'physical',
      status: 'needs-attention',
      currentValue: 'Moderate clutter',
      optimalRange: 'Clean, organized workspace',
      tips: [
        'Use the 2-minute clean-up rule',
        'Implement a filing system',
        'Keep only essential items on desk',
        'Use drawer organizers',
      ],
    },
    {
      id: '5',
      name: 'Ergonomics',
      category: 'physical',
      status: 'optimal',
      currentValue: 'Proper setup',
      optimalRange: 'Ergonomic guidelines met',
      tips: [
        'Monitor at eye level',
        'Feet flat on floor',
        'Arms at 90 degrees',
        'Take regular movement breaks',
      ],
    },
    {
      id: '6',
      name: 'Background Noise',
      category: 'environmental',
      status: 'needs-attention',
      currentValue: 'Irregular office noise',
      optimalRange: 'Consistent low-level or white noise',
      tips: [
        'Use noise-canceling headphones',
        'Play ambient background sounds',
        'Consider sound masking system',
        'Communicate noise preferences to others',
      ],
    },
  ]);

  const calculateScore = (category: string): EnvironmentScore => {
    const categoryFactors = factors.filter((f) => f.category === category);
    const totalFactors = categoryFactors.length;
    
    if (totalFactors === 0) return { category, score: 0, recommendations: [] };

    const score = categoryFactors.reduce((acc, factor) => {
      switch (factor.status) {
        case 'optimal':
          return acc + 100;
        case 'needs-attention':
          return acc + 50;
        case 'critical':
          return acc + 0;
        default:
          return acc;
      }
    }, 0) / totalFactors;

    const recommendations = categoryFactors
      .filter((f) => f.status !== 'optimal')
      .map((f) => f.tips[0]);

    return { category, score, recommendations };
  };

  const updateFactorStatus = (
    id: string,
    status: EnvironmentFactor['status']
  ) => {
    setFactors((prev) =>
      prev.map((factor) =>
        factor.id === id ? { ...factor, status } : factor
      )
    );
  };

  const categories = ['physical', 'digital', 'environmental', 'social'];
  const scores = categories.map(calculateScore);

  const getStatusColor = (status: EnvironmentFactor['status']) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-500';
      case 'needs-attention':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Focus Environment Setup</h2>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {scores.map((score) => (
          <Card key={score.category} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">
                {score.category} Environment
              </h3>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{Math.round(score.score)}</div>
                <div className="text-sm text-gray-500">/100</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${score.score}%` }}
              />
            </div>
            {score.recommendations.length > 0 && (
              <div className="text-sm text-gray-600">
                <strong>Quick Wins:</strong>
                <ul className="list-disc list-inside mt-2">
                  {score.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryFactors = factors.filter((f) => f.category === category);
          if (categoryFactors.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4 capitalize">
                {category} Factors
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryFactors.map((factor) => (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{factor.name}</h4>
                          <p className="text-sm text-gray-600">
                            Current: {factor.currentValue}
                          </p>
                          <p className="text-sm text-gray-600">
                            Optimal: {factor.optimalRange}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {(['optimal', 'needs-attention', 'critical'] as const).map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() => updateFactorStatus(factor.id, status)}
                                className={`w-3 h-3 rounded-full ${
                                  factor.status === status
                                    ? getStatusColor(status)
                                    : 'bg-gray-200'
                                }`}
                              />
                            )
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {factor.tips.map((tip, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-blue-500">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
