export const getSupabaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.error('VITE_SUPABASE_URL environment variable is not set.');
    throw new Error('Supabase URL is not configured.');
  }
  return url;
};

export const getSupabaseAnonKey = (): string => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    console.error('VITE_SUPABASE_ANON_KEY environment variable is not set.');
    throw new Error('Supabase Anon Key is not configured.');
  }
  return key;
}; 