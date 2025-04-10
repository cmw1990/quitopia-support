import { 
  SessionType, 
  EnvironmentState, 
  FlowStateInfo, 
  NoiseLevel,
  LightingLevel,
  TemperatureLevel,
  FocusInsight,
  FlowState,
  DistractionInfo
} from './types/focus-types';
import { determineFlowState } from './types/focus-state';
import { 
  focusEventBus, 
  TimerStateEvent, 
  EnvironmentEvent,
  InsightsEvent 
} from './focus-event-bus';
import { secureStorage } from './secure-storage';

interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'focus' | 'break';
  energyLevel: number;
  distractions: number;
  environment: EnvironmentState;
  productivity: number;
  flowState: FlowStateInfo;
  completedTasks: number;
}

interface ProductivityInsights {
  optimalDuration: number;
  bestTimeOfDay: string[];
  bestEnvironment: EnvironmentState;
  flowTriggers: string[];
  distractionPatterns: {
    timeBasedPatterns: { hour: number; frequency: number }[];
    environmentalFactors: { factor: string; impact: number }[];
    emotionalTriggers: { trigger: string; frequency: number }[];
  };
  recommendations: string[];
}

class FocusAnalytics {
  private static instance: FocusAnalytics;
  private sessions: FocusSession[];
  private readonly storageKey = 'focus-analytics';
  private readonly maxSessionsStored = 100;
  private currentEnvironment: EnvironmentState;

  private constructor() {
    this.sessions = this.loadSessions();
    this.currentEnvironment = {
      noise: 'moderate',
      lighting: 'bright',
      temperature: 'moderate',
      quality: 0.8
    };
    this.setupEventListeners();
  }

  public static getInstance(): FocusAnalytics {
    if (!FocusAnalytics.instance) {
      FocusAnalytics.instance = new FocusAnalytics();
    }
    return FocusAnalytics.instance;
  }

  private loadSessions(): FocusSession[] {
    return secureStorage.getItem<FocusSession[]>(this.storageKey) || [];
  }

  private saveSessions(): void {
    if (this.sessions.length > this.maxSessionsStored) {
      this.sessions = this.sessions.slice(-this.maxSessionsStored);
    }
    secureStorage.setItem(this.storageKey, this.sessions);
  }

  private setupEventListeners(): void {
    focusEventBus.subscribe('timerStateUpdate', (event) => {
      const timerData = event.data as TimerStateEvent;
      if (timerData.completed && (timerData.type === 'focus' || timerData.type === 'break')) {
        this.recordSession(timerData);
      }
    });

    focusEventBus.subscribe('environmentUpdate', (event) => {
      const envData = event.data as EnvironmentEvent;
      this.currentEnvironment = envData.current;
    });
  }

  private recordSession(timerData: TimerStateEvent): void {
    const session: FocusSession = {
      id: crypto.randomUUID(),
      startTime: Date.now() - (timerData.duration * 60 * 1000),
      endTime: Date.now(),
      duration: timerData.duration,
      type: timerData.type === 'focus' ? 'focus' : 'break',
      energyLevel: this.getCurrentEnergyLevel(),
      distractions: 0,
      environment: this.currentEnvironment,
      productivity: this.calculateProductivity(timerData),
      flowState: this.analyzeFlowState(timerData),
      completedTasks: 0
    };

    this.sessions.push(session);
    this.saveSessions();
    this.notifyInsightsUpdate();
  }

  private getCurrentEnergyLevel(): number {
    const hour = new Date().getHours();
    const recentSessions = this.sessions.slice(-3);
    const avgProductivity = recentSessions.reduce((acc, s) => acc + s.productivity, 0) / 
      (recentSessions.length || 1);

    let baseEnergy = hour >= 9 && hour <= 11 ? 8 :
                     hour >= 14 && hour <= 16 ? 6 :
                     hour >= 20 ? 5 : 7;

    return Math.round((baseEnergy + (avgProductivity * 10)) / 2);
  }

  private calculateProductivity(timerData: TimerStateEvent): number {
    const intensityFactor = {
      low: 0.6,
      medium: 0.8,
      high: 1.0
    }[timerData.intensity];

    const durationFactor = Math.min(timerData.duration / 25, 1);
    return intensityFactor * durationFactor;
  }

  private analyzeFlowState(timerData: TimerStateEvent): FlowStateInfo {
    const recentSessions = this.sessions.slice(-3);
    const productivityTrend = recentSessions.map(s => s.productivity);
    const currentProductivity = this.calculateProductivity(timerData);
    const currentEnergy = this.getCurrentEnergyLevel();

    const state = determineFlowState(productivityTrend, currentProductivity, currentEnergy);

    return {
      state,
      duration: timerData.duration,
      intensity: timerData.intensity === 'high' ? 1 : timerData.intensity === 'medium' ? 0.7 : 0.4,
      triggers: this.identifyFlowTriggers()
    };
  }

  private identifyFlowTriggers(): string[] {
    const flowSessions = this.sessions.filter(s => s.flowState.state === 'flowing');
    const triggers = new Set<string>();

    flowSessions.forEach(session => {
      if (session.environment.noise === 'low') triggers.add('quiet_environment');
      if (session.environment.lighting === 'bright') triggers.add('good_lighting');
      if (session.duration >= 25) triggers.add('optimal_duration');
      if (session.energyLevel >= 7) triggers.add('high_energy');
    });

    return Array.from(triggers);
  }

