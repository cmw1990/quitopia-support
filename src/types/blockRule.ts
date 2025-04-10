export interface BlockRule {
  id?: string;
  user_id: string;
  name: string;
  pattern: string;
  type: 'domain' | 'url' | 'app';
  is_active: boolean;
  schedule?: {
    start_time?: string;
    end_time?: string;
    days?: number[];
  };
  created_at?: string;
  updated_at?: string;
  description?: string;
  priority?: number;
  exceptions?: string[];
  block_mode?: 'hard' | 'soft';
  notification_settings?: {
    show_notification: boolean;
    message?: string;
  };
} 