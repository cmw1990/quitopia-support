
import { supabase } from './supabase-client';

export const sendPasswordResetEmail = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
};
