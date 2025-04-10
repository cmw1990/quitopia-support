import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface Guide {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'adhd' | 'productivity' | 'energy' | 'mental-health';
  estimated_reading_time: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

const guides: Guide[] = [
  {
    id: '1',
    title: 'Pomodoro Technique: The Ultimate Guide',
    description: 'Master the time-tested Pomodoro technique to improve focus and productivity.',
    category: 'focus',
    estimated_reading_time: 8,
    difficulty: 'beginner',
    icon: '🍅',
  },
  {
    id: '2',
    title: 'ADHD and Focus: Practical Strategies',
    description: 'Evidence-based approaches to manage ADHD symptoms and enhance concentration.',
    category: 'adhd',
    estimated_reading_time: 12,
    difficulty: 'intermediate',
    icon: '🧠',
  },
  {
    id: '3',
    title: 'Building a Distraction-Free Workspace',
    description: 'Design your physical and digital environment to minimize interruptions.',
    category: 'productivity',
    estimated_reading_time: 6,
    difficulty: 'beginner',
    icon: '🏠',
  },
  {
    id: '4',
    title: 'Deep Work: Cultivating Intense Focus',
    description: 'Learn to develop the ability to focus deeply on cognitively demanding tasks.',
    category: 'focus',
    estimated_reading_time: 10,
    difficulty: 'advanced',
    icon: '🔍',
  },
  {
    id: '5',
    title: 'Energy Management for Sustained Focus',
    description: 'Optimize your energy levels throughout the day to maintain consistent focus.',
    category: 'energy',
    estimated_reading_time: 7,
    difficulty: 'intermediate',
    icon: '⚡',
  },
  {
    id: '6',
    title: 'Mindfulness for Improved Concentration',
    description: 'Integrate mindfulness practices to strengthen attention and awareness.',
    category: 'mental-health',
    estimated_reading_time: 9,
    difficulty: 'beginner',
    icon: '🧘',
  },
  {
    id: '7',
    title: 'ADHD Medication and Focus Supplements',
    description: 'A comprehensive guide to treatments and supplements for attention disorders.',
    category: 'adhd',
    estimated_reading_time: 15,
    difficulty: 'advanced',
    icon: '💊',
  },
  {
    id: '8',
    title: 'The Science of Procrastination',
    description: 'Understand the psychology behind procrastination and how to overcome it.',
    category: 'productivity',
    estimated_reading_time: 8,
    difficulty: 'intermediate',
    icon: '⏰',
  },
  {
    id: '9',
    title: 'Digital Minimalism: Reclaiming Focus',
    description: 'Practical steps to reduce digital distractions and regain control of your attention.',
    category: 'focus',
    estimated_reading_time: 11,
    difficulty: 'intermediate',
    icon: '📱',
  },
];

export function GuidesHub() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const categories = [
    { value: 'focus', label: 'Focus Techniques' },
    { value: 'adhd', label: 'ADHD Support' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'energy', label: 'Energy Management' },
    { value: 'mental-health', label: 'Mental Health' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const filteredGuides = guides.filter((guide) => {
    if (selectedCategory && guide.category !== selectedCategory) {
      return false;
    }
    if (selectedDifficulty && guide.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Focus & ADHD Guides</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert-crafted resources to help you understand and enhance your focus abilities.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Filter Guides</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant={selectedDifficulty === null ? 'default' : 'outline'}
              onClick={() => setSelectedDifficulty(null)}
            >
              All Levels
            </Button>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty.value}
                variant={selectedDifficulty === difficulty.value ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty(difficulty.value)}
              >
                {difficulty.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{guide.icon}</span>
                  <CardTitle>{guide.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-between h-full">
                <p className="text-muted-foreground mb-4">{guide.description}</p>
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                      {guide.estimated_reading_time} min read
                    </span>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {guide.difficulty}
                    </span>
                  </div>
                  <Button className="w-full">Read Guide</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Have a Specific Topic in Mind?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Can't find what you're looking for? Submit a guide request and our focus experts will create it!
              </p>
              <Button>Request a Guide</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 