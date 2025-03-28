import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent,
  Button,
  Card,
  CardContent
} from './ui';
import { 
  Plus, 
  X, 
  Cigarette, 
  Leaf, 
  PenSquare, 
  BookOpen, 
  BarChart, 
  Timer, 
  Heart,
  Smile,
  Sparkles, 
  Share2,
  Hand,
  CheckCircle,
  BadgeHelp,
  Trophy,
  BookText,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface QuickActionsProps {
  session: Session | null;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  description: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ session }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  
  // List of quick actions available to the user
  const quickActions: Record<string, QuickAction[]> = {
    popular: [
      { 
        id: 'log-craving', 
        label: 'Log Craving', 
        icon: <Cigarette className="h-5 w-5" />, 
        route: '/craving-tracker',
        color: 'text-red-500',
        description: 'Record a new craving episode'
      },
      { 
        id: 'journal', 
        label: 'New Journal', 
        icon: <PenSquare className="h-5 w-5" />, 
        route: '/journal',
        color: 'text-blue-500',
        description: 'Write a journal entry'
      },
      { 
        id: 'mood', 
        label: 'Track Mood', 
        icon: <Smile className="h-5 w-5" />, 
        route: '/health/mood',
        color: 'text-yellow-500',
        description: 'Record your current mood'
      },
      { 
        id: 'achievements', 
        label: 'Achievements', 
        icon: <Trophy className="h-5 w-5" />, 
        route: '/achievements',
        color: 'text-amber-500',
        description: 'View your progress awards'
      },
      { 
        id: 'analytics', 
        label: 'Analytics', 
        icon: <BarChart className="h-5 w-5" />, 
        route: '/analytics',
        color: 'text-indigo-500',
        description: 'View detailed insights'
      },
    ],
    tracking: [
      { 
        id: 'log-consumption', 
        label: 'Log Consumption', 
        icon: <Timer className="h-5 w-5" />, 
        route: '/consumption-logger',
        color: 'text-indigo-500',
        description: 'Record nicotine consumption'
      },
      { 
        id: 'progress', 
        label: 'View Progress', 
        icon: <BarChart className="h-5 w-5" />, 
        route: '/progress',
        color: 'text-green-500',
        description: 'See your quitting progress'
      },
      { 
        id: 'triggers', 
        label: 'Analyze Triggers', 
        icon: <Hand className="h-5 w-5" />, 
        route: '/trigger-analysis',
        color: 'text-pink-500',
        description: 'Identify craving triggers'
      },
      { 
        id: 'task-check', 
        label: 'Tasks', 
        icon: <CheckCircle className="h-5 w-5" />, 
        route: '/task-manager',
        color: 'text-emerald-500',
        description: 'Check your daily tasks'
      },
    ],
    resources: [
      { 
        id: 'guides', 
        label: 'Guides Hub', 
        icon: <BookOpen className="h-5 w-5" />, 
        route: '/guides',
        color: 'text-purple-500',
        description: 'Explore quitting resources'
      },
      { 
        id: 'nrt', 
        label: 'NRT Products', 
        icon: <Leaf className="h-5 w-5" />, 
        route: '/nrt-directory',
        color: 'text-teal-500',
        description: 'Browse nicotine alternatives'
      },
      { 
        id: 'community', 
        label: 'Community', 
        icon: <Heart className="h-5 w-5" />, 
        route: '/community',
        color: 'text-rose-500',
        description: 'Connect with others'
      },
      { 
        id: 'help', 
        label: 'Get Support', 
        icon: <BadgeHelp className="h-5 w-5" />, 
        route: '/support',
        color: 'text-sky-500',
        description: 'Find assistance resources'
      },
    ]
  };

  // Categories for the quick actions
  const categories = [
    { id: 'popular', label: 'Popular' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'resources', label: 'Resources' }
  ];

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (!session) {
      toast.error('Please sign in to access this feature');
      navigate('/auth');
      return;
    }
    
    setIsOpen(false);
    
    // Provide haptic feedback on mobile if available
    if (window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(5); // Short vibration for feedback
    }
    
    navigate(action.route);
    toast.success(`Quick access: ${action.label}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="fixed right-6 bottom-20 md:bottom-6 z-50">
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                animate={{ scale: 1, rotate: 45 }}
                exit={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  size="lg" 
                  className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 rounded-lg shadow-xl border-none"
        side="top"
        align="end"
        alignOffset={-20}
        sideOffset={20}
      >
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="flex border-b">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="flex-1 rounded-none text-sm py-2"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="col-span-2 grid grid-cols-2 gap-2"
                >
                  {quickActions[selectedCategory].map(action => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="flex flex-col items-center justify-center h-24 gap-1 hover:border-primary/50"
                      onClick={() => handleQuickAction(action)}
                    >
                      <div className={`${action.color} mb-1`}>
                        {action.icon}
                      </div>
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {action.description}
                      </span>
                    </Button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default QuickActions; 