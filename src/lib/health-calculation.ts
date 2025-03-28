import { differenceInDays } from 'date-fns';
import { HealthMetric, SavingsDetail } from '../types/dataTypes';

/**
 * Calculates the overall health improvement percentage based on days since quitting
 */
export function calculateHealthImprovement(quitDate: Date | null): number {
  if (!quitDate) return 0;
  
  const daysSinceQuit = Math.max(0, differenceInDays(new Date(), quitDate));
  
  if (daysSinceQuit <= 0) return 0;
  
  // Health improvement calculation based on medical research
  // This is a simplified model that can be adjusted with more precise data
  if (daysSinceQuit < 2) return Math.min(10, daysSinceQuit * 5);
  if (daysSinceQuit < 7) return 10 + Math.min(10, (daysSinceQuit - 2) * 2);
  if (daysSinceQuit < 30) return 20 + Math.min(15, (daysSinceQuit - 7) * 0.65);
  if (daysSinceQuit < 90) return 35 + Math.min(15, (daysSinceQuit - 30) * 0.25);
  if (daysSinceQuit < 365) return 50 + Math.min(20, (daysSinceQuit - 90) * 0.073);
  if (daysSinceQuit < 3650) return 70 + Math.min(25, (daysSinceQuit - 365) * 0.025);
  
  // After 10 years, health risks are significantly reduced
  return 95;
}

/**
 * Calculates the number of cigarettes avoided since quitting
 */
export function calculateCigarettesAvoided(quitDate: Date | null, dailyAvgCigarettes: number): number {
  if (!quitDate || dailyAvgCigarettes <= 0) return 0;
  
  const daysSinceQuit = Math.max(0, differenceInDays(new Date(), quitDate));
  return Math.floor(daysSinceQuit * dailyAvgCigarettes);
}

/**
 * Calculates carbon footprint reduction based on cigarettes avoided
 * Average cigarette produces ~14g of CO2 (including production & disposal)
 */
export function calculateCarbonReduction(cigarettesAvoided: number): number {
  return cigarettesAvoided * 14; // 14g CO2 per cigarette
}

/**
 * Calculates time saved from not smoking
 * Average time to smoke one cigarette is ~5 minutes
 */
export function calculateTimeSaved(cigarettesAvoided: number): {
  hours: number;
  days: number;
  weeks: number;
} {
  const minutesSaved = cigarettesAvoided * 5;
  const hours = Math.floor(minutesSaved / 60);
  const days = Math.floor(hours / 24);
  const weeks = parseFloat((hours / 168).toFixed(1));
  
  return { hours, days, weeks };
}

/**
 * Calculates money saved based on cigarette consumption and cost
 */
export function calculateSavings(
  quitDate: Date | null,
  costPerPack: number,
  packsPerDay: number
): SavingsDetail {
  if (!quitDate || costPerPack <= 0 || packsPerDay <= 0) {
    return { daily: 0, weekly: 0, monthly: 0, yearly: 0, total: 0 };
  }
  
  const daysSinceQuit = Math.max(0, differenceInDays(new Date(), quitDate));
  const dailySavings = costPerPack * packsPerDay;
  
  return {
    daily: dailySavings,
    weekly: dailySavings * 7,
    monthly: dailySavings * 30,
    yearly: dailySavings * 365,
    total: dailySavings * daysSinceQuit
  };
} 