import { 
  SessionType, 
  EnvironmentState, 
  FlowStateInfo, 
  SessionStats, 
  FocusInsight,
  IntensityLevel,
  NoiseLevel,
  LightingLevel,
  TemperatureLevel
} from './types/focus-types';

export type FocusEventType =
  | 'energyUpdate'
  | 'environmentUpdate'
  | 'timerStateUpdate'
  | 'distractionDetected'
  | 'focusModeChange'
  | 'taskStatusChange'
  | 'rewardUpdate'
  | 'milestoneReached'
  | 'achievementUnlocked'
  | 'insightsUpdated'
  | 'flowStateChange'
  | 'sessionComplete'
  | 'shortcutTriggered'
  | 'accessibilityChange'
  | 'preferenceUpdate';

export interface FocusEvent {
  type: FocusEventType;
  data: any;
  timestamp: number;
}

export interface TimerStateEvent {
  type: SessionType;
  completed?: boolean;
  duration: number;
  intensity: IntensityLevel;
}

export interface EnvironmentEvent {
  previous: EnvironmentState;
  current: EnvironmentState;
  changes: Partial<EnvironmentState>;
}

export interface DistractionEvent {
  type: string;
  intensity: number;
  timestamp: number;
  source?: string;
}

export interface RewardEvent {
  points: number;
  reason: string;
  total: number;
}

export interface MilestoneEvent {
  milestone: number;
  total: number;
}

export interface AchievementEvent {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
}

export interface FlowStateEvent {
  previous: FlowStateInfo;
  current: FlowStateInfo;
  sessionDuration: number;
}

export interface InsightsEvent {
  insights: FocusInsight[];
  sessionStats: SessionStats;
}

export interface ShortcutEvent {
  shortcut: string;
  category: 'focus' | 'navigation' | 'task' | 'environment' | 'accessibility';
  timestamp: number;
}

export interface AccessibilityEvent {
  feature: string;
  enabled: boolean;
  value?: any;
}

export interface PreferenceEvent {
  category: string;
  setting: string;
  value: any;
  previousValue: any;
}

class FocusEventBus {
  private static instance: FocusEventBus;
  private listeners: Map<FocusEventType, Set<(event: FocusEvent) => void>>;
  private eventLog: FocusEvent[];

  private constructor() {
    this.listeners = new Map();
    this.eventLog = [];
  }

  public static getInstance(): FocusEventBus {
    if (!FocusEventBus.instance) {
      FocusEventBus.instance = new FocusEventBus();
    }
    return FocusEventBus.instance;
  }

  subscribe(eventType: FocusEventType, callback: (event: FocusEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  emit(eventType: FocusEventType, data: any): void {
    const event: FocusEvent = {
      type: eventType,
      data,
      timestamp: Date.now()
    };

    this.eventLog.push(event);
    if (this.eventLog.length > 1000) {
      this.eventLog.shift();
    }

    this.listeners.get(eventType)?.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
  }

  getRecentEvents(eventType?: FocusEventType, count: number = 10): FocusEvent[] {
    let events = this.eventLog;
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    return events.slice(-count);
  }

  clearListeners(): void {
    this.listeners.clear();
  }

  clearEventLog(): void {
    this.eventLog = [];
  }
}

export const focusEventBus = FocusEventBus.getInstance();
