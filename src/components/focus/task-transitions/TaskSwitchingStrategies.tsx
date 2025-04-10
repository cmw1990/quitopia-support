import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface Strategy {
  id: string;
  title: string;
  description: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeNeeded: number; // in minutes
  benefits: string[];
  category: 'planning' | 'mindfulness' | 'environmental' | 'cognitive' | 'energy';
  bestFor: string[];
}

export const TaskSwitchingStrategies: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<
    Strategy['category'] | 'all'
  >('all');

  const strategies: Strategy[] = [
    {
      id: '1',
      title: 'Two-Minute Bridge',
      description:
        'Create a quick mental bridge between tasks using a two-minute mindfulness exercise',
      steps: [
        'Pause and acknowledge the end of current task',
        'Take three deep breaths',
        'Visualize letting go of previous task',
        'Set intention for next task',
        'Review key objectives',
      ],
      difficulty: 'easy',
      timeNeeded: 2,
      benefits: [
        'Reduces mental carryover',
        'Creates clear task boundaries',
        'Minimizes task-switching anxiety',
        'Improves focus on new task',
      ],
      category: 'mindfulness',
      bestFor: ['Quick transitions', 'High-stress situations', 'Mental clarity'],
    },
    {
      id: '2',
      title: 'Environment Reset',
      description:
        'Physically reorganize your workspace to signal a task change to your brain',
      steps: [
        'Clear desk of previous task materials',
        'Adjust lighting if needed',
        'Organize tools for next task',
        'Change physical position or location',
        'Reset workspace ergonomics',
      ],
      difficulty: 'medium',
      timeNeeded: 5,
      benefits: [
        'Creates physical task boundaries',
        'Reduces visual distractions',
        'Improves focus through environment',
        'Supports working memory',
      ],
      category: 'environmental',
      bestFor: [
        'Long work sessions',
        'Complex projects',
        'Different types of work',
      ],
    },
    {
      id: '3',
      title: 'Energy Matching',
      description:
        'Align task transitions with your natural energy levels and attention patterns',
      steps: [
        'Check current energy level',
        'Review task energy requirements',
        'Schedule similar energy tasks together',
        'Plan breaks for energy dips',
        'Adjust schedule if needed',
      ],
      difficulty: 'medium',
      timeNeeded: 3,
      benefits: [
        'Optimizes productivity',
        'Reduces mental fatigue',
        'Improves task completion',
        'Maintains energy levels',
      ],
      category: 'energy',
      bestFor: ['Long work days', 'Multiple task types', 'Energy management'],
    },
  ];

  const getDifficultyColor = (difficulty: Strategy['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: Strategy['category']) => {
    switch (category) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'mindfulness':
        return 'bg-purple-100 text-purple-800';
      case 'environmental':
        return 'bg-green-100 text-green-800';
      case 'cognitive':
        return 'bg-orange-100 text-orange-800';
      case 'energy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStrategies = selectedCategory === 'all'
    ? strategies
    : strategies.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task Switching Strategies</h2>
        <div className="flex gap-2">
          {(['all', ...new Set(strategies.map((s) => s.category))] as const).map(
            (category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {selectedStrategy ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">
                        {selectedStrategy.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                          selectedStrategy.category
                        )}`}
                      >
                        {selectedStrategy.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {selectedStrategy.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStrategy(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Implementation</h4>
                      <div className="space-y-4">
                        {selectedStrategy.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Benefits</h4>
                      <div className="space-y-2">
                        {selectedStrategy.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-green-500">✓</span>
                            {benefit}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(
                              selectedStrategy.difficulty
                            )}`}
                          >
                            {selectedStrategy.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Needed</span>
                          <span className="font-medium">
                            {selectedStrategy.timeNeeded} minutes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Best For</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStrategy.bestFor.map((use) => (
                          <span
                            key={use}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredStrategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{strategy.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                            strategy.category
                          )}`}
                        >
                          {strategy.category}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                          strategy.difficulty
                        )}`}
                      >
                        {strategy.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {strategy.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {strategy.timeNeeded} min
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {strategy.bestFor.slice(0, 1).map((use) => (
                          <span
                            key={use}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                          >
                            {use}
                          </span>
                        ))}
                        {strategy.bestFor.length > 1 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            +{strategy.bestFor.length - 1} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
