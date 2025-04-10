import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusHabit {
  id: string;
  name: string;
  description: string;
  category: 'environment' | 'routine' | 'mindset' | 'physical' | 'digital';
  frequency: 'daily' | 'weekly' | 'workdays';
  impact: 1 | 2 | 3 | 4 | 5;
  currentStreak: number;
  bestStreak: number;
  lastCompleted?: Date;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  reminderEnabled: boolean;
  notes?: string;
}

interface HabitProgress {
  completed: number;
  total: number;
  streakDays: number;
  lastActivity?: Date;
}

export const FocusHabitTracker: React.FC = () => {
  const [selectedHabit, setSelectedHabit] = useState<FocusHabit | null>(
    null
  );
  const [showAddHabit, setShowAddHabit] = useState(false);

  const habits: FocusHabit[] = [
    {
      id: '1',
      name: 'Morning Focus Ritual',
      description:
        'Start each day with a 10-minute mindfulness session and environment setup',
      category: 'routine',
      frequency: 'daily',
      impact: 5,
      currentStreak: 7,
      bestStreak: 14,
      timeOfDay: 'morning',
      reminderEnabled: true,
      notes: 'Clear desk, set daily intentions, quick breathing exercise',
    },
    {
      id: '2',
      name: 'Digital Detox Hour',
      description:
        'One hour of focused work with all notifications disabled',
      category: 'digital',
      frequency: 'workdays',
      impact: 4,
      currentStreak: 3,
      bestStreak: 10,
      timeOfDay: 'afternoon',
      reminderEnabled: true,
    },
    {
      id: '3',
      name: 'Focus-Friendly Workspace',
      description:
        'Maintain an organized, clutter-free workspace with proper lighting',
      category: 'environment',
      frequency: 'daily',
      impact: 4,
      currentStreak: 5,
      bestStreak: 8,
      timeOfDay: 'anytime',
      reminderEnabled: false,
    },
  ];

  const getHabitProgress = (habit: FocusHabit): HabitProgress => {
    // Mock progress data - in real app, this would come from a database
    return {
      completed: 15,
      total: 20,
      streakDays: habit.currentStreak,
      lastActivity: habit.lastCompleted,
    };
  };

  const getCategoryColor = (category: FocusHabit['category']) => {
    switch (category) {
      case 'environment':
        return 'bg-green-100 text-green-800';
      case 'routine':
        return 'bg-blue-100 text-blue-800';
      case 'mindset':
        return 'bg-purple-100 text-purple-800';
      case 'physical':
        return 'bg-orange-100 text-orange-800';
      case 'digital':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactStars = (impact: FocusHabit['impact']) => {
    return '★'.repeat(impact) + '☆'.repeat(5 - impact);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Focus Habit Tracker</h2>
        <button
          onClick={() => setShowAddHabit(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Habit
        </button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {showAddHabit ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold">Create New Habit</h3>
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Morning Focus Ritual"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      rows={3}
                      placeholder="Describe your habit and its benefits..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="environment">Environment</option>
                        <option value="routine">Routine</option>
                        <option value="mindset">Mindset</option>
                        <option value="physical">Physical</option>
                        <option value="digital">Digital</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Frequency
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="workdays">Workdays</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Impact Level
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="1">★☆☆☆☆ Minimal</option>
                        <option value="2">★★☆☆☆ Low</option>
                        <option value="3">★★★☆☆ Medium</option>
                        <option value="4">★★★★☆ High</option>
                        <option value="5">★★★★★ Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Time of Day
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="reminderEnabled"
                      className="mr-2"
                    />
                    <label htmlFor="reminderEnabled">
                      Enable Reminders
                    </label>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowAddHabit(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Create Habit
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : selectedHabit ? (
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
                        {selectedHabit.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                          selectedHabit.category
                        )}`}
                      >
                        {selectedHabit.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {selectedHabit.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedHabit(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Progress</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>
                              {getHabitProgress(selectedHabit).completed}/
                              {getHabitProgress(selectedHabit).total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (getHabitProgress(selectedHabit)
                                    .completed /
                                    getHabitProgress(selectedHabit)
                                      .total) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Streak</span>
                            <span>{selectedHabit.currentStreak} days</span>
                          </div>
                          <div>
                            <span className="text-orange-500 text-2xl">
                              {'🔥'.repeat(
                                Math.min(
                                  Math.floor(
                                    selectedHabit.currentStreak / 5
                                  ),
                                  5
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frequency</span>
                          <span className="font-medium">
                            {selectedHabit.frequency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Impact</span>
                          <span className="text-yellow-500">
                            {getImpactStars(selectedHabit.impact)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Best Streak</span>
                          <span className="font-medium">
                            {selectedHabit.bestStreak} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time of Day</span>
                          <span className="font-medium">
                            {selectedHabit.timeOfDay}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Recent Activity</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <div>
                              <div className="font-medium">
                                Completed Today
                              </div>
                              <div className="text-sm text-gray-600">
                                Keep up the great work!
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Notes</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">
                          {selectedHabit.notes ||
                            'No notes added for this habit.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                        Edit
                      </button>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedHabit(habit)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{habit.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                            habit.category
                          )}`}
                        >
                          {habit.category}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                          Impact:
                        </span>
                        <span className="text-yellow-500">
                          {getImpactStars(habit.impact)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>
                            {getHabitProgress(habit).completed}/
                            {getHabitProgress(habit).total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${
                                (getHabitProgress(habit).completed /
                                  getHabitProgress(habit).total) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {habit.frequency}
                        </span>
                        {habit.currentStreak > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-orange-500">🔥</span>
                            <span className="text-sm font-medium">
                              {habit.currentStreak} day streak
                            </span>
                          </div>
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
