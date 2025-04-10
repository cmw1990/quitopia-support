import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion } from 'framer-motion';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
  instructions: string[];
  sideEffects: string[];
  effectiveness: {
    focus: number;
    duration: number;
    consistency: number;
  };
  notes: string;
  nextRefill: string;
  history: {
    date: string;
    taken: boolean;
    effectiveness: number;
    notes?: string;
  }[];
  icon: string;
}

interface ReminderSetting {
  id: string;
  type: 'notification' | 'alarm' | 'check-in' | 'refill';
  time: string;
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export const MedicationReminders: React.FC = () => {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(
    null
  );
  const [view, setView] = useState<'list' | 'calendar' | 'stats'>('list');

  const medications: Medication[] = [
    {
      id: '1',
      name: 'Methylphenidate',
      dosage: '20mg',
      frequency: 'Twice daily',
      schedule: {
        morning: '8:00 AM',
        afternoon: '2:00 PM',
      },
      instructions: [
        'Take with food',
        'Space doses 6 hours apart',
        'Avoid late evening doses',
        'Stay hydrated',
      ],
      sideEffects: [
        'Decreased appetite',
        'Mild anxiety',
        'Initial insomnia',
        'Dry mouth',
      ],
      effectiveness: {
        focus: 85,
        duration: 6,
        consistency: 90,
      },
      notes: 'Works best with consistent sleep schedule',
      nextRefill: '2025-04-01',
      history: [
        {
          date: '2025-03-18',
          taken: true,
          effectiveness: 85,
          notes: 'Good focus day',
        },
        {
          date: '2025-03-17',
          taken: true,
          effectiveness: 80,
          notes: 'Slightly tired',
        },
      ],
      icon: '💊',
    },
    {
      id: '2',
      name: 'Atomoxetine',
      dosage: '40mg',
      frequency: 'Once daily',
      schedule: {
        morning: '9:00 AM',
      },
      instructions: [
        'Take consistently',
        'Can take with/without food',
        'Allow 8 weeks for full effect',
        'Monitor blood pressure',
      ],
      sideEffects: [
        'Initial nausea',
        'Fatigue',
        'Mood changes',
        'Appetite changes',
      ],
      effectiveness: {
        focus: 75,
        duration: 24,
        consistency: 85,
      },
      notes: 'Building consistent routine',
      nextRefill: '2025-04-15',
      history: [
        {
          date: '2025-03-18',
          taken: true,
          effectiveness: 75,
          notes: 'Steady improvement',
        },
        {
          date: '2025-03-17',
          taken: true,
          effectiveness: 70,
          notes: 'Normal day',
        },
      ],
      icon: '💊',
    },
  ];

  const reminderSettings: ReminderSetting[] = [
    {
      id: '1',
      type: 'notification',
      time: '07:45',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      message: 'Morning medication reminder',
      priority: 'high',
    },
    {
      id: '2',
      type: 'check-in',
      time: '10:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      message: 'How is your medication working?',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'refill',
      time: '09:00',
      days: ['mon'],
      message: 'Check medication supply',
      priority: 'high',
    },
  ];

  const getEffectivenessColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: ReminderSetting['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Medication Manager</h2>
        <div className="flex gap-2">
          {(['list', 'calendar', 'stats'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg capitalize ${
                view === v
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!selectedMedication ? (
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            {medications.map((med) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedMedication(med)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{med.icon}</div>
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      <div className="text-sm text-gray-600">
                        {med.dosage} • {med.frequency}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-medium">Focus</div>
                        <div
                          className={`text-lg ${getEffectivenessColor(
                            med.effectiveness.focus
                          )}`}
                        >
                          {med.effectiveness.focus}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-medium">Duration</div>
                        <div className="text-lg text-blue-500">
                          {med.effectiveness.duration}h
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm font-medium">Consistency</div>
                        <div
                          className={`text-lg ${getEffectivenessColor(
                            med.effectiveness.consistency
                          )}`}
                        >
                          {med.effectiveness.consistency}%
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Next dose:</span>
                        <span>
                          {Object.values(med.schedule)[0] || 'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Next refill:</span>
                        <span>{new Date(med.nextRefill).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Upcoming Reminders</h3>
            <div className="space-y-4">
              {reminderSettings.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {reminder.type === 'notification'
                        ? '🔔'
                        : reminder.type === 'check-in'
                        ? '📝'
                        : '📦'}
                    </span>
                    <div>
                      <div className="font-medium">{reminder.message}</div>
                      <div className="text-sm text-gray-600">
                        {reminder.time} •{' '}
                        {reminder.days.map((d) => d.toUpperCase()).join(', ')}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                      reminder.priority
                    )}`}
                  >
                    {reminder.priority}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedMedication.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedMedication.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedMedication.dosage} • {selectedMedication.frequency}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedication(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Schedule</h4>
                  <ul className="space-y-2">
                    {Object.entries(selectedMedication.schedule).map(
                      ([time, value]) => (
                        <li
                          key={time}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="capitalize">{time}</span>
                          <span>{value}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Instructions</h4>
                  <ul className="space-y-2">
                    {selectedMedication.instructions.map((instruction, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-blue-500">•</span>
                        {instruction}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Side Effects to Monitor</h4>
                  <ul className="space-y-2">
                    {selectedMedication.sideEffects.map((effect, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-red-500">⚠️</span>
                        {effect}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Recent History</h4>
                  <div className="space-y-3">
                    {selectedMedication.history.map((entry, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span
                            className={`${
                              entry.taken ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {entry.taken ? '✓ Taken' : '✕ Missed'}
                          </span>
                        </div>
                        <div
                          className={`text-sm ${getEffectivenessColor(
                            entry.effectiveness
                          )}`}
                        >
                          Effectiveness: {entry.effectiveness}%
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-600 mt-1">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm font-medium mb-1">Focus Impact</div>
                      <div
                        className={`text-xl font-bold ${getEffectivenessColor(
                          selectedMedication.effectiveness.focus
                        )}`}
                      >
                        {selectedMedication.effectiveness.focus}%
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm font-medium mb-1">Duration</div>
                      <div className="text-xl font-bold text-blue-500">
                        {selectedMedication.effectiveness.duration}h
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-sm font-medium mb-1">Consistency</div>
                      <div
                        className={`text-xl font-bold ${getEffectivenessColor(
                          selectedMedication.effectiveness.consistency
                        )}`}
                      >
                        {selectedMedication.effectiveness.consistency}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                Edit Schedule
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Log Medication
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
