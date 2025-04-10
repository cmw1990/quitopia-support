import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Timer, Headphones, BookOpen, ListTodo, Lightbulb, ArrowRight, 
  BrainCircuit, HeartPulse, Focus, Users, Clock, Music, Sparkles, ShieldCheck, LayoutGrid, 
  RefreshCw, Smile, Droplets, BarChart3, MonitorSmartphone, ArrowRightLeft,
  Zap, Activity, Search, Filter, Star, Settings,
  ChevronRight, ChevronDown, Info, CalendarClock, SlidersHorizontal, EyeOff,
  Lock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopNav } from "@/components/layout/TopNav";
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInView } from 'react-intersection-observer';

// Types
type IconType = React.ComponentType<{ size?: number | string; className?: string }>;

type ToolCategory = {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
  bgColor: string;
  features?: string[];
};

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  category: string;
  path: string;
  isNew?: boolean;
  isPremium?: boolean;
  comingSoon?: boolean;
  tags?: string[];
  usageCount?: number;
  features?: string[];
  benefits?: string[];
};

// Tool Categories - Refined and aligned with ssot8001 & app goals
const toolCategories: ToolCategory[] = [
  {
    id: 'adhd',
    name: 'ADHD Toolkit',
    description: 'Specialized tools designed to support executive functions and manage ADHD challenges.',
    icon: BrainCircuit,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: [
      'Executive function support',
      'Task breakdown & planning',
      'Time perception aids',
      'Impulsivity management'
    ]
  },
  {
    id: 'focus',
    name: 'Focus Enhancement',
    description: 'Techniques and environments to improve concentration, attention, and deep work.',
    icon: Focus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      'Distraction blocking',
      'Focus session timers (Pomodoro, Flow)',
      'Ambient soundscapes',
      'Mindfulness exercises'
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity Boosters',
    description: 'Tools to streamline workflows, manage tasks efficiently, and get more done.',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    features: [
      'Advanced task management',
      'Time tracking & analytics',
      'Goal setting & progress monitoring',
      'Workflow optimization'
    ]
  },
  {
    id: 'wellness',
    name: 'Energy & Wellness',
    description: 'Manage mental energy, track mood, and build healthy digital habits.',
    icon: HeartPulse,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: [
      'Energy level tracking',
      'Mood journaling & analysis',
      'Digital wellness insights',
      'Stress reduction techniques'
    ]
  },
];

