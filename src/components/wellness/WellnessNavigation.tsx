import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Bath,
  Brain,
  Calendar,
  Coffee,
  Dumbbell,
  Eye,
  Heart,
  HeartPulse,
  Hotel,
  Lightbulb,
  Medal,
  MessageSquareHeart,
  Moon,
  Pill,
  Shield,
  Sparkles,
  Stethoscope,
  Timer,
  Utensils,
  Users,
  Wine,
  Zap,
  Wind
} from 'lucide-react';

const wellnessRoutes = [
  {
    category: 'Energy & Focus',
    routes: [
      { path: '/app/energy/mental', label: 'Mental Energy', icon: Brain },
      { path: '/app/energy/physical', label: 'Physical Energy', icon: Activity },
      { path: '/app/energy/recipes', label: 'Energy Recipes', icon: Utensils },
      { path: '/app/focus', label: 'Focus Timer', icon: Timer },
      { path: '/app/distractions', label: 'Distraction Blocker', icon: Shield },
      { path: '/app/caffeine', label: 'Caffeine Tracking', icon: Coffee },
      { path: '/app/eye-exercises', label: 'Eye Exercises', icon: Eye }
    ]
  },
  {
    category: 'Mental Wellness',
    routes: [
      { path: '/app/meditation', label: 'Meditation', icon: Brain },
      { path: '/app/breathing', label: 'Breathing Exercises', icon: HeartPulse },
      { path: '/app/cbt', label: 'CBT Tools', icon: Lightbulb },
      { path: '/app/mental-health', label: 'Mental Health', icon: Heart },
      { path: '/app/motivation', label: 'Motivation', icon: Sparkles }
    ]
  },
  {
    category: 'Physical Health',
    routes: [
      { path: '/app/exercise', label: 'Exercise Tracking', icon: Dumbbell },
      { path: '/app/sleep', label: 'Sleep Tracking', icon: Moon },
      { path: '/app/nutrition', label: 'Nutrition', icon: Utensils },
      { path: '/app/supplements', label: 'Supplements', icon: Pill },
      { path: '/app/bathing', label: 'Bathing Routine', icon: Bath }
    ]
  },
  {
    category: 'Lifestyle & Recovery',
    routes: [
      { path: '/app/cycle', label: 'Female Cycle', icon: Calendar },
      { path: '/app/pregnancy', label: 'Pregnancy', icon: Heart },
      { path: '/app/smoke-free', label: 'Smoke-Free', icon: Wind },
      { path: '/app/nicotine', label: 'Nicotine', icon: Activity },
      { path: '/app/recovery', label: 'Recovery', icon: HeartPulse }
    ]
  },
  {
    category: 'Support & Progress',
    routes: [
      { path: '/app/consultation', label: 'Expert Consultation', icon: Stethoscope },
      { path: '/app/insurance', label: 'Insurance Claims', icon: Shield },
      { path: '/app/achievements', label: 'Achievements', icon: Medal },
      { path: '/app/support', label: 'Support Groups', icon: MessageSquareHeart },
      { path: '/app/social', label: 'Social Connections', icon: Users }
    ]
  }
];

export function WellnessNavigation() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6">
      {wellnessRoutes.map((category) => (
        <div key={category.category} className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {category.category}
          </h3>
          <div className="space-y-2">
            {category.routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <route.icon className="w-5 h-5" />
                <span>{route.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
