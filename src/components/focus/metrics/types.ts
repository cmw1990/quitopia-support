import type { FocusSession, SmartRecommendation } from '@/lib/types/focus-types';

export interface FocusAnalyticsProps {
  sessions: FocusSession[];
  onClose: () => void;
}
