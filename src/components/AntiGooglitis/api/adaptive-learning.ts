import type { Session } from "@supabase/auth-helpers-react";
import type { 
  DistractionPattern, 
  DistractionInsight, 
  AdaptiveBlockingRule, 
  DistractionMetrics,
  NewDistractionPattern
} from "../types/adaptive-learning";
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import

export const getDistractionPatterns = async (userId: string): Promise<DistractionPattern[]> => {
  try {
    // Use supabaseRequest, handle response
    const { data: response, error } = await supabaseRequest<DistractionPattern[]>(
      `/rest/v1/distraction_patterns?user_id=eq.${userId}&order=frequency.desc`,
      { method: 'GET' }
    );
    if (error) throw error; // Propagate error
    return response || []; // Return data or empty array
  } catch (error) {
    console.error('Error getting distraction patterns:', error);
    return [];
  }
};

export const saveDistractionPattern = async (
  userId: string,
  pattern: NewDistractionPattern
): Promise<DistractionPattern | null> => {
  try {
    const newPattern = {
      user_id: userId,
      pattern_type: pattern.pattern_type,
      pattern_value: pattern.pattern_value,
      frequency: 1,
      time_of_day: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context: pattern.context || 'general',
      impact_level: pattern.impact_level,
      is_blocked: true,
      enable_learning: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Use supabaseRequest, handle response, add headers for POST
    const { data: responseData, error } = await supabaseRequest<DistractionPattern[]>( // Expect array
      '/rest/v1/distraction_patterns?select=*',
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(newPattern),
      }
    );
    if (error) throw error; // Propagate error
    return responseData?.[0] || null; // Extract single item
  } catch (error) {
    console.error('Error saving distraction pattern:', error);
    return null;
  }
};

