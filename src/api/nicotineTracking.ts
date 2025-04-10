import { createClient } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase REST API call helper
export const supabaseRestCall = async (
  endpoint: string,
  options: RequestInit = {},
  session: Session | null = null
) => {
  try {
    const headers: HeadersInit = {
      ...options.headers,
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${supabaseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Supabase REST API error:", error);
    throw error;
  }
};

// Interface definitions
export interface NicotineLog {
  id?: string;
  user_id?: string;
  product_type: string;
  quantity: number;
  unit: string;
  consumption_date: string;
  location?: string;
  trigger?: string;
  mood?: string;
  intensity?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CravingLog {
  id?: string;
  user_id?: string;
  timestamp: string;
  intensity: number;
  duration_seconds?: number;
  trigger_type?: string;
  location?: string;
  resisted: boolean;
  strategies_used?: string[];
  notes?: string;
  created_at?: string;
}

export interface FocusImpactData {
  timestamp: string;
  focus_level: number;
  focus_duration_minutes: number;
  nicotine_consumption?: number;
  craving_intensity?: number;
}

// API Functions
export const logNicotineConsumption = async (
  session: Session | null,
  logData: NicotineLog
): Promise<NicotineLog | null> => {
  try {
    if (!session?.user) return null;
    
    const data = await supabaseRestCall(
      "/rest/v1/nicotine_logs8",
      {
        method: "POST",
        body: JSON.stringify({
          ...logData,
          user_id: session.user.id,
        }),
        headers: {
          'Prefer': 'return=representation'
        }
      },
      session
    );
    
    return data[0] || null;
  } catch (error) {
    console.error("Error logging nicotine consumption:", error);
    throw error;
  }
};

export const getNicotineConsumptionLogs = async (
  session: Session | null,
  timeframe: string = "7days"
): Promise<NicotineLog[]> => {
  try {
    if (!session?.user) return [];
    
    let query = `/rest/v1/nicotine_logs8?user_id=eq.${session.user.id}&order=consumption_date.desc`;
    
    // Add timeframe filtering if needed
    if (timeframe !== "all") {
      const daysBack = parseInt(timeframe.replace("days", ""));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const formattedDate = startDate.toISOString().split('T')[0];
      query += `&consumption_date=gte.${formattedDate}`;
    }
    
    const data = await supabaseRestCall(
      query,
      { method: "GET" },
      session
    );
    
    return data || [];
  } catch (error) {
    console.error("Error fetching nicotine logs:", error);
    return [];
  }
};

export const logCraving = async (
  session: Session | null,
  cravingData: CravingLog
): Promise<CravingLog | null> => {
  try {
    if (!session?.user) return null;
    
    const data = await supabaseRestCall(
      "/rest/v1/craving_logs8",
      {
        method: "POST",
        body: JSON.stringify({
          ...cravingData,
          user_id: session.user.id,
        }),
        headers: {
          'Prefer': 'return=representation'
        }
      },
      session
    );
    
    return data[0] || null;
  } catch (error) {
    console.error("Error logging craving:", error);
    throw error;
  }
};

export const getCravingLogs = async (
  session: Session | null,
  limit: number = 50
): Promise<CravingLog[]> => {
  try {
    if (!session?.user) return [];
    
    const data = await supabaseRestCall(
      `/rest/v1/craving_logs8?user_id=eq.${session.user.id}&order=timestamp.desc&limit=${limit}`,
      { method: "GET" },
      session
    );
    
    return data || [];
  } catch (error) {
    console.error("Error fetching craving logs:", error);
    return [];
  }
};

export const saveFocusImpactData = async (
  session: Session | null,
  impactData: FocusImpactData
): Promise<FocusImpactData | null> => {
  try {
    if (!session?.user) return null;
    
    const data = await supabaseRestCall(
      "/rest/v1/focus_nicotine_impact8",
      {
        method: "POST",
        body: JSON.stringify({
          ...impactData,
          user_id: session.user.id,
        }),
        headers: {
          'Prefer': 'return=representation'
        }
      },
      session
    );
    
    return data[0] || null;
  } catch (error) {
    console.error("Error saving focus impact data:", error);
    throw error;
  }
};

export const getFocusImpactData = async (
  session: Session | null,
  days: number = 30
): Promise<FocusImpactData[]> => {
  try {
    if (!session?.user) return [];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const formattedDate = startDate.toISOString();
    
    const data = await supabaseRestCall(
      `/rest/v1/focus_nicotine_impact8?user_id=eq.${session.user.id}&timestamp=gte.${formattedDate}&order=timestamp.desc`,
      { method: "GET" },
      session
    );
    
    return data || [];
  } catch (error) {
    console.error("Error fetching focus impact data:", error);
    return [];
  }
}; 