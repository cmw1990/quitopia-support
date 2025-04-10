import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer, Headphones, BookOpen, ListTodo, Lightbulb, ArrowRight, 
  Brain, Heart, Focus, Users, Clock, Music, Sparkles, Bomb, LayoutGrid, 
  RefreshCw, Smile, Droplets, BarChart3, MonitorSmartphone,
  Zap, Activity, Heart as HeartIcon, HeartPulse
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopNav } from "@/components/layout/TopNav";
import { PomodoroTimer } from '@/components/tools/PomodoroTimer';
import { FocusSounds } from '@/components/tools/FocusSounds';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
// Import specific components instead of QuickTools
import { BreathingExercise, GroundingExercise, BodyScan } from '@/components/tools/QuickTools';

// Define the type for tool icons
type IconType = React.ComponentType<{ size?: number | string; className?: string }>;

type ToolCategory = {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
};

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  category: string;
  path: string;
  component?: React.ReactNode;
  isNew?: boolean;
  isPremium?: boolean;
  comingSoon?: boolean;
};

const toolCategories: ToolCategory[] = [
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Tools to help you get more done with less effort',
    icon: Zap,
    color: 'text-yellow-500'
  },
  {
    id: 'focus',
    name: 'Focus Enhancement',
    description: 'Techniques to improve concentration and attention',
    icon: Brain,
    color: 'text-purple-500'
  },
  {
    id: 'adhd',
    name: 'ADHD Support',
    description: 'Specialized tools designed for ADHD brains',
    icon: Activity,
    color: 'text-blue-500'
  },
  {
    id: 'emotional',
    name: 'Emotional Regulation',
    description: 'Sound-based tools to help manage mood and stress',
    icon: Smile,
    color: 'text-green-500'
  },
];

const tools: Tool[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    description: 'Boost productivity with timed work sessions and breaks',
    icon: Clock,
    category: 'productivity',
    path: '/tools/pomodoro',
    component: <PomodoroTimer />,
  },
  {
    id: 'focus-sounds',
    name: 'Focus Sounds',
    description: 'Ambient soundscapes to help you concentrate',
    icon: Music,
    category: 'emotional',
    path: '/tools/focus-sounds',
    component: <FocusSounds />,
  },
  {
    id: 'quick-tools',
    name: 'Quick Tools',
    description: 'Simple utilities for better productivity',
    icon: Sparkles,
    category: 'productivity',
    path: '/tools/quick-tools',
    component: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BreathingExercise />
        <GroundingExercise />
      </div>
    ),
  },
  {
    id: 'todo',
    name: 'Quick Todo',
    description: 'Rapidly capture and organize tasks to maintain focus',
    icon: ListTodo,
    category: 'productivity',
    path: '/tools/todo',
  },
  {
    id: 'reading-guide',
    name: 'Reading Guide',
    description: 'Improve reading focus and reduce distractions',
    icon: BookOpen,
    category: 'focus',
    path: '/tools/reading-guide',
    isNew: true,
  },
  {
    id: 'binaural-beats',
    name: 'Binaural Beats',
    description: 'Use sound frequencies to enhance focus and cognitive performance',
    icon: HeartPulse,
    category: 'focus',
    path: '/tools/binaural-beats',
  },
  {
    id: 'context-switching',
    name: 'Context Switching',
    description: 'Tools to help smoothly transition between different tasks',
    icon: RefreshCw,
    category: 'adhd',
    path: '/tools/context-switching',
  },
  {
    id: 'flow-state',
    name: 'Flow State',
    description: 'Techniques to achieve and maintain deep focus',
    icon: Focus,
    category: 'focus',
    path: '/tools/flow-state',
    isPremium: true,
  },
  {
    id: 'distraction-blocker',
    name: 'Distraction Blocker',
    description: 'Block distracting websites and apps',
    icon: Bomb,
    category: 'adhd',
    path: '/tools/distraction-blocker',
    comingSoon: true,
  },
  {
    id: 'digital-minimalism',
    name: 'Digital Minimalism',
    description: 'Declutter your digital life for better focus',
    icon: LayoutGrid,
    category: 'adhd',
    path: '/tools/digital-minimalism',
    comingSoon: true,
  },
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Track and understand your emotional states',
    icon: Smile,
    category: 'emotional',
    path: '/tools/mood-tracker',
    comingSoon: true,
  },
  {
    id: 'breathing-exercises',
    name: 'Breathing Exercises',
    description: 'Calm your mind with guided breathing techniques',
    icon: Droplets,
    category: 'emotional',
    path: '/tools/breathing-exercises',
    comingSoon: true,
  },
  {
    id: 'focus-analytics',
    name: 'Focus Analytics',
    description: 'Gain insights into your focus patterns and productivity',
    icon: BarChart3,
    category: 'productivity',
    path: '/tools/focus-analytics',
    isPremium: true,
  },
  {
    id: 'digital-wellbeing',
    name: 'Digital Wellbeing',
    description: 'Monitor and improve your relationship with technology',
    icon: MonitorSmartphone,
    category: 'emotional',
    path: '/tools/digital-wellbeing',
    comingSoon: true,
  },
];

