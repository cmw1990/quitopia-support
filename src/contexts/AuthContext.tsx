import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Supabase configuration (Keep URL and Key for API calls)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Define the shape of the authentication context
export interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define types for API responses (basic examples)
interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: any; // Supabase user object
}

interface AuthErrorResponse {
  error: string;
  error_description: string;
}

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- NEW API-based Auth Functions (Implementations Pending) ---

  const storeSession = (sessionData: AuthTokenResponse | null) => {
    if (sessionData) {
      setUser(sessionData.user);
      setAccessToken(sessionData.access_token);
      setRefreshToken(sessionData.refresh_token);
      localStorage.setItem('user', JSON.stringify(sessionData.user));
      localStorage.setItem('access_token', sessionData.access_token);
      localStorage.setItem('refresh_token', sessionData.refresh_token);
    } else {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
        console.log("No refresh token found for refresh.");
        storeSession(null); // Clear session if refresh token is missing
        return null;
    }

    console.log("Attempting token refresh...");
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh_token: storedRefreshToken })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Token refresh failed:", data);
        storeSession(null); // Clear session on refresh failure
        return null;
      }

      console.log("Token refresh successful.");
      storeSession(data as AuthTokenResponse);
      return data.access_token as string;
    } catch (error) {
        console.error('Network error during token refresh:', error);
        storeSession(null); // Clear session on network error during refresh
        return null;
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    let currentAccessToken = localStorage.getItem('access_token');

    // If no access token, try to refresh
    if (!currentAccessToken) {
        currentAccessToken = await refreshAccessToken();
        if (!currentAccessToken) {
            storeSession(null); // Ensure logout if refresh fails
            throw new Error('Authentication required and token refresh failed.');
        }
    }

    // Create a new Headers object, copying existing headers if provided
    const headers = new Headers(options.headers);

    // Set required headers using the .set() method
    headers.set('apikey', supabaseAnonKey);
    headers.set('Authorization', `Bearer ${currentAccessToken}`);
    // Only set Content-Type if there's a body and it's not already set differently
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Assign the updated Headers object back to options
    options.headers = headers;

    let response = await fetch(url, options);

    // If unauthorized (401), try refreshing the token and retry the request once
    if (response.status === 401) {
        console.log("Access token expired or invalid. Refreshing...");
        currentAccessToken = await refreshAccessToken();
        if (currentAccessToken) {
            // Update the Authorization header on the existing Headers object
            headers.set('Authorization', `Bearer ${currentAccessToken}`);
            options.headers = headers; // Re-assign headers just in case
            console.log("Retrying request with new token...");
            response = await fetch(url, options);
        } else {
            // If refresh failed, throw error and ensure logout
            storeSession(null);
            throw new Error('Token refresh failed. User needs to log in again.');
        }
    }
    // Handle other potential errors after retry if needed
    // if (!response.ok) { ... }

    return response;
};

  // Check initial auth state on mount - Now uses localStorage and potentially refresh
  useEffect(() => {
    const checkAuthState = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');

        if (storedUser && storedAccessToken && storedRefreshToken) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          // Optionally: Validate the token here by making a userinfo call
          // or just proceed and let fetchWithAuth handle potential 401s.
          console.log("Found stored session, assuming valid for now.");
        } else {
          console.log("No complete session found in localStorage.");
          storeSession(null); // Ensure clean state if partial data exists
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('An error occurred while checking authentication state');
        storeSession(null); // Clear session on error
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();

    // Remove onAuthStateChange listener
    // const { data: authListener } = supabase.auth.onAuthStateChange(...);
    // return () => { authListener.subscription.unsubscribe(); };

  }, []);

  // Login function (API version)
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Replace supabase.auth.signInWithPassword
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
              'apikey': supabaseAnonKey,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
          const errorData = data as AuthErrorResponse;
          toast.error(errorData.error_description || 'Login failed');
          throw new Error(errorData.error_description || 'Login failed');
      }

      storeSession(data as AuthTokenResponse);
      navigate('/app/dashboard');
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
       // Don't toast here if already toasted above
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function (API version)
  const signOut = async () => {
    setIsLoading(true);
    const tokenToRevoke = localStorage.getItem('access_token'); // Use access token for logout endpoint
    
    // Optimistically clear local state
    storeSession(null);
    navigate('/auth/login'); // Navigate immediately

    if (!tokenToRevoke) {
       console.warn("No access token found during sign out attempt.");
       setIsLoading(false);
       return;
    }

    try {
      // Replace supabase.auth.signOut
      const response = await fetch(`${supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${tokenToRevoke}`
          }
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error('Logout API error:', errorData);
          // No need to toast error here as user is already redirected and state cleared
          // But log it for debugging
      } else {
          toast.success('Logged out successfully'); // Toast on successful API call
      }

    } catch (error) {
      console.error('Logout network error:', error);
      // Still no toast, state is cleared
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function (API version)
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Replace supabase.auth.signUp
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthErrorResponse;
        toast.error(errorData.error_description || 'Signup failed');
        // Supabase might return 422 for weak password, 400 for existing user etc.
        throw new Error(errorData.error_description || 'Signup failed');
      }
      
      // Successful signup returns user object, but NOT tokens automatically.
      // User needs to confirm email (if enabled) then log in.
      // Handle based on Supabase project settings (email confirmation on/off).
      const needsConfirmation = data.aud === 'authenticated'; // Check if confirmation is needed

      if (needsConfirmation) {
         toast.success('Account created! Please check your email to confirm your account.');
         navigate('/auth/login'); // Redirect to login after signup confirmation needed
      } else {
          // If email confirmation is OFF, Supabase *might* return tokens directly, 
          // or you might need to immediately call the token endpoint. 
          // Assuming we need to call /token endpoint after signup if confirmation is off:
          // This might require a slight delay or checking the user object structure.
          // For simplicity, let's just redirect to login for now, 
          // but a better UX would auto-login if confirmation is off.
          toast.success('Account created successfully! Please log in.');
          navigate('/auth/login');
          // TODO: If auto-login desired: Call signIn() immediately after successful signup if confirmation is disabled.
      }
      
      // Don't store session here as user might need to confirm email or login
      // storeSession(data as AuthTokenResponse); 

      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function (API version)
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Replace supabase.auth.resetPasswordForEmail
      const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
       // Supabase returns 200 OK even if email doesn't exist for security reasons
       if (!response.ok) {
          // This case might indicate a server issue or invalid request format
          const errorData = await response.json();
          toast.error(errorData.error_description || 'Failed to send reset password email');
          throw new Error(errorData.error_description || 'Failed to send reset password email');
       }

      toast.success('Password reset email sent (if account exists)');
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function (API version)
  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    const currentAccessToken = localStorage.getItem('access_token'); // Needs current access token

    if (!currentAccessToken) {
        toast.error("Not logged in. Cannot update password.");
        setIsLoading(false);
        return { error: new Error("User not authenticated") };
    }

    try {
      // Replace supabase.auth.updateUser
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${currentAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as AuthErrorResponse;
        toast.error(errorData.error_description || 'Failed to update password');
        throw new Error(errorData.error_description || 'Failed to update password');
      }

      // Password update might invalidate old refresh tokens. 
      // Best practice: Force re-login or attempt immediate token refresh.
      toast.success('Password updated successfully. Please log in again for security.');
      // Forcing logout after password update:
      await signOut(); 
      // OR try to refresh token immediately (less secure if refresh token compromised)
      // await refreshAccessToken();

      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      // If signOut was called, it might navigate away, so check if still mounted if needed.
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};