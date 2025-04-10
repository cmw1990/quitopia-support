import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { achievementService } from '@/services/achievementService';
import type { DisplayAchievement } from '@/types/achievement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Trophy, TrendingUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'; // Using Award as a generic icon
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parseISO } from 'date-fns';

// Helper to get a suitable icon - can be expanded significantly
const getIcon = (iconName: string | undefined, isUnlocked: boolean) => {
  if (!isUnlocked && iconName === 'Lock') return <Lock className="h-10 w-10 text-gray-400" />;
  if (!isUnlocked) return <Lock className="h-10 w-10 text-gray-400" />;
  
  switch(iconName) {
      case 'Trophy': return <Trophy className="h-10 w-10 text-yellow-500" />;
      case 'TrendingUp': return <TrendingUp className="h-10 w-10 text-blue-500" />;
      case 'CheckCircle': return <CheckCircle className="h-10 w-10 text-green-500" />;
      // Add more mappings based on icons defined in AchievementDefinition
      default: return <Award className="h-10 w-10 text-yellow-500" />; // Default unlocked icon
  }
}

interface GroupedAchievements {
  [category: string]: DisplayAchievement[];
}

export const AchievementsDisplay: React.FC = () => {
  const [showLocked, setShowLocked] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // --- React Query Hook ---
  const { data: achievements, isLoading, error } = useQuery<DisplayAchievement[], Error>({
    queryKey: ['achievementsForDisplay'],
    queryFn: async () => {
        const result = await achievementService.getAchievementsForDisplay();
        if (result.error) throw result.error;
        return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const { data: totalPoints } = useQuery<number>({ 
    queryKey: ['totalAchievementPoints', achievements], // Depends on achievements query
    queryFn: () => {
        if (!Array.isArray(achievements)) return 0;
        return achievementService.calculateTotalPoints(achievements);
    },
    enabled: !!achievements && Array.isArray(achievements), // Only run when achievements is a loaded array
  });

  // --- Data Processing ---
  const groupedAchievements = useMemo(() => {
    if (!Array.isArray(achievements)) return {};
    
    const filtered = showLocked ? achievements : achievements.filter(a => a.is_unlocked);

    return filtered.reduce((acc, ach) => {
      const category = ach.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ach);
      return acc;
    }, {} as GroupedAchievements);
  }, [achievements, showLocked]);
  
  // Initialize category expansion state
  useMemo(() => {
      if (Array.isArray(achievements)) {
          const initialExpansionState: Record<string, boolean> = {};
          achievements.forEach(ach => {
              const category = ach.category || 'Uncategorized';
              if (initialExpansionState[category] === undefined) {
                  initialExpansionState[category] = achievements.some(a => a.category === category && a.is_unlocked);
              }
          });
          setExpandedCategories(prev => ({ ...initialExpansionState, ...prev }));
      }
  }, [achievements]);

  const toggleCategory = (category: string) => {
      setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // --- Rendering ---
  const renderAchievementCard = (ach: DisplayAchievement) => (
    <motion.div
      key={ach.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`p-4 border rounded-lg flex items-center space-x-4 relative overflow-hidden ${ach.is_unlocked ? 'bg-card border-border' : 'bg-muted/50 border-dashed border-muted-foreground/30'}`}
    >
        {ach.is_unlocked && (
            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full"
            >
                <CheckCircle className="h-3 w-3" />
            </motion.div>
        )}
        <div className={`flex-shrink-0 ${ach.is_unlocked ? '' : 'opacity-50'}`}>
            {getIcon(ach.icon, ach.is_unlocked)}
        </div>
        <div className="flex-grow">
            <h3 className={`font-semibold ${ach.is_unlocked ? 'text-card-foreground' : 'text-muted-foreground'}`}>{ach.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{ach.description}</p>
            {ach.is_unlocked && ach.unlocked_at && (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <p className="text-xs text-green-600 mt-1">Unlocked: {format(parseISO(ach.unlocked_at), 'MMM d, yyyy')}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{format(parseISO(ach.unlocked_at), 'PPpp')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
             {!ach.is_unlocked && ach.progress !== null && ach.progress !== undefined && ach.progress_total !== null && ach.progress_total !== undefined && ach.progress_total > 0 && (
                 <div className="mt-2">
                     <Progress value={(typeof ach.progress === 'number' && typeof ach.progress_total === 'number' && ach.progress_total > 0) ? (ach.progress / ach.progress_total) * 100 : 0} className="h-2" />
                     <p className="text-xs text-muted-foreground mt-1 text-right">{ach.progress ?? 0} / {ach.progress_total ?? '??'}</p>
                 </div>
             )}
        </div>
        {ach.is_unlocked && (
            <div className="text-right flex-shrink-0 ml-4">
                <Badge variant="secondary" className="font-bold text-lg">+{ach.points_reward} pts</Badge>
            </div>
        )}
    </motion.div>
  );

   const renderSkeletonGroup = () => (
     <div className="mb-8">
        <Skeleton className="h-6 w-1/3 mb-4" />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(3).fill(0).map((_, i) => (
                 <div key={i} className="p-4 border rounded-lg flex items-center space-x-4 bg-card">
                     <Skeleton className="h-10 w-10 rounded-full" />
                     <div className="flex-grow space-y-2">
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-3 w-full" />
                         <Skeleton className="h-3 w-1/2" />
                     </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                 </div>
            ))}
        </div>
     </div>
   );

  return (
    <div className="p-4 md:p-6">
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
      >
          <div>
             <h1 className="text-3xl font-bold">Achievements</h1>
             <p className="text-muted-foreground mt-1">Track your progress and unlock rewards!</p>
          </div>
          <div className="flex items-center gap-4">
              <Card className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6"/>
                    <span className="text-2xl font-bold">
                        {totalPoints === undefined ? <Skeleton className="h-6 w-12 inline-block bg-white/30"/> : totalPoints}
                    </span>
                    <span className="text-sm font-medium">Total Points</span>
                </div>
              </Card>
              <Button variant="outline" onClick={() => setShowLocked(!showLocked)}>
                {showLocked ? 'Hide Locked' : 'Show Locked'}
              </Button>
          </div>
      </motion.div>

      {isLoading && ( <> {renderSkeletonGroup()} {renderSkeletonGroup()} </> )}
      {error && <p className="text-red-500">Error loading achievements: {error.message}</p>}
      {!isLoading && !error && Object.keys(groupedAchievements).length === 0 && (
          <p className="text-center text-muted-foreground py-8">
              {showLocked ? "No achievements defined yet." : "No achievements unlocked yet. Keep going!"}
          </p>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          {Object.entries(groupedAchievements).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, categoryAchievements]) => (
            <motion.div 
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * Object.keys(groupedAchievements).indexOf(category) }}
            >
              <button 
                  onClick={() => toggleCategory(category)} 
                  className="w-full text-left mb-4 pb-2 border-b border-border flex justify-between items-center cursor-pointer hover:text-primary transition-colors"
              >
                <h2 className="text-2xl font-semibold flex items-center">
                   {/* Add category icons later */} 
                   {category}
                   <Badge variant="secondary" className="ml-3 text-sm font-normal">{categoryAchievements.length}</Badge>
                </h2>
                {expandedCategories[category] ? <ChevronUp /> : <ChevronDown />}
              </button>
              <AnimatePresence>
              {expandedCategories[category] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                 >
                   {Array.isArray(categoryAchievements) && categoryAchievements
                        .sort((a, b) => (a.is_unlocked === b.is_unlocked) ? (a.points_reward ?? 0) - (b.points_reward ?? 0) : a.is_unlocked ? -1 : 1)
                        .map(renderAchievementCard)}
                 </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}; 