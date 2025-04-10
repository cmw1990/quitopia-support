import { db } from '@/integrations/supabase/rest-api';

// Get the session token from localStorage
const getSessionToken = () => {
  const storedSession = localStorage.getItem('supabase.auth.token');
  if (!storedSession) return null;
  try {
    const { currentSession } = JSON.parse(storedSession);
    return currentSession?.access_token;
  } catch {
    return null;
  }
};

// Care Connector tables helper
export const careConnector = {
  groups: {
    select: (columns?: string) => db.from('care8_groups').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_groups').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_groups').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_groups').delete(match, getSessionToken()),
  },
  groupMembers: {
    select: (columns?: string) => db.from('care8_group_members').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_group_members').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_group_members').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_group_members').delete(match, getSessionToken()),
  },
  groupInvitations: {
    select: (columns?: string) => db.from('care8_group_invitations').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_group_invitations').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_group_invitations').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_group_invitations').delete(match, getSessionToken()),
  },
  tasks: {
    select: (columns?: string) => db.from('care8_group_tasks').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_group_tasks').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_group_tasks').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_group_tasks').delete(match, getSessionToken()),
  },
  healthRecords: {
    select: (columns?: string) => db.from('care8_health_records').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_health_records').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_health_records').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_health_records').delete(match, getSessionToken()),
  },
  providers: {
    select: (columns?: string) => db.from('care8_providers').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_providers').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_providers').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_providers').delete(match, getSessionToken()),
  },
  providerReviews: {
    select: (columns?: string) => db.from('care8_provider_reviews').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_provider_reviews').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_provider_reviews').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_provider_reviews').delete(match, getSessionToken()),
  },
  activityLog: {
    select: (columns?: string) => db.from('care8_activity_log').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_activity_log').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_activity_log').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_activity_log').delete(match, getSessionToken()),
  },
  groupEvents: {
    select: (columns?: string) => db.from('care8_group_events').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_group_events').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_group_events').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_group_events').delete(match, getSessionToken()),
  },
  groupPosts: {
    select: (columns?: string) => db.from('care8_group_posts').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_group_posts').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_group_posts').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_group_posts').delete(match, getSessionToken()),
  },
  groupComments: {
    select: (columns?: string) => db.from('care8_group_comments').select(columns, getSessionToken()),
    insert: (data: any) => db.from('care8_group_comments').insert(data, getSessionToken()),
    update: (data: any, match: Record<string, any>) => db.from('care8_group_comments').update(data, match, getSessionToken()),
    delete: (match: Record<string, any>) => db.from('care8_group_comments').delete(match, getSessionToken()),
  },
};

// Helper for RPC calls
export const rpc = (functionName: string, params?: any) => {
  return db.rpc(functionName, params, getSessionToken());
};
