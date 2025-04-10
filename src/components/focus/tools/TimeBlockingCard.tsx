import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  category: 'focus' | 'break' | 'admin' | 'learning' | 'creative';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  energyLevel: 'high' | 'medium' | 'low';
  estimatedProgress?: number;
}

export const TimeBlockingCard: React.FC = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      id: '1',
      title: 'Deep Focus: Project X',
      description: 'Core development work on main features',
      startTime: '09:00',
      duration: 90,
      category: 'focus',
      priority: 'high',
      completed: false,
      energyLevel: 'high',
      estimatedProgress: 0,
    },
    {
      id: '2',
      title: 'Strategic Break',
      description: 'Quick walk and breathing exercises',
      startTime: '10:30',
      duration: 15,
      category: 'break',
      priority: 'medium',
      completed: false,
      energyLevel: 'medium',
    },
    {
      id: '3',
      title: 'Learning Session',
      description: 'Review new technology documentation',
      startTime: '10:45',
      duration: 45,
      category: 'learning',
      priority: 'medium',
      completed: false,
      energyLevel: 'high',
    },
  ]);

  const [showAddBlock, setShowAddBlock] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(
    null
  );

  const getCategoryColor = (category: TimeBlock['category']) => {
    switch (category) {
      case 'focus':
        return 'bg-blue-100 text-blue-800';
      case 'break':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-gray-100 text-gray-800';
      case 'learning':
        return 'bg-purple-100 text-purple-800';
      case 'creative':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TimeBlock['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnergyIcon = (level: TimeBlock['energyLevel']) => {
    switch (level) {
      case 'high':
        return '⚡⚡⚡';
      case 'medium':
        return '⚡⚡';
      case 'low':
        return '⚡';
      default:
        return '';
    }
  };

  const toggleBlockComplete = (id: string) => {
    setTimeBlocks((blocks) =>
      blocks.map((block) =>
        block.id === id
          ? { ...block, completed: !block.completed }
          : block
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Time Blocking</h2>
        <button
          onClick={() => setShowAddBlock(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Block
        </button>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {showAddBlock ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold">Create Time Block</h3>
                  <button
                    onClick={() => setShowAddBlock(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Block Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Deep Focus: Project X"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      rows={2}
                      placeholder="What will you accomplish during this time?"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="focus">Focus Work</option>
                        <option value="break">Break</option>
                        <option value="admin">Admin Tasks</option>
                        <option value="learning">Learning</option>
                        <option value="creative">Creative Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Priority
                      </label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Required Energy Level
                    </label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="high">High Energy ⚡⚡⚡</option>
                      <option value="medium">Medium Energy ⚡⚡</option>
                      <option value="low">Low Energy ⚡</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowAddBlock(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Create Block
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : selectedBlock ? (
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
                        {selectedBlock.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                          selectedBlock.category
                        )}`}
                      >
                        {selectedBlock.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {selectedBlock.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBlock(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Time Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Time</span>
                          <span className="font-medium">
                            {selectedBlock.startTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">
                            {selectedBlock.duration} minutes
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Time</span>
                          <span className="font-medium">
                            {new Date(
                              '1970-01-01T' +
                                selectedBlock.startTime +
                                ':00'
                            ).getTime() +
                              selectedBlock.duration * 60000}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Properties</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                              selectedBlock.priority
                            )}`}
                          >
                            {selectedBlock.priority}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Energy Level</span>
                          <span className="text-yellow-500">
                            {getEnergyIcon(selectedBlock.energyLevel)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {selectedBlock.estimatedProgress !== undefined && (
                      <div>
                        <h4 className="font-semibold mb-3">Progress</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Estimated Completion</span>
                              <span>{selectedBlock.estimatedProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${selectedBlock.estimatedProgress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">Actions</h4>
                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            toggleBlockComplete(selectedBlock.id)
                          }
                          className={`flex-1 px-4 py-2 rounded-lg ${
                            selectedBlock.completed
                              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {selectedBlock.completed
                            ? 'Mark Incomplete'
                            : 'Mark Complete'}
                        </button>
                        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {timeBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                      block.completed
                        ? 'bg-gray-50 opacity-75'
                        : 'bg-white'
                    }`}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-semibold ${
                              block.completed
                                ? 'line-through text-gray-500'
                                : ''
                            }`}
                          >
                            {block.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                              block.category
                            )}`}
                          >
                            {block.category}
                          </span>
                        </div>
                        {block.description && (
                          <p
                            className={`text-sm ${
                              block.completed
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}
                          >
                            {block.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium">
                          {block.startTime} ({block.duration}min)
                        </div>
                        <div className="flex items-center mt-1 gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                              block.priority
                            )}`}
                          >
                            {block.priority}
                          </span>
                          <span className="text-yellow-500">
                            {getEnergyIcon(block.energyLevel)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {block.estimatedProgress !== undefined && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full"
                            style={{
                              width: `${block.estimatedProgress}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
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
