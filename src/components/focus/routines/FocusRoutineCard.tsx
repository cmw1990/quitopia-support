import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion } from 'framer-motion';

interface FocusRoutine {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: 'morning' | 'work' | 'study' | 'evening' | 'break';
  steps: {
    id: string;
    title: string;
    duration: number;
    type: 'preparation' | 'focus' | 'break' | 'review';
    description: string;
    completed?: boolean;
  }[];
  adherenceRate: number;
  focusScore: number;
  energyImpact: number;
  lastCompleted?: string;
  streak: number;
  icon: string;
  tips: string[];
}

interface RoutineProgress {
  currentStep: number;
  timeRemaining: number;
  isActive: boolean;
}

export const FocusRoutineCard: React.FC = () => {
  const [selectedRoutine, setSelectedRoutine] = useState<FocusRoutine | null>(
    null
  );
  const [routineProgress, setRoutineProgress] = useState<RoutineProgress>({
    currentStep: 0,
    timeRemaining: 0,
    isActive: false,
  });

  const routines: FocusRoutine[] = [
    {
      id: '1',
      name: 'Morning Focus Ritual',
      description:
        'Start your day with intention and prepare your mind for focused work.',
      duration: 45,
      category: 'morning',
      steps: [
        {
          id: '1a',
          title: 'Environment Setup',
          duration: 5,
          type: 'preparation',
          description: 'Open windows, adjust lighting, organize workspace',
        },
        {
          id: '1b',
          title: 'Mindful Breathing',
          duration: 10,
          type: 'preparation',
          description: 'Deep breathing exercises to center attention',
        },
        {
          id: '1c',
          title: 'Daily Planning',
          duration: 15,
          type: 'focus',
          description: 'Review tasks and set priorities for the day',
        },
        {
          id: '1d',
          title: 'Quick Movement',
          duration: 10,
          type: 'break',
          description: 'Light stretching or walking to energize',
        },
        {
          id: '1e',
          title: 'Focus Preview',
          duration: 5,
          type: 'review',
          description: 'Visualize successful completion of main tasks',
        },
      ],
      adherenceRate: 85,
      focusScore: 90,
      energyImpact: 85,
      lastCompleted: '2025-03-18',
      streak: 7,
      icon: '🌅',
      tips: [
        'Keep a consistent wake time',
        'Avoid screens for first 30 minutes',
        'Stay hydrated',
        'Use natural light when possible',
      ],
    },
    {
      id: '2',
      name: 'Deep Work Block',
      description:
        'Structured routine for maximizing focus and productivity during work sessions.',
      duration: 90,
      category: 'work',
      steps: [
        {
          id: '2a',
          title: 'Focus Zone Setup',
          duration: 5,
          type: 'preparation',
          description: 'Clear distractions, set up tools and resources',
        },
        {
          id: '2b',
          title: 'Task Breakdown',
          duration: 10,
          type: 'preparation',
          description: 'Break down complex tasks into manageable steps',
        },
        {
          id: '2c',
          title: 'Deep Focus Session',
          duration: 45,
          type: 'focus',
          description: 'Uninterrupted work on primary task',
        },
        {
          id: '2d',
          title: 'Movement Break',
          duration: 10,
          type: 'break',
          description: 'Physical activity to refresh mind',
        },
        {
          id: '2e',
          title: 'Second Focus Session',
          duration: 15,
          type: 'focus',
          description: 'Complete remaining tasks or start next item',
        },
        {
          id: '2f',
          title: 'Progress Review',
          duration: 5,
          type: 'review',
          description: 'Document progress and plan next steps',
        },
      ],
      adherenceRate: 75,
      focusScore: 85,
      energyImpact: 80,
      lastCompleted: '2025-03-17',
      streak: 4,
      icon: '💼',
      tips: [
        'Use noise-canceling headphones',
        'Keep water within reach',
        'Document insights during breaks',
        'Adjust lighting as needed',
      ],
    },
    {
      id: '3',
      name: 'Study Flow Sequence',
      description:
        'Optimized routine for effective learning and information retention.',
      duration: 60,
      category: 'study',
      steps: [
        {
          id: '3a',
          title: 'Study Space Setup',
          duration: 5,
          type: 'preparation',
          description: 'Organize materials and create study environment',
        },
        {
          id: '3b',
          title: 'Topic Preview',
          duration: 10,
          type: 'preparation',
          description: 'Quick overview of material to be covered',
        },
        {
          id: '3c',
          title: 'Active Learning',
          duration: 25,
          type: 'focus',
          description: 'Deep engagement with material',
        },
        {
          id: '3d',
          title: 'Mind Reset',
          duration: 5,
          type: 'break',
          description: 'Quick break to process information',
        },
        {
          id: '3e',
          title: 'Review & Connect',
          duration: 10,
          type: 'review',
          description: 'Summarize key points and connect concepts',
        },
        {
          id: '3f',
          title: 'Test Understanding',
          duration: 5,
          type: 'review',
          description: 'Self-quiz on material covered',
        },
      ],
      adherenceRate: 80,
      focusScore: 85,
      energyImpact: 75,
      lastCompleted: '2025-03-18',
      streak: 5,
      icon: '📚',
      tips: [
        'Use active recall techniques',
        'Take handwritten notes',
        'Explain concepts aloud',
        'Create mind maps',
      ],
    },
  ];

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'preparation':
        return 'bg-blue-100 text-blue-800';
      case 'focus':
        return 'bg-purple-100 text-purple-800';
      case 'break':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: FocusRoutine['category']) => {
    switch (category) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800';
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'study':
        return 'bg-purple-100 text-purple-800';
      case 'evening':
        return 'bg-indigo-100 text-indigo-800';
      case 'break':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Focus Routines</h2>

      <div className="grid gap-6">
        {!selectedRoutine ? (
          <div className="grid gap-6 md:grid-cols-2">
            {routines.map((routine) => (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRoutine(routine)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{routine.icon}</div>
                    <div>
                      <h3 className="font-semibold">{routine.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                          routine.category
                        )}`}
                      >
                        {routine.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {routine.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Adherence</div>
                      <div
                        className={`text-lg ${getMetricColor(
                          routine.adherenceRate
                        )}`}
                      >
                        {routine.adherenceRate}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Focus</div>
                      <div
                        className={`text-lg ${getMetricColor(
                          routine.focusScore
                        )}`}
                      >
                        {routine.focusScore}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Energy</div>
                      <div
                        className={`text-lg ${getMetricColor(
                          routine.energyImpact
                        )}`}
                      >
                        {routine.energyImpact}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-sm text-gray-600">
                    <span>⏱️ {routine.duration} minutes</span>
                    <span>🔥 {routine.streak} day streak</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedRoutine.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {selectedRoutine.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedRoutine.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoutine(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-4">Routine Steps</h4>
                  <div className="space-y-4">
                    {selectedRoutine.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          routineProgress.currentStep === index &&
                          routineProgress.isActive
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{step.title}</h5>
                            <p className="text-sm text-gray-600">
                              {step.description}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStepTypeColor(
                              step.type
                            )}`}
                          >
                            {step.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          ⏱️ {step.duration} minutes
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Pro Tips</h4>
                    <ul className="space-y-2">
                      {selectedRoutine.tips.map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-blue-500">💡</span>
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Stats</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm font-medium">Adherence</div>
                        <div
                          className={`text-xl font-bold ${getMetricColor(
                            selectedRoutine.adherenceRate
                          )}`}
                        >
                          {selectedRoutine.adherenceRate}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm font-medium">Focus</div>
                        <div
                          className={`text-xl font-bold ${getMetricColor(
                            selectedRoutine.focusScore
                          )}`}
                        >
                          {selectedRoutine.focusScore}%
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-sm font-medium">Energy</div>
                        <div
                          className={`text-xl font-bold ${getMetricColor(
                            selectedRoutine.energyImpact
                          )}`}
                        >
                          {selectedRoutine.energyImpact}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">History</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Last completed:</span>
                        <span>
                          {selectedRoutine.lastCompleted
                            ? new Date(
                                selectedRoutine.lastCompleted
                              ).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current streak:</span>
                        <span className="text-green-500">
                          {selectedRoutine.streak} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                  Edit Routine
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Start Routine
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {!selectedRoutine && (
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Create New Routine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
