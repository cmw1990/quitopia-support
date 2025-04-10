import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface NoiseProfile {
  id: string;
  name: string;
  type: 'focus' | 'relax' | 'calm' | 'energize' | 'custom';
  settings: {
    ambientNoise: number;
    suddenSounds: number;
    humanVoices: number;
    whitePinkNoise: number;
    natureSounds: number;
  };
  triggers: string[];
  recommendations: string[];
}

export const NoiseSensitivitySettings: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<NoiseProfile | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);

  const noiseProfiles: NoiseProfile[] = [
    {
      id: '1',
      name: 'Deep Focus Mode',
      type: 'focus',
      settings: {
        ambientNoise: 20,
        suddenSounds: 10,
        humanVoices: 15,
        whitePinkNoise: 85,
        natureSounds: 40,
      },
      triggers: [
        'Unexpected loud noises',
        'Background conversations',
        'Device notifications',
      ],
      recommendations: [
        'Use noise-canceling headphones',
        'Enable Do Not Disturb mode',
        'Work in a dedicated quiet space',
      ],
    },
    {
      id: '2',
      name: 'Gentle Background',
      type: 'calm',
      settings: {
        ambientNoise: 40,
        suddenSounds: 20,
        humanVoices: 30,
        whitePinkNoise: 60,
        natureSounds: 70,
      },
      triggers: [
        'Complete silence',
        'Irregular rhythmic sounds',
        'High-pitched noises',
      ],
      recommendations: [
        'Use nature sound playlists',
        'Position away from high-traffic areas',
        'Consider acoustic panels',
      ],
    },
    {
      id: '3',
      name: 'Balanced Environment',
      type: 'relax',
      settings: {
        ambientNoise: 50,
        suddenSounds: 30,
        humanVoices: 45,
        whitePinkNoise: 55,
        natureSounds: 60,
      },
      triggers: [
        'Fluctuating noise levels',
        'Electronic device sounds',
        'Environmental disruptions',
      ],
      recommendations: [
        'Maintain consistent background noise',
        'Use sound masking techniques',
        'Create acoustic barriers',
      ],
    },
  ];

  const getProfileTypeColor = (type: NoiseProfile['type']) => {
    switch (type) {
      case 'focus':
        return 'bg-blue-100 text-blue-800';
      case 'relax':
        return 'bg-green-100 text-green-800';
      case 'calm':
        return 'bg-purple-100 text-purple-800';
      case 'energize':
        return 'bg-orange-100 text-orange-800';
      case 'custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoiseLevel = (level: number) => {
    if (level >= 80) return { color: 'bg-red-500', text: 'Very High' };
    if (level >= 60) return { color: 'bg-orange-500', text: 'High' };
    if (level >= 40) return { color: 'bg-yellow-500', text: 'Medium' };
    if (level >= 20) return { color: 'bg-green-500', text: 'Low' };
    return { color: 'bg-blue-500', text: 'Very Low' };
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Noise Sensitivity Settings</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCalibration(true)}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Calibrate
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            New Profile
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {showCalibration ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    Noise Sensitivity Calibration
                  </h3>
                  <button
                    onClick={() => setShowCalibration(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-600">
                    Follow these steps to calibrate your noise sensitivity
                    settings to your environment and preferences.
                  </p>

                  <div className="grid gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Step 1: Baseline</h4>
                      <p className="text-sm text-gray-600">
                        Find a quiet moment and assess your current
                        environment's noise level.
                      </p>
                      <button className="mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                        Start Baseline Test
                      </button>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">
                        Step 2: Sound Types
                      </h4>
                      <p className="text-sm text-gray-600">
                        We'll play different types of sounds to determine your
                        sensitivity levels.
                      </p>
                      <button className="mt-3 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        Test Sound Types
                      </button>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium mb-2">
                        Step 3: Duration Test
                      </h4>
                      <p className="text-sm text-gray-600">
                        Measure how different sounds affect you over time.
                      </p>
                      <button className="mt-3 px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600">
                        Start Duration Test
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setShowCalibration(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Save Calibration
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : isCreating ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">
                    Create New Noise Profile
                  </h3>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., Office Hours, Study Time"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Profile Type
                    </label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="focus">Focus</option>
                      <option value="relax">Relax</option>
                      <option value="calm">Calm</option>
                      <option value="energize">Energize</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Noise Settings</h4>
                    <div className="space-y-4">
                      {Object.entries(noiseProfiles[0].settings).map(
                        ([key, _]) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span>50%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              defaultValue="50"
                              className="w-full"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Save Profile
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : activeProfile ? (
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
                        {activeProfile.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getProfileTypeColor(
                          activeProfile.type
                        )}`}
                      >
                        {activeProfile.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveProfile(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Noise Levels</h4>
                      <div className="space-y-4">
                        {Object.entries(activeProfile.settings).map(
                          ([key, value]) => {
                            const level = getNoiseLevel(value);
                            return (
                              <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-white ${level.color}`}
                                  >
                                    {level.text}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`${level.color} h-2 rounded-full`}
                                    style={{ width: `${value}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Common Triggers</h4>
                      <div className="space-y-2">
                        {activeProfile.triggers.map((trigger, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-red-500">•</span>
                            {trigger}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        Recommendations
                      </h4>
                      <div className="space-y-3">
                        {activeProfile.recommendations.map(
                          (recommendation, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-green-500 mt-0.5">
                                  ✓
                                </span>
                                <span>{recommendation}</span>
                              </div>
                            </motion.div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Apply Profile
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {noiseProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveProfile(profile)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{profile.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getProfileTypeColor(
                            profile.type
                          )}`}
                        >
                          {profile.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {Object.entries(profile.settings)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className={`${
                                  getNoiseLevel(value).color
                                } h-1 rounded-full`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profile.triggers.slice(0, 2).map((trigger, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                      {profile.triggers.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          +{profile.triggers.length - 2} more
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
