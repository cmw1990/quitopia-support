import { supabase } from "@/lib/supabase";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isFavorite: boolean;
}

export async function getUserTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from("user_tools")
    .select("*")
    .order("isFavorite", { ascending: false });

  if (error) {
    console.error("Error fetching user tools:", error);
    throw error;
  }

  return data || [];
}

export async function updateUserTools(tool: Tool): Promise<void> {
  const { error } = await supabase
    .from("user_tools")
    .update({ isFavorite: tool.isFavorite })
    .eq("id", tool.id);

  if (error) {
    console.error("Error updating user tool:", error);
    throw error;
  }
}
