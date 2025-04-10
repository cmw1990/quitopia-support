import * as z from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const dateSchema = z.date().min(new Date(1900, 0, 1), 'Date must be after 1900');

export const urlSchema = z.string().url('Invalid URL');

export const positiveNumberSchema = z
  .number()
  .positive('Number must be positive');

export const nonNegativeNumberSchema = z
  .number()
  .min(0, 'Number must be non-negative');

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be between 0 and 100')
  .max(100, 'Percentage must be between 0 and 100');

export const colorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, 'Invalid color code');

export const timeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)');

export const durationSchema = z
  .number()
  .min(0, 'Duration must be non-negative');

export const ratingSchema = z
  .number()
  .min(1, 'Rating must be between 1 and 5')
  .max(5, 'Rating must be between 1 and 5');

export const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(20, 'Tag must be less than 20 characters');

export const tagsSchema = z
  .array(tagSchema)
  .min(1, 'At least one tag is required')
  .max(5, 'Maximum 5 tags allowed');

export const moodSchema = z.enum([
  'very_happy',
  'happy',
  'neutral',
  'sad',
  'very_sad',
]);

export const energyLevelSchema = z.enum([
  'very_high',
  'high',
  'moderate',
  'low',
  'very_low',
]);

export const stressLevelSchema = z.enum([
  'none',
  'mild',
  'moderate',
  'high',
  'severe',
]);

export const sleepQualitySchema = z.enum([
  'excellent',
  'good',
  'fair',
  'poor',
  'very_poor',
]);

export const exerciseIntensitySchema = z.enum([
  'rest',
  'light',
  'moderate',
  'vigorous',
  'maximum',
]);

export const nutritionQualitySchema = z.enum([
  'excellent',
  'good',
  'fair',
  'poor',
  'very_poor',
]);

export const focusLevelSchema = z.enum([
  'excellent',
  'good',
  'fair',
  'poor',
  'very_poor',
]);

export const productivitySchema = z.enum([
  'very_productive',
  'productive',
  'neutral',
  'unproductive',
  'very_unproductive',
]);

export const anxietyLevelSchema = z.enum([
  'none',
  'mild',
  'moderate',
  'severe',
  'extreme',
]);

export const breathingPatternSchema = z.enum([
  'box',
  '4-7-8',
  'resonant',
  'alternate_nostril',
  'ujjayi',
  'custom',
]);

export const meditationTypeSchema = z.enum([
  'mindfulness',
  'focused',
  'loving_kindness',
  'transcendental',
  'zen',
  'guided',
  'custom',
]);

export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  mood: moodSchema,
  tags: tagsSchema.optional(),
  isPrivate: z.boolean(),
});

export const dailyCheckInSchema = z.object({
  date: dateSchema,
  mood: moodSchema,
  energyLevel: energyLevelSchema,
  stressLevel: stressLevelSchema,
  sleepQuality: sleepQualitySchema,
  exerciseIntensity: exerciseIntensitySchema.optional(),
  nutritionQuality: nutritionQualitySchema.optional(),
  focusLevel: focusLevelSchema.optional(),
  productivity: productivitySchema.optional(),
  anxietyLevel: anxietyLevelSchema.optional(),
  notes: z.string().optional(),
});