const WebTools: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(toolCategories[0].id);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get the active tool
  const activeTool = tools.find(tool => tool.id === activeToolId);
  
  // Get tools for the active category
  const categoryTools = tools.filter(tool => tool.category === activeCategory);
  
  return (
    <>
      <Helmet>
        <title>Web Tools - Easier Focus</title>
        <meta name="description" content="Free web-based tools to help you focus better, manage ADHD, and boost productivity." />
      </Helmet>
      
      <TooltipProvider> 
        <div className="flex flex-col min-h-screen bg-background">
          <TopNav />
          <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
            {/* Header */} 
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 md:mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Focus Web Tools</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Try essential focus tools directly in your browser. Sign up for the full experience.
              </p>
            </motion.div>

            <Tabs
              defaultValue={toolCategories[0].id}
              value={activeCategory}
              onValueChange={(value) => {
                setActiveCategory(value);
                setActiveToolId(null); // Reset active tool when changing categories
              }}
              className="w-full"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-64 flex-shrink-0">
                  <TabsList className="flex flex-col h-auto bg-muted p-1 space-y-1">
                    {toolCategories.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          className={`flex items-center justify-start gap-2 px-3 py-2 text-left w-full ${
                            activeCategory === category.id ? category.color : ''
                          }`}
                        >
                          <CategoryIcon className="h-5 w-5" />
                          <span>{category.name}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  <div className="mt-6 bg-muted/50 rounded-lg p-4">
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">About {
                      toolCategories.find(c => c.id === activeCategory)?.name
                    }</h3>
                    <p className="text-sm text-muted-foreground">
                      {toolCategories.find(c => c.id === activeCategory)?.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1">
                  {toolCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-0">
                      <AnimatePresence mode="wait">
                        {!activeToolId ? (
                          <motion.div
                            key="tool-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {categoryTools.map((tool) => (
                                <Card key={tool.id} className="overflow-hidden">
                                  <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                      <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                                        <tool.icon className="h-5 w-5 text-primary" />
                                      </div>
                                      <div className="flex gap-1">
                                        {tool.isNew && (
                                          <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">New</Badge>
                                        )}
                                        {tool.isPremium && (
                                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">Premium</Badge>
                                        )}
                                        {tool.comingSoon && (
                                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{tool.name}</CardTitle>
                                    <CardDescription>{tool.description}</CardDescription>
                                  </CardHeader>
                                  <CardFooter className="pt-0">
                                    {tool.component ? (
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-between"
                                        onClick={() => setActiveToolId(tool.id)}
                                      >
                                        Open Tool <ArrowRight className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      tool.comingSoon ? (
                                        <Button variant="outline" className="w-full" disabled>
                                          Coming Soon
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-between"
                                          asChild
                                        >
                                          <Link to={tool.path}>
                                            Open Tool <ArrowRight className="h-4 w-4" />
                                          </Link>
                                        </Button>
                                      )
                                    )}
                                  </CardFooter>
                                </Card>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="tool-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Button
                              variant="ghost"
                              className="mb-4"
                              onClick={() => setActiveToolId(null)}
                            >
                              <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                              Back to tools
                            </Button>
                            <Card>
                              <CardHeader>
                                <div className="flex items-center gap-3 mb-1">
                                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                                    {activeTool && <activeTool.icon className="h-5 w-5 text-primary" />}
                                  </div>
                                  <CardTitle>{activeTool?.name}</CardTitle>
                                </div>
                                <CardDescription>{activeTool?.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {activeTool?.component}
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
            
            {/* Quick tools section */}
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Quick Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BreathingExercise />
                <GroundingExercise />
              </div>
            </section>
          </main>
        </div>
      </TooltipProvider>
    </>
  );
};

export default WebTools;
