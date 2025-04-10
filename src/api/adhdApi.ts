import { DATABASE_SCHEMA } from '@/integrations/supabase/db-client'; // Use alias
import { supabaseRestCall } from './supabase-rest';
import type { ADHDAssessment, CopingStrategy } from '@/hooks/useAdhdSupport'; // Use alias
import type { Session } from '@supabase/supabase-js'; // Import Session type

/**
 * Fetch ADHD assessments for the current user
 */
export const getADHDAssessments = async (session: Session | null): Promise<ADHDAssessment[]> => {
  if (!session?.user?.id) throw new Error('User not authenticated');
  
  try {
    const data = await supabaseRestCall(
      `/rest/v1/${DATABASE_SCHEMA.tables.adhd_assessments}?user_id=eq.${session.user.id}&order=assessment_date.desc`,
      { method: 'GET' },
      session
    );
    
    return data || [];
  } catch (error) {
    console.error('Error fetching ADHD assessments:', error);
    throw error;
  }
};

/**
 * Create a new ADHD assessment
 */
export const createADHDAssessment = async (
  assessment: Omit<ADHDAssessment, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<ADHDAssessment> => {
  if (!session?.user?.id) throw new Error('User not authenticated');
  
  try {
    const payload = {
      ...assessment,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const data = await supabaseRestCall(
      `/rest/v1/${DATABASE_SCHEMA.tables.adhd_assessments}`,
      { 
        method: 'POST',
        body: JSON.stringify(payload)
      },
      session
    );
    
    return data || {};
  } catch (error) {
    console.error('Error creating ADHD assessment:', error);
    throw error;
  }
};

/**
 * Fetch coping strategies for the current user
 */
export const getCopingStrategies = async (session: Session | null): Promise<CopingStrategy[]> => {
  if (!session?.user?.id) throw new Error('User not authenticated');
  
  try {
    const data = await supabaseRestCall(
      `/rest/v1/${DATABASE_SCHEMA.tables.coping_strategies}?user_id=eq.${session.user.id}&order=effectiveness_rating.desc`,
      { method: 'GET' },
      session
    );
    
    return data || [];
  } catch (error) {
    console.error('Error fetching coping strategies:', error);
    throw error;
  }
};

/**
 * Create a new coping strategy
 */
export const createCopingStrategy = async (
  strategy: Omit<CopingStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  session: Session | null
): Promise<CopingStrategy> => {
  if (!session?.user?.id) throw new Error('User not authenticated');
  
  try {
    const payload = {
      ...strategy,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const data = await supabaseRestCall(
      `/rest/v1/${DATABASE_SCHEMA.tables.coping_strategies}`,
      { 
        method: 'POST',
        body: JSON.stringify(payload)
      },
      session
    );
    
    return data || {};
  } catch (error) {
    console.error('Error creating coping strategy:', error);
    throw error;
  }
};

/**
 * Update a coping strategy's usage count
 */
export const updateStrategyUsageCount = async (
  strategyId: string,
  session: Session | null
): Promise<CopingStrategy> => {
  if (!session?.user?.id) throw new Error('User not authenticated');
  
  try {
    // First get the current strategy
    const currentStrategy = await supabaseRestCall(
      `/rest/v1/${DATABASE_SCHEMA.tables.coping_strategies}?id=eq.${strategyId}`,
      { method: 'GET' },
      session
    );
    
    if (!currentStrategy || !currentStrategy[0]) {
      throw new Error('Strategy not found');
    }
    
    // Then update with incremented count
    const updatedStrategy = await supabaseRestCall(
      `/rest/v1/${DATABASE_SCHEMA.tables.coping_strategies}?id=eq.${strategyId}`,
      { 
        method: 'PATCH',
        body: JSON.stringify({
          used_count: (currentStrategy[0].used_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
      },
      session
    );
    
    return updatedStrategy || {};
  } catch (error) {
    console.error('Error updating strategy usage count:', error);
    throw error;
  }
}; 