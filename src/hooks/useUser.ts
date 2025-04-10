import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useUser() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Get additional user data from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
        
      if (profileError) throw profileError;
      
      return {
        ...user,
        ...profile,
      };
    },
  });

  return {
    user,
    isLoading,
    error,
  };
}
