import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  LayoutDashboard,
  Loader2,
  Flame,
  Clock,
  Focus,
  Play,
  ArrowRight,
  ListChecks,
  Users,
  CheckCircle2,
  Lightbulb,
  Award,
  Trophy,
  Brain,
  CheckSquare,
  Target,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseGet, supabasePatch } from '@/lib/supabaseApiService';
import { Achievement as AchievementType, UserAchievement } from '@/types/achievements';
import type { FocusStrategy } from '@/types/focusStrategy';
import type { Task as TaskType, TaskStatus } from '@/types/tasks';
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { parseISO, formatDistanceToNow, isToday, startOfDay, format, differenceInSeconds } from 'date-fns';
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';
import { Label } from "@/components/ui/label";
import { produce } from 'immer';
import { RecentAchievementsWidget } from '@/components/dashboard/RecentAchievementsWidget';
import { DailyGoalWidget } from "@/components/dashboard/DailyGoalWidget";
import { FocusStrategiesWidget } from "@/components/dashboard/FocusStrategiesWidget";
import { CommunityInsightsWidget } from "@/components/dashboard/CommunityInsightsWidget";
import { ProgressAnalyticsWidget } from "@/components/dashboard/ProgressAnalyticsWidget";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { StatsSummaryWidget } from "@/components/dashboard/StatsSummaryWidget";
import { ActiveSessionWidget } from "@/components/dashboard/ActiveSessionWidget";
import { QuickStartWidget } from "@/components/dashboard/QuickStartWidget";

interface FocusSession {
    id: string;
    start_time?: string | null;
    end_time?: string | null;
    status?: string | null;
    technique?: string | null;
    planned_duration_seconds?: number | null;
    duration_minutes?: number | null;
    completed?: boolean | null;
}
interface UserProfileData {
    daily_focus_goal_minutes?: number;
    focus_score?: number;
}
interface DisplayAchievement extends AchievementType {
    isUnlocked: boolean;
    earnedAt?: string | null;
}

const achievementIconMap: Record<string, React.ComponentType<any>> = {
    Trophy,
    Brain,
    CheckSquare,
    Target,
    Clock,
    Award,
    ListChecks,
    Default: Trophy,
};
const getIconComponent = (iconName: string | undefined | null): React.ComponentType<any> => {
    const fallbackIcon = achievementIconMap.Default;
    if (!iconName || !achievementIconMap[iconName]) {
        return fallbackIcon;
    }
    return achievementIconMap[iconName];
};

const GridContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {children}
  </div>
);
interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
export const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, children, className }) => (
  <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const [tasks, setTasks] = useState<TaskType[] | null>(null);
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [stats, setStats] = useState<{ streak: number; totalMinutes: number }>({ streak: 0, totalMinutes: 0 });
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [achievements, setAchievements] = useState<DisplayAchievement[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
    const [taskLoadingId, setTaskLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const userId = user?.id;

    const fetchTasks = useCallback(async () => {
        if (!userId) return;
        setIsLoadingTasks(true);
        try {
            const { data: fetchedTasks, error: fetchError } = await supabaseGet<TaskType>(
                'tasks',
                `user_id=eq.${userId}&status=neq.completed&order=created_at.asc`
            );
            if (fetchError) throw fetchError;
            setTasks(fetchedTasks || []);
        } catch (err: any) {
            console.error("Error fetching tasks:", err);
            setError('Failed to load tasks.');
            setTasks([]);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [userId]);

    const fetchSessions = useCallback(async () => {
        if (!userId) return;
        setIsLoadingSessions(true);
        try {
            const { data: fetchedSessions, error: fetchError } = await supabaseGet<FocusSession>(
                'focus_sessions',
                `user_id=eq.${userId}&order=start_time.desc&limit=5`
            );
            if (fetchError) throw fetchError;
            setSessions(fetchedSessions || []);
        } catch (err: any) {
            console.error("Error fetching sessions:", err);
            setError('Failed to load focus sessions.');
        } finally {
            setIsLoadingSessions(false);
        }
    }, [userId]);

    const fetchStats = useCallback(async () => {
        if (!userId) return;
        setIsLoadingStats(true);
        try {
            const { data: fetchedStatsData, error: fetchError } = await supabaseGet<{ focus_streak: number; total_focus_minutes: number }>(
                'user_profiles',
                `id=eq.${userId}&select=focus_streak,total_focus_minutes&limit=1`
            );
            if (fetchError) throw fetchError;
            const userStats = fetchedStatsData?.[0];
            setStats({
                streak: userStats?.focus_streak ?? 0,
                totalMinutes: userStats?.total_focus_minutes ?? 0
            });
        } catch (err: any) {
            console.error("Error fetching stats:", err);
            setError('Failed to load stats.');
            setStats({ streak: 0, totalMinutes: 0 });
        } finally {
            setIsLoadingStats(false);
        }
    }, [userId]);

    const fetchProfile = useCallback(async () => {
        if (!userId) return;
        setIsLoadingProfile(true);
        try {
            const { data: fetchedProfile, error: fetchError } = await supabaseGet<UserProfileData>(
                'user_profiles',
                `id=eq.${userId}&select=daily_focus_goal_minutes,focus_score&limit=1`
            );
            if (fetchError) throw fetchError;
            setProfile(fetchedProfile?.[0] || null);
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError('Failed to load profile data.');
        } finally {
            setIsLoadingProfile(false);
        }
    }, [userId]);

    const fetchAchievements = useCallback(async () => {
        if (!userId) return;
        setIsLoadingAchievements(true);
        try {
            const { data: allAch, error: allErr } = await supabaseGet<AchievementType>('achievements', 'select=id,name,description,icon,points');
            if (allErr) throw allErr;
            const { data: userAch, error: userErr } = await supabaseGet<UserAchievement>('user_achievements', `user_id=eq.${userId}&select=achievement_id,earned_at`);
            if (userErr) throw userErr;

            const earnedMap = new Map(userAch?.map(ua => [ua.achievement_id, ua.earned_at]));
            
            const displayAchievements = (allAch || []).map((ach): DisplayAchievement => ({
                ...ach,
                isUnlocked: earnedMap.has(ach.id),
                earnedAt: earnedMap.get(ach.id) || null,
            })).sort((a, b) => {
                if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
                return (a.name || '').localeCompare(b.name || '');
            });
            setAchievements(displayAchievements);
        } catch (err: any) {
            console.error("Error fetching achievements:", err);
            setError('Failed to load achievements.');
        } finally {
            setIsLoadingAchievements(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchTasks();
            fetchSessions();
            fetchStats();
            fetchProfile();
            fetchAchievements();
        }
    }, [userId, fetchTasks, fetchSessions, fetchStats, fetchProfile, fetchAchievements]);

    const activeSession = useMemo(() =>
        sessions.find(s => s.start_time && isToday(parseISO(s.start_time)) && !s.end_time && s.status !== 'completed'),
    [sessions]);

    const handleTaskCheck = useCallback(async (taskId: string, currentStatus: string) => {
        if (!userId || !tasks) return;

        const originalTasks = tasks;
        const newStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed';
        setTaskLoadingId(taskId);

        setTasks(produce(draft => {
            const task = draft?.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
            }
        }));

        try {
            const queryParams = `id=eq.${taskId}`;
            const { error: updateError } = await supabasePatch('tasks', { status: newStatus }, queryParams);
            if (updateError) throw updateError;
            fetchStats();
        } catch (err: any) {
            console.error("Error updating task:", err);
            setError(`Failed to update task status: ${err.message || 'Unknown error'}`);
            setTasks(originalTasks);
        } finally {
            setTaskLoadingId(null);
        }
    }, [userId, tasks, fetchStats]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const isPageLoading = isAuthLoading || (!isAuthenticated && !isAuthLoading);
    const isDataLoading = isLoadingTasks || isLoadingSessions || isLoadingStats || isLoadingProfile || isLoadingAchievements;

    const renderContent = () => {
        if (isPageLoading) {
            return <div className="p-6"><Skeleton className="h-64 w-full rounded-lg" /></div>;
        }
        if (!isAuthenticated) {
             return <div className="p-6 text-center text-muted-foreground">Please log in to view your dashboard.</div>;
        }
        if (isDataLoading && !tasks && !sessions && !stats.totalMinutes && !profile && !achievements.length) {
             return (
                <GridContainer>
                    <Skeleton className="h-32 w-full rounded-lg md:col-span-2" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </GridContainer>
             );
        }
        if (error) {
            return (
                <Alert variant="destructive" className="col-span-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Dashboard</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => { fetchTasks(); fetchSessions(); fetchStats(); fetchProfile(); fetchAchievements(); }}>Retry All</Button>
                </Alert>
            );
        }

        return (
            <GridContainer>
                <Card className="col-span-full bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-red-900/30 border-0 shadow-inner">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">{getGreeting()}, {user?.user_metadata?.name || 'User'}!</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">Ready to focus and achieve your goals?</CardDescription>
                    </CardHeader>
                </Card>
                <QuickStartWidget navigate={navigate} />
                <TasksWidget 
                    tasks={tasks} 
                    handleCheck={handleTaskCheck} 
                    isLoading={taskLoadingId}
                />
                <StatsSummaryWidget 
                    streak={stats.streak} 
                    totalMinutes={stats.totalMinutes}
                    isLoading={isLoadingStats}
                />
                <ActiveSessionWidget session={activeSession} navigate={navigate} />
                <RecentAchievementsWidget />
                <FocusStrategiesWidget className="lg:col-span-1" />
                <CommunityInsightsWidget className="lg:col-span-1" />
                <ProgressAnalyticsWidget className="lg:col-span-2" />
                <DailyGoalWidget
                    profile={profile}
                    stats={stats}
                    isLoadingProfile={isLoadingProfile}
                    className="lg:col-span-1"
                />
            </GridContainer>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <Helmet>
                <title>Dashboard - Easier Focus</title>
                <meta name="description" content="Your personal focus dashboard." />
            </Helmet>
            <header className="p-4 flex justify-between items-center">
              <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard size={20}/> Dashboard</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardPage;
