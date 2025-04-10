import { SUPABASE_URL } from '@/integrations/supabase/db-client';
import {
  BlockedSite,
  DistractionPattern,
  DistractionLog,
  BlockingStats,
  EnvironmentRecommendation,
  DigitalMinimalismGoal,
  DistractionAPI
} from '../types/distraction-types';

const getHeaders = (token?: string): HeadersInit => ({
  'Content-Type': 'application/json',
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
});

export class DistractionApiClient implements DistractionAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getBlockedSites(user_id: string): Promise<BlockedSite[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_distractions8?user_id=eq.${user_id}&select=*`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch blocked sites');
    }

    return await response.json();
  }

  async addBlockedSite(site: Partial<BlockedSite>): Promise<BlockedSite> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_distractions8`,
      {
        method: 'POST',
        headers: {
          ...getHeaders(this.token),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(site)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add blocked site');
    }

    return await response.json();
  }

  async removeBlockedSite(id: string): Promise<void> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_distractions8?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(this.token)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove blocked site');
    }
  }

  async updateBlockedSite(id: string, updates: Partial<BlockedSite>): Promise<BlockedSite> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_distractions8?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          ...getHeaders(this.token),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update blocked site');
    }

    const result = await response.json();
    return result[0];
  }

  async getDistractionPatterns(user_id: string): Promise<DistractionPattern[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_patterns8?user_id=eq.${user_id}&select=*`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch distraction patterns');
    }

    return await response.json();
  }

  async getBlockingStats(user_id: string): Promise<BlockingStats> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_stats8?user_id=eq.${user_id}&select=*`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch blocking stats');
    }

    const stats = await response.json();
    return stats[0];
  }

  async getDistractionLogs(user_id: string): Promise<DistractionLog[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_logs8?user_id=eq.${user_id}&select=*&order=timestamp.desc`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch distraction logs');
    }

    return await response.json();
  }

  async addDistractionLog(log: Partial<DistractionLog>): Promise<DistractionLog> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_logs8`,
      {
        method: 'POST',
        headers: {
          ...getHeaders(this.token),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(log)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add distraction log');
    }

    return await response.json();
  }

  async getEnvironmentRecommendations(user_id: string): Promise<EnvironmentRecommendation[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_recommendations8?user_id=eq.${user_id}&select=*`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch environment recommendations');
    }

    return await response.json();
  }

  async getDigitalGoals(user_id: string): Promise<DigitalMinimalismGoal[]> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_goals8?user_id=eq.${user_id}&select=*`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch digital goals');
    }

    return await response.json();
  }

  async implementRecommendation(id: string, user_id: string): Promise<void> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_recommendations8?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: getHeaders(this.token),
        body: JSON.stringify({
          implemented: true,
          implemented_at: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to implement recommendation');
    }

    // Log the implementation for analytics
    await this.addEnvironmentLog({
      user_id,
      recommendation_id: id,
      action: 'implement',
      timestamp: new Date().toISOString()
    });
  }

  async addEnvironmentLog(log: {
    user_id: string;
    recommendation_id: string;
    action: 'implement' | 'dismiss' | 'auto_implement';
    timestamp: string;
    impact_score?: number;
  }): Promise<void> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_environment_logs8`,
      {
        method: 'POST',
        headers: getHeaders(this.token),
        body: JSON.stringify(log)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to log environment action');
    }
  }

  async getEnvironmentStats(user_id: string): Promise<{
    total_implemented: number;
    impact_score: number;
    top_recommendations: string[];
  } | null> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_environment_stats8?user_id=eq.${user_id}`,
      { headers: getHeaders(this.token) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch environment stats');
    }

    const stats = await response.json();
    return stats.length > 0 ? stats[0] : null;
  }

  async updateEnvironmentStatus(user_id: string, status: {
    noise: 'low' | 'moderate' | 'high';
    lighting: 'dark' | 'dim' | 'bright';
    temperature: 'cold' | 'moderate' | 'warm';
  }): Promise<void> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_environment_status8`,
      {
        method: 'POST',
        headers: getHeaders(this.token),
        body: JSON.stringify({
          user_id,
          ...status,
          timestamp: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update environment status');
    }
  }

  async updateDigitalGoal(id: string, updates: Partial<DigitalMinimalismGoal>): Promise<DigitalMinimalismGoal> {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/focus_goals8?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          ...getHeaders(this.token),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update digital goal');
    }

    const result = await response.json();
    return result[0];
  }

  // Real-time subscription setup
  subscribeToUpdates(callback: (payload: any) => void): () => void {
    const ws = new WebSocket(
      `${SUPABASE_URL.replace('https://', 'wss://')}/realtime/v1/websocket?apikey=${import.meta.env.VITE_SUPABASE_ANON_KEY}&vsn=1.0.0`
    );

    ws.onopen = () => {
      ws.send(JSON.stringify({
        topic: 'realtime:focus_distractions8',
        event: 'phx_join',
        payload: {
          config: {
            postgres_changes: [
              { event: '*', schema: 'public', table: 'focus_distractions8' },
              { event: '*', schema: 'public', table: 'focus_patterns8' },
              { event: '*', schema: 'public', table: 'focus_logs8' },
              { event: '*', schema: 'public', table: 'focus_goals8' },
              { event: '*', schema: 'public', table: 'focus_environment_status8' },
              { event: '*', schema: 'public', table: 'focus_environment_logs8' },
              { event: '*', schema: 'public', table: 'focus_recommendations8' }
            ]
          }
        },
        ref: '1'
      }));
    };

    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      if (response.event === 'postgres_changes') {
        callback(response.payload);
      }
    };

    return () => {
      ws.close();
    };
  }
}
