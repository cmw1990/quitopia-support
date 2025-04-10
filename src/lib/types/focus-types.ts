export type FlowState = 'building' | 'flowing' | 'declining' | 'unknown';
export type FlowPhase = 'preparation' | 'struggle' | 'incubation' | 'illumination' | 'verification' | 'unknown';

export interface FocusSession {
  duration: number;
  distractions: number;
  task?: string;
  completed: boolean;
  intensity: string;
  timestamp: string;
  flow_state?: FlowState;
  energy_level?: number;
  focus_quality?: number;
  environment?: {
    noise: 'quiet' | 'moderate' | 'loud';
    lighting: 'dark' | 'dim' | 'bright';
    temperature: 'cold' | 'comfortable' | 'warm';
  };
  neural_metrics?: {
    prefrontal: number;
    default_mode: number;
    attentional: number;
    brainwaves: {
      alpha: number;
      beta: number;
      theta: number;
      gamma: number;
    };
  };
}

export interface SmartRecommendation {
  duration: number;
  type: 'focus' | 'break' | 'micro-break';
  confidence: number;
  reason: string;
  adaptiveSuggestions: {
    environment: string[];
    technique: string;
    breakActivity?: string;
  };
  flowStateAnalysis: {
    currentState: FlowState;
    sustainabilityScore: number;
    recommendations: string[];
  };
  energyOptimization: {
    currentLevel: number;
    peakTimeStart: string;
    peakTimeEnd: string;
    suggestions: string[];
  };
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  type: 'focus' | 'break' | 'micro-break';
  task?: string;
  distractions: number;
  intensity: 'low' | 'medium' | 'high';
  flowState: FlowState;
  energyLevel: number;
  focusQuality: number;
  environment: {
    noise: 'quiet' | 'moderate' | 'loud';
    lighting: 'dark' | 'dim' | 'bright';
    temperature: 'cold' | 'comfortable' | 'warm';
  };
}

export interface EnhancedTimerState extends TimerState {
  flowPhase: FlowPhase;
  neuralActivity: {
    prefrontal: number;
    default: number;
    attentional: number;
  };
  brainwaveState: {
    alpha: number;
    beta: number;
    theta: number;
    gamma: number;
  };
  flowScore: number;
  visualPattern: 'pulse' | 'wave' | 'expand' | 'sparkle';
}
