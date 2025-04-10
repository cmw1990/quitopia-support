import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  category: 'focus' | 'consistency' | 'productivity' | 'wellness';
  reward: {
    type: 'points' | 'badge' | 'powerup';
    value: number;
    description: string;
  };
  unlocked: boolean;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: {
    type: 'points' | 'badge' | 'powerup';
    value: number;
    description: string;
  };
  progress: number;
  active: boolean;
}

interface Powerup {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // in minutes
  effect: string;
  cost: number;
  active: boolean;
}

export const FocusGamificationCard: React.FC = () => {
  const [points, setPoints] = useState(750);
  const [level, setLevel] = useState(5);
  const [streak, setStreak] = useState(7);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'Focus Master',
      description: 'Complete 10 focus sessions of 25+ minutes',
      icon: '🎯',
      progress: 7,
      total: 10,
      category: 'focus',
      reward: {
        type: 'points',
        value: 500,
        description: 'Earn 500 focus points',
      },
      unlocked: false,
    },
    {
      id: '2',
      name: 'Consistency King',
      description: 'Maintain a 7-day focus streak',
      icon: '👑',
      progress: 7,
      total: 7,
      category: 'consistency',
      reward: {
        type: 'badge',
        value: 1,
        description: 'Unlock the Consistency Master badge',
      },
      unlocked: true,
    },
    {
      id: '3',
      name: 'Productivity Pro',
      description: 'Complete 50 tasks on time',
      icon: '⚡',
      progress: 35,
      total: 50,
      category: 'productivity',
      reward: {
        type: 'powerup',
        value: 1,
        description: 'Unlock the Time Warp powerup',
      },
      unlocked: false,
    },
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      name: 'Deep Focus Marathon',
      description: 'Complete 3 hours of focused work today',
      duration: '24h',
      difficulty: 'hard',
      reward: {
        type: 'points',
        value: 1000,
        description: 'Earn 1000 focus points',
      },
      progress: 65,
      active: true,
    },
    {
      id: '2',
      name: 'Task Master',
      description: 'Complete 10 tasks in your priority queue',
      duration: '48h',
      difficulty: 'medium',
      reward: {
        type: 'badge',
        value: 1,
        description: 'Unlock the Task Master badge',
      },
      progress: 40,
      active: true,
    },
  ]);

  const [powerups] = useState<Powerup[]>([
    {
      id: '1',
      name: 'Time Warp',
      description: 'Boost focus timer progress by 2x',
      icon: '⏰',
      duration: 30,
      effect: '2x Focus Progress',
      cost: 500,
      active: false,
    },
    {
      id: '2',
      name: 'Energy Shield',
      description: 'Block all distractions for 1 hour',
      icon: '🛡️',
      duration: 60,
      effect: 'Distraction Blocker',
      cost: 750,
      active: true,
    },
    {
      id: '3',
      name: 'Mind Boost',
      description: 'Increase focus score gains by 50%',
      icon: '🧠',
      duration: 45,
      effect: '1.5x Focus Score',
      cost: 1000,
      active: false,
    },
  ]);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Focus Points</h3>
            <div className="text-3xl font-bold text-blue-500">{points}</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Level</h3>
            <div className="text-3xl font-bold text-purple-500">{level}</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Day Streak</h3>
            <div className="text-3xl font-bold text-orange-500">
              {streak} days 🔥
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold mb-4">Active Challenges</h3>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{challenge.name}</h4>
                      <p className="text-sm text-gray-600">
                        {challenge.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(
                        challenge.difficulty
                      )}`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Time left: {challenge.duration}
                    </span>
                    <span className="text-blue-600">
                      +{challenge.reward.value} {challenge.reward.type}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-4 mt-6">Powerups</h3>
          <div className="grid gap-4 grid-cols-2">
            {powerups.map((powerup) => (
              <Card
                key={powerup.id}
                className={`p-4 cursor-pointer transition-colors ${
                  powerup.active
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{powerup.icon}</div>
                  <h4 className="font-semibold">{powerup.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {powerup.description}
                  </p>
                  <div className="text-sm text-blue-600">
                    {powerup.active ? (
                      `${powerup.duration} mins left`
                    ) : (
                      `${powerup.cost} points`
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Achievements</h3>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`p-4 ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50'
                    : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              (achievement.progress / achievement.total) * 100
                            }%`,
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-blue-600">
                      Reward: {achievement.reward.description}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
