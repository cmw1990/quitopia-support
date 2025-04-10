import { supabase } from "@/lib/supabase";

export interface UserMetrics {
  physical: number;
  mental: number;
  emotional: number;
  sleep: number;
}

export async function getUserMetrics(): Promise<UserMetrics> {
  const { data, error } = await supabase
    .from("user_metrics")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching user metrics:", error);
    throw error;
  }

  return data;
}
