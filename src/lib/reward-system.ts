import { focusEventBus, TimerStateEvent, EnvironmentEvent, FocusEvent } from './focus-event-bus';

export interface RewardPoints {
  daily: number;
  weekly: number;
  total: number;
  streaks: {
    current: number;
    best: number;
  };
  achievements: Achievement[];
  lastReward: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  category: 'focus' | 'consistency' | 'environment' | 'distraction' | 'streak';
}

class RewardSystem {
  private static instance: RewardSystem;
  private points: RewardPoints;
  private readonly storageKey = 'easier-focus-rewards';

  private constructor() {
    this.points = this.loadPoints();
    this.setupEventListeners();
  }

  public static getInstance(): RewardSystem {
    if (!RewardSystem.instance) {
      RewardSystem.instance = new RewardSystem();
    }
    return RewardSystem.instance;
  }

  private loadPoints(): RewardPoints {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      daily: 0,
      weekly: 0,
      total: 0,
      streaks: {
        current: 0,
        best: 0
      },
      achievements: this.initializeAchievements(),
      lastReward: null
    };
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: 'first_focus',
        title: 'First Focus',
        description: 'Complete your first focus session',
        points: 10,
        icon: '🎯',
        unlockedAt: null,
        progress: 0,
        maxProgress: 1,
        category: 'focus'
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete 3 focus sessions before 10 AM',
        points: 20,
        icon: '🌅',
        unlockedAt: null,
        progress: 0,
        maxProgress: 3,
        category: 'consistency'
      },
      {
        id: 'distraction_master',
        title: 'Distraction Master',
        description: 'Block 50 distractions',
        points: 30,
        icon: '🛡️',
        unlockedAt: null,
        progress: 0,
        maxProgress: 50,
        category: 'distraction'
      },
      {
        id: 'flow_state',
        title: 'Flow State',
        description: 'Maintain focus for 2 hours straight',
        points: 50,
        icon: '⚡',
        unlockedAt: null,
        progress: 0,
        maxProgress: 120,
        category: 'focus'
      },
      {
        id: 'perfect_environment',
        title: 'Perfect Environment',
        description: 'Maintain optimal environment settings for 5 sessions',
        points: 25,
        icon: '🌟',
        unlockedAt: null,
        progress: 0,
        maxProgress: 5,
        category: 'environment'
      },
      {
        id: 'weekly_warrior',
        title: 'Weekly Warrior',
        description: 'Complete focus sessions 7 days in a row',
        points: 100,
        icon: '🏆',
        unlockedAt: null,
        progress: 0,
        maxProgress: 7,
        category: 'streak'
      }
    ];
  }

  private setupEventListeners(): void {
    // Listen for focus session completions
    focusEventBus.subscribe('timerStateUpdate', (event: FocusEvent) => {
      const timerData = event.data as TimerStateEvent;
      if (timerData.type === 'focus' && timerData.completed) {
        this.awardPoints('focus_completion', 10);
        this.updateAchievementProgress('first_focus', 1);
        
        const hour = new Date().getHours();
        if (hour < 10) {
          this.updateAchievementProgress('early_bird', 1);
        }
      }
    });

    // Listen for distraction blocks
    focusEventBus.subscribe('distractionDetected', () => {
      this.awardPoints('distraction_blocked', 2);
      this.updateAchievementProgress('distraction_master', 1);
    });

    // Listen for environment optimizations
    focusEventBus.subscribe('environmentUpdate', (event: FocusEvent) => {
      const envData = event.data as EnvironmentEvent;
      if (this.isOptimalEnvironment(envData)) {
        this.updateAchievementProgress('perfect_environment', 1);
      }
    });
  }

  private isOptimalEnvironment(environment: EnvironmentEvent): boolean {
    return (
      environment.noise === 'low' &&
      environment.lighting === 'bright' &&
      environment.temperature === 'moderate'
    );
  }

  public awardPoints(reason: string, amount: number): void {
    this.points.daily += amount;
    this.points.weekly += amount;
    this.points.total += amount;
    this.points.lastReward = new Date().toISOString();
    
    this.savePoints();
    this.checkMilestones();
    
    focusEventBus.emit('rewardUpdate', {
      points: amount,
      reason,
      total: this.points.total
    });
  }

  private checkMilestones(): void {
    const milestones = [100, 500, 1000, 5000, 10000];
    const currentMilestone = milestones.find(m => this.points.total >= m);
    
    if (currentMilestone) {
      focusEventBus.emit('milestoneReached', {
        milestone: currentMilestone,
        total: this.points.total
      });
    }
  }

  private updateAchievementProgress(id: string, increment: number): void {
    const achievement = this.points.achievements.find(a => a.id === id);
    if (!achievement || achievement.unlockedAt) return;

    achievement.progress = Math.min(achievement.progress + increment, achievement.maxProgress);
    
    if (achievement.progress >= achievement.maxProgress) {
      achievement.unlockedAt = new Date().toISOString();
      this.awardPoints(`achievement_${id}`, achievement.points);
      
      focusEventBus.emit('achievementUnlocked', achievement);
    }

    this.savePoints();
  }

  private savePoints(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.points));
  }

  public getPoints(): RewardPoints {
    return { ...this.points };
  }

  public resetDaily(): void {
    this.points.daily = 0;
    this.savePoints();
  }

  public resetWeekly(): void {
    this.points.weekly = 0;
    this.savePoints();
  }
}

export const rewardSystem = RewardSystem.getInstance();
