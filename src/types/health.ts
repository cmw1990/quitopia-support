export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  quality: number;
  sleep_time: string;
  wake_time: string;
  disturbances: string[];
  notes: string;
  created_at: string;
} 