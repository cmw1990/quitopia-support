import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { motion } from 'framer-motion';

interface BreakActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  type: 'physical' | 'mental' | 'social' | 'creative' | 'relaxation';
  benefits: string[];
  energyImpact: 'energizing' | 'neutral' | 'calming';
  suitable: {
    timeOfDay: ('morning' | 'afternoon' | 'evening')[];
    energy: ('high' | 'medium' | 'low')[];
    location: ('indoor' | 'outdoor' | 'anywhere')[];
  };
  icon: string;
}

interface BreakSuggestion {
  activity: BreakActivity;
  reason: string;
  score: number;
}

export const SmartBreakSuggestions: React.FC = () => {
  const [userEnergy, setUserEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>(
    'morning'
  );
  const [location, setLocation] = useState<'indoor' | 'outdoor' | 'anywhere'>(
    'indoor'
  );
  const [focusDuration, setFocusDuration] = useState(45);
  const [suggestions, setSuggestions] = useState<BreakSuggestion[]>([]);

  const activities: BreakActivity[] = [
    {
      id: '1',
      name: 'Quick Stretch Session',
      description:
        'Simple desk stretches to reduce tension and improve circulation',
      duration: 5,
      type: 'physical',
      benefits: [
        'Reduces muscle tension',
        'Improves blood flow',
        'Increases energy',
        'Enhances posture',
      ],
      energyImpact: 'energizing',
      suitable: {
        timeOfDay: ['morning', 'afternoon', 'evening'],
        energy: ['low', 'medium'],
        location: ['indoor', 'outdoor', 'anywhere'],
      },
      icon: '🧘‍♂️',
    },
    {
      id: '2',
      name: 'Mindful Breathing',
      description: 'Simple breathing exercises to center and calm your mind',
      duration: 3,
      type: 'relaxation',
      benefits: [
        'Reduces stress',
        'Improves focus',
        'Calms racing thoughts',
        'Centers attention',
      ],
      energyImpact: 'calming',
      suitable: {
        timeOfDay: ['morning', 'afternoon', 'evening'],
        energy: ['high', 'medium'],
        location: ['indoor', 'outdoor', 'anywhere'],
      },
      icon: '🫁',
    },
    {
      id: '3',
      name: 'Nature Walk',
      description: 'Short walk outside to refresh your mind',
      duration: 10,
      type: 'physical',
      benefits: [
        'Natural light exposure',
        'Physical movement',
        'Mental reset',
        'Vitamin D',
      ],
      energyImpact: 'energizing',
      suitable: {
        timeOfDay: ['morning', 'afternoon'],
        energy: ['medium', 'low'],
        location: ['outdoor'],
      },
      icon: '🚶',
    },
    {
      id: '4',
      name: 'Quick Meditation',
      description: 'Brief mindfulness practice to restore focus',
      duration: 5,
      type: 'mental',
      benefits: [
        'Mental clarity',
        'Emotional balance',
        'Stress reduction',
        'Improved concentration',
      ],
      energyImpact: 'neutral',
      suitable: {
        timeOfDay: ['morning', 'afternoon', 'evening'],
        energy: ['high', 'medium', 'low'],
        location: ['indoor', 'outdoor', 'anywhere'],
      },
      icon: '🧘',
    },
    {
      id: '5',
      name: 'Doodle Break',
      description: 'Free-form drawing to engage creativity',
      duration: 8,
      type: 'creative',
      benefits: [
        'Creative expression',
        'Mental relaxation',
        'Stress relief',
        'Different brain engagement',
      ],
      energyImpact: 'neutral',
      suitable: {
        timeOfDay: ['morning', 'afternoon', 'evening'],
        energy: ['medium', 'low'],
        location: ['indoor', 'anywhere'],
      },
      icon: '✏️',
    },
  ];

  const calculateSuggestions = () => {
    const scored = activities.map((activity) => {
      let score = 0;
      let reasons: string[] = [];

      // Time of day match
      if (activity.suitable.timeOfDay.includes(timeOfDay)) {
        score += 2;
        reasons.push('Ideal for this time of day');
      }

      // Energy level match
      if (activity.suitable.energy.includes(userEnergy)) {
        score += 3;
        reasons.push('Matches your current energy level');
      }

      // Location match
      if (
        activity.suitable.location.includes(location) ||
        activity.suitable.location.includes('anywhere')
      ) {
        score += 2;
        reasons.push('Suitable for your location');
      }

      // Duration appropriateness
      if (
        (focusDuration >= 60 && activity.duration >= 8) ||
        (focusDuration >= 30 && activity.duration >= 5) ||
        activity.duration <= 5
      ) {
        score += 2;
        reasons.push('Duration fits your work session');
      }

      // Energy impact appropriateness
      if (
        (userEnergy === 'low' && activity.energyImpact === 'energizing') ||
        (userEnergy === 'high' && activity.energyImpact === 'calming') ||
        (userEnergy === 'medium' && activity.energyImpact === 'neutral')
      ) {
        score += 3;
        reasons.push('Will help balance your energy');
      }

      return {
        activity,
        reason: reasons.join('. '),
        score,
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  useEffect(() => {
    setSuggestions(calculateSuggestions());
  }, [userEnergy, timeOfDay, location, focusDuration]);

  const getEnergyColor = (energy: typeof userEnergy) => {
    switch (energy) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: BreakActivity['type']) => {
    switch (type) {
      case 'physical':
        return 'bg-blue-100 text-blue-800';
      case 'mental':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'creative':
        return 'bg-orange-100 text-orange-800';
      case 'relaxation':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Smart Break Suggestions</h2>

      <Card className="p-6 mb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-4">Your Current State</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Energy Level
                </label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((energy) => (
                    <button
                      key={energy}
                      onClick={() => setUserEnergy(energy)}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        userEnergy === energy
                          ? getEnergyColor(energy)
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {energy}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Time of Day
                </label>
                <div className="flex gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeOfDay(time)}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        timeOfDay === time
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Break Context</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Location
                </label>
                <div className="flex gap-2">
                  {(['indoor', 'outdoor', 'anywhere'] as const).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        location === loc
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center mt-2">{focusDuration} minutes</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {suggestions.map(({ activity, reason, score }, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{activity.icon}</div>
                <div>
                  <h3 className="font-semibold">{activity.name}</h3>
                  <div className="text-sm text-gray-600">
                    {activity.duration} mins
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {activity.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getTypeColor(
                    activity.type
                  )}`}
                >
                  {activity.type}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activity.energyImpact === 'energizing'
                      ? 'bg-green-100 text-green-800'
                      : activity.energyImpact === 'calming'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {activity.energyImpact}
                </span>
              </div>

              <div className="mt-auto">
                <h4 className="font-semibold mb-2">Benefits:</h4>
                <ul className="text-sm space-y-1">
                  {activity.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 text-sm text-blue-600">{reason}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
