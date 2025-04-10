import { Trophy, Brain, CheckSquare, Clock, ListChecks, Award } from 'lucide-react';
import type { AchievementCriteriaType } from '@/types/achievements';

export interface AchievementDefinition {
    key: string; // Unique identifier (e.g., 'focus_session_10')
    name: string;
    description: string;
    icon: React.ComponentType<any>; // Use actual component type
    criteria_type: AchievementCriteriaType;
    criteria_threshold: number;
    points?: number; // Optional
}

// Static definitions for all achievements in the application
export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition> = {
    // --- Pomodoro Achievements ---
    focus_session_1: {
        key: 'focus_session_1',
        name: 'First Focus',
        description: 'Complete your first Pomodoro focus session.',
        icon: Brain,
        criteria_type: 'focus_sessions_completed',
        criteria_threshold: 1,
        points: 5,
    },
    focus_session_10: {
        key: 'focus_session_10',
        name: 'Focused Ten',
        description: 'Complete 10 Pomodoro focus sessions.',
        icon: Brain,
        criteria_type: 'focus_sessions_completed',
        criteria_threshold: 10,
        points: 20,
    },
    focus_session_50: {
        key: 'focus_session_50',
        name: 'Pomodoro Powerhouse',
        description: 'Complete 50 Pomodoro focus sessions.',
        icon: Trophy,
        criteria_type: 'focus_sessions_completed',
        criteria_threshold: 50,
        points: 50,
    },
    focus_minutes_60: {
        key: 'focus_minutes_60',
        name: 'Hour of Power',
        description: 'Accumulate 60 minutes of focus time.',
        icon: Clock,
        criteria_type: 'focus_minutes_total',
        criteria_threshold: 60,
        points: 10,
    },
    focus_minutes_600: {
        key: 'focus_minutes_600',
        name: 'Deep Work Initiate',
        description: 'Accumulate 600 minutes (10 hours) of focus time.',
        icon: Clock,
        criteria_type: 'focus_minutes_total',
        criteria_threshold: 600,
        points: 50,
    },

    // --- Task Achievements ---
    task_complete_1: {
        key: 'task_complete_1',
        name: 'Task Taker',
        description: 'Complete your first task linked to a focus session.',
        icon: CheckSquare,
        criteria_type: 'tasks_completed',
        criteria_threshold: 1,
        points: 5,
    },
    task_complete_25: {
        key: 'task_complete_25',
        name: 'List Conqueror',
        description: 'Complete 25 tasks linked to focus sessions.',
        icon: ListChecks,
        criteria_type: 'tasks_completed',
        criteria_threshold: 25,
        points: 30,
    },

    // --- Add More Categories (Mood, Streaks, etc.) ---
    // Example: streak_3_days
    // Example: mood_log_7_days
}; 