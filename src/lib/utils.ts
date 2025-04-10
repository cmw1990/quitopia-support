import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatISO, parseISO, formatDistanceToNow } from 'date-fns'

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string into a readable format
 */
export function formatDate(date: string, formatStr: string = "PPP") {
  const parsedDate = parseISO(date)
  return format(parsedDate, formatStr)
}

export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function formatDateTime(date: Date): string {
  return format(date, 'PPpp');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateString(str: string, length: number = 30): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

/**
 * Generates an array of objects containing date and value for the last n days
 */
export function generateDateArray(days: number = 7, valueFunc: () => number = () => 0): { date: string; value: number }[] {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (days - 1 - i));
    result.push({
      date: format(date, 'yyyy-MM-dd'),
      value: valueFunc()
    });
  }
  
  return result;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: any;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  } as T;
}

export function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
  return array.map(item => item[key]);
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function formatFullDate(date: Date) {
  return format(date, 'EEEE, MMMM do, yyyy');
}

export function formatDateTimeShort(date: Date) {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (diffInDays < 7) {
    return format(date, 'EEEE');
  } else {
    return format(date, 'MMM d');
  }
}

export function formatDuration(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  if (minutes < 1) {
    return `${seconds} sec${seconds !== 1 ? 's' : ''}`;
  }
  
  if (minutes < 60) {
    return seconds === 0 
      ? `${minutes} min${minutes !== 1 ? 's' : ''}`
      : `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncate(str: string, length: number) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function calculateFocusScore(
  sessionDuration: number,
  distractions: number,
  tasksCompleted: number
) {
  // Base score from session duration (up to 60 points for 2+ hours)
  const durationScore = Math.min(sessionDuration / 120 * 60, 60);
  
  // Distractions penalty (lose up to 20 points)
  // No penalty for 0-2 distractions, scaled penalty for more
  const distractionPenalty = distractions <= 2 ? 0 : Math.min((distractions - 2) * 4, 20);
  
  // Task completion bonus (up to 20 points)
  const taskBonus = Math.min(tasksCompleted * 5, 20);
  
  // Calculate raw score
  let score = durationScore - distractionPenalty + taskBonus;
  
  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return score;
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  
  if (hour < 5) {
    return 'night';
  } else if (hour < 12) {
    return 'morning';
  } else if (hour < 17) {
    return 'afternoon';
  } else if (hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Format a number as a percentage string
 * 
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns String with percentage symbol
 */
export function formatPercent(num: number, decimals = 0): string {
  const factor = Math.pow(10, decimals);
  return (Math.round(num * factor * 100) / factor).toFixed(decimals) + '%';
}

/**
 * Convert camelCase to Title Case
 * 
 * @param text - camelCase text to convert
 * @returns Title Case string
 */
export function camelToTitleCase(text: string): string {
  if (!text) return '';
  
  // Add space before uppercase letters and capitalize first letter
  const result = text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
  
  return result;
}

/**
 * Safely access nested object properties without throwing an error
 * 
 * @param obj - Object to access
 * @param path - Path to property as string or array
 * @param defaultValue - Default value if path doesn't exist
 * @returns Value at path or default value
 */
export function getNestedValue(obj: any, path: string | string[], defaultValue: any = undefined): any {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current === undefined ? defaultValue : current;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 5 minutes")
 * 
 * @param date - Date to format
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}
