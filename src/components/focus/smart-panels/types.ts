import type { FocusSession, SmartRecommendation } from '@/lib/types/focus-types';

export interface SmartPanelsProps {
  showSmartRecommendations: boolean;
  smartRecommendation: SmartRecommendation | null;
  sessions: FocusSession[];
  sessionCount: number;
  totalFocusMinutes: number;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
}
