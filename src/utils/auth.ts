/**
 * Authentication utility functions
 */

// Get the current auth token from localStorage
export const getToken = (): string | null => {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (!storedSession) return null;
    
    const { currentSession } = JSON.parse(storedSession);
    return currentSession?.access_token || null;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  try {
    localStorage.removeItem('supabase.auth.token');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Get user ID from stored token
export const getUserId = (): string | null => {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (!storedSession) return null;
    
    const { currentSession } = JSON.parse(storedSession);
    if (!currentSession?.user?.id) return null;
    
    return currentSession.user.id;
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    return null;
  }
};

export default {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  getUserId
}; 