/**
 * Supabase REST API Client for Mission Fresh
 * 
 * Direct REST API implementation following SSOT8001 guidelines,
 * avoiding the use of Supabase client methods as mandated by SSOT8001.
 * 
 * IMPORTANT: This module implements the MANDATORY REST API APPROACH
 * specified in SSOT8001 section "REST API Policy".
 */

// Only import types from Supabase, not client functionality
import type { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useOffline } from '@/context/OfflineContext';

// Use environment variables if available, otherwise use production values from SSOT8001
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Storage key for Supabase auth (consistent with Supabase standard)
export const STORAGE_KEY = 'supabase.auth.token';

// In-memory cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Ensures table names comply with SSOT8001 naming convention (suffix '8')
 * This helps standardize API calls across the application
 * 
 * @param endpoint The endpoint to check and potentially modify
 * @returns The corrected endpoint with proper table naming
 */
const ensureTableNameCompliance = (endpoint: string): string => {
  // If it's already a full URL or doesn't contain /rest/v1/, return as is
  if (endpoint.startsWith('http') || !endpoint.includes('/rest/v1/')) {
    return endpoint;
  }
  
  // Check if the endpoint follows the pattern /rest/v1/table_name
  // If the table name doesn't end with '8', append it
  return endpoint.replace(
    /\/rest\/v1\/([a-z_]+)(?!\d)/g, 
    '/rest/v1/$18'
  );
};

/**
 * Makes a REST API call to Supabase endpoints
 * This function is SSOT8001 compliant and does not use the Supabase client
 * 
 * @param endpoint The endpoint to call (either full URL or relative path)
 * @param options Fetch options to include in the request
 * @param session Optional session object or boolean for authentication
 * @returns Promise with the API response
 */
export const supabaseRestCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  session?: Session | null | boolean
): Promise<{ data: T | null; error: any | null }> => {
  try {
    // Ensure table names comply with SSOT8001 (suffix '8')
    const compliantEndpoint = ensureTableNameCompliance(endpoint);
    
    // Determine the full URL based on whether endpoint is already a full URL
    const fullEndpoint = compliantEndpoint.startsWith('http') || compliantEndpoint.startsWith('/')
      ? compliantEndpoint.startsWith('/') ? `${SUPABASE_URL}${compliantEndpoint}` : compliantEndpoint
      : `${SUPABASE_URL}/rest/v1/${compliantEndpoint}`;
    
    // Determine the authentication token to use
    let authToken: string = SUPABASE_ANON_KEY;
    
    if (session) {
      if (typeof session === 'object' && session !== null && 'access_token' in session) {
        authToken = session.access_token;
      }
      // If session is true, we'll use the anon key (already set)
    }

    // Add caching capability for GET requests
    if (options.method === 'GET' || !options.method) {
      const cacheKey = `${fullEndpoint}:${JSON.stringify(options.headers || {})}`;
      const cachedResponse = apiCache.get(cacheKey);
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        return { data: cachedResponse.data, error: null };
      }
    }

    // Make the API request
    const response = await fetch(fullEndpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
      }
    });

    // Check for non-2xx responses
    if (!response.ok) {
      const errorText = await response.text();
      let parsedError;
      
      try {
        // Try to parse as JSON if possible
        parsedError = JSON.parse(errorText);
      } catch (e) {
        // If not JSON, use the raw text
        parsedError = { message: errorText };
      }
      
      return { 
        data: null, 
        error: { 
          status: response.status, 
          statusText: response.statusText,
          ...parsedError
        } 
      };
    }

    // Handle empty responses
    if (response.status === 204) {
      return { data: null, error: null };
    }

    // Parse the JSON response
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Supabase REST API call failed:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : 'Unknown error',
        original: error
      } 
    };
  }
};

/**
 * Signs in a user with email and password
 * Uses direct REST API calls to Supabase auth endpoints
 * 
 * @param email The user's email address
 * @param password The user's password
 * @returns Promise with session and user data on success
 * @throws Error if login fails
 */
