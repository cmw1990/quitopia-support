export type PomodoroDbMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSessionRecord {
    id: string;
    user_id: string;
    start_time: string;
    end_time?: string | null;
    duration_minutes: number;
    mode: PomodoroDbMode; // Use the specific DB type
    task_id?: string | null;
    task_title?: string | null;
    completed: boolean;
} 