  private notifyInsightsUpdate(): void {
    const insights = this.generateInsights();
    focusEventBus.emit('insightsUpdated', {
      insights: insights.recommendations.map(r => ({
        type: 'environment',
        title: 'Focus Environment',
        description: r,
        confidence: 0.8,
        actionable: true
      })),
      sessionStats: {
        duration: this.calculateOptimalDuration(),
        type: 'focus',
        metrics: {
          energyLevel: this.getCurrentEnergyLevel(),
          flowQuality: 0.8,
          distractionCount: 0,
          environmentScore: 0.8,
          productivityScore: 0.8
        },
        environment: this.currentEnvironment,
        flowState: this.analyzeFlowState({ type: 'focus', duration: 25, intensity: 'medium' }),
        distractions: [],
        insights: []
      }
    } as InsightsEvent);
  }

  public generateInsights(): ProductivityInsights {
    return {
      optimalDuration: this.calculateOptimalDuration(),
      bestTimeOfDay: this.findBestTimeOfDay(),
      bestEnvironment: this.determineBestEnvironment(),
      flowTriggers: this.identifyFlowTriggers(),
      distractionPatterns: {
        timeBasedPatterns: this.findTimeBasedPatterns(),
        environmentalFactors: this.findEnvironmentalFactors(),
        emotionalTriggers: this.findEmotionalTriggers()
      },
      recommendations: this.generateRecommendations()
    };
  }

  private calculateOptimalDuration(): number {
    const productiveSessions = this.sessions.filter(s => s.productivity > 0.7);
    if (productiveSessions.length === 0) return 25;

    return Math.round(
      productiveSessions.reduce((acc, s) => acc + s.duration, 0) / productiveSessions.length
    );
  }

  private findBestTimeOfDay(): string[] {
    const hourlyProductivity = new Map<number, { total: number; count: number }>();
    
    this.sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const current = hourlyProductivity.get(hour) || { total: 0, count: 0 };
      hourlyProductivity.set(hour, {
        total: current.total + session.productivity,
        count: current.count + 1
      });
    });

    return Array.from(hourlyProductivity.entries())
      .map(([hour, data]) => ({
        hour,
        avgProductivity: data.total / data.count
      }))
      .sort((a, b) => b.avgProductivity - a.avgProductivity)
      .slice(0, 3)
      .map(entry => `${entry.hour}:00`);
  }

  private determineBestEnvironment(): EnvironmentState {
    const environments = this.sessions.map(s => s.environment);
    
    const getBestLevel = <T extends NoiseLevel | LightingLevel | TemperatureLevel>(
      property: keyof EnvironmentState
    ): T => {
      const counts = environments.reduce((acc, env) => {
        const value = env[property];
        acc[value as string] = (acc[value as string] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0][0] as T;
    };

    return {
      noise: getBestLevel<NoiseLevel>('noise'),
      lighting: getBestLevel<LightingLevel>('lighting'),
      temperature: getBestLevel<TemperatureLevel>('temperature'),
      quality: 1
    };
  }

  private findTimeBasedPatterns() {
    const hourlyDistractions = new Map<number, number>();
    
    this.sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourlyDistractions.set(hour, (hourlyDistractions.get(hour) || 0) + session.distractions);
    });

    return Array.from(hourlyDistractions.entries())
      .map(([hour, frequency]) => ({ hour, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);
  }

  private findEnvironmentalFactors() {
    const factors: { factor: string; impact: number }[] = [];
    const sessions = this.sessions.slice(-20);

    ['noise', 'lighting', 'temperature'].forEach(factor => {
      const impact = this.calculateEnvironmentalImpact(sessions, factor as keyof EnvironmentState);
      factors.push({ factor, impact });
    });

    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private findEmotionalTriggers() {
    return [
      { trigger: 'fatigue', frequency: this.calculateTriggerFrequency('low_energy') },
      { trigger: 'stress', frequency: this.calculateTriggerFrequency('high_distractions') },
      { trigger: 'motivation', frequency: this.calculateTriggerFrequency('low_productivity') }
    ];
  }

  private calculateEnvironmentalImpact(sessions: FocusSession[], factor: keyof EnvironmentState): number {
    const avgProductivity = sessions.reduce((acc, s) => acc + s.productivity, 0) / sessions.length;
    
    return sessions.reduce((impact, session) => {
      return impact + (session.productivity - avgProductivity);
    }, 0) / sessions.length;
  }

  private calculateTriggerFrequency(type: string): number {
    switch (type) {
      case 'low_energy':
        return this.sessions.filter(s => s.energyLevel < 5).length;
      case 'high_distractions':
        return this.sessions.filter(s => s.distractions > 5).length;
      case 'low_productivity':
        return this.sessions.filter(s => s.productivity < 0.5).length;
      default:
        return 0;
    }
  }

  private generateRecommendations(): string[] {
    const insights = [
      `Optimal focus time: ${this.calculateOptimalDuration()} minutes`,
      `Best environment: ${this.currentEnvironment.noise} noise, ${this.currentEnvironment.lighting} lighting`,
      ...this.findBestTimeOfDay().map(time => `Peak productivity time: ${time}`),
      ...this.identifyFlowTriggers().map(trigger => `Flow trigger: ${trigger}`)
    ];

    return insights.slice(0, 5);
  }
}

export const focusAnalytics = FocusAnalytics.getInstance();