export const signInWithEmail = async (email: string, password: string): Promise<Session> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Create a properly formatted session object
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      expires_in: data.expires_in,
      token_type: data.token_type || 'bearer',
      user: data.user,
    };
    
    // Store the session in local storage in the expected format
    const storedSession = {
      currentSession: session
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));
    
    // Simulate storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(storedSession)
    }));
    
    return session;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
};

/**
 * Signs out the current user
 * Uses direct REST API calls to Supabase auth endpoints
 * 
 * @param session Optional session object. If not provided, will attempt to get from localStorage
 * @returns Promise resolving to true if successful, false otherwise
 */
export const signOut = async (session?: Session): Promise<boolean> => {
  try {
    // Get the current session if not provided
    const currentSession = session || getCurrentSession();
    
    // If there's no session, just clear local storage
    if (!currentSession) {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    
    // Make sure we have a valid token
    if (!currentSession.access_token) {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${currentSession.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }

    // Always clear the local session
    localStorage.removeItem(STORAGE_KEY);
    
    // Notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: null
    }));

    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Still attempt to remove local session on error
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
};

/**
 * Gets the current session from localStorage
 * 
 * @returns The current session or null if not found
 */
export const getCurrentSession = (): Session | null => {
  try {
    // Get the stored session from localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return null;
    }
    
    // Parse the stored JSON
    const storedSession = JSON.parse(storedData);
    
    // Extract the session
    if (storedSession && storedSession.currentSession) {
      const session = storedSession.currentSession;
      
      // Check if the token is expired
      if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
        console.warn('Session token is expired');
        return null;
      }
      
      return session;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Refreshes the current session token
 * 
 * @param session Optional session to refresh. If not provided, will get from localStorage
 * @returns Promise with the refreshed session or null
 */
export const refreshSession = async (session?: Session): Promise<Session | null> => {
  try {
    // Get current session if not provided
    const currentSession = session || getCurrentSession();
    
    // If there's no session or no refresh token, return null
    if (!currentSession || !currentSession.refresh_token) {
      return null;
    }
    
    // Make the refresh request
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: currentSession.refresh_token,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.message || 'Failed to refresh session');
    }

    const data = await response.json();
    
    // Create a properly formatted session object
    const newSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      expires_in: data.expires_in,
      token_type: data.token_type || 'bearer',
      user: data.user,
    };
    
    // Store the session in local storage in the expected format
    const storedSession = {
      currentSession: newSession
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));
    
    // Simulate storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(storedSession)
    }));
    
    return newSession;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }
};

/**
 * Gets the current user from the session in localStorage
 * 
 * @returns The current user or null if not found
 */
export const getCurrentUser = (): User | null => {
  const session = getCurrentSession();
  return session?.user || null;
};

// Subscription for auth state changes
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  // Call initially with current session
  const currentSession = getCurrentSession();
  callback('INITIAL', currentSession);

  // Setup storage listener for auth changes
  const storageListener = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      if (!event.newValue) {
        // Session was removed
        callback('SIGNED_OUT', null);
      } else {
        try {
          const parsedData = JSON.parse(event.newValue);
          const session = parsedData.currentSession;
          if (session) {
            callback('SIGNED_IN', session);
          }
        } catch (e) {
          console.error('Error parsing auth state change:', e);
        }
      }
    }
  };

  window.addEventListener('storage', storageListener);
  
  // Return unsubscribe function
  return {
    unsubscribe: () => {
      window.removeEventListener('storage', storageListener);
    }
  };
};

