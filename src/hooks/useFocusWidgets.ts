import { useState, useEffect } from 'react';
import { widgetConfigApi } from '@/api/supabase-rest';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/supabase-client';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  chartType?: string;
  dataType?: string;
  isVisible: boolean;
  options?: Record<string, any>;
}

export interface LayoutConfig {
  columns: number;
  compactType: 'vertical' | 'horizontal' | null;
  preventCollision: boolean;
  rowHeight: number;
}

export interface DashboardConfig {
  widgets: WidgetConfig[];
  layout: LayoutConfig;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'focus-summary',
    type: 'summary',
    title: 'Focus Summary',
    size: 'medium',
    position: { x: 0, y: 0 },
    timeRange: 'week',
    isVisible: true
  },
  {
    id: 'focus-time-series',
    type: 'timeSeries',
    title: 'Focus Over Time',
    size: 'large',
    position: { x: 0, y: 1 },
    timeRange: 'month',
    chartType: 'line',
    isVisible: true
  },
  {
    id: 'focus-by-context',
    type: 'byContext',
    title: 'Focus by Context',
    size: 'medium',
    position: { x: 1, y: 0 },
    timeRange: 'month',
    chartType: 'pie',
    isVisible: true
  },
  {
    id: 'focus-by-weekday',
    type: 'byWeekday',
    title: 'Focus by Day of Week',
    size: 'medium',
    position: { x: 2, y: 0 },
    timeRange: 'month',
    chartType: 'bar',
    isVisible: true
  },
  {
    id: 'focus-by-time-of-day',
    type: 'byTimeOfDay',
    title: 'Focus by Time of Day',
    size: 'medium',
    position: { x: 0, y: 2 },
    timeRange: 'month',
    chartType: 'heatmap',
    isVisible: true
  },
  {
    id: 'top-distractions',
    type: 'topDistractions',
    title: 'Top Distractions',
    size: 'small',
    position: { x: 2, y: 1 },
    timeRange: 'month',
    isVisible: true
  },
  {
    id: 'productivity-insights',
    type: 'insights',
    title: 'Productivity Insights',
    size: 'medium',
    position: { x: 1, y: 2 },
    timeRange: 'month',
    isVisible: true
  }
];

const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 3,
  compactType: 'vertical',
  preventCollision: false,
  rowHeight: 150
};

const DEFAULT_CONFIG: DashboardConfig = {
  widgets: DEFAULT_WIDGETS,
  layout: DEFAULT_LAYOUT
};

export function useFocusWidgets() {
  const authContext = useAuth();
  const user = authContext?.user;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchWidgetConfig = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setConfig(DEFAULT_CONFIG);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const userConfig = await widgetConfigApi.getWidgetConfiguration(user.id);
        
        if (userConfig) {
          setConfig(userConfig);
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      } catch (err) {
        console.error('Error fetching widget configuration:', err);
        setError('Failed to load dashboard configuration');
        setConfig(DEFAULT_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWidgetConfig();
  }, [user?.id]);

  const updateWidget = (widgetId: string, updates: Partial<WidgetConfig>) => {
    setConfig(prevConfig => {
      const updatedWidgets = prevConfig.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );
      
      setHasChanges(true);
      return {
        ...prevConfig,
        widgets: updatedWidgets
      };
    });
  };

  const addWidget = (widget: Omit<WidgetConfig, 'id'>) => {
    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}`
    } as WidgetConfig;
    
    setConfig(prevConfig => {
      setHasChanges(true);
      return {
        ...prevConfig,
        widgets: [...prevConfig.widgets, newWidget]
      };
    });
  };

  const removeWidget = (widgetId: string) => {
    setConfig(prevConfig => {
      const updatedWidgets = prevConfig.widgets.filter(widget => widget.id !== widgetId);
      
      setHasChanges(true);
      return {
        ...prevConfig,
        widgets: updatedWidgets
      };
    });
  };

  const updateLayout = (updates: Partial<LayoutConfig>) => {
    setConfig(prevConfig => {
      setHasChanges(true);
      return {
        ...prevConfig,
        layout: {
          ...prevConfig.layout,
          ...updates
        }
      };
    });
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    if (!user?.id) {
      setError('User is not authenticated');
      return false;
    }

    try {
      setIsLoading(true);
      await widgetConfigApi.saveWidgetConfiguration(user.id, config);
      setHasChanges(false);
      return true;
    } catch (err) {
      console.error('Error saving widget configuration:', err);
      setError('Failed to save dashboard configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    config,
    isLoading,
    error,
    hasChanges,
    updateWidget,
    addWidget,
    removeWidget,
    updateLayout,
    resetToDefault,
    saveConfiguration
  };
} 