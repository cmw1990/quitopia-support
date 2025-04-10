import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const tools = [
  {
    title: 'Focus Timer',
    description: 'Track your focus sessions with our customizable timer',
    href: '/focus-timer',
    icon: '⏱️',
  },
  {
    title: 'Distraction Blocker',
    description: 'Block distracting websites and apps during focus sessions',
    href: '/distraction-blocker',
    icon: '🚫',
  },
  {
    title: 'White Noise',
    description: 'Ambient sounds to help you stay focused',
    href: '/white-noise',
    icon: '🎵',
  },
  {
    title: 'Task Manager',
    description: 'Organize and prioritize your tasks effectively',
    href: '/task-manager',
    icon: '📝',
  },
  {
    title: 'Focus Analytics',
    description: 'Track and analyze your focus patterns',
    href: '/focus-analytics',
    icon: '📊',
  },
  {
    title: 'Break Timer',
    description: 'Take structured breaks to maintain productivity',
    href: '/break-timer',
    icon: '☕',
  },
  {
    title: 'Focus Environment',
    description: 'Create the perfect environment for deep work',
    href: '/focus-environment',
    icon: '🌟',
  },
  {
    title: 'Focus Journal',
    description: 'Document your focus journey and insights',
    href: '/focus-journal',
    icon: '📔',
  },
  {
    title: 'ADHD Support',
    description: 'Tools and techniques specifically for ADHD management',
    href: '/adhd-support',
    icon: '🧠',
  },
  {
    title: 'Energy Tracker',
    description: 'Monitor and optimize your energy levels',
    href: '/energy-tracker',
    icon: '⚡',
  },
  {
    title: 'Focus Games',
    description: 'Brain training games to improve focus',
    href: '/focus-games',
    icon: '🎮',
  },
  {
    title: 'Focus Community',
    description: 'Connect with others on their focus journey',
    href: '/community',
    icon: '👥',
  },
];

export function FocusTools() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Focus Tools</h1>
          <p className="text-xl text-muted-foreground">
            A comprehensive suite of tools to enhance your focus and productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{tool.icon}</span>
                    <CardTitle>{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Need Help Getting Started?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Not sure which tools to use? Take our focus assessment to get personalized
              recommendations based on your needs and work style.
            </p>
            <Link to="/focus-assessment">
              <Button>Take Focus Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 