// Export a placeholder for compatibility with existing code
// This is NOT the actual Supabase client, but a REST API wrapper
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const result = await signInWithEmail(email, password);
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    signOut: async () => {
      try {
        const session = getCurrentSession();
        if (!session) return { error: null };
        await signOut(session);
        return { error: null };
      } catch (error) {
        return { error: error as Error };
      }
    },
    getSession: async () => {
      try {
        const session = getCurrentSession();
        return { data: { session }, error: null };
      } catch (error) {
        return { data: { session: null }, error: error as Error };
      }
    },
    getUser: async () => {
      try {
        const user = getCurrentUser();
        return { data: { user }, error: null };
      } catch (error) {
        return { data: { user: null }, error: error as Error };
      }
    },
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      const { unsubscribe } = onAuthStateChange(callback);
      return { data: { subscription: { unsubscribe } }, error: null };
    }
  },
  
  // Add database operations
  from: (table: string) => {
    return {
      // Insert data into a table
      insert: async (data: Record<string, any>, options?: { returning?: string }) => {
        try {
          const session = getCurrentSession();
          const endpoint = `/rest/v1/${table}`;
          const result = await supabaseRestCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: options?.returning 
              ? { 'Prefer': `return=${options.returning}` } 
              : undefined
          }, session);
          
          return result;
        } catch (error) {
          console.error(`Error inserting into ${table}:`, error);
          return { data: null, error: error as Error };
        }
      },
      
      // Select data from a table with optional query params
      select: async (columns: string = '*', options?: { 
        eq?: Record<string, any>,
        order?: { column: string, ascending?: boolean },
        limit?: number
      }) => {
        try {
          const session = getCurrentSession();
          let endpoint = `/rest/v1/${table}?select=${encodeURIComponent(columns)}`;
          
          // Add query parameters for filtering
          if (options?.eq) {
            Object.entries(options.eq).forEach(([key, value]) => {
              endpoint += `&${encodeURIComponent(key)}=eq.${encodeURIComponent(String(value))}`;
            });
          }
          
          // Add ordering
          if (options?.order) {
            const direction = options.order.ascending === false ? 'desc' : 'asc';
            endpoint += `&order=${encodeURIComponent(options.order.column)}.${direction}`;
          }
          
          // Add limit
          if (options?.limit) {
            endpoint += `&limit=${options.limit}`;
          }
          
          const result = await supabaseRestCall(endpoint, {
            method: 'GET'
          }, session);
          
          return result;
        } catch (error) {
          console.error(`Error selecting from ${table}:`, error);
          
          // For offline support or API errors, return mock data if available
          const mockData = getFallbackData(table);
          if (mockData && mockData.length > 0) {
            console.info(`Using fallback data for ${table}`);
            return { data: mockData, error: null };
          }
          
          return { data: null, error: error as Error };
        }
      },
      
      // Update data in a table
      update: async (data: Record<string, any>, options: { 
        eq: Record<string, any>,
        returning?: string 
      }) => {
        try {
          const session = getCurrentSession();
          let endpoint = `/rest/v1/${table}`;
          
          // Add query parameters for filtering which rows to update
          Object.entries(options.eq).forEach(([key, value], index) => {
            const prefix = index === 0 ? '?' : '&';
            endpoint += `${prefix}${encodeURIComponent(key)}=eq.${encodeURIComponent(String(value))}`;
          });
          
          const result = await supabaseRestCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: options.returning 
              ? { 'Prefer': `return=${options.returning}` } 
              : undefined
          }, session);
          
          return result;
        } catch (error) {
          console.error(`Error updating ${table}:`, error);
          return { data: null, error: error as Error };
        }
      },
      
      // Delete data from a table
      delete: async (options: { 
        eq: Record<string, any>,
        returning?: string 
      }) => {
        try {
          const session = getCurrentSession();
          let endpoint = `/rest/v1/${table}`;
          
          // Add query parameters for filtering which rows to delete
          Object.entries(options.eq).forEach(([key, value], index) => {
            const prefix = index === 0 ? '?' : '&';
            endpoint += `${prefix}${encodeURIComponent(key)}=eq.${encodeURIComponent(String(value))}`;
          });
          
          const result = await supabaseRestCall(endpoint, {
            method: 'DELETE',
            headers: options.returning 
              ? { 'Prefer': `return=${options.returning}` } 
              : undefined
          }, session);
          
          return result;
        } catch (error) {
          console.error(`Error deleting from ${table}:`, error);
          return { data: null, error: error as Error };
        }
      }
    };
  }
};

