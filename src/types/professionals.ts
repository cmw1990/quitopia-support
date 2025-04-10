// Professional Types for Well-Charged Platform

export interface Professional {
  id: string;
  user_id: string;
  type: 'therapist' | 'nutritionist' | 'dietitian';
  full_name: string;
  title: string;
  specializations: string[];
  certifications: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  years_of_experience: number;
  languages: string[];
  bio: string;
  profile_image?: string;
  consultation_fee: number;
  available_slots: {
    day: string;
    times: string[];
  }[];
  insurance_networks: string[];
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  professional_id: string;
  client_id: string;
  type: 'initial' | 'follow_up' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  duration_minutes: number;
  consultation_mode: 'video' | 'audio' | 'chat';
  consultation_fee: number;
  insurance_claim?: {
    provider: string;
    policy_number: string;
    status: 'pending' | 'approved' | 'rejected';
    claim_amount: number;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  professional_id: string;
  client_id: string;
  title: string;
  description: string;
  type: 'prescription' | 'advice' | 'todo' | 'recipe';
  content: {
    items: {
      title: string;
      description: string;
      duration?: string;
      frequency?: string;
      dosage?: string;
      notes?: string;
    }[];
    attachments?: string[];
  };
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  professional_id: string;
  client_id: string;
  consultation_id: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachments?: string[];
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceClaim {
  id: string;
  consultation_id: string;
  client_id: string;
  provider: string;
  policy_number: string;
  claim_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  processed_at?: string;
  documents: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultationPackage {
  id: string;
  professional_id: string;
  title: string;
  description: string;
  sessions: number;
  validity_days: number;
  price: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientProgress {
  id: string;
  client_id: string;
  professional_id: string;
  consultation_id: string;
  metrics: {
    category: string;
    value: number;
    target: number;
    notes?: string;
  }[];
  notes?: string;
  next_steps?: string;
  created_at: string;
  updated_at: string;
}
