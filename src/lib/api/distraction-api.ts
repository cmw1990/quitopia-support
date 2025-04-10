
import { apiGet, apiPost, apiPut, apiDelete } from './api-client';

export interface DistractionBlockerRule {
  id?: string;
  user_id: string;
  site_url: string;
  schedule_type: 'all_day' | 'time_range';
  start_time?: string;
  end_time?: string;
  days_active?: string[];
  is_active: boolean;
  created_at?: string;
}

export interface DistractionStats {
  total_blocked: number;
  sites_data: {
    site_url: string;
    block_count: number;
  }[];
  last_blocked_at?: string;
}

// Add the DistractionApiClient class that's being imported in useDistractionManager.ts
export class DistractionApiClient {
  private authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  // Rules methods
  async getBlockerRules(userId: string) {
    return getBlockerRules(userId);
  }

  async createBlockerRule(rule: DistractionBlockerRule) {
    return createBlockerRule(rule);
  }

  async updateBlockerRule(id: string, updates: Partial<DistractionBlockerRule>) {
    return updateBlockerRule(id, updates);
  }

  async deleteBlockerRule(id: string) {
    return deleteBlockerRule(id);
  }

  // Stats methods
  async getBlockerStats(userId: string) {
    return getBlockerStats(userId);
  }

  async recordBlockEvent(userId: string, siteUrl: string) {
    return recordBlockEvent(userId, siteUrl);
  }

  // Additional methods required by useDistractionManager.ts
  async getBlockedSites(userId: string) {
    return this.getBlockerRules(userId);
  }

  async getDistractionPatterns(userId: string) {
    return apiGet('distraction_patterns', { 'user_id': `eq.${userId}` });
  }

  async getDistractionLogs(userId: string) {
    return apiGet('distraction_logs', { 
      'user_id': `eq.${userId}`,
      'order': 'timestamp.desc',
      'limit': '50'
    });
  }

  async getEnvironmentRecommendations(userId: string) {
    return apiGet('environment_recommendations', { 'user_id': `eq.${userId}` });
  }

  async getDigitalGoals(userId: string) {
    return apiGet('digital_minimalism_goals', { 'user_id': `eq.${userId}` });
  }

  async addBlockedSite(site: any) {
    return apiPost('distraction_blocker_rules', site);
  }

  async removeBlockedSite(id: string) {
    return deleteBlockerRule(id);
  }

  async updateBlockedSite(id: string, updates: any) {
    return updateBlockerRule(id, updates);
  }

  async updateDigitalGoal(id: string, updates: any) {
    return apiPut(`digital_minimalism_goals?id=eq.${id}`, updates);
  }

  async addDistractionLog(log: any) {
    return apiPost('distraction_logs', log);
  }

  // Placeholder for subscription functionality
  subscribeToUpdates(callback: (payload: any) => void) {
    // In a real implementation, this would set up a Supabase realtime subscription
    // For now, return a dummy unsubscribe function
    return () => {
      // Unsubscribe logic would go here
    };
  }
}

export async function getBlockerRules(userId: string) {
  return apiGet<DistractionBlockerRule[]>('distraction_blocker_rules', {
    'user_id': `eq.${userId}`,
    'order': 'created_at.desc'
  });
}

export async function createBlockerRule(rule: DistractionBlockerRule) {
  return apiPost<DistractionBlockerRule>('distraction_blocker_rules', rule);
}

export async function updateBlockerRule(id: string, updates: Partial<DistractionBlockerRule>) {
  return apiPut<DistractionBlockerRule>(`distraction_blocker_rules?id=eq.${id}`, updates);
}

export async function deleteBlockerRule(id: string) {
  return apiDelete(`distraction_blocker_rules?id=eq.${id}`);
}

export async function getBlockerStats(userId: string) {
  return apiGet<DistractionStats>('distraction_blocker_stats', {
    'user_id': `eq.${userId}`,
    'order': 'created_at.desc',
    'limit': '1'
  });
}

export async function recordBlockEvent(userId: string, siteUrl: string) {
  return apiPost('distraction_blocker_events', {
    user_id: userId,
    site_url: siteUrl,
    blocked_at: new Date().toISOString()
  });
}
