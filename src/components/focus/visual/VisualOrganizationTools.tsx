import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  category: 'workspace' | 'tasks' | 'notes' | 'schedule' | 'project';
  layout: 'grid' | 'list' | 'kanban' | 'timeline' | 'mindmap';
  colorScheme: string[];
  tags: string[];
  suitableFor: string[];
  accessibility: {
    contrast: 'high' | 'medium' | 'low';
    textSize: 'large' | 'medium' | 'small';
    spacing: 'comfortable' | 'compact' | 'spacious';
  };
  preview: string;
  popularity: number;
}

export const VisualOrganizationTools: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<VisualTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visualTemplates: VisualTemplate[] = [
    {
      id: '1',
      name: 'Focus Flow Board',
      description:
        'Clear visual organization of tasks with priority lanes and progress tracking.',
      category: 'workspace',
      layout: 'kanban',
      colorScheme: ['#E5F6FD', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6'],
      tags: ['adhd-friendly', 'minimalist', 'high-contrast'],
      suitableFor: [
        'Task management',
        'Project planning',
        'Daily organization',
      ],
      accessibility: {
        contrast: 'high',
        textSize: 'large',
        spacing: 'comfortable',
      },
      preview: '🗂️',
      popularity: 92,
    },
    {
      id: '2',
      name: 'TimeBlock Grid',
      description:
        'Visual time management grid with color-coded blocks and energy level indicators.',
      category: 'schedule',
      layout: 'grid',
      colorScheme: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC'],
      tags: ['time-management', 'energy-tracking', 'visual-planning'],
      suitableFor: [
        'Daily scheduling',
        'Focus sessions',
        'Energy management',
      ],
      accessibility: {
        contrast: 'medium',
        textSize: 'medium',
        spacing: 'spacious',
      },
      preview: '📊',
      popularity: 88,
    },
    {
      id: '3',
      name: 'Mind Flow Map',
      description:
        'Intuitive mind mapping tool for organizing thoughts and project components.',
      category: 'notes',
      layout: 'mindmap',
      colorScheme: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A'],
      tags: ['brainstorming', 'project-planning', 'visual-thinking'],
      suitableFor: [
        'Idea organization',
        'Project breakdown',
        'Content planning',
      ],
      accessibility: {
        contrast: 'medium',
        textSize: 'medium',
        spacing: 'compact',
      },
      preview: '🌳',
      popularity: 85,
    },
  ];

  const categories = [
    {
      name: 'workspace',
      icon: '💼',
      description: 'Organize your digital workspace',
    },
    {
      name: 'tasks',
      icon: '✅',
      description: 'Visualize and manage tasks',
    },
    {
      name: 'notes',
      icon: '📝',
      description: 'Structure your thoughts and notes',
    },
    {
      name: 'schedule',
      icon: '📅',
      description: 'Plan your time visually',
    },
    {
      name: 'project',
      icon: '🎯',
      description: 'Manage project components',
    },
  ];

  const getLayoutColor = (layout: VisualTemplate['layout']) => {
    switch (layout) {
      case 'grid':
        return 'bg-blue-100 text-blue-800';
      case 'list':
        return 'bg-green-100 text-green-800';
      case 'kanban':
        return 'bg-purple-100 text-purple-800';
      case 'timeline':
        return 'bg-orange-100 text-orange-800';
      case 'mindmap':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessibilityIcon = (
    level: string,
    type: 'contrast' | 'textSize' | 'spacing'
  ) => {
    switch (type) {
      case 'contrast':
        return level === 'high' ? '🔆' : level === 'medium' ? '🌤️' : '☁️';
      case 'textSize':
        return level === 'large' ? '📝' : level === 'medium' ? '✍️' : '✎';
      case 'spacing':
        return level === 'spacious'
          ? '⬚ ⬚'
          : level === 'comfortable'
          ? '⬚⬚'
          : '⬚';
    }
  };

  const getContrastStyle = (contrast: string) => {
    switch (contrast) {
      case 'high':
        return 'bg-gray-900 text-white';
      case 'medium':
        return 'bg-gray-600 text-white';
      case 'low':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Visual Organization Tools</h2>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() =>
              setActiveCategory(
                activeCategory === category.name ? null : category.name
              )
            }
            className={`p-4 rounded-lg text-center transition-colors ${
              activeCategory === category.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="font-medium capitalize">{category.name}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {selectedTemplate ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{selectedTemplate.preview}</div>
                      <div>
                        <h3 className="text-2xl font-bold">
                          {selectedTemplate.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getLayoutColor(
                            selectedTemplate.layout
                          )}`}
                        >
                          {selectedTemplate.layout}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Color Scheme</h4>
                      <div className="flex gap-2">
                        {selectedTemplate.colorScheme.map((color, index) => (
                          <div
                            key={index}
                            className="w-10 h-10 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Suitable For</h4>
                      <ul className="space-y-2">
                        {selectedTemplate.suitableFor.map(
                          (suitable, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-green-500">✓</span>
                              {suitable}
                            </motion.li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        Accessibility Features
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>
                              {getAccessibilityIcon(
                                selectedTemplate.accessibility.contrast,
                                'contrast'
                              )}
                            </span>
                            <span>Contrast</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-sm ${getContrastStyle(
                              selectedTemplate.accessibility.contrast
                            )}`}
                          >
                            {selectedTemplate.accessibility.contrast}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>
                              {getAccessibilityIcon(
                                selectedTemplate.accessibility.textSize,
                                'textSize'
                              )}
                            </span>
                            <span>Text Size</span>
                          </div>
                          <span className="text-gray-700">
                            {selectedTemplate.accessibility.textSize}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>
                              {getAccessibilityIcon(
                                selectedTemplate.accessibility.spacing,
                                'spacing'
                              )}
                            </span>
                            <span>Spacing</span>
                          </div>
                          <span className="text-gray-700">
                            {selectedTemplate.accessibility.spacing}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Stats</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span>Popularity</span>
                          <span className="text-blue-500 font-bold">
                            {selectedTemplate.popularity}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${selectedTemplate.popularity}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                    Preview
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Use Template
                  </button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {visualTemplates
                .filter(
                  (template) =>
                    !activeCategory || template.category === activeCategory
                )
                .map((template) => (
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
                        <div className="text-3xl">{template.preview}</div>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getLayoutColor(
                              template.layout
                            )}`}
                          >
                            {template.layout}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {template.description}
                      </p>

                      <div className="flex gap-2 flex-wrap mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>Popularity:</span>
                          <span className="text-blue-500 font-medium">
                            {template.popularity}%
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {getAccessibilityIcon(
                            template.accessibility.contrast,
                            'contrast'
                          )}
                          {getAccessibilityIcon(
                            template.accessibility.textSize,
                            'textSize'
                          )}
                          {getAccessibilityIcon(
                            template.accessibility.spacing,
                            'spacing'
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