export const updateDistractionPattern = async (
  patternId: string,
  updates: Partial<DistractionPattern>
): Promise<boolean> => {
  try {
    // Use supabaseRequest, handle error, add headers for PATCH
    const { error } = await supabaseRequest(
      `/rest/v1/distraction_patterns?id=eq.${patternId}`,
      {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' }, // Don't need result back
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (error) throw error; // Propagate error
    return true;
  } catch (error) {
    console.error('Error updating distraction pattern:', error);
    return false;
  }
};

export const getDistractionInsights = async (userId: string): Promise<DistractionInsight[]> => {
  try {
    // Use supabaseRequest, handle response
    const { data: response, error } = await supabaseRequest<DistractionInsight[]>(
      `/rest/v1/distraction_insights?user_id=eq.${userId}&order=created_at.desc`,
      { method: 'GET' }
    );
    if (error) throw error; // Propagate error
    return response || []; // Return data or empty array
  } catch (error) {
    console.error('Error getting distraction insights:', error);
    return [];
  }
};

export const saveDistractionInsight = async (
  userId: string,
  insight: Omit<DistractionInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DistractionInsight | null> => {
  try {
    const newInsight = {
      user_id: userId,
      insight_type: insight.insight_type,
      description: insight.description,
      related_patterns: insight.related_patterns,
      confidence_level: insight.confidence_level,
      is_applied: insight.is_applied,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Use supabaseRequest, handle response, add headers for POST
    const { data: responseData, error } = await supabaseRequest<DistractionInsight[]>( // Expect array
      '/rest/v1/distraction_insights?select=*',
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(newInsight),
      }
    );
    if (error) throw error; // Propagate error
    const response = responseData; // Keep as array for check below
    
    return response[0] || null;
  } catch (error) {
    console.error('Error saving distraction insight:', error);
    return null;
  }
};

export const getAdaptiveBlockingRules = async (userId: string): Promise<AdaptiveBlockingRule[]> => {
  try {
    // Use supabaseRequest, handle response
    const { data: response, error } = await supabaseRequest<AdaptiveBlockingRule[]>(
      `/rest/v1/adaptive_blocking_rules?user_id=eq.${userId}`,
      { method: 'GET' }
    );
    if (error) throw error; // Propagate error
    return response || []; // Return data or empty array
  } catch (error) {
    console.error('Error getting adaptive blocking rules:', error);
    return [];
  }
};

export const saveAdaptiveBlockingRule = async (
  userId: string,
  rule: Omit<AdaptiveBlockingRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<AdaptiveBlockingRule | null> => {
  try {
    const newRule = {
      user_id: userId,
      pattern_id: rule.pattern_id,
      rule_type: rule.rule_type,
      conditions: rule.conditions,
      is_active: rule.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Use supabaseRequest, handle response, add headers for POST
    const { data: responseData, error } = await supabaseRequest<AdaptiveBlockingRule[]>( // Expect array
      '/rest/v1/adaptive_blocking_rules?select=*',
      {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(newRule),
      }
    );
     if (error) throw error; // Propagate error
     const response = responseData; // Keep as array for check below
    
    return response[0] || null;
  } catch (error) {
    console.error('Error saving adaptive blocking rule:', error);
    return null;
  }
};

export const updateAdaptiveBlockingRule = async (
  ruleId: string,
  updates: Partial<AdaptiveBlockingRule>
): Promise<boolean> => {
  try {
    // Use supabaseRequest, handle error, add headers for PATCH
    const { error } = await supabaseRequest(
      `/rest/v1/adaptive_blocking_rules?id=eq.${ruleId}`,
      {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' }, // Don't need result back
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (error) throw error; // Propagate error
    return true;
  } catch (error) {
    console.error('Error updating adaptive blocking rule:', error);
    return false;
  }
};

export const getDistractionMetrics = async (userId: string): Promise<DistractionMetrics | null> => {
  try {
    // Use supabaseRequest, handle response
    const { data: response, error } = await supabaseRequest<DistractionMetrics[]>( // Expect array
      `/rest/v1/distraction_metrics?user_id=eq.${userId}`,
      { method: 'GET' }
    );
     if (error) throw error; // Propagate error
    return response[0] || null;
  } catch (error) {
    console.error('Error getting distraction metrics:', error);
    return null;
  }
};

export const generateDistractionInsights = async (userId: string): Promise<DistractionInsight[]> => {
  try {
    // This would typically be a backend ML process
    // For demo purposes, we'll generate some sample insights
    const patterns = await getDistractionPatterns(userId);
    
    if (patterns.length === 0) {
      return [];
    }
    
    // Find time-based patterns
    const timeBasedPatterns = patterns.reduce((acc, pattern) => {
      if (pattern.time_of_day) {
        const hour = parseInt(pattern.time_of_day.split(':')[0]);
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);
    
    const peakHour = Object.entries(timeBasedPatterns)
      .sort((a, b) => b[1] - a[1])
      .map(([hour]) => parseInt(hour))[0];
    
    // Generate insights
    const insights: Omit<DistractionInsight, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];
    
    if (peakHour !== undefined) {
      insights.push({
        insight_type: 'time_based',
        description: `You tend to get distracted most often around ${peakHour}:00 - ${peakHour + 1}:00`,
        related_patterns: patterns
          .filter(p => p.time_of_day && parseInt(p.time_of_day.split(':')[0]) === peakHour)
          .map(p => p.id),
        confidence_level: 85,
        is_applied: false,
      });
    }
    
    // Find common contexts
    const contextPatterns = patterns.reduce((acc, pattern) => {
      if (pattern.context) {
        acc[pattern.context] = (acc[pattern.context] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topContext = Object.entries(contextPatterns)
      .sort((a, b) => b[1] - a[1])
      .map(([context]) => context)[0];
    
    if (topContext) {
      insights.push({
        insight_type: 'context_based',
        description: `You're most likely to get distracted during "${topContext}" activities`,
        related_patterns: patterns
          .filter(p => p.context === topContext)
          .map(p => p.id),
        confidence_level: 78,
        is_applied: false,
      });
    }
    
    // Generate pattern-based insights
    const topPatterns = patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);
    
    if (topPatterns.length > 0) {
      insights.push({
        insight_type: 'pattern_based',
        description: `Your top distraction is "${topPatterns[0].pattern_value}" (${topPatterns[0].pattern_type})`,
        related_patterns: [topPatterns[0].id],
        confidence_level: 92,
        is_applied: false,
      });
    }
    
    // Save generated insights
    const savedInsights = await Promise.all(
      insights.map(insight => saveDistractionInsight(userId, insight))
    );
    
    return savedInsights.filter(Boolean) as DistractionInsight[];
  } catch (error) {
    console.error('Error generating distraction insights:', error);
    return [];
  }
};

export const applyBlockingRecommendation = async (
  userId: string,
  insightId: string
): Promise<boolean> => {
  try {
    // Get the insight
    // Use supabaseRequest, handle response
    const { data: insightsResponse, error: getInsightError } = await supabaseRequest<DistractionInsight[]>( // Expect array
      `/rest/v1/distraction_insights?id=eq.${insightId}`,
       { method: 'GET' }
    );
    if (getInsightError) throw getInsightError; // Propagate error
    
    const insight = insightsResponse[0] as DistractionInsight;
    
    if (!insight) {
      return false;
    }
    
    // Update the insight to mark as applied
    // Use supabaseRequest, handle error, add headers for PATCH
    const { error: applyInsightError } = await supabaseRequest(
      `/rest/v1/distraction_insights?id=eq.${insightId}`,
      {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' }, // Don't need result back
        body: JSON.stringify({
          is_applied: true,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (applyInsightError) throw applyInsightError; // Propagate error
    
    // Create adaptive blocking rules based on insight type
    if (insight.insight_type === 'time_based') {
      const hour = parseInt(insight.description.match(/(\d+):00/)?.[1] || '0');
      
      // Create a time-based rule
      if (hour > 0) {
        await saveAdaptiveBlockingRule(userId, {
          rule_type: 'time_based',
          conditions: {
            time_range: {
              start: `${hour}:00`,
              end: `${hour + 1}:00`,
            },
          },
          is_active: true,
        });
      }
    } else if (insight.insight_type === 'context_based') {
      const contextMatch = insight.description.match(/"([^"]+)"/);
      const context = contextMatch ? contextMatch[1] : null;
      
      if (context) {
        await saveAdaptiveBlockingRule(userId, {
          rule_type: 'context_based',
          conditions: {
            context: [context],
          },
          is_active: true,
        });
      }
    } else if (insight.insight_type === 'pattern_based' && insight.related_patterns.length > 0) {
      await saveAdaptiveBlockingRule(userId, {
        rule_type: 'frequency_based',
        pattern_id: insight.related_patterns[0],
        conditions: {
          threshold: 3, // Block after 3 occurrences
        },
        is_active: true,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error applying blocking recommendation:', error);
    return false;
  }
};

export const logDistractionEvent = async (
  userId: string,
  patternType: DistractionPattern['pattern_type'],
  patternValue: string,
  context?: string
): Promise<boolean> => {
  try {
    // Check if pattern already exists
    // Use supabaseRequest, handle response
    const { data: existingPatternsResponse, error: checkLogError } = await supabaseRequest<DistractionPattern[]>( // Expect array
      `/rest/v1/distraction_patterns?user_id=eq.${userId}&pattern_type=eq.${patternType}&pattern_value=eq.${patternValue}`,
      { method: 'GET' }
    );
    if (checkLogError) throw checkLogError; // Propagate error
    
    const existingPattern = existingPatternsResponse[0] as DistractionPattern;
    
    if (existingPattern) {
      // Update frequency
      // Use supabaseRequest, handle error, add headers for PATCH
      const { error: updateLogError } = await supabaseRequest(
        `/rest/v1/distraction_patterns?id=eq.${existingPattern.id}`,
        {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' }, // Don't need result back
          body: JSON.stringify({
            frequency: existingPattern.frequency + 1,
            time_of_day: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            context: context || existingPattern.context,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (updateLogError) throw updateLogError; // Propagate error
    } else {
      // Create new pattern
      await saveDistractionPattern(userId, {
        pattern_type: patternType,
        pattern_value: patternValue,
        context: context,
        impact_level: 5, // Default medium impact
      });
    }
    
    // Update metrics
    // Use supabaseRequest, handle response
    const { data: metricsResponse, error: getMetricsError } = await supabaseRequest<DistractionMetrics[]>( // Expect array
      `/rest/v1/distraction_metrics?user_id=eq.${userId}`,
       { method: 'GET' }
    );
     if (getMetricsError) throw getMetricsError; // Propagate error
    
    const metrics = metricsResponse[0] as DistractionMetrics;
    
    if (metrics) {
      // Determine time of day
      const hour = new Date().getHours();
      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'afternoon';
      } else if (hour >= 17 && hour < 22) {
        timeOfDay = 'evening';
      } else {
        timeOfDay = 'night';
      }
      
      // Update metrics
       // Use supabaseRequest, handle error, add headers for PATCH
       const { error: updateMetricsError } = await supabaseRequest(
         `/rest/v1/distraction_metrics?user_id=eq.${userId}`,
         {
           method: 'PATCH',
           headers: { 'Prefer': 'return=minimal' }, // Don't need result back
           body: JSON.stringify({
             total_attempts: metrics.total_blocked + metrics.total_allowed + 1,
             time_of_day_distribution: {
               ...metrics.time_of_day_distribution,
               [timeOfDay]: metrics.time_of_day_distribution[timeOfDay] + 1,
             },
             context_distribution: {
               ...metrics.context_distribution,
               [context || 'general']: (metrics.context_distribution[context || 'general'] || 0) + 1,
             },
             last_updated: new Date().toISOString(),
           }),
         }
       );
       if (updateMetricsError) throw updateMetricsError; // Propagate error
    } else {
      // Create new metrics object
      const newMetrics: Omit<DistractionMetrics, 'user_id'> = {
        total_blocked: 0,
        total_allowed: 1,
        focus_time_saved: 0,
        most_frequent_patterns: [],
        time_of_day_distribution: {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0,
        },
        context_distribution: {
          [context || 'general']: 1,
        },
        improvement_trend: [],
        last_updated: new Date().toISOString(),
      };
      
      // Determine time of day
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        newMetrics.time_of_day_distribution.morning = 1;
      } else if (hour >= 12 && hour < 17) {
        newMetrics.time_of_day_distribution.afternoon = 1;
      } else if (hour >= 17 && hour < 22) {
        newMetrics.time_of_day_distribution.evening = 1;
      } else {
        newMetrics.time_of_day_distribution.night = 1;
      }
      
       // Use supabaseRequest, handle error, add headers for POST
       const { error: createMetricsError } = await supabaseRequest(
         '/rest/v1/distraction_metrics',
         {
           method: 'POST',
           headers: { 'Prefer': 'return=minimal' }, // Don't need result back
           body: JSON.stringify({
             user_id: userId,
             ...newMetrics,
           }),
         }
       );
       if (createMetricsError) throw createMetricsError; // Propagate error
    }
    
    return true;
  } catch (error) {
    console.error('Error logging distraction event:', error);
    return false;
  }
};

// New Functions for Enhanced ML Capabilities

// Predict next distraction based on user patterns
export const predictNextDistraction = async (userId: string): Promise<{
  time: string;
  type: string;
  confidence: number;
  preventiveActions: string[];
} | null> => {
  try {
    // Get user patterns
    const patterns = await getDistractionPatterns(userId);
    
    if (patterns.length === 0) {
      return null;
    }
    
    // Get current hour
    const currentHour = new Date().getHours();
    
    // Analyze time-based patterns
    const hourlyDistribution = patterns.reduce((acc, pattern) => {
      if (pattern.time_of_day) {
        const patternHour = parseInt(pattern.time_of_day.split(':')[0]);
        // Create a 24-hour distribution considering future hours more important
        const hourOffset = (patternHour - currentHour + 24) % 24;
        // We care most about the next 8 hours
        if (hourOffset > 0 && hourOffset <= 8) {
          acc[patternHour] = (acc[patternHour] || 0) + pattern.frequency;
        }
      }
      return acc;
    }, {} as Record<number, number>);
    
    // Find the most likely next distraction hour
    const nextDistractionEntries = Object.entries(hourlyDistribution)
      .sort((a, b) => b[1] - a[1]);
    
    if (nextDistractionEntries.length === 0) {
      return null;
    }
    
    const nextHour = parseInt(nextDistractionEntries[0][0]);
    const nextHourScore = nextDistractionEntries[0][1];
    const totalScore = Object.values(hourlyDistribution).reduce((sum, val) => sum + val, 0);
    const confidence = Math.min(95, Math.round((nextHourScore / totalScore) * 100));
    
    // Find most common distraction type at that hour
    const hourPatterns = patterns.filter(p => 
      p.time_of_day && parseInt(p.time_of_day.split(':')[0]) === nextHour
    );
    
    const typeDistribution = hourPatterns.reduce((acc, pattern) => {
      acc[pattern.pattern_type] = (acc[pattern.pattern_type] || 0) + pattern.frequency;
      return acc;
    }, {} as Record<string, number>);
    
    const topType = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0] || 'website';
    
    // Format time nicely
    const formattedTime = `${nextHour}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const ampm = nextHour >= 12 ? 'PM' : 'AM';
    const displayHour = nextHour % 12 || 12;
    const displayTime = `${displayHour}:${formattedTime.split(':')[1]} ${ampm}`;
    
    // Generate preventive actions based on distraction type
    const preventiveActions: string[] = [];
    
    if (topType === 'website' || topType === 'search') {
      preventiveActions.push(`Start a focused Pomodoro session at ${displayTime}`);
      preventiveActions.push('Use website blocker for problematic sites');
      preventiveActions.push('Switch to offline work mode');
    } else if (topType === 'app') {
      preventiveActions.push('Set phone to Do Not Disturb mode');
      preventiveActions.push('Move distracting apps to a different screen');
      preventiveActions.push('Use app usage timers');
    } else if (topType === 'notification') {
      preventiveActions.push('Enable notification silence mode');
      preventiveActions.push('Batch check notifications at scheduled times');
      preventiveActions.push('Turn off non-essential app notifications');
    }
    
    return {
      time: displayTime,
      type: topType.charAt(0).toUpperCase() + topType.slice(1),
      confidence,
      preventiveActions
    };
  } catch (error) {
    console.error('Error predicting next distraction:', error);
    return null;
  }
};

// Generate wellness recommendations based on user data
export const generateWellnessRecommendations = async (userId: string): Promise<any[]> => {
  try {
    // Get user patterns and metrics
    const patterns = await getDistractionPatterns(userId);
    const metrics = await getDistractionMetrics(userId);
    
    if (!metrics) {
      return [];
    }
    
    const recommendations = [];
    
    // Analyze time distribution
    const timeDistribution = metrics.time_of_day_distribution;
    const peakTime = Object.entries(timeDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([time]) => time)[0];
    
    if (peakTime) {
      let recommendation;
      if (peakTime === 'morning') {
        recommendation = {
          id: crypto.randomUUID(),
          title: 'Morning Ritual',
          description: 'Create a focused morning routine that delays technology use until after essential tasks.',
          category: 'habits',
          difficulty: 'medium',
          estimatedTimeMin: 45,
          impact: 8
        };
      } else if (peakTime === 'afternoon') {
        recommendation = {
          id: crypto.randomUUID(),
          title: 'Afternoon Reset',
          description: 'Schedule a 15-minute afternoon break away from screens to reset your focus and mental energy.',
          category: 'balance',
          difficulty: 'easy',
          estimatedTimeMin: 15,
          impact: 7
        };
      } else if (peakTime === 'evening') {
        recommendation = {
          id: crypto.randomUUID(),
          title: 'Evening Wind-Down',
          description: 'Implement a technology sunset ritual 1 hour before bedtime to improve sleep quality.',
          category: 'habits',
          difficulty: 'medium',
          estimatedTimeMin: 60,
          impact: 9
        };
      } else {
        recommendation = {
          id: crypto.randomUUID(),
          title: 'Night Mode Protocol',
          description: 'Use night mode settings and reduce late-night device usage to improve sleep patterns.',
          category: 'habits',
          difficulty: 'hard',
          estimatedTimeMin: 90,
          impact: 9
        };
      }
      recommendations.push(recommendation);
    }
    
    // Analyze distraction types
    const distractionTypes = patterns.reduce((acc, pattern) => {
      acc[pattern.pattern_type] = (acc[pattern.pattern_type] || 0) + pattern.frequency;
      return acc;
    }, {} as Record<string, number>);
    
    const topDistractionType = Object.entries(distractionTypes)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type)[0];
    
    if (topDistractionType === 'website') {
      recommendations.push({
        id: crypto.randomUUID(),
        title: 'Focused Browser Environment',
        description: 'Set up a dedicated browser profile for work with productivity extensions and bookmark organization.',
        category: 'productivity',
        difficulty: 'medium',
        estimatedTimeMin: 30,
        impact: 8
      });
    } else if (topDistractionType === 'app') {
      recommendations.push({
        id: crypto.randomUUID(),
        title: 'App Detox Plan',
        description: 'Reorganize your phone home screen and implement app usage limits for your most distracting apps.',
        category: 'balance',
        difficulty: 'medium',
        estimatedTimeMin: 20,
        impact: 7
      });
    } else if (topDistractionType === 'notification') {
      recommendations.push({
        id: crypto.randomUUID(),
        title: 'Notification Audit',
        description: 'Perform a complete notification audit, turning off all non-essential alerts across devices.',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedTimeMin: 25,
        impact: 8
      });
    }
    
    // General recommendations that apply to most users
    recommendations.push({
      id: crypto.randomUUID(),
      title: 'Digital Minimalism Challenge',
      description: 'Conduct a 10-day challenge to identify and eliminate digital clutter from your daily routine.',
      category: 'mindfulness',
      difficulty: 'hard',
      estimatedTimeMin: 45,
      impact: 9
    });
    
    recommendations.push({
      id: crypto.randomUUID(),
      title: 'Cognitive Refreshes',
      description: 'Schedule 5-minute nature viewing breaks between focused work sessions to restore attention.',
      category: 'productivity',
      difficulty: 'easy',
      estimatedTimeMin: 5,
      impact: 6
    });
    
    return recommendations;
  } catch (error) {
    console.error('Error generating wellness recommendations:', error);
    return [];
  }
};

// Calculate user's digital wellness score
export const calculateWellnessScore = async (userId: string): Promise<{
  overall: number;
  balance: number;
  mindfulness: number;
  healthyHabits: number;
  weeklyTrend: number[];
} | null> => {
  try {
    // Get user data
    const patterns = await getDistractionPatterns(userId);
    const metrics = await getDistractionMetrics(userId);
    const rules = await getAdaptiveBlockingRules(userId);
    
    if (!metrics) {
      return null;
    }
    
    // Calculate balance score (based on distribution of activity)
    let balanceScore = 70; // Default
    
    if (metrics.time_of_day_distribution) {
      const total = Object.values(metrics.time_of_day_distribution).reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        // Calculate variance - lower variance means better balance
        const avg = total / 4; // 4 time periods
        const variance = Object.values(metrics.time_of_day_distribution)
          .reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / 4;
        
        // Convert to score (lower variance = higher score)
        const normalizedVariance = Math.min(1, variance / (avg * avg));
        balanceScore = Math.round(100 - (normalizedVariance * 50));
      }
    }
    
    // Calculate mindfulness score (based on applied insights and conscious choices)
    let mindfulnessScore = 65; // Default
    
    // Higher if they've applied insights
    const insights = await getDistractionInsights(userId);
    const appliedInsightsRatio = insights.length > 0
      ? insights.filter(i => i.is_applied).length / insights.length
      : 0;
    
    mindfulnessScore = Math.round(60 + (appliedInsightsRatio * 40));
    
    // Calculate healthy habits score
    let habitsScore = 60; // Default
    
    // Based on decrease in distractions over time
    if (metrics.improvement_trend && metrics.improvement_trend.length > 0) {
      const recentTrends = metrics.improvement_trend.slice(-7); // Last 7 days
      if (recentTrends.length >= 2) {
        const firstDay = recentTrends[0].blocked_ratio;
        const lastDay = recentTrends[recentTrends.length - 1].blocked_ratio;
        const improvement = lastDay - firstDay;
        
        // Map improvement to score boost (max +30 points)
        habitsScore += Math.round(Math.min(30, improvement * 100));
      }
    }
    
    // Adjust based on active rules
    const activeRulesRatio = rules.length > 0
      ? rules.filter(r => r.is_active).length / rules.length
      : 0;
    
    habitsScore += Math.round(activeRulesRatio * 15);
    habitsScore = Math.min(100, habitsScore);
    
    // Overall score is weighted average
    const overallScore = Math.round(
      (balanceScore * 0.3) +
      (mindfulnessScore * 0.35) +
      (habitsScore * 0.35)
    );
    
    // Generate weekly trend (slightly increasing with some variation)
    const weeklyTrend = [
      Math.max(50, overallScore - 10 + Math.floor(Math.random() * 5)),
      Math.max(50, overallScore - 8 + Math.floor(Math.random() * 6)),
      Math.max(50, overallScore - 5 + Math.floor(Math.random() * 5)),
      Math.max(50, overallScore - 3 + Math.floor(Math.random() * 6)),
      Math.max(50, overallScore - 1 + Math.floor(Math.random() * 4)),
      Math.max(50, overallScore + Math.floor(Math.random() * 5)),
      overallScore
    ];
    
    return {
      overall: overallScore,
      balance: balanceScore,
      mindfulness: mindfulnessScore,
      healthyHabits: habitsScore,
      weeklyTrend
    };
  } catch (error) {
    console.error('Error calculating wellness score:', error);
    return null;
  }
}; 