// Expanded and Refined Tools Data (Aligned with ssot8001)
const tools: Tool[] = [
  // ADHD Category
  {
    id: 'task-manager',
    name: 'ADHD Task Manager',
    description: 'Visually organize, break down, and prioritize tasks with cognitive load estimates.',
    icon: ListTodo,
    category: 'adhd',
    path: '/easier-focus/app/tasks', // Correct path from ssot8001
    tags: ['task-management', 'planning', 'executive-function', 'organization'],
    usageCount: 2150,
    isPremium: true,
    features: [
      'Visual task board (Kanban)',
      'Micro-task breakdown',
      'Priority matrix (Eisenhower)',
      'Cognitive load estimation',
      'Reward system integration'
    ],
    benefits: [
      'Reduces overwhelm',
      'Improves task initiation',
      'Enhances planning skills',
      'Boosts sense of accomplishment'
    ]
  },
  {
    id: 'context-switcher',
    name: 'Context Switching Aid',
    description: 'Smoothly transition between tasks with guided mental preparation and checklists.',
    icon: ArrowRightLeft,
    category: 'adhd',
    path: '/easier-focus/app/strategies', // Changed path to strategies as no dedicated page exists in ssot8001
    tags: ['transitions', 'cognitive-load', 'executive-function'],
    usageCount: 890,
    isPremium: true,
    isNew: true,
    features: [
      'Structured transition protocols',
      'Mental reset exercises',
      'Pre-task checklists',
      'Time estimation for switching'
    ],
    benefits: [
      'Reduces mental friction',
      'Minimizes time lost between tasks',
      'Improves focus when starting new tasks',
      'Lowers cognitive load'
    ]
  },
  {
    id: 'impulse-control',
    name: 'Impulse Management Tools',
    description: 'Strategies and interventions to manage impulsivity and redirect focus.',
    icon: Activity,
    category: 'adhd',
    path: '/easier-focus/app/strategies', // Changed path to strategies as no dedicated page exists in ssot8001
    tags: ['impulsivity', 'self-regulation', 'executive-function', 'behavior'],
    // comingSoon: true, // Removed coming soon - should be implemented within strategies page
    isPremium: true, // Assumed premium
    isNew: true, // Marked as new feature to implement
    features: [
      '"Pause & Reflect" prompts',
      'Behavior tracking & analysis',
      'Alternative activity suggestions',
      'Gamified self-control challenges'
    ],
    benefits: [
      'Increases awareness of impulsive urges',
      'Develops self-regulation skills',
      'Reduces negative consequences of impulsivity'
    ]
  },
  // Focus Category
  {
    id: 'pomodoro',
    name: 'AI Pomodoro & Flow Timer',
    description: 'Adaptive timer with work/break cycles, flow tracking, and personalized suggestions.',
    icon: Clock,
    category: 'focus',
    path: '/easier-focus/app/pomodoro', // Correct path from ssot8001
    tags: ['time-management', 'focus', 'productivity', 'flow-state'],
    usageCount: 5820,
    isPremium: false,
    features: [
      'Customizable work/break intervals',
      'AI-powered adaptive cycles',
      'Flow state detection (beta)',
      'Integrated task list',
      'Ambient soundscapes'
    ],
    benefits: [
      'Structured work sessions',
      'Reduced mental fatigue',
      'Improved concentration',
      'Builds consistent work habits'
    ]
  },
   {
    id: 'distraction-blocker',
    name: 'Intelligent Blocker',
    description: 'Block distracting websites and apps during focus sessions with smart scheduling.',
    icon: ShieldCheck,
    category: 'focus',
    path: '/easier-focus/app/blocker', // Correct path from ssot8001
    tags: ['distraction', 'focus', 'digital-wellness', 'blocking'],
    usageCount: 4100,
    isPremium: true,
    features: [
      'Website & application blocking',
      'Scheduled blocking periods',
      'Allowlist/Blocklist modes',
      'Password-protected overrides',
      'Usage analytics integration'
    ],
    benefits: [
      'Creates distraction-free work environment',
      'Reduces procrastination',
      'Increases deep work time',
      'Builds self-control'
    ]
  },
  {
    id: 'ambient-sounds',
    name: 'Focus Soundscapes',
    description: 'Curated ambient sounds and music designed to enhance concentration and block noise.',
    icon: Headphones,
    category: 'focus',
    path: '/easier-focus/app/sessions', // Integrated into Focus Sessions page as per ssot8001 implications
    tags: ['audio', 'focus', 'relaxation', 'noise-blocking'],
    usageCount: 3500,
    features: [
      'Variety of sound types (nature, cafe, white noise)',
      'Binaural beats (optional)',
      'Volume mixing controls',
      'Timer integration'
    ],
    benefits: [
      'Masks distracting background noise',
      'Promotes a calm and focused state',
      'Can improve concentration for some individuals'
    ]
  },
  // Productivity Category
  {
    id: 'body-doubling',
    name: 'Community Body Doubling',
    description: 'Virtual co-working sessions to boost accountability and maintain focus alongside others.',
    icon: Users,
    category: 'productivity', // Changed category to productivity based on location
    path: '/easier-focus/app/community', // Correct path from ssot8001
    tags: ['accountability', 'social', 'motivation', 'adhd', 'co-working'],
    usageCount: 1500,
    isNew: true,
    isPremium: true, // Assumed premium
    features: [
      'Scheduled group sessions',
      'On-demand silent co-working rooms',
      'Optional video/chat interaction',
      'Goal sharing & check-ins'
    ],
    benefits: [
      'Reduces feelings of isolation',
      'Increases task initiation & follow-through',
      'Provides structure and social presence'
    ]
  },
  {
    id: 'analytics',
    name: 'Focus Analytics',
    description: 'Track your focus patterns, productivity trends, and identify areas for improvement.',
    icon: BarChart3,
    category: 'productivity', // Changed category to productivity based on location
    path: '/easier-focus/app/analytics', // Correct path from ssot8001
    tags: ['data', 'insights', 'productivity', 'tracking', 'self-improvement'],
    usageCount: 1980,
    isPremium: true,
    features: [
      'Focus session history & trends',
      'Task completion rates',
      'Distraction pattern analysis',
      'Optimal focus time identification',
      'Goal progress tracking'
    ],
    benefits: [
      'Understand your work patterns',
      'Make data-driven improvements',
      'Identify focus triggers & blockers',
      'Visualize progress over time'
    ]
  },
   {
    id: 'goal-setting',
    name: 'Goal Setting & Tracking',
    description: 'Define, break down, and track progress towards your short-term and long-term goals.',
    icon: Star,
    category: 'productivity',
    path: '/easier-focus/app/tasks', // Integrated into Task Manager as per ssot8001 implications
    tags: ['goals', 'planning', 'motivation', 'achievement'],
    // comingSoon: true, // Removed coming soon
    isPremium: true, // Assumed premium
    isNew: true,
    features: [
      'SMART goal framework',
      'Goal decomposition into tasks',
      'Progress visualization',
      'Milestone celebrations'
    ],
    benefits: [
      'Provides clarity and direction',
      'Increases motivation and commitment',
      'Makes large goals less daunting'
    ]
  },
  // Wellness Category
  {
    id: 'mood-energy-tracker',
    name: 'Mood & Energy Tracker',
    description: 'Log and analyze your mood and energy levels to optimize focus and well-being.',
    icon: Smile, // Or HeartPulse
    category: 'wellness',
    path: '/easier-focus/app/mood', // Correct path from ssot8001
    tags: ['mood', 'energy', 'self-awareness', 'wellness', 'tracking'],
    usageCount: 2800,
    isPremium: false, // Core feature likely free
    features: [
      'Quick logging interface',
      'Correlation analysis with focus sessions',
      'Trend visualization',
      'Personalized insights & suggestions'
    ],
    benefits: [
      'Identify patterns affecting focus',
      'Optimize work schedule based on energy',
      'Improve self-awareness',
      'Supports proactive well-being management'
    ]
  },
  {
    id: 'digital-wellness',
    name: 'Digital Wellness Center',
    description: 'Tools and insights to build healthier habits around technology use.',
    icon: MonitorSmartphone,
    category: 'wellness',
    path: '/easier-focus/app/blocker', // Integrated into Blocker as per ssot8001 implications
    tags: ['digital-detox', 'screen-time', 'habits', 'mindfulness', 'tech-balance'],
    usageCount: 1100,
    isPremium: true,
    isNew: true,
    features: [
      'Usage tracking & insights (integration needed)',
      'Mindful usage prompts',
      'Scheduled tech breaks',
      'Digital wellness score'
    ],
    benefits: [
      'Reduces mindless scrolling',
      'Promotes intentional technology use',
      'Decreases digital fatigue',
      'Improves overall well-being'
    ]
  },
  {
    id: 'stress-reduction',
    name: 'Stress Reduction Toolkit',
    description: 'Guided exercises and techniques to manage stress and regulate emotions.',
    icon: Droplets,
    category: 'wellness',
    path: '/easier-focus/app/strategies', // Integrated into Strategies page
    tags: ['stress', 'relaxation', 'mindfulness', 'emotional-regulation'],
    // comingSoon: true, // Removed coming soon
    isPremium: false, // Likely free basic exercises
    isNew: true,
    features: [
      'Guided breathing exercises',
      'Short mindfulness meditations',
      'Body scan practices',
      'Quick stress-relief techniques'
    ],
    benefits: [
      'Lowers acute stress levels',
      'Improves emotional regulation',
      'Promotes calmness and relaxation'
    ]
  },
];

