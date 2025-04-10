import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'study' | 'work' | 'creative' | 'chores' | 'wellness';
  duration: number;
  activityLevel: 'quiet' | 'moderate' | 'active';
  suitableFor: string[];
  structure: {
    setup: string[];
    process: string[];
    completion: string[];
  };
  benefits: string[];
  tips: string[];
  icon: string;
}

export const BodyDoublingTemplates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'all'>(
    'all'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const templates: Template[] = [
    {
      id: '1',
      name: 'Deep Work Session',
      description:
        'Focused work time with virtual accountability and structured breaks.',
      category: 'work',
      duration: 90,
      activityLevel: 'quiet',
      suitableFor: [
        'Complex projects',
        'Writing tasks',
        'Analysis work',
        'Strategic planning',
      ],
      structure: {
        setup: [
          'Set clear session goal',
          'Prepare workspace',
          'Minimize distractions',
          'Check tools and resources',
        ],
        process: [
          'Brief check-in every 25 minutes',
          'Shared focus periods',
          'Silent progress tracking',
          'Optional ambient sounds',
        ],
        completion: [
          'Review accomplishments',
          'Share key takeaways',
          'Plan next session',
          'Celebrate progress',
        ],
      },
      benefits: [
        'Enhanced accountability',
        'Reduced procrastination',
        'Improved focus duration',
        'Structured workflow',
      ],
      tips: [
        'Use video if comfortable',
        'Keep regular schedule',
        'Share session goals',
        'Stay within timeframe',
      ],
      icon: '💼',
    },
    {
      id: '2',
      name: 'Study Group Flow',
      description:
        'Collaborative learning environment with shared focus and discussion periods.',
      category: 'study',
      duration: 120,
      activityLevel: 'moderate',
      suitableFor: [
        'Exam preparation',
        'Research work',
        'Skill learning',
        'Reading sessions',
      ],
      structure: {
        setup: [
          'Share study objectives',
          'Review materials needed',
          'Set milestone points',
          'Agree on break times',
        ],
        process: [
          'Silent study blocks',
          'Brief concept sharing',
          'Progress check-ins',
          'Question rounds',
        ],
        completion: [
          'Summarize learnings',
          'Plan next topics',
          'Share resources',
          'Set next goals',
        ],
      },
      benefits: [
        'Peer motivation',
        'Knowledge sharing',
        'Consistent schedule',
        'Better retention',
      ],
      tips: [
        'Use study timer',
        'Take coordinated breaks',
        'Share study tips',
        'Maintain quiet focus',
      ],
      icon: '📚',
    },
    {
      id: '3',
      name: 'Creative Co-Working',
      description:
        'Supportive environment for artistic and creative endeavors.',
      category: 'creative',
      duration: 60,
      activityLevel: 'moderate',
      suitableFor: [
        'Art projects',
        'Writing sessions',
        'Design work',
        'Brainstorming',
      ],
      structure: {
        setup: [
          'Share project goals',
          'Prepare materials',
          'Set inspiration mood',
          'Plan sharing points',
        ],
        process: [
          'Independent creation',
          'Optional sharing',
          'Feedback rounds',
          'Inspiration breaks',
        ],
        completion: [
          'Share progress',
          'Collect feedback',
          'Document ideas',
          'Plan next session',
        ],
      },
      benefits: [
        'Creative motivation',
        'Shared inspiration',
        'Regular practice',
        'Constructive feedback',
      ],
      tips: [
        'Stay open to ideas',
        'Share challenges',
        'Take inspiration breaks',
        'Document progress',
      ],
      icon: '🎨',
    },
    {
      id: '4',
      name: 'Home Task Sprint',
      description:
        'Structured approach to completing household tasks and chores.',
      category: 'chores',
      duration: 45,
      activityLevel: 'active',
      suitableFor: [
        'Cleaning tasks',
        'Organization',
        'Meal prep',
        'Home maintenance',
      ],
      structure: {
        setup: [
          'List specific tasks',
          'Gather supplies',
          'Set task order',
          'Check timing',
        ],
        process: [
          'Task-by-task focus',
          'Progress sharing',
          'Movement breaks',
          'Quick wins first',
        ],
        completion: [
          'Area check',
          'Task verification',
          'Reset supplies',
          'Next session plan',
        ],
      },
      benefits: [
        'Maintained momentum',
        'Shared energy',
        'Task completion',
        'Regular upkeep',
      ],
      tips: [
        'Start small',
        'Stay mobile',
        'Share progress photos',
        'Celebrate completion',
      ],
      icon: '🏠',
    },
    {
      id: '5',
      name: 'Wellness Hour',
      description:
        'Guided self-care and wellness activities with accountability.',
      category: 'wellness',
      duration: 60,
      activityLevel: 'moderate',
      suitableFor: [
        'Exercise sessions',
        'Meditation',
        'Stretching',
        'Mindfulness',
      ],
      structure: {
        setup: [
          'Set wellness goals',
          'Prepare space',
          'Check equipment',
          'Review routine',
        ],
        process: [
          'Guided activities',
          'Regular check-ins',
          'Mindful breaks',
          'Progress sharing',
        ],
        completion: [
          'Cool down',
          'Share experience',
          'Track progress',
          'Schedule next',
        ],
      },
      benefits: [
        'Consistent practice',
        'Mutual support',
        'Health focus',
        'Stress reduction',
      ],
      tips: [
        'Stay comfortable',
        'Listen to body',
        'Share wellness tips',
        'Keep regular schedule',
      ],
      icon: '🧘',
    },
  ];

  const getCategoryIcon = (category: Template['category']) => {
    switch (category) {
      case 'study':
        return '📚';
      case 'work':
        return '💼';
      case 'creative':
        return '🎨';
      case 'chores':
        return '🏠';
      case 'wellness':
        return '🧘';
      default:
        return '📋';
    }
  };

  const getActivityLevelColor = (level: Template['activityLevel']) => {
    switch (level) {
      case 'quiet':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(
    (template) => selectedCategory === 'all' || template.category === selectedCategory
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Body Doubling Templates</h2>

      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'study', 'work', 'creative', 'chores', 'wellness'] as const).map(
            (category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">
                  {category === 'all' ? '📋' : getCategoryIcon(category)}
                </span>
                {category === 'all' ? 'All Templates' : category}
              </button>
            )
          )}
        </div>
      </div>

      {!selectedTemplate ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{template.icon}</div>
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getActivityLevelColor(
                          template.activityLevel
                        )}`}
                      >
                        {template.activityLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>

                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">⏱️</span>
                    {template.duration} minutes
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
                <div className="text-4xl">{selectedTemplate.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-4">Session Structure</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Setup Phase
                    </h5>
                    <ul className="space-y-2">
                      {selectedTemplate.structure.setup.map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-blue-500">1️⃣</span>
                          {step}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Process Phase
                    </h5>
                    <ul className="space-y-2">
                      {selectedTemplate.structure.process.map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-purple-500">2️⃣</span>
                          {step}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Completion Phase
                    </h5>
                    <ul className="space-y-2">
                      {selectedTemplate.structure.completion.map(
                        (step, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <span className="text-green-500">3️⃣</span>
                            {step}
                          </motion.li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.suitableFor.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Benefits</h4>
                  <ul className="space-y-2">
                    {selectedTemplate.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-green-500">✓</span>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Pro Tips</h4>
                  <ul className="space-y-2">
                    {selectedTemplate.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-blue-500">💡</span>
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                Save Template
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Start Session
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
