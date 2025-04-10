import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_KEY = supabaseAnonKey;

interface SupabaseRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  tableName: string;
  data?: any;
  options?: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  };
}

interface SupabaseResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: number;
}

// Create supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true
    }
});

// Export the supabase client
export const supabase = supabaseClient;

export async function supabaseRequest<T = any>(config: SupabaseRequestConfig): Promise<SupabaseResponse<T>> {
  const session = localStorage.getItem('supabase.auth.token');
  let token = SUPABASE_KEY;
  
  if (session) {
    try {
      const { access_token } = JSON.parse(session);
      token = access_token;
    } catch (error) {
      console.error('Error parsing session token:', error);
      localStorage.removeItem('supabase.auth.token');
    }
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...config.options?.headers,
  };

  try {
    const response = await fetch(`${SUPABASE_URL}${config.tableName}`, {
      method: config.method,
      headers,
      ...(config.data && { body: JSON.stringify(config.data) }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
      status: 500,
    };
  }
}

export const getBaseHeaders = (token: string | null) => ({
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${token || SUPABASE_KEY}`
});

export const getCurrentUser = async () => {
  const session = localStorage.getItem('supabase.auth.token');
  if (!session) return null;
  try {
    const parsedSession = JSON.parse(session);
    return parsedSession?.user || null;
  } catch (error) {
    console.error('Error parsing session token:', error);
    localStorage.removeItem('supabase.auth.token');
    return null;
  }
}

export const fetchUserProfile = async (userId: string) => {
  const session = localStorage.getItem('supabase.auth.token');
  if (!session) throw new Error('No authentication token found');
  const {access_token} = JSON.parse(session);
  const headers = getBaseHeaders(access_token);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {headers});
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const session = localStorage.getItem('supabase.auth.token');
  if (!session) throw new Error('No authentication token found');
  const {access_token} = JSON.parse(session);
   const headers = getBaseHeaders(access_token);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const session = localStorage.getItem('supabase.auth.token');
  if (!session) throw new Error('No authentication token found');
  const {access_token} = JSON.parse(session);
   const headers = getBaseHeaders(access_token);

  const storageUrl = `https://api.supabase.com/storage/v1/object/${bucket}/${path}`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(storageUrl, {
    method: 'POST',
    headers: {
     ...headers,
      'Authorization': `Bearer ${access_token}`
    },
    body: formData
  });

  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
   const storageResult = await response.json();
   return storageResult;
};

export const listenToChannel = (channelName: string, eventName: string, callback: (payload: any) => void
) => {
  const session = localStorage.getItem('supabase.auth.token');
  if (!session) return () => {};

  // const channel = supabase.channel(channelName);

  // channel.on(
  //   'postgres_changes',
  //   { event: eventName, schema: 'public', table: 'messages' },
  //   payload => {
  //     callback(payload);
  //   }
  // )
  // .subscribe()

  // return () => {
  //   supabase.removeChannel(channel)
  // }
};