// Mock data for development and testing
const mockData: Record<string, any[]> = {
  consumption_logs: [
    {
      id: '1',
      user_id: 'user123',
      consumption_date: new Date().toISOString(),
      product_type: 'cigarettes',
      quantity: 5,
      unit: 'pieces',
      trigger: 'stress',
      location: 'home',
      mood: 'neutral',
      intensity: 7,
      notes: 'After difficult work call',
      created_at: new Date().toISOString()
    }
  ],
  progress_data: [
    {
      id: '1',
      user_id: 'user123',
      date: new Date().toISOString(),
      cravings: 5,
      cigarettes_avoided: 10,
      energy_level: 7,
      mood_score: 'positive'
    }
  ],
  nrt_products: [
    {
      id: '1',
      name: 'Nicotine Gum',
      type: 'gum',
      brand: 'NicoDerm',
      rating: 4.2,
      reviews: 156,
      price_range: '$15-30',
      description: 'Nicotine gum that helps reduce cravings',
      pros: ['Easy to use', 'Portable', 'Discreet'],
      cons: ['May cause jaw soreness', 'Taste issues for some users'],
      best_for: ['Work situations', 'Travel', 'New quitters'],
      image_url: 'https://placehold.co/400x300/png',
      strength_options: ['2mg', '4mg'],
      available: true
    }
  ]
};

// Export fallback mock data for offline development or testing
export const getFallbackData = (table: string) => {
  return mockData[table as keyof typeof mockData] || [];
};

