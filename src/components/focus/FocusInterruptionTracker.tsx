import React, { useState } from 'react';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface Interruption {
  id: string;
  timestamp: string;
  type: 'internal' | 'external' | 'technological' | 'physical' | 'social';
  source: string;
  duration: number;
  impact: 1 | 2 | 3 | 4 | 5;
  preventable: boolean;
  solution?: string;
  context: string;
  activityType: string;
  energyLevelBefore: number;
  focusLevelBefore: number;
}

interface InterruptionStats {
  totalTime: number;
  mostCommonType: string;
  topSource: string;
  averageImpact: number;
  preventableCount: number;
  totalCount: number;
}

export const FocusInterruptionTracker: React.FC = () => {
  const [selectedInterruption, setSelectedInterruption] =
    useState<Interruption | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const interruptions: Interruption[] = [
    {
      id: '1',
      timestamp: '2025-03-18T09:30:00',
      type: 'technological',
      source: 'Phone notifications',
      duration: 8,
      impact: 4,
      preventable: true,
      solution: 'Enable Do Not Disturb mode during focus sessions',
      context: 'Deep work session on project documentation',
      activityType: 'Writing',
      energyLevelBefore: 85,
      focusLevelBefore: 90,
    },
    {
      id: '2',
      timestamp: '2025-03-18T10:15:00',
      type: 'internal',
      source: 'Task switching urge',
      duration: 12,
      impact: 3,
      preventable: true,
      solution: 'Implement better task breakdown and time blocking',
      context: 'Code review session',
      activityType: 'Analysis',
      energyLevelBefore: 75,
      focusLevelBefore: 80,
    },
    {
      id: '3',
      timestamp: '2025-03-18T11:45:00',
      type: 'physical',
      source: 'Hunger',
      duration: 15,
      impact: 5,
      preventable: true,
      solution: 'Schedule regular meal breaks and keep healthy snacks nearby',
      context: 'Problem-solving session',
      activityType: 'Creative Work',
      energyLevelBefore: 60,
      focusLevelBefore: 70,
    },
  ];

  const calculateStats = (): InterruptionStats => {
    const totalTime = interruptions.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );

    const typeCount: Record<string, number> = {};
    const sourceCount: Record<string, number> = {};
    let totalImpact = 0;
    let preventable = 0;

    interruptions.forEach((interruption) => {
      typeCount[interruption.type] = (typeCount[interruption.type] || 0) + 1;
      sourceCount[interruption.source] =
        (sourceCount[interruption.source] || 0) + 1;
      totalImpact += interruption.impact;
      if (interruption.preventable) preventable++;
    });

    const mostCommonType = Object.entries(typeCount).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];
    const topSource = Object.entries(sourceCount).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    return {
      totalTime,
      mostCommonType,
      topSource,
      averageImpact: totalImpact / interruptions.length,
      preventableCount: preventable,
      totalCount: interruptions.length,
    };
  };

  const stats = calculateStats();

  const getInterruptionTypeColor = (type: Interruption['type']) => {
    switch (type) {
      case 'internal':
        return 'bg-purple-100 text-purple-800';
      case 'external':
        return 'bg-blue-100 text-blue-800';
      case 'technological':
        return 'bg-green-100 text-green-800';
      case 'physical':
        return 'bg-orange-100 text-orange-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: number) => {
    switch (impact) {
      case 1:
        return 'text-green-500';
      case 2:
        return 'text-blue-500';
      case 3:
        return 'text-yellow-500';
      case 4:
        return 'text-orange-500';
      case 5:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getLevelIndicator = (level: number) => {
    const color =
      level >= 80
        ? 'bg-green-500'
        : level >= 60
        ? 'bg-yellow-500'
        : 'bg-red-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${level}%` }}
        />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Focus Interruption Tracker</h2>
        <button
          onClick={() => setIsLogging(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Log Interruption
        </button>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Interruption Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Time Lost</div>
            <div className="text-2xl font-bold">
              {stats.totalTime} minutes
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Most Common Type</div>
            <div className="text-2xl font-bold capitalize">
              {stats.mostCommonType}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Average Impact</div>
            <div className="text-2xl font-bold">
              {stats.averageImpact.toFixed(1)}/5
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Preventable</div>
            <div className="text-2xl font-bold">
              {stats.preventableCount}/{stats.totalCount}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Top Source</div>
            <div className="text-xl font-bold">{stats.topSource}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Interruptions</div>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {isLogging ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    Log New Interruption
                  </h3>
                  <button
                    onClick={() => setIsLogging(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Type
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                        <option value="technological">Technological</option>
                        <option value="physical">Physical</option>
                        <option value="social">Social</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="What caused the interruption?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Context
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="What were you doing when interrupted?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Impact (1-5)
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="1">1 - Minimal</option>
                        <option value="2">2 - Minor</option>
                        <option value="3">3 - Moderate</option>
                        <option value="4">4 - Major</option>
                        <option value="5">5 - Severe</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Preventable?
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Solution/Prevention
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-lg h-20"
                      placeholder="How could this interruption be prevented in the future?"
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setIsLogging(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Save Interruption
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : selectedInterruption ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Interruption Details
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getInterruptionTypeColor(
                          selectedInterruption.type
                        )}`}
                      >
                        {selectedInterruption.type}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(
                          selectedInterruption.timestamp
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInterruption(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Context</h4>
                      <p className="text-gray-600">
                        {selectedInterruption.context}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Impact Analysis</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium">
                            Duration
                          </div>
                          <div className="text-xl font-bold">
                            {selectedInterruption.duration} min
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium">Impact</div>
                          <div
                            className={`text-xl font-bold ${getImpactColor(
                              selectedInterruption.impact
                            )}`}
                          >
                            {selectedInterruption.impact}/5
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">State Before</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-1">
                            Energy Level
                          </div>
                          {getLevelIndicator(
                            selectedInterruption.energyLevelBefore
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">
                            Focus Level
                          </div>
                          {getLevelIndicator(
                            selectedInterruption.focusLevelBefore
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Source</h4>
                      <p className="text-gray-600">
                        {selectedInterruption.source}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Prevention</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              selectedInterruption.preventable
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                          <span className="font-medium">
                            {selectedInterruption.preventable
                              ? 'Preventable'
                              : 'Not Preventable'}
                          </span>
                        </div>
                        {selectedInterruption.solution && (
                          <p className="text-gray-600 mt-2">
                            {selectedInterruption.solution}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {interruptions.map((interruption) => (
                <motion.div
                  key={interruption.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedInterruption(interruption)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getInterruptionTypeColor(
                              interruption.type
                            )}`}
                          >
                            {interruption.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              interruption.timestamp
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="font-medium mt-1">
                          {interruption.source}
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${getImpactColor(
                          interruption.impact
                        )}`}
                      >
                        {interruption.impact}/5
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {interruption.context}
                    </p>

                    <div className="flex justify-between text-sm">
                      <span>⏱️ {interruption.duration} minutes</span>
                      <span
                        className={
                          interruption.preventable
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {interruption.preventable
                          ? '✓ Preventable'
                          : '× Not Preventable'}
                      </span>
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
