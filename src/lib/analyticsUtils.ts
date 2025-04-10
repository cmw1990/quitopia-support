import { parseISO, subDays } from 'date-fns';

export interface EnergyLog {
  id: string;
  user_id: string;
  timestamp: string;
  energy_level: number;
  mood_level: number;
  notes?: string;
}

export interface KeywordFrequency {
  word: string;
  count: number;
}

export interface AnalyticsData {
  avgEnergyLast7Days: number | null;
  avgMoodLast7Days: number | null;
  moodTrend: 'up' | 'down' | 'stable' | null;
  topKeywords: KeywordFrequency[];
  hasEnoughDataForTrend: boolean;
  hasEnoughDataForKeywords: boolean;
}

// Basic stop words list (can be expanded)
const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'and', 'but', 'or', 'i', 'me', 'my', 'you', 'your', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'with', 'feeling', 'felt', 'feel', 'about', 'very', 'of', 'have', 'had', 'do', 'did', 'not', 'be', 'will', 'am', 'pm', 'just', 'so', 'get', 'got', 'go', 'going', 'day', 'today']);


export function calculateMoodEnergyAnalytics(energyLogs: EnergyLog[]): AnalyticsData | null {
  if (energyLogs.length < 1) {
    return null;
  }

  const sortedLogs = [...energyLogs].sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  // --- 7-Day Averages ---
  const last7DaysLogs = sortedLogs.filter(log => parseISO(log.timestamp) >= sevenDaysAgo);
  const avgEnergyLast7Days = last7DaysLogs.length > 0
    ? Math.round((last7DaysLogs.reduce((sum, log) => sum + log.energy_level, 0) / last7DaysLogs.length) * 10) / 10
    : null;
  const avgMoodLast7Days = last7DaysLogs.length > 0
    ? Math.round((last7DaysLogs.reduce((sum, log) => sum + log.mood_level, 0) / last7DaysLogs.length) * 10) / 10
    : null;

  // --- Mood Trend ---
  const prev7DaysLogs = sortedLogs.filter(log => {
      const logDate = parseISO(log.timestamp);
      return logDate >= fourteenDaysAgo && logDate < sevenDaysAgo;
  });
  const avgMoodPrev7Days = prev7DaysLogs.length > 0
      ? Math.round((prev7DaysLogs.reduce((sum, log) => sum + log.mood_level, 0) / prev7DaysLogs.length) * 10) / 10
      : null;

  let moodTrend: 'up' | 'down' | 'stable' | null = null;
  if (avgMoodLast7Days !== null && avgMoodPrev7Days !== null) {
      if (avgMoodLast7Days > avgMoodPrev7Days + 0.5) moodTrend = 'up';
      else if (avgMoodLast7Days < avgMoodPrev7Days - 0.5) moodTrend = 'down';
      else moodTrend = 'stable';
  } else if (avgMoodLast7Days !== null && prev7DaysLogs.length === 0 && last7DaysLogs.length > 0) {
      // Data exists now, but not before -> upward trend
      moodTrend = 'up';
  }

  // --- Keyword Frequency ---
  const notesText = last7DaysLogs // Analyze keywords from the last 7 days only for relevance
      .map(log => log.notes || '')
      .join(' ')
      .toLowerCase();
  const words = notesText.match(/\b[a-z]{3,}\b/g) || []; // Match words with 3+ letters
  const wordFrequencies: { [key: string]: number } = {};

  words.forEach(word => {
      if (!stopWords.has(word)) {
          wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
      }
  });

  const topKeywords = Object.entries(wordFrequencies)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5) // Top 5 keywords
      .map(([word, count]) => ({ word, count }));

  return {
      avgEnergyLast7Days,
      avgMoodLast7Days,
      moodTrend,
      topKeywords,
      hasEnoughDataForTrend: avgMoodLast7Days !== null && avgMoodPrev7Days !== null,
      hasEnoughDataForKeywords: topKeywords.length > 0,
  };
}

// Helper function to generate basic recommendations based on analytics
export function generateRecommendations(analytics: AnalyticsData): string[] {
    const recommendations: string[] = [];
    const lowThreshold = 4;
    const highThreshold = 7;

    if (analytics.avgEnergyLast7Days !== null && analytics.avgEnergyLast7Days <= lowThreshold) {
        recommendations.push("Your average energy seems low lately. Consider prioritizing sleep, checking nutrition, or taking short, frequent breaks.");
    }
    if (analytics.avgMoodLast7Days !== null && analytics.avgMoodLast7Days <= lowThreshold) {
        recommendations.push("Your average mood has been on the lower side. Engaging in enjoyable activities, mindfulness, or talking to someone might help.");
    }
     if (analytics.moodTrend === 'down') {
        recommendations.push("Noticing a downward trend in mood. Pay attention to potential stressors or triggers. Small positive actions can make a difference.");
    }
     if (analytics.avgEnergyLast7Days !== null && analytics.avgEnergyLast7Days > highThreshold && analytics.avgMoodLast7Days !== null && analytics.avgMoodLast7Days > highThreshold ) {
         recommendations.push("You seem to be in a good energy and mood zone! Keep up the positive routines.");
     }

    // Basic keyword recommendations (example)
    if (analytics.topKeywords.some(kw => kw.word === 'tired' || kw.word === 'exhausted')) {
        recommendations.push("Seeing words like 'tired'. Ensure you're getting enough rest and managing your workload.");
    }
    if (analytics.topKeywords.some(kw => kw.word === 'stressed' || kw.word === 'anxious')) {
        recommendations.push("Keywords like 'stressed' or 'anxious' appeared. Explore stress-management techniques like deep breathing or short walks.");
    }

    if (recommendations.length === 0 && (analytics.avgEnergyLast7Days !== null || analytics.avgMoodLast7Days !== null)) {
         recommendations.push("Keep tracking to uncover more detailed patterns and insights!");
    } else if (recommendations.length === 0) {
        recommendations.push("Log your mood and energy consistently to start receiving personalized recommendations.");
    }


    return recommendations.slice(0, 3); // Limit recommendations shown
}

