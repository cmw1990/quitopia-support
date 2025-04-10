import OpenAI from 'openai';
import { supabase } from './supabase';

let openaiInstance: OpenAI | null = null;

export async function getOpenAIInstance() {
  if (openaiInstance) return openaiInstance;

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('openai_api_key')
      .single();

    if (error) throw error;
    if (!data?.openai_api_key) throw new Error('OpenAI API key not found');

    openaiInstance = new OpenAI({
      apiKey: data.openai_api_key,
    });

    return openaiInstance;
  } catch (error) {
    console.error('Error initializing OpenAI:', error);
    throw error;
  }
}

export async function generateAIResponse(
  message: string,
  context: {
    wellnessScores?: any;
    recentActivities?: any;
    userPreferences?: any;
  } = {}
) {
  const openai = await getOpenAIInstance();

  const systemPrompt = `You are an empathetic and knowledgeable mental health assistant. 
Your role is to provide supportive guidance, personalized recommendations, and evidence-based insights 
while maintaining a warm and professional tone. Always prioritize user safety and well-being.

Current user context:
${JSON.stringify(context, null, 2)}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    // Parse response for recommendations and insights
    const recommendations = extractRecommendations(response);
    const insights = extractInsights(response);

    return {
      message: response,
      type: determineResponseType(response),
      recommendations,
      insights,
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export async function analyzeWellnessData(data: any) {
  const openai = await getOpenAIInstance();

  const systemPrompt = `You are an AI specialized in mental health data analysis.
Analyze the following wellness data and provide insights, trends, and personalized recommendations.
Focus on identifying patterns, progress indicators, and areas for improvement.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(data) }
      ],
      temperature: 0.5,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing wellness data:', error);
    throw error;
  }
}

export async function generatePersonalizedExercise(
  category: string,
  userProfile: any
) {
  const openai = await getOpenAIInstance();

  const systemPrompt = `You are an AI specialized in creating personalized mental health exercises.
Generate a detailed exercise for the category: ${category}
Consider the user's profile, preferences, and current mental state.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userProfile) }
      ],
      temperature: 0.8,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating personalized exercise:', error);
    throw error;
  }
}

function extractRecommendations(response: string) {
  // Extract structured recommendations from the AI response
  // This is a simple implementation - enhance based on your needs
  const recommendations = [];
  const recommendationRegex = /Recommendation:(.*?)(?=Recommendation:|$)/gs;
  let match;

  while ((match = recommendationRegex.exec(response)) !== null) {
    const recommendation = match[1].trim();
    if (recommendation) {
      recommendations.push({
        title: recommendation.split('\n')[0],
        description: recommendation.split('\n').slice(1).join('\n'),
        category: determineCategory(recommendation),
        difficulty: determineDifficulty(recommendation),
        duration: extractDuration(recommendation),
        benefits: extractBenefits(recommendation),
      });
    }
  }

  return recommendations;
}

function extractInsights(response: string) {
  // Extract structured insights from the AI response
  // This is a simple implementation - enhance based on your needs
  const insights = [];
  const insightRegex = /Insight:(.*?)(?=Insight:|$)/gs;
  let match;

  while ((match = insightRegex.exec(response)) !== null) {
    const insight = match[1].trim();
    if (insight) {
      insights.push({
        category: determineCategory(insight),
        metric: extractMetric(insight),
        value: extractValue(insight),
        trend: determineTrend(insight),
        suggestion: extractSuggestion(insight),
      });
    }
  }

  return insights;
}

function determineResponseType(response: string): 'message' | 'recommendation' | 'insight' | 'exercise' {
  if (response.includes('Recommendation:')) return 'recommendation';
  if (response.includes('Insight:')) return 'insight';
  if (response.includes('Exercise:')) return 'exercise';
  return 'message';
}

function determineCategory(text: string): string {
  const categories = ['anxiety', 'depression', 'stress', 'sleep', 'relationships', 'mindfulness', 'gratitude', 'goals'];
  for (const category of categories) {
    if (text.toLowerCase().includes(category)) return category;
  }
  return 'general';
}

function determineDifficulty(text: string): 'easy' | 'medium' | 'hard' {
  const lower = text.toLowerCase();
  if (lower.includes('easy') || lower.includes('beginner')) return 'easy';
  if (lower.includes('hard') || lower.includes('advanced')) return 'hard';
  return 'medium';
}

function extractDuration(text: string): string {
  const durationRegex = /(\d+)\s*(minute|min|hour|hr)/i;
  const match = text.match(durationRegex);
  return match ? `${match[1]} ${match[2]}s` : '5 minutes';
}

function extractBenefits(text: string): string[] {
  const benefitsRegex = /Benefits?:(.*?)(?=\n|$)/i;
  const match = text.match(benefitsRegex);
  if (!match) return ['Improved well-being'];
  return match[1].split(',').map(b => b.trim());
}

function extractMetric(text: string): string {
  const metricRegex = /([\w\s]+):/;
  const match = text.match(metricRegex);
  return match ? match[1].trim() : 'General';
}

function extractValue(text: string): number {
  const valueRegex = /(\d+(\.\d+)?)/;
  const match = text.match(valueRegex);
  return match ? parseFloat(match[1]) : 0;
}

function determineTrend(text: string): 'improving' | 'declining' | 'stable' {
  const lower = text.toLowerCase();
  if (lower.includes('improv') || lower.includes('better') || lower.includes('up')) return 'improving';
  if (lower.includes('declin') || lower.includes('worse') || lower.includes('down')) return 'declining';
  return 'stable';
}

function extractSuggestion(text: string): string {
  const suggestionRegex = /suggest(?:ion)?s?:(.*?)(?=\n|$)/i;
  const match = text.match(suggestionRegex);
  return match ? match[1].trim() : '';
}
