import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { focusStatsApi } from '@/api/supabase-rest';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number; };
  settings: Record<string, any>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  layout: 'grid' | 'list';
  widgets: WidgetConfig[];
}

export function useWidgets() {
  const session = useSession();
  
  const loadWidgets = async (): Promise<DashboardConfig[] | null> => {
    if (!session) return null;
    
    try {
      const widgetConfig = await focusStatsApi.getWidgetConfiguration(session);
      return widgetConfig || null;
    } catch (error) {
      console.error('Error loading widget configuration:', error);
      return null;
    }
  };
  
  const saveWidgets = async (dashboards: DashboardConfig[]): Promise<boolean> => {
    if (!session) return false;
    
    try {
      await focusStatsApi.saveWidgetConfiguration(dashboards, session);
      return true;
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      return false;
    }
  };
  
  return {
    loadWidgets,
    saveWidgets
  };
} 