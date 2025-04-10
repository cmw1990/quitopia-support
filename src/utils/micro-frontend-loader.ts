import { supabase } from '../integrations/supabase/client';

// Types of sharable resources
export interface SharedResources {
  auth: {
    supabase: typeof supabase;
    user: any | null;
    session: any | null;
  };
  services: {
    [key: string]: any;
  };
  utils: {
    [key: string]: any;
  };
}

// Global store for shared resources
let sharedResources: SharedResources | null = null;

// Initialize shared resources
export function initializeSharedResources(): SharedResources {
  if (sharedResources) {
    return sharedResources;
  }

  // Create shared resources only once
  sharedResources = {
    auth: {
      supabase, // Use the singleton supabase client
      user: null,
      session: null,
    },
    services: {},
    utils: {},
  };

  // Synchronize authentication state
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session && sharedResources) {
      sharedResources.auth.session = session;
      sharedResources.auth.user = session.user;
    }
  });

  // Listen for auth changes
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      console.log('User authenticated');
      loadPrivateModules();
    } else {
      console.log('User not authenticated');
      loadPublicModules();
    }
  });

  return sharedResources;
}

// Load micro-frontend and provide shared resources
export function loadMicroFrontend(name: string): { resources: SharedResources } {
  const resources = initializeSharedResources();
  console.log(`Loading micro-frontend: ${name} with shared resources`, resources);
  return { resources };
}

// Listen for auth changes
export function setupAuthListener() {
  // Set up the auth listener
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      console.log('User authenticated');
      loadPrivateModules();
    } else {
      console.log('User not authenticated');
      loadPublicModules();
    }
  });
  
  return data;
}

// Set up shared resources for micro-frontends
export function setupSharedResources() {
  // Initialize shared resources
  const sharedResources = {
    auth: {
      session: null,
      user: null,
    },
    api: {
      endpoints: apiEndpoints,
    },
    // Other shared resources
  };

  // Listen for auth changes
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (sharedResources) {
      sharedResources.auth.session = session;
      sharedResources.auth.user = session?.user || null;
    }
  });

  // Create the resources object
  const resources = {
    auth: sharedResources.auth,
    api: sharedResources.api,
  };

  // Return the shared resources
  return { resources };
}
