import { secureStorage } from './secure-storage';

export interface ADHDPreferences {
  visualStyle: {
    animationSpeed: 'slow' | 'normal' | 'fast';
    colorIntensity: 'soft' | 'medium' | 'vibrant';
    usePatterns: boolean;
    useDynamicColors: boolean;
    theme: 'light' | 'dark' | 'system';
    focusMode: 'minimal' | 'guided' | 'gamified';
  };
  timing: {
    defaultFocusDuration: number;
    defaultBreakDuration: number;
    useDynamicTiming: boolean;
    showTimeVisually: boolean;
    useCountdown: boolean;
    breakReminders: boolean;
  };
  environment: {
    noiseLevel: 'silent' | 'ambient' | 'any';
    lightingLevel: 'dark' | 'dim' | 'bright';
    temperature: 'cool' | 'moderate' | 'warm';
    monitorAmbient: boolean;
  };
  assistance: {
    textToSpeech: boolean;
    useKeyboardShortcuts: boolean;
    showTooltips: boolean;
    useChecklists: boolean;
    taskBreakdown: boolean;
    bodyDoubling: boolean;
  };
  gamification: {
    showPoints: boolean;
    showAchievements: boolean;
    useRewards: boolean;
    streakTracking: boolean;
    progressBars: boolean;
    dailyChallenges: boolean;
  };
  notifications: {
    soundEnabled: boolean;
    soundVolume: number;
    vibrationEnabled: boolean;
    notificationStyle: 'minimal' | 'detailed';
    breakReminders: boolean;
    achievementAlerts: boolean;
  };
  focus: {
    autoStartBreaks: boolean;
    blockDistractions: boolean;
    showProgress: boolean;
    flowStateDetection: boolean;
    energyTracking: boolean;
    adaptiveDifficulty: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    colorBlindMode: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
  };
}

const defaultPreferences: ADHDPreferences = {
  visualStyle: {
    animationSpeed: 'normal',
    colorIntensity: 'medium',
    usePatterns: true,
    useDynamicColors: true,
    theme: 'system',
    focusMode: 'guided'
  },
  timing: {
    defaultFocusDuration: 25,
    defaultBreakDuration: 5,
    useDynamicTiming: true,
    showTimeVisually: true,
    useCountdown: true,
    breakReminders: true
  },
  environment: {
    noiseLevel: 'ambient',
    lightingLevel: 'bright',
    temperature: 'moderate',
    monitorAmbient: true
  },
  assistance: {
    textToSpeech: false,
    useKeyboardShortcuts: true,
    showTooltips: true,
    useChecklists: true,
    taskBreakdown: true,
    bodyDoubling: false
  },
  gamification: {
    showPoints: true,
    showAchievements: true,
    useRewards: true,
    streakTracking: true,
    progressBars: true,
    dailyChallenges: true
  },
  notifications: {
    soundEnabled: true,
    soundVolume: 0.7,
    vibrationEnabled: true,
    notificationStyle: 'detailed',
    breakReminders: true,
    achievementAlerts: true
  },
  focus: {
    autoStartBreaks: false,
    blockDistractions: true,
    showProgress: true,
    flowStateDetection: true,
    energyTracking: true,
    adaptiveDifficulty: true
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    colorBlindMode: false,
    screenReaderOptimized: false,
    keyboardNavigation: true
  }
};

class UserPreferences {
  private static instance: UserPreferences;
  private preferences: ADHDPreferences;
  private readonly storageKey = 'user-preferences';
  private readonly changeListeners: Set<(prefs: ADHDPreferences) => void>;

  private constructor() {
    this.preferences = this.loadPreferences();
    this.changeListeners = new Set();
    this.setupSystemThemeListener();
  }

  public static getInstance(): UserPreferences {
    if (!UserPreferences.instance) {
      UserPreferences.instance = new UserPreferences();
    }
    return UserPreferences.instance;
  }

  private loadPreferences(): ADHDPreferences {
    const stored = secureStorage.getItem<ADHDPreferences>(this.storageKey);
    return stored ? { ...defaultPreferences, ...stored } : { ...defaultPreferences };
  }

  private setupSystemThemeListener(): void {
    if (this.preferences.visualStyle.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        this.notifyListeners();
      });
    }
  }

  public getPreferences(): ADHDPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updates: Partial<ADHDPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...updates
    };
    secureStorage.setItem(this.storageKey, this.preferences);
    this.notifyListeners();
  }

  public subscribe(callback: (prefs: ADHDPreferences) => void): () => void {
    this.changeListeners.add(callback);
    return () => this.changeListeners.delete(callback);
  }

  private notifyListeners(): void {
    const prefs = this.getPreferences();
    this.changeListeners.forEach(listener => listener(prefs));
  }

  public resetToDefaults(): void {
    this.preferences = { ...defaultPreferences };
    secureStorage.setItem(this.storageKey, this.preferences);
    this.notifyListeners();
  }

  public exportPreferences(): string {
    return JSON.stringify(this.preferences);
  }

  public importPreferences(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.updatePreferences(parsed);
    } catch (error) {
      console.error('Failed to import preferences:', error);
    }
  }
}

export const userPreferences = UserPreferences.getInstance();