// Mock data for consumption logs
const mockConsumptionLogs = [
  {
    id: '1',
    user_id: 'user123',
    consumption_date: new Date().toISOString(),
    product_type: 'cigarettes',
    quantity: 5,
    unit: 'pieces',
    trigger: 'stress',
    location: 'home',
    mood: 'neutral',
    intensity: 7,
    notes: 'After difficult work call',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user123',
    consumption_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    product_type: 'vaping',
    quantity: 3,
    unit: 'sessions',
    trigger: 'social',
    location: 'bar',
    mood: 'positive',
    intensity: 5,
    notes: 'With friends',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    user_id: 'user123',
    consumption_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    product_type: 'cigarettes',
    quantity: 4,
    unit: 'pieces',
    trigger: 'boredom',
    location: 'home',
    mood: 'neutral',
    intensity: 6,
    notes: 'Watching TV',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

// Mock progress data
const mockProgressData = [
  {
    id: '1',
    user_id: 'user123',
    date: new Date().toISOString(),
    cravings: 5,
    cigarettes_avoided: 10,
    energy_level: 7,
    mood_score: 'positive'
  },
  {
    id: '2',
    user_id: 'user123',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    cravings: 7,
    cigarettes_avoided: 8,
    energy_level: 6,
    mood_score: 'neutral'
  },
  {
    id: '3',
    user_id: 'user123',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    cravings: 9,
    cigarettes_avoided: 5,
    energy_level: 4,
    mood_score: 'negative'
  }
];

// Mock NRT products
const mockNRTProducts = [
  {
    id: '1',
    name: 'Nicotine Gum',
    type: 'gum',
    brand: 'NicoDerm',
    rating: 4.2,
    reviews: 156,
    price_range: '$15-30',
    description: 'Nicotine gum that helps reduce cravings',
    pros: ['Easy to use', 'Portable', 'Discreet'],
    cons: ['May cause jaw soreness', 'Taste issues for some users'],
    best_for: ['Work situations', 'Travel', 'New quitters'],
    image_url: 'https://placehold.co/400x300/png',
    strength_options: ['2mg', '4mg'],
    available: true,
    avg_rating: 4.2,
    review_count: 156
  },
  {
    id: '2',
    name: 'Nicotine Patch',
    type: 'patch',
    brand: 'Habitrol',
    rating: 4.5,
    reviews: 203,
    price_range: '$25-45',
    description: 'Daily patch that releases nicotine gradually',
    pros: ['Once-a-day application', 'Steady release', 'Works while sleeping'],
    cons: ['Skin irritation possible', 'Cannot adjust timing'],
    best_for: ['Heavy smokers', 'People who forget to take medication', 'Overnight cravings'],
    image_url: 'https://placehold.co/400x300/png',
    strength_options: ['7mg', '14mg', '21mg'],
    available: true,
    avg_rating: 4.5,
    review_count: 203
  }
];

// Mock alternative products
const mockAlternativeProducts = [
  {
    id: '1',
    name: 'Herbal Cigarettes',
    type: 'herbal',
    brand: 'GreenSmoke',
    rating: 3.8,
    reviews: 94,
    price_range: '$10-20',
    description: 'Nicotine-free herbal cigarettes for behavioral replacement',
    pros: ['No nicotine', 'Satisfies hand-to-mouth habit', 'Natural ingredients'],
    cons: ['Still produces tar', 'Smoke inhalation issues'],
    best_for: ['Addressing behavioral dependency', 'Social situations'],
    image_url: 'https://placehold.co/400x300/png',
    available: true
  },
  {
    id: '2',
    name: 'Quit Smoking App',
    type: 'digital',
    brand: 'QuitBuddy',
    rating: 4.7,
    reviews: 532,
    price_range: 'Free-$10',
    description: 'Mobile app with tracking, support and games',
    pros: ['Always available', 'Tracks progress', 'Community support'],
    cons: ['Requires smartphone', 'Battery usage'],
    best_for: ['Tech-savvy quitters', 'People wanting to track savings', 'Those needing reminders'],
    image_url: 'https://placehold.co/400x300/png',
    available: true
  }
];

// Mock guides
const mockGuides = [
  {
    id: '1',
    title: 'First Week Quitting Guide',
    type: 'beginner',
    category: 'guide',
    content: 'A comprehensive guide to handling your first week without smoking.',
    tags: ['beginner', 'withdrawal', 'coping strategies'],
    read_time: '8 min',
    premium: false
  },
  {
    id: '2',
    title: 'Managing Cravings in Social Settings',
    type: 'intermediate',
    category: 'guide',
    content: 'How to handle social situations that trigger smoking cravings.',
    tags: ['social', 'cravings', 'triggers'],
    read_time: '5 min',
    premium: false
  }
];

// Mock tasks
const mockTasks = [
  {
    id: '1',
    user_id: 'user123',
    title: 'Throw away all smoking products',
    description: 'Clear your home of cigarettes, lighters, and ashtrays',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user123',
    title: 'Download quit smoking app',
    description: 'Get a tracking app to monitor your progress',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    created_at: new Date().toISOString()
  }
];

// Helper function to filter mock data by table
const getMockDataByTable = (table: string) => {
  switch (table) {
    case 'consumption_logs':
      return mockConsumptionLogs;
    case 'progress_data':
      return mockProgressData;
    case 'nrt_products':
      return mockNRTProducts;
    case 'alternative_products':
      return mockAlternativeProducts;
    case 'guides':
      return mockGuides;
    case 'tasks':
      return mockTasks;
    default:
      return [];
  }
};

// Mock supabase client
export const supabaseMock = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        gte: (column: string, value: any) => ({
          lte: (column: string, value: any) => ({
            order: (column: string, { ascending }: { ascending: boolean }) => ({
              data: getMockDataByTable(table),
              error: null
            })
          })
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          data: getMockDataByTable(table).filter(item => (item as any)[column] === value),
          error: null
        }),
        maybeSingle: () => ({
          data: getMockDataByTable(table).find(item => (item as any)[column] === value) || null,
          error: null
        }),
        single: () => ({
          data: getMockDataByTable(table).find(item => (item as any)[column] === value) || null,
          error: null
        }),
        data: getMockDataByTable(table).filter(item => (item as any)[column] === value),
        error: null
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        data: getMockDataByTable(table),
        error: null
      }),
      data: getMockDataByTable(table),
      error: null
    }),
    insert: (data: any) => Promise.resolve({ 
      data: { ...data, id: `mock-${Date.now()}`, created_at: new Date().toISOString() }, 
      error: null 
    }),
    upsert: (data: any) => Promise.resolve({ 
      data: { ...data, id: data.id || `mock-${Date.now()}`, updated_at: new Date().toISOString() }, 
      error: null 
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ 
        data: { ...data, id: value, updated_at: new Date().toISOString() }, 
        error: null 
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ 
        data: { success: true }, 
        error: null 
      })
    })
  }),
  auth: {
    signOut: () => Promise.resolve({
      error: null
    })
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any) => Promise.resolve({
        data: { path: `${bucket}/${path}` },
        error: null
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://placehold.co/400x300/png` }
      })
    })
  }
};