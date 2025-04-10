import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, Reorder } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'important' | 'moderate' | 'low';
  effort: 'high' | 'medium' | 'low';
  deadline?: string;
  timeEstimate: number; // in minutes
  tags: string[];
  status: 'todo' | 'in-progress' | 'completed';
  energyLevel: 'high' | 'medium' | 'low';
  dependencies: string[];
}

export const FocusPriorityQueue: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Project Proposal',
      description: 'Write and submit the project proposal for client review',
      priority: 'urgent',
      effort: 'high',
      deadline: '2025-03-20',
      timeEstimate: 120,
      tags: ['project', 'writing', 'client'],
      status: 'todo',
      energyLevel: 'high',
      dependencies: [],
    },
    {
      id: '2',
      title: 'Review Team Updates',
      description: 'Check team progress and provide feedback',
      priority: 'important',
      effort: 'medium',
      deadline: '2025-03-19',
      timeEstimate: 45,
      tags: ['team', 'review', 'feedback'],
      status: 'todo',
      energyLevel: 'medium',
      dependencies: [],
    },
    {
      id: '3',
      title: 'Update Documentation',
      description: 'Add recent changes to project documentation',
      priority: 'moderate',
      effort: 'low',
      timeEstimate: 30,
      tags: ['documentation', 'maintenance'],
      status: 'todo',
      energyLevel: 'low',
      dependencies: ['1'],
    },
  ]);

  const [showCompleted, setShowCompleted] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterEnergy, setFilterEnergy] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'effort' | 'energy'>('priority');

  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'moderate',
    effort: 'medium',
    timeEstimate: 30,
    tags: [],
    status: 'todo',
    energyLevel: 'medium',
    dependencies: [],
  });

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnergyColor = (energy: Task['energyLevel']) => {
    switch (energy) {
      case 'high':
        return 'bg-purple-100 text-purple-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addNewTask = () => {
    if (newTask.title?.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || '',
        priority: newTask.priority || 'moderate',
        effort: newTask.effort || 'medium',
        deadline: newTask.deadline,
        timeEstimate: newTask.timeEstimate || 30,
        tags: newTask.tags || [],
        status: 'todo',
        energyLevel: newTask.energyLevel || 'medium',
        dependencies: newTask.dependencies || [],
      };

      setTasks((prev) => [...prev, task]);
      setNewTask({
        priority: 'moderate',
        effort: 'medium',
        timeEstimate: 30,
        tags: [],
        status: 'todo',
        energyLevel: 'medium',
        dependencies: [],
      });
      setShowNewTaskForm(false);
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (!showCompleted && task.status === 'completed') return false;
    if (filterPriority && task.priority !== filterPriority) return false;
    if (filterEnergy && task.energyLevel !== filterEnergy) return false;
    return true;
  });

  const priorityLevels = ['urgent', 'important', 'moderate', 'low'];
  const energyLevels = ['high', 'medium', 'low'];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Focus Priority Queue</h2>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          New Task
        </button>
      </div>

      <div className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Filter by Priority</h3>
            <div className="flex flex-wrap gap-2">
              {priorityLevels.map((priority) => (
                <button
                  key={priority}
                  onClick={() =>
                    setFilterPriority(
                      filterPriority === priority ? null : priority
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm capitalize ${
                    filterPriority === priority
                      ? getPriorityColor(priority as Task['priority'])
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Filter by Energy</h3>
            <div className="flex flex-wrap gap-2">
              {energyLevels.map((energy) => (
                <button
                  key={energy}
                  onClick={() =>
                    setFilterEnergy(
                      filterEnergy === energy ? null : energy
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm capitalize ${
                    filterEnergy === energy
                      ? getEnergyColor(energy as Task['energyLevel'])
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {energy}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as typeof sortBy)
              }
              className="w-full p-2 border rounded"
            >
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
              <option value="effort">Effort</option>
              <option value="energy">Energy Level</option>
            </select>
          </Card>
        </div>
      </div>

      {showNewTaskForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">New Task</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newTask.title || ''}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border rounded"
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Description
              </label>
              <textarea
                value={newTask.description || ''}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded h-24"
                placeholder="Task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: e.target.value as Task['priority'],
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  {priorityLevels.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Energy Level Required
                </label>
                <select
                  value={newTask.energyLevel}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      energyLevel: e.target.value as Task['energyLevel'],
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  {energyLevels.map((energy) => (
                    <option key={energy} value={energy}>
                      {energy}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newTask.deadline || ''}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Time Estimate (minutes)
                </label>
                <input
                  type="number"
                  value={newTask.timeEstimate}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      timeEstimate: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                  step="5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addNewTask}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <Reorder.Group
          axis="y"
          values={filteredTasks}
          onReorder={setTasks}
          className="space-y-4"
        >
          {filteredTasks.map((task) => (
            <Reorder.Item key={task.id} value={task}>
              <Card className="p-4 cursor-grab active:cursor-grabbing">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-gray-600">{task.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getEnergyColor(
                          task.energyLevel
                        )}`}
                      >
                        {task.energyLevel} energy
                      </span>
                      {task.deadline && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {task.timeEstimate} min
                      </span>
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      updateTaskStatus(
                        task.id,
                        e.target.value as Task['status']
                      )
                    }
                    className={`p-2 rounded border ${
                      task.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : task.status === 'in-progress'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
};
