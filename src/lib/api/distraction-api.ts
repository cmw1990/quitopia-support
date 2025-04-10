
import { apiGet, apiPost, apiPut, apiDelete } from './api-client';

interface DistractionBlockerRule {
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

interface DistractionStats {
  total_blocked: number;
  sites_data: {
    site_url: string;
    block_count: number;
  }[];
  last_blocked_at?: string;
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
