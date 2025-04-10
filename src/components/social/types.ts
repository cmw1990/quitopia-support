export interface GroupSession {
  id: string;
  title: string;
  description: string;
  session_date: string;
  duration_minutes: number;
  max_participants: number;
  session_type: string;
  host_id: string;
  is_private: boolean;
  meeting_link?: string;
}

export interface Participant {
  user_id: string;
  status: string;
  joined_at: string;
}