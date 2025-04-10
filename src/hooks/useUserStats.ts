import { useState, useEffect, useCallback } from 'react';
import { fetchTable, insertIntoTable } from '@/lib/supabase-rest';
import { PomodoroSessionRecord } from '@/types/pomodoro';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Trophy } from 'lucide-react';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from '@/config/achievements';
import { UserAchievement } from '@/types/achievements';
import { startOfDay, isSameDay, subDays, parseISO } from 'date-fns';

export interface UserStats {
    focusSessionsCompleted: number;
    totalFocusMinutes: number;
    tasksCompletedViaFocus: number; // Tasks linked to completed focus sessions
    currentFocusStreak: number; // Added streak
    // Add other stats as needed (e.g., total mood logs, streak lengths)
}

export interface UseUserStatsReturn extends UserStats {
    isLoading: boolean;
    error: string | null;
    refetch: () => void; // Function to manually refetch stats
}

const EMPTY_STATS: UserStats = {
    focusSessionsCompleted: 0,
    totalFocusMinutes: 0,
    tasksCompletedViaFocus: 0,
    currentFocusStreak: 0, // Added streak default
};

export function useUserStats(userId: string | undefined): UseUserStatsReturn {
    const { user } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Changed to false initially
    const [error, setError] = useState<string | null>(null);

    // State for achievement unlocking
    const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
    const [isCheckingAchievements, setIsCheckingAchievements] = useState(false);
    // Note: Achievement unlock errors are logged/toasted, not returned directly for now.

    // If no userId is provided, return empty stats immediately without fetching
    if (!userId) {
        return {
            ...EMPTY_STATS,
            isLoading: false,
            error: null,
            refetch: () => {} // No-op for unauthenticated routes
        };
    }

    // Fetch initial unlocked achievements
    useEffect(() => {
        const fetchInitialUnlocked = async () => {
            if (!userId) {
                setUnlockedKeys(new Set());
                return;
            }
            try {
                const userAchievementsData = await fetchTable<UserAchievement>(
                    'focus_achievements',
                    { user_id: `eq.${userId}` }
                );
                const initialKeys = new Set((userAchievementsData || []).map(ua => ua.achievement_id));
                setUnlockedKeys(initialKeys);
            } catch (err) {
                console.error("Error fetching initial unlocked achievements:", err);
            }
        };
        fetchInitialUnlocked();
    }, [userId]);

    // Function to check and unlock achievements based on current stats
    const checkAndUnlockAchievements = useCallback(async (currentStats: UserStats) => {
        if (!userId || isCheckingAchievements || unlockedKeys.size === 0) {
            return;
        }

        const achievementsToUnlock: AchievementDefinition[] = [];
        for (const definition of Object.values(ACHIEVEMENT_DEFINITIONS)) {
            if (unlockedKeys.has(definition.key)) continue; // Skip already unlocked

            let criteriaMet = false;
            switch (definition.criteria_type) {
                case 'focus_sessions_completed':
                    criteriaMet = currentStats.focusSessionsCompleted >= definition.criteria_threshold;
                    break;
                case 'focus_minutes_total':
                    criteriaMet = currentStats.totalFocusMinutes >= definition.criteria_threshold;
                    break;
                case 'tasks_completed':
                    criteriaMet = currentStats.tasksCompletedViaFocus >= definition.criteria_threshold;
                    break;
                // Add future criteria checks here
            }

            if (criteriaMet) {
                achievementsToUnlock.push(definition);
            }
        }

        if (achievementsToUnlock.length === 0) return;

        setIsCheckingAchievements(true);
        try {
            const awardsToInsert = achievementsToUnlock.map(ach => ({
                user_id: userId,
                achievement_id: ach.key,
                earned_at: new Date().toISOString()
            }));

            const results = await insertIntoTable<UserAchievement>('focus_achievements', awardsToInsert);
            
            const newlyUnlockedKeys: string[] = [];
            if (results && Array.isArray(results)) {
                results.forEach(insertedRecord => {
                    const achievement = achievementsToUnlock.find(def => def.key === insertedRecord.achievement_id);
                    if(achievement) {
                        newlyUnlockedKeys.push(achievement.key);
                        toast({
                            title: "Achievement Unlocked!",
                            description: `${achievement.name} unlocked!`,
                            duration: 5000,
                        });
                    }
                });
            } else if (results) {
                const achievement = achievementsToUnlock.find(def => def.key === (results as UserAchievement).achievement_id);
                if(achievement) {
                    newlyUnlockedKeys.push(achievement.key);
                    toast({ title: "Achievement Unlocked!", description: `${achievement.name} unlocked!` });
                }
            } else {
                console.warn("Achievement insert operation did not return data.");
                achievementsToUnlock.forEach(ach => newlyUnlockedKeys.push(ach.key));
            }

            if (newlyUnlockedKeys.length > 0) {
                setUnlockedKeys(prev => new Set([...prev, ...newlyUnlockedKeys]));
            }
        } catch (err: any) {
            console.error("Error during achievement unlock process:", err);
            toast({ variant: "destructive", title: "Achievement Error", description: "Could not save achievement progress." });
        } finally {
            setIsCheckingAchievements(false);
        }
    }, [user?.id, isCheckingAchievements, unlockedKeys, toast]);

    // Function to calculate focus streak
    const calculateFocusStreak = (sessions: PomodoroSessionRecord[]): number => {
        if (!sessions || sessions.length === 0) return 0;

        const completedDates = sessions
            .filter(s => s.completed && s.start_time)
            .map(s => startOfDay(parseISO(s.start_time!)))
            .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

        if (completedDates.length === 0) return 0;

        let streak = 0;
        let currentDate = startOfDay(new Date());

        // Check if there was a session today or yesterday to start the streak count
        if (!isSameDay(completedDates[0], currentDate) && !isSameDay(completedDates[0], subDays(currentDate, 1))) {
            return 0; // No session today or yesterday, streak broken
        }
        
        // Check if today has a session
        if (isSameDay(completedDates[0], currentDate)) {
            streak = 1;
            currentDate = subDays(currentDate, 1); // Start checking from yesterday
        } else {
            // Must have been yesterday
            streak = 1; 
             currentDate = subDays(currentDate, 1); // Start checking from 2 days ago
        }
        

        let uniqueDayIndex = 1; // Index for the next unique day in sorted dates
        while (uniqueDayIndex < completedDates.length) {
            // Find the next unique day in the sorted list
            let nextUniqueDate = completedDates[uniqueDayIndex];
            while (uniqueDayIndex + 1 < completedDates.length && isSameDay(completedDates[uniqueDayIndex + 1], nextUniqueDate)) {
                uniqueDayIndex++;
            }
            
            if (isSameDay(nextUniqueDate, currentDate)) {
                streak++;
                currentDate = subDays(currentDate, 1); // Check for the previous day
                uniqueDayIndex++; // Move to the next potential unique day
            } else {
                break; // Gap found, streak ends
            }
        }

        return streak;
    };

    // Function to fetch stats
    const fetchStats = useCallback(async () => {
        if (!userId) {
            console.log("[useUserStats] fetchStats: No user ID, setting empty stats.");
            setStats(EMPTY_STATS);
            setIsLoading(false);
            return;
        }
        console.log("[useUserStats] fetchStats: Starting for user", userId);
        setIsLoading(true);
        setError(null);
        let calculatedStats = EMPTY_STATS;

        try {
            console.log("[useUserStats] fetchStats: Fetching completed focus sessions...");
            const completedFocusSessions = await fetchTable<PomodoroSessionRecord>(
                'pomodoro_sessions',
                { 
                    user_id: `eq.${userId}`, 
                    completed: 'eq.true' 
                }
            );
            console.log(`[useUserStats] fetchStats: Fetched ${completedFocusSessions?.length ?? 0} completed sessions.`);
            
            const sessions = completedFocusSessions || [];
            const focusSessionsCompleted = sessions.length;
            const totalFocusMinutes = sessions.reduce((sum: number, session: PomodoroSessionRecord) => sum + (session.duration_minutes || 0), 0);
            
            const completedTaskIds = new Set<string>();
            sessions.forEach((session: PomodoroSessionRecord) => { if (session.task_id) completedTaskIds.add(session.task_id); });
            const tasksCompletedViaFocus = completedTaskIds.size;
            console.log("[useUserStats] fetchStats: Calculating streak...");
            const currentFocusStreak = calculateFocusStreak(sessions);
            console.log("[useUserStats] fetchStats: Streak calculated:", currentFocusStreak);

            calculatedStats = {
                focusSessionsCompleted,
                totalFocusMinutes,
                tasksCompletedViaFocus,
                currentFocusStreak,
            };
            console.log("[useUserStats] fetchStats: Calculated stats:", calculatedStats);
            setStats(calculatedStats);

        } catch (err: any) {
            console.error("[useUserStats] Error fetching user stats:", err);
            setError(err.message || 'Failed to load user statistics.');
            setStats(EMPTY_STATS);
        } finally {
            console.log("[useUserStats] fetchStats: Setting isLoading to false.");
            setIsLoading(false);
        }
        // We will trigger the achievement check via useEffect dependency on `stats`
        // instead of calling it directly here.
    }, [userId, calculateFocusStreak]); // Added calculateFocusStreak dependency

    // Initial fetch
    useEffect(() => {
        console.log("[useUserStats] useEffect [fetchStats]: Triggering initial fetch.");
        fetchStats();
    }, [fetchStats]); // Depend on the memoized fetchStats
    
    // Trigger achievement check when stats update
    useEffect(() => {
        // Check only if stats are loaded, not empty, and not currently checking
        if (!isLoading && stats !== EMPTY_STATS && !isCheckingAchievements) {
             // Check specifically if unlockedKeys has been populated to avoid checking before initial fetch
            if (unlockedKeys.size > 0 || userId) { // Ensure we attempt check even if user has 0 unlocked initially
                 checkAndUnlockAchievements(stats);
            }
        }
    }, [stats, isLoading, isCheckingAchievements, unlockedKeys, checkAndUnlockAchievements, userId]);

    return { 
        ...stats, 
        isLoading, 
        error, 
        refetch: fetchStats
    };
} 