const WebToolsPage: React.FC = () => {
  // Ensure the initial active category exists
  const initialCategory = toolCategories.length > 0 ? toolCategories[0].id : '';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set()); // Use Set for better performance
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const authData = useAuth(); // Get the whole auth context data
  const user = authData?.user; // Safely access user
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

  // Update filtersOpen state when isMobile changes
  useEffect(() => {
    setFiltersOpen(!isMobile);
  }, [isMobile]);

  // Memoize calculation of all unique tags
  const allTags = useMemo(() => {
    return Array.from(new Set(tools.flatMap(tool => tool.tags || []))).sort();
  }, []); // Re-calculate only if `tools` data changes (which it won't in this hardcoded example)

  // Memoize filtered and sorted tools
  const filteredTools = useMemo(() => {
    return tools
      .filter(tool => tool.category === activeCategory)
      .filter(tool => {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = tool.name.toLowerCase().includes(searchLower);
        const descMatch = tool.description.toLowerCase().includes(searchLower);
        const tagMatch = (tool.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
        return nameMatch || descMatch || tagMatch;
      })
      .filter(tool => 
        selectedTags.length === 0 || 
        selectedTags.every(tag => tool.tags?.includes(tag))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            return (b.usageCount || 0) - (a.usageCount || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'newest':
            // Prioritize non-new items first, then sort by name for consistency if both are new/old
            const aIsNew = a.isNew ? -1 : 1;
            const bIsNew = b.isNew ? -1 : 1;
            if (aIsNew !== bIsNew) return aIsNew - bIsNew;
            return a.name.localeCompare(b.name); 
          default:
            return 0;
        }
      });
  }, [activeCategory, searchQuery, selectedTags, sortBy]);

  const handleToolClick = (tool: Tool) => {
    // Use a more robust check for premium status based on user_metadata
    const isUserPremium = user?.user_metadata?.is_premium || false; 
    
    if (tool.isPremium && !isUserPremium) {
      toast({
        title: "Premium Feature",
        description: `Upgrade to Premium to unlock the ${tool.name} tool and enhance your focus journey!`,
        variant: "default",
        action: {
          label: "View Pricing",
          onClick: () => navigate('/pricing') // Ensure /pricing route exists
        }
      });
      return;
    }
    navigate(tool.path);
  };

  const toggleToolExpansion = (toolId: string) => {
    setExpandedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click when clicking badge
      if (!selectedTags.includes(tag)) {
        setSelectedTags(prev => [...prev, tag]);
      } else {
        setSelectedTags(prev => prev.filter(t => t !== tag));
      }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: shouldReduceMotion ? 0 : 0.07 // Faster stagger
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: shouldReduceMotion ? 0 : 15, // Slightly less movement
      scale: shouldReduceMotion ? 1 : 0.98
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120, // Adjusted spring
        damping: 18
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" } // Smoother ease
    }
  };

  return (
    <>
      <Helmet>
        <title>EasierFocus Tools - Enhance Focus, Productivity & Wellness</title>
        <meta 
          name="description" 
          content="Explore a comprehensive suite of tools for ADHD support, focus enhancement, productivity boosting, and digital wellness management. Find your flow with EasierFocus."
        />
         <meta name="keywords" content="focus tools, productivity apps, ADHD tools, pomodoro timer, distraction blocker, task management, digital wellness, body doubling" />
      </Helmet>
      
      <TooltipProvider delayDuration={100}> 
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-slate-50/50 to-background dark:from-background dark:via-black/10 dark:to-background">
          <TopNav />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Header - Enhanced */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInVariants}
              className="text-center mb-10 md:mb-16"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
                className="inline-block p-3 rounded-full bg-primary/10 mb-4"
              >
                 <LayoutGrid className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
                Your Focus Toolkit
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover specialized tools designed to enhance concentration, boost productivity, manage ADHD, and promote digital well-being.
              </p>
            </motion.div>

            <Tabs
              defaultValue={initialCategory}
              value={activeCategory}
              onValueChange={(value) => {
                setActiveCategory(value);
                setSearchQuery(''); // Reset search on category change
                setSelectedTags([]); // Reset tags on category change
              }}
              className="w-full"
            >
              <div className="flex flex-col lg:flex-row gap-8 xl:gap-10">
                {/* Sidebar - Enhanced */}
                <div className="lg:w-72 flex-shrink-0 space-y-6">
                  {/* Category Tabs - Enhanced */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-muted-foreground px-3 mb-2">Categories</h3>
                    <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
                      {toolCategories.map((category) => {
                        const CategoryIcon = category.icon;
                        return (
                          <HoverCard key={category.id} openDelay={200} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <TabsTrigger
                                value={category.id}
                                className={cn(
                                  "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all",
                                  "hover:bg-accent/70 dark:hover:bg-accent/50",
                                  activeCategory === category.id
                                    ? `bg-primary/10 ${category.color} dark:bg-primary/20`
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <CategoryIcon className={cn("h-5 w-5", activeCategory === category.id ? category.color : 'text-muted-foreground/80')} />
                                <span>{category.name}</span>
                              </TabsTrigger>
                            </HoverCardTrigger>
                            <HoverCardContent align="start" className="w-80 ml-2">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                   <div className={cn("rounded-md p-1.5 w-fit", category.bgColor)}>
                                      <CategoryIcon className={cn("h-5 w-5", category.color)} />
                                   </div>
                                   <h4 className="font-semibold text-base">{category.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                {category.features && category.features.length > 0 && (
                                  <ul className="text-sm space-y-1 pt-2">
                                    {category.features.map((feature, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <ChevronRight className="h-3 w-3 text-primary/70" />
                                        <span className="text-muted-foreground">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}
                    </TabsList>
                  </div>

                  <Separator />

                  {/* Filters - Enhanced */}
                  <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full group px-3 py-1">
                      <span className="text-sm font-semibold text-muted-foreground">Filters</span>
                      <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          filtersOpen ? "rotate-180" : "",
                          "group-hover:text-foreground"
                        )} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-5 mt-4 px-1">
                      {/* Sort By */}
                      <div>
                        <label htmlFor="sort-by" className="text-xs font-medium text-muted-foreground mb-2 block px-2">Sort By</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger id="sort-by" className="w-full text-sm">
                            <SelectValue placeholder="Sort by..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="popular">Popularity</SelectItem>
                            <SelectItem value="name">Alphabetical (A-Z)</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filter by Tags */}
                      {allTags.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block px-2">Filter by Tags</label>
                          <ScrollArea className="h-[180px] rounded-md border bg-background/50 dark:bg-black/10 p-3">
                            <div className="space-y-2.5">
                              {allTags.map(tag => (
                                <div key={tag} className="flex items-center">
                                  <Checkbox
                                    id={`tag-${tag}`}
                                    checked={selectedTags.includes(tag)}
                                    onCheckedChange={(checked) => {
                                      const isChecked = checked === true;
                                      setSelectedTags(prev => 
                                        isChecked 
                                          ? [...prev, tag]
                                          : prev.filter(t => t !== tag)
                                      );
                                    }}
                                    className="mr-2"
                                  />
                                  <label 
                                    htmlFor={`tag-${tag}`} 
                                    className="text-sm cursor-pointer hover:text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {tag.split('-').map(word => 
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                           {selectedTags.length > 0 && (
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => setSelectedTags([])}
                              >
                                Clear Tags
                              </Button>
                            )}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Main Content Area - Tools Grid */}
                <div className="flex-1 min-w-0">
                  {/* Search Bar - Enhanced */}
                  <div className="mb-6 relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      type="search"
                      placeholder={`Search in ${toolCategories.find(c => c.id === activeCategory)?.name || 'tools'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-base shadow-sm"
                    />
                  </div>

                  {/* Tools Grid */}
                  {toolCategories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-0">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${category.id}-${searchQuery}-${sortBy}-${selectedTags.join('-')}`} // Key ensures re-render on filter/sort change
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0 }} // Add exit animation
                          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
                        >
                          {filteredTools.length > 0 ? (
                            filteredTools.map((tool, index) => (
                              <motion.div 
                                key={tool.id} 
                                variants={itemVariants}
                                // layout // Add layout prop for smoother transitions if needed, can impact performance
                              >
                                <Card 
                                  className={cn(
                                    "overflow-hidden flex flex-col h-full transition-all duration-300 group",
                                    "bg-card border rounded-xl shadow-sm",
                                    "hover:shadow-md hover:border-primary/40 hover:-translate-y-1",
                                    tool.isPremium && "border-amber-300/50 dark:border-amber-700/50 hover:border-amber-400/80"
                                  )}
                                  onClick={() => handleToolClick(tool)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-3">
                                       {/* Icon */}
                                      <div className={cn(
                                        "w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-200",
                                        tool.isPremium ? "bg-amber-100 dark:bg-amber-900/30" : "bg-primary/10 dark:bg-primary/20",
                                        tool.isPremium ? "group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50" : "group-hover:bg-primary/20 dark:group-hover:bg-primary/30"
                                      )}>
                                        <tool.icon className={cn(
                                          "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                          tool.isPremium ? "text-amber-600 dark:text-amber-400" : "text-primary"
                                        )} />
                                      </div>
                                      {/* Badges */}
                                      <div className="flex flex-col items-end gap-1.5 text-xs">
                                        {tool.isNew && (
                                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white">
                                            New
                                          </Badge>
                                        )}
                                        {tool.isPremium && (
                                          <Badge variant="outline" className="border-amber-500 text-amber-600 dark:border-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-transparent">
                                            Premium
                                          </Badge>
                                        )}
                                        {tool.usageCount && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Badge variant="secondary" className="gap-1 cursor-default">
                                                <Users className="h-3 w-3" />
                                                {tool.usageCount > 1000 ? `${(tool.usageCount / 1000).toFixed(1)}k` : tool.usageCount}
                                              </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                              <p>{tool.usageCount.toLocaleString()} users this month</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </div>
                                    {/* Title & Description */}
                                    <CardTitle className={cn(
                                        "text-lg font-semibold transition-colors group-hover:text-primary"
                                      )}>
                                      {tool.name}
                                    </CardTitle>
                                    <CardDescription className="text-sm h-10 line-clamp-2">{tool.description}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="pb-4 flex-grow flex flex-col">
                                    {/* Tags */}
                                    {tool.tags && tool.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-4">
                                        {tool.tags.slice(0, 3).map(tag => (
                                          <Badge 
                                            key={tag} 
                                            variant={selectedTags.includes(tag) ? "default" : "secondary"}
                                            className={cn(
                                              "text-xs font-medium cursor-pointer transition-colors",
                                              !selectedTags.includes(tag) && "hover:bg-accent"
                                            )}
                                            onClick={(e) => { e.stopPropagation(); handleTagClick(tag, e); }}
                                          >
                                            {tag.split('-').map(word => 
                                              word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Collapsible Details */}
                                    {(tool.features || tool.benefits) && (
                                      <Collapsible
                                        open={expandedTools.has(tool.id)}
                                        onOpenChange={(isOpen) => {
                                          toggleToolExpansion(tool.id)
                                        }}
                                        className="mb-4"
                                      >
                                        <CollapsibleTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-between text-muted-foreground hover:text-foreground px-2"
                                            aria-label={`More details about ${tool.name}`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <span className="text-xs font-medium">Details</span>
                                            <ChevronDown className={cn(
                                              "h-4 w-4 transition-transform",
                                              expandedTools.has(tool.id) && "rotate-180"
                                            )} />
                                          </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="space-y-3 pt-3 text-sm">
                                          {tool.features && tool.features.length > 0 && (
                                            <div>
                                              <h4 className="text-xs font-semibold mb-1.5 text-foreground">Key Features:</h4>
                                              <ul className="space-y-1">
                                                {tool.features.map((feature, index) => (
                                                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                                    <ChevronRight className="h-3 w-3 text-primary/80 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {tool.benefits && tool.benefits.length > 0 && (
                                            <div>
                                              <h4 className="text-xs font-semibold mb-1.5 text-foreground">Benefits:</h4>
                                              <ul className="space-y-1">
                                                {tool.benefits.map((benefit, index) => (
                                                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                                    <Star className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />
                                                    <span>{benefit}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </CollapsibleContent>
                                      </Collapsible>
                                    )}
                                    
                                    <div className="flex-grow"></div>

                                    <Button
                                      variant={tool.isPremium ? "secondary" : "default"}
                                      size="sm"
                                      className="w-full group/button mt-auto"
                                      onClick={(e) => { e.stopPropagation(); handleToolClick(tool); }}
                                      aria-label={`Open ${tool.name}`}
                                    >
                                      {tool.isPremium ? (
                                        <> 
                                          <Lock className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-500"/>
                                          <span>Unlock Premium</span>
                                        </>
                                      ) : (
                                        <>
                                          <span>Open Tool</span>
                                          <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover/button:translate-x-1" />
                                        </>
                                      )}
                                    </Button>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))
                          ) : (
                            // No Results Message
                            <motion.div 
                              className="col-span-full text-center py-12"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                               <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"/>
                              <p className="text-lg font-medium text-foreground">No tools found</p>
                              <p className="text-muted-foreground mt-1">
                                Try adjusting your search or filters.
                              </p>
                               <Button 
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => { setSearchQuery(''); setSelectedTags([]); }}
                              >
                                Clear Filters
                              </Button>
                            </motion.div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
          </main>
        </div>
      </TooltipProvider>
    </>
  );
};

export default WebToolsPage;
