// import { supabaseRequest } from '@/utils/supabaseRequest'; // Remove old import
import { fetchTable, insertIntoTable } from './supabase-rest'; // Use the new helpers
import { Achievement, UserAchievement, AchievementCriteriaType } from '@/types/achievements';

/**
 * Checks for unlockable achievements based on an event and current progress,
 * and awards them by inserting into the user_achievements table.
 *
 * @param userId The ID of the user.
 * @param eventType The type of criteria being checked (e.g., 'focus_sessions_completed').
 * @param currentValue The user's current progress value for that criteria type.
 * @returns A promise resolving to an array of newly earned Achievements.
 */
export const checkAndAwardAchievements = async (
  userId: string,
  eventType: AchievementCriteriaType,
  currentValue: number
): Promise<Achievement[]> => {
  if (!userId) return [];

  try {
    // 1. Fetch potential achievements matching the event type
    // Specify the expected return type for fetchTable
    const potentialAchievements = await fetchTable<Achievement>(
      'achievements_definitions', // Table for achievement definitions
      { criteria_type: `eq.${eventType}` },
      false // Definitions might be public
    );

    if (potentialAchievements.length === 0) {
      console.log(`No achievements defined for event type: ${eventType}`);
      return [];
    }

    // 2. Fetch achievements already earned by the user
    // Specify the expected return type for fetchTable
    const earnedAchievements = await fetchTable<UserAchievement>(
      'focus_achievements', // Table linking users and achievements
      { user_id: `eq.${userId}` }
    );
    // Provide type for map callback parameter
    const earnedAchievementIds = new Set(earnedAchievements?.map((ua: UserAchievement) => ua.achievement_id) || []);

    // 3. Identify unlockable achievements
    const achievementsToAward: Achievement[] = [];
    // Define type for the array elements
    const awardsToInsert: Omit<UserAchievement, 'id' | 'earned_at'>[] = [];

    // Provide type for forEach callback parameter
    potentialAchievements.forEach((achievement: Achievement) => {
      if (
        !earnedAchievementIds.has(achievement.id) &&
        achievement.criteria_threshold !== null &&
        currentValue >= achievement.criteria_threshold
      ) {
        achievementsToAward.push(achievement);
        awardsToInsert.push({
          user_id: userId,
          achievement_id: achievement.id,
        });
      }
    });

    // 4. Award new achievements (insert into user_achievements)
    if (awardsToInsert.length > 0) {
      console.log(`Awarding ${awardsToInsert.length} achievements to user ${userId}:`, achievementsToAward.map(a => a.name));
      // Specify the expected type for insertIntoTable data
      const inserted = await insertIntoTable<UserAchievement>('focus_achievements', awardsToInsert);
      if (!inserted) {
        console.warn("Insert operation for achievements did not return data.");
      }
    }

    return achievementsToAward;

  } catch (error: any) {
    console.error('Error checking/awarding achievements:', error);
    return [];
  }
};

// Example Usage (conceptual - needs integration)
// const handleActionComplete = async (userId, actionType, newValue) => {
//    const newAchievements = await checkAndAwardAchievements(userId, actionType, newValue);
//    if (newAchievements.length > 0) {
//        // Show notifications for newAchievements
//        newAchievements.forEach(ach => toast({ title: `Achievement Unlocked!`, description: ach.name }));
//    }
// }; 