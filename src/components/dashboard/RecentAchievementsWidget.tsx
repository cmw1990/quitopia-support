import React, { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Info, ExternalLink, Lock, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseGet } from '@/lib/supabaseApiService';
import { UserAchievement } from '@/types/achievements';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { DashboardCard } from '@/pages/app/DashboardPage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AchievementDefinition {
    key: string;
    name: string;
    description: string;
    icon?: React.ComponentType<any>;
}

const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
    'first-focus': { key: 'first-focus', name: 'First Focus Session', description: 'Complete your first focus session.', icon: Trophy },
    'streak-3': { key: 'streak-3', name: 'Focus Streak: 3 Days', description: 'Maintain a focus streak for 3 days.', icon: Award },
    'task-master': { key: 'task-master', name: 'Task Master', description: 'Complete 10 tasks.', icon: Lock },
};

interface CombinedAchievement extends AchievementDefinition {
    earnedAt: string;
}

export const RecentAchievementsWidget: React.FC = () => {
    const { user } = useAuth();
    const [recentAchievements, setRecentAchievements] = useState<CombinedAchievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentAchievements = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await supabaseGet<UserAchievement>(
                    'user_achievements',
                    `user_id=eq.${user.id}&select=achievement_id,earned_at&order=earned_at.desc&limit=3`
                );

                if (fetchError) throw fetchError;
                
                const combined: CombinedAchievement[] = (data || [])
                    .map(ua => {
                        const definition = ACHIEVEMENT_DEFINITIONS[ua.achievement_id];
                        if (!definition) return null;
                        return {
                            ...definition,
                            earnedAt: ua.earned_at,
                        };
                    })
                    .filter((ach): ach is CombinedAchievement => ach !== null);

                setRecentAchievements(combined);

            } catch (err: any) {
                console.error("Error fetching recent achievements:", err);
                setError(err.message || 'Failed to load achievements.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecentAchievements();
    }, [user?.id]);

    return (
        <DashboardCard 
            title="Recent Achievements" 
            description="Your latest accomplishments"
            className="md:col-span-2 lg:col-span-1 flex flex-col"
        >
            <CardContent className="pt-4 flex-grow space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                        <Skeleton className="h-6 w-4/5" />
                    </div>
                ) : error ? (
                    <div className="flex items-center text-sm text-destructive">
                        <Info size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : recentAchievements.length > 0 ? (
                    <TooltipProvider delayDuration={100}>
                        <ul className="space-y-4">
                            {recentAchievements.map(ach => {
                                const Icon = ach.icon || Lock;
                                return (
                                    <li key={ach.key} className="flex items-center gap-3">
                                        <span className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                            <Icon size={18} className="text-amber-600 dark:text-amber-400" />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                     <p className="text-sm font-medium truncate cursor-default" title={ach.name}>
                                                        {ach.name}
                                                     </p>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{ach.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNowStrict(parseISO(ach.earnedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </TooltipProvider>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full py-4">
                       <Trophy size={32} className="text-muted-foreground/50 mb-3" />
                       <p className="text-sm font-medium text-muted-foreground">Keep focusing!</p>
                       <p className="text-xs text-muted-foreground">Your achievements will appear here.</p>
                    </div>
                )}
            </CardContent>
            {!isLoading && !error && recentAchievements.length > 0 && (
                <CardFooter className="pt-3 mt-auto">
                    <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                        <Link to="/app/achievements">
                            <ExternalLink size={12} className="mr-1.5" /> View All Achievements
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </DashboardCard>
    );
}; 