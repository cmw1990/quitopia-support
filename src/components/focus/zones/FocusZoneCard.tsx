import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion } from 'framer-motion';

interface FocusZone {
  id: string;
  name: string;
  description: string;
  type: 'deep' | 'light' | 'creative' | 'reading' | 'social';
  environment: {
    lighting: number;
    noise: number;
    temperature: number;
    declutter: number;
  };
  preferences: {
    music?: string;
    scent?: string;
    seating?: string;
    tools?: string[];
  };
  schedule: {
    preferredTime: string;
    duration: number;
    frequency: string;
  };
  stats: {
    productivity: number;
    comfort: number;
    consistency: number;
  };
  icon: string;
}

interface ZoneEnvironment {
  name: string;
  description: string;
  icon: string;
  optimal: {
    min: number;
    max: number;
  };
  unit: string;
}

export const FocusZoneCard: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<FocusZone | null>(null);

  const focusZones: FocusZone[] = [
    {
      id: '1',
      name: 'Deep Work Sanctuary',
      description: 'Distraction-free environment for intense focus sessions.',
      type: 'deep',
      environment: {
        lighting: 70,
        noise: 20,
        temperature: 72,
        declutter: 90,
      },
      preferences: {
        music: 'Low-fi beats',
        scent: 'Lavender',
        seating: 'Ergonomic chair',
        tools: ['Noise-canceling headphones', 'Light dimmer', 'Timer'],
      },
      schedule: {
        preferredTime: 'Morning',
        duration: 90,
        frequency: 'Daily',
      },
      stats: {
        productivity: 85,
        comfort: 90,
        consistency: 80,
      },
      icon: '🎯',
    },
    {
      id: '2',
      name: 'Creative Corner',
      description: 'Inspiring space for creative projects and brainstorming.',
      type: 'creative',
      environment: {
        lighting: 85,
        noise: 40,
        temperature: 74,
        declutter: 70,
      },
      preferences: {
        music: 'Ambient nature',
        scent: 'Citrus',
        seating: 'Floor cushion',
        tools: ['Whiteboard', 'Art supplies', 'Inspiration board'],
      },
      schedule: {
        preferredTime: 'Afternoon',
        duration: 60,
        frequency: '3x/week',
      },
      stats: {
        productivity: 75,
        comfort: 95,
        consistency: 70,
      },
      icon: '🎨',
    },
    {
      id: '3',
      name: 'Reading Nook',
      description: 'Comfortable space for focused reading and learning.',
      type: 'reading',
      environment: {
        lighting: 80,
        noise: 10,
        temperature: 71,
        declutter: 85,
      },
      preferences: {
        music: 'Classical',
        scent: 'Vanilla',
        seating: 'Reading chair',
        tools: ['Book stand', 'Reading light', 'Note-taking tools'],
      },
      schedule: {
        preferredTime: 'Evening',
        duration: 45,
        frequency: 'Daily',
      },
      stats: {
        productivity: 80,
        comfort: 100,
        consistency: 85,
      },
      icon: '📚',
    },
  ];

  const environmentSettings: Record<keyof FocusZone['environment'], ZoneEnvironment> = {
    lighting: {
      name: 'Lighting',
      description: 'Ambient light level for optimal focus',
      icon: '💡',
      optimal: {
        min: 60,
        max: 80,
      },
      unit: '%',
    },
    noise: {
      name: 'Noise Level',
      description: 'Background noise intensity',
      icon: '🔊',
      optimal: {
        min: 10,
        max: 40,
      },
      unit: 'dB',
    },
    temperature: {
      name: 'Temperature',
      description: 'Room temperature for comfort',
      icon: '🌡️',
      optimal: {
        min: 68,
        max: 75,
      },
      unit: '°F',
    },
    declutter: {
      name: 'Organization',
      description: 'Space organization and tidiness',
      icon: '✨',
      optimal: {
        min: 70,
        max: 100,
      },
      unit: '%',
    },
  };

  const getZoneTypeColor = (type: FocusZone['type']) => {
    switch (type) {
      case 'deep':
        return 'bg-blue-100 text-blue-800';
      case 'light':
        return 'bg-green-100 text-green-800';
      case 'creative':
        return 'bg-purple-100 text-purple-800';
      case 'reading':
        return 'bg-yellow-100 text-yellow-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isOptimal = (setting: keyof FocusZone['environment'], value: number) => {
    const env = environmentSettings[setting];
    return value >= env.optimal.min && value <= env.optimal.max;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Focus Zones</h2>

      <div className="grid gap-6">
        {!selectedZone ? (
          <div className="grid gap-6 md:grid-cols-2">
            {focusZones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{zone.icon}</div>
                    <div>
                      <h3 className="font-semibold">{zone.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getZoneTypeColor(
                          zone.type
                        )}`}
                      >
                        {zone.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {zone.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Productivity</div>
                      <div
                        className={`text-lg ${getStatColor(
                          zone.stats.productivity
                        )}`}
                      >
                        {zone.stats.productivity}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Comfort</div>
                      <div
                        className={`text-lg ${getStatColor(zone.stats.comfort)}`}
                      >
                        {zone.stats.comfort}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Consistency</div>
                      <div
                        className={`text-lg ${getStatColor(
                          zone.stats.consistency
                        )}`}
                      >
                        {zone.stats.consistency}%
                      </div>
                    </div>
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
                  <div className="text-4xl">{selectedZone.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedZone.name}</h3>
                    <p className="text-gray-600">{selectedZone.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-4">Environment Settings</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedZone.environment).map(
                      ([key, value]) => {
                        const setting = environmentSettings[
                          key as keyof FocusZone['environment']
                        ];
                        return (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <span>{setting.icon}</span>
                                {setting.name}
                              </label>
                              <span
                                className={`text-sm ${
                                  isOptimal(
                                    key as keyof FocusZone['environment'],
                                    value
                                  )
                                    ? 'text-green-500'
                                    : 'text-yellow-500'
                                }`}
                              >
                                {value}
                                {setting.unit}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={value}
                              className="w-full"
                              readOnly
                            />
                            <div className="text-xs text-gray-500">
                              {setting.description}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Zone Preferences</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedZone.preferences).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="capitalize">{key}</span>
                            <span className="text-gray-600">
                              {Array.isArray(value)
                                ? value.join(', ')
                                : value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Schedule</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedZone.schedule).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                            <span className="text-gray-600">
                              {typeof value === 'number'
                                ? `${value} minutes`
                                : value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Performance Stats</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(selectedZone.stats).map(([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="text-sm font-medium capitalize">
                            {key}
                          </div>
                          <div
                            className={`text-xl font-bold ${getStatColor(value)}`}
                          >
                            {value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                  Edit Zone
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Start Session
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {!selectedZone && (
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Create New Zone
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
