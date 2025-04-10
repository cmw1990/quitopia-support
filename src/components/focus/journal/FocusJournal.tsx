import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'reflection' | 'challenge' | 'success' | 'insight' | 'strategy';
  mood: 'positive' | 'neutral' | 'challenging';
  tags: string[];
  focusScore?: number;
  energyLevel?: number;
  challenges?: string[];
  solutions?: string[];
}

export const FocusJournal: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  const journalEntries: JournalEntry[] = [
    {
      id: '1',
      title: 'Deep Focus Success',
      content:
        'Today I successfully implemented the Pomodoro technique with focused work blocks. Found that using noise-canceling headphones and setting clear goals for each session made a significant difference.',
      date: '2025-03-18',
      type: 'success',
      mood: 'positive',
      tags: ['pomodoro', 'productivity', 'focus-techniques'],
      focusScore: 85,
      energyLevel: 80,
      challenges: [
        'Initial resistance to starting',
        'Minor distractions from notifications',
      ],
      solutions: [
        'Used 5-minute rule to overcome procrastination',
        'Enabled Do Not Disturb mode',
      ],
    },
    {
      id: '2',
      title: 'Managing ADHD Challenges',
      content:
        'Struggled with task switching today. Noticed that environmental factors played a big role - too much ambient noise and poor lighting affected my concentration.',
      date: '2025-03-17',
      type: 'challenge',
      mood: 'challenging',
      tags: ['adhd', 'environment', 'task-switching'],
      focusScore: 60,
      energyLevel: 65,
      challenges: [
        'Frequent context switching',
        'Environmental distractions',
        'Low energy periods',
      ],
      solutions: [
        'Plan to create dedicated focus zones',
        'Schedule tasks based on energy levels',
        'Implement better break structures',
      ],
    },
    {
      id: '3',
      title: 'New Focus Strategy Insights',
      content:
        'Discovered that combining time blocking with regular movement breaks significantly improves my focus duration and quality. The key seems to be maintaining a balance between structure and flexibility.',
      date: '2025-03-16',
      type: 'insight',
      mood: 'positive',
      tags: ['time-blocking', 'movement', 'balance'],
      focusScore: 90,
      energyLevel: 85,
      challenges: ['Finding the right work-break ratio'],
      solutions: ['Experimented with different break durations'],
    },
  ];

  const getEntryTypeColor = (type: JournalEntry['type']) => {
    switch (type) {
      case 'reflection':
        return 'bg-blue-100 text-blue-800';
      case 'challenge':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'insight':
        return 'bg-purple-100 text-purple-800';
      case 'strategy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodIcon = (mood: JournalEntry['mood']) => {
    switch (mood) {
      case 'positive':
        return '😊';
      case 'neutral':
        return '😐';
      case 'challenging':
        return '😓';
      default:
        return '🤔';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const allTags = Array.from(
    new Set(journalEntries.flatMap((entry) => entry.tags))
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Focus Journal</h2>
        <button
          onClick={() => setIsWriting(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          New Entry
        </button>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() =>
              setActiveFilter(activeFilter === tag ? null : tag)
            }
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilter === tag
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {isWriting ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">New Journal Entry</h3>
                  <button
                    onClick={() => setIsWriting(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Give your entry a title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Content
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-lg h-32"
                      placeholder="Share your thoughts, challenges, or insights..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Type
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="reflection">Reflection</option>
                        <option value="challenge">Challenge</option>
                        <option value="success">Success</option>
                        <option value="insight">Insight</option>
                        <option value="strategy">Strategy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Mood
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Add tags separated by commas..."
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setIsWriting(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Save Entry
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : selectedEntry ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedEntry.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getEntryTypeColor(
                          selectedEntry.type
                        )}`}
                      >
                        {selectedEntry.type}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(selectedEntry.date).toLocaleDateString()}
                      </span>
                      <span className="text-xl">
                        {getMoodIcon(selectedEntry.mood)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <p>{selectedEntry.content}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium">
                            Focus Score
                          </div>
                          <div
                            className={`text-xl font-bold ${getScoreColor(
                              selectedEntry.focusScore || 0
                            )}`}
                          >
                            {selectedEntry.focusScore}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium">
                            Energy Level
                          </div>
                          <div
                            className={`text-xl font-bold ${getScoreColor(
                              selectedEntry.energyLevel || 0
                            )}`}
                          >
                            {selectedEntry.energyLevel}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(selectedEntry.challenges?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Challenges</h4>
                      <ul className="space-y-2">
                        {selectedEntry.challenges?.map((challenge, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-red-500">•</span>
                            {challenge}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(selectedEntry.solutions?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Solutions</h4>
                      <ul className="space-y-2">
                        {selectedEntry.solutions?.map((solution, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-green-500">✓</span>
                            {solution}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {journalEntries
                .filter(
                  (entry) =>
                    !activeFilter || entry.tags.includes(activeFilter)
                )
                .map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">
                          {getMoodIcon(entry.mood)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{entry.title}</h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getEntryTypeColor(
                                entry.type
                              )}`}
                            >
                              {entry.type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {entry.content}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            +{entry.tags.length - 3} more
                          </span>
                        )}
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
