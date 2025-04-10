import { supabase } from '../contexts/AuthContext';
import { z } from 'zod';
// import { handleError, ErrorType } from '../utils/error-handler'; // Temporarily commented out for diagnosis

// Comprehensive progress tracking schema
export const ProgressEntrySchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  category: z.enum([
    'focus_sessions', 
    'tasks', 
    'energy_levels', 
    'achievements'
  ]),
  metric: z.string(),
  value: z.number(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;

export interface ProgressAnalytics {
  overallProgress: number;
  categoryBreakdown: Record<string, {
    totalEntries: number;
    averageValue: number;
    trend: 'increasing' | 'decreasing' | 'stable'
  }>;
  achievements: {
    unlocked: string[];
    totalAchievements: number;
    progressPercentage: number;
  };
  exportOptions: {
    csv: string;
  };
}

export class ProgressAnalyticsService {
  // Log a progress entry with comprehensive validation
  static async logProgressEntry(
    progressEntry: Omit<ProgressEntry, 'id' | 'timestamp'>
  ): Promise<ProgressEntry | null> {
    try {
      const validatedProgressEntry = ProgressEntrySchema.omit({ 
        id: true, 
        timestamp: true 
      }).parse({
        ...progressEntry,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('progress_entries')
        .insert(validatedProgressEntry)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // handleError(error, 'Invalid progress entry data');
      } else {
        // handleError(error, 'Failed to log progress entry');
      }
      return null;
    }
  }

  // Retrieve comprehensive progress analytics
  static async getProgressAnalytics(
    userId: string,
    options?: {
      startDate?: string,
      endDate?: string,
      categories?: Array<'focus_sessions' | 'tasks' | 'energy_levels' | 'achievements'>
    }
  ): Promise<ProgressAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_comprehensive_progress_analytics', { 
        p_user_id: userId,
        p_start_date: options?.startDate,
        p_end_date: options?.endDate,
        p_categories: options?.categories
      });

      if (error) throw error;
      return data || { 
        overallProgress: 0,
        categoryBreakdown: {},
        achievements: {
          unlocked: [],
          totalAchievements: 0,
          progressPercentage: 0
        },
        exportOptions: {
          csv: ''
        }
      };
    } catch (error) {
      // handleError(error, 'Failed to fetch progress analytics');
      return { 
        overallProgress: 0,
        categoryBreakdown: {},
        achievements: {
          unlocked: [],
          totalAchievements: 0,
          progressPercentage: 0
        },
        exportOptions: {
          csv: ''
        }
      };
    }
  }

  // Generate achievement recommendations
  static generateAchievementRecommendations(
    analytics: ProgressAnalytics
  ): string[] {
    const recommendations: string[] = [];

    if (analytics.achievements.progressPercentage < 25) {
      recommendations.push('You\'re just getting started! Keep exploring and completing tasks to unlock achievements.');
    }

    if (analytics.overallProgress < 50) {
      recommendations.push('You have room for improvement. Set small, achievable goals to boost your progress.');
    }

    Object.entries(analytics.categoryBreakdown).forEach(([category, breakdown]) => {
      if (breakdown.trend === 'decreasing') {
        recommendations.push(`Your progress in ${category} is declining. Focus on consistent effort.`);
      }
    });

    return recommendations;
  }

  // Export progress data to CSV
  static async exportProgressToCSV(
    userId: string,
    analytics: ProgressAnalytics
  ): Promise<string | null> {
    try {
      let csvContent = 'Category,Total Entries,Average Value,Trend\n';

      Object.entries(analytics.categoryBreakdown).forEach(([category, breakdown]) => {
        csvContent += `${category},${breakdown.totalEntries},${breakdown.averageValue},${breakdown.trend}\n`;
      });

      csvContent += '\nAchievements\n';
      csvContent += 'Progress Percentage,Total Achievements,Unlocked Achievements\n';
      csvContent += `${analytics.achievements.progressPercentage},${analytics.achievements.totalAchievements},${analytics.achievements.unlocked.join(';')}\n`;

      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const csvUrl = URL.createObjectURL(csvBlob);

      return csvUrl;
    } catch (error) {
      // handleError(error, 'Failed to generate CSV report');
      return null;
    }
  }
}