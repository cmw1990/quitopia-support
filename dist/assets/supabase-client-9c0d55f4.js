const SUPABASE_URL = "https://zoubqdwxemivxrjruvam.supabase.co" ;
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs" ;
const supabaseRestCall = async (endpoint, options = {}, session) => {
  try {
    const headers = {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": session ? `Bearer ${session.access_token}` : `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...options.headers
    };
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText
      }));
      throw new Error(`API Error (${response.status}): ${error.message || response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Supabase REST API call failed:", error);
    throw error;
  }
};
const signInWithEmail = async (email, password) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.message || "Login failed");
  }
  const data = await response.json();
  return {
    session: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      expires_in: data.expires_in,
      token_type: data.token_type || "bearer",
      user: data.user
    },
    user: data.user
  };
};
const signOut = async (session) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || error.message || "Logout failed");
  }
  return true;
};
const getCurrentSession = async () => {
  const storedSession = localStorage.getItem("supabase.auth.token");
  if (!storedSession)
    return null;
  try {
    const parsedSession = JSON.parse(storedSession);
    if (parsedSession.currentSession) {
      return parsedSession.currentSession;
    }
  } catch (e) {
    console.error("Error parsing stored session:", e);
  }
  return null;
};
const getCurrentUser = async () => {
  const session = await getCurrentSession();
  if (!session)
    return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${session.access_token}`
    }
  });
  if (!response.ok)
    return null;
  const data = await response.json();
  return data;
};
const onAuthStateChange = (callback) => {
  const session = getCurrentSession();
  session.then((currentSession) => {
    callback("INITIAL", currentSession);
  });
  const storageListener = (event) => {
    if (event.key === "supabase.auth.token") {
      getCurrentSession().then((updatedSession) => {
        callback(updatedSession ? "SIGNED_IN" : "SIGNED_OUT", updatedSession);
      });
    }
  };
  window.addEventListener("storage", storageListener);
  return {
    unsubscribe: () => {
      window.removeEventListener("storage", storageListener);
    }
  };
};
const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }) => {
      try {
        const result = await signInWithEmail(email, password);
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        const session = await getCurrentSession();
        if (!session)
          return { error: null };
        await signOut(session);
        localStorage.removeItem("supabase.auth.token");
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    getSession: async () => {
      try {
        const session = await getCurrentSession();
        return { data: { session }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },
    getUser: async () => {
      try {
        const user = await getCurrentUser();
        return { data: { user }, error: null };
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    onAuthStateChange: (callback) => {
      const { unsubscribe } = onAuthStateChange(callback);
      return { data: { subscription: { unsubscribe } }, error: null };
    }
  },
  // Add database operations
  from: (table) => {
    return {
      // Insert data into a table
      insert: async (data, options) => {
        try {
          const session = await getCurrentSession();
          const endpoint = `/rest/v1/${table}`;
          const result = await supabaseRestCall(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
            headers: options?.returning ? { "Prefer": `return=${options.returning}` } : void 0
          }, session);
          return { data: result, error: null };
        } catch (error) {
          console.error(`Error inserting into ${table}:`, error);
          return { data: null, error };
        }
      },
      // Select data from a table with optional query params
      select: async (columns = "*", options) => {
        try {
          const session = await getCurrentSession();
          let endpoint = `/rest/v1/${table}?select=${columns}`;
          if (options?.eq) {
            for (const [key, value] of Object.entries(options.eq)) {
              endpoint += `&${key}=eq.${value}`;
            }
          }
          if (options?.order) {
            const direction = options.order.ascending === false ? "desc" : "asc";
            endpoint += `&order=${options.order.column}.${direction}`;
          }
          if (options?.limit) {
            endpoint += `&limit=${options.limit}`;
          }
          const result = await supabaseRestCall(endpoint, {
            method: "GET"
          }, session);
          return { data: result, error: null };
        } catch (error) {
          console.error(`Error selecting from ${table}:`, error);
          return { data: null, error };
        }
      }
    };
  }
};
({
  consumption_logs: [
    {
      id: "1",
      user_id: "user123",
      consumption_date: (/* @__PURE__ */ new Date()).toISOString(),
      product_type: "cigarettes",
      quantity: 5,
      unit: "pieces",
      trigger: "stress",
      location: "home",
      mood: "neutral",
      intensity: 7,
      notes: "After difficult work call",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  progress_data: [
    {
      id: "1",
      user_id: "user123",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      cravings: 5,
      cigarettes_avoided: 10,
      energy_level: 7,
      mood_score: "positive"
    }
  ],
  nrt_products: [
    {
      id: "1",
      name: "Nicotine Gum",
      type: "gum",
      brand: "NicoDerm",
      rating: 4.2,
      reviews: 156,
      price_range: "$15-30",
      description: "Nicotine gum that helps reduce cravings",
      pros: ["Easy to use", "Portable", "Discreet"],
      cons: ["May cause jaw soreness", "Taste issues for some users"],
      best_for: ["Work situations", "Travel", "New quitters"],
      image_url: "https://placehold.co/400x300/png",
      strength_options: ["2mg", "4mg"],
      available: true
    }
  ]
});
[
  {
    id: "1",
    user_id: "user123",
    consumption_date: (/* @__PURE__ */ new Date()).toISOString(),
    product_type: "cigarettes",
    quantity: 5,
    unit: "pieces",
    trigger: "stress",
    location: "home",
    mood: "neutral",
    intensity: 7,
    notes: "After difficult work call",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "2",
    user_id: "user123",
    consumption_date: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(),
    // yesterday
    product_type: "vaping",
    quantity: 3,
    unit: "sessions",
    trigger: "social",
    location: "bar",
    mood: "positive",
    intensity: 5,
    notes: "With friends",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString()
  },
  {
    id: "3",
    user_id: "user123",
    consumption_date: new Date(Date.now() - 48 * 60 * 60 * 1e3).toISOString(),
    // 2 days ago
    product_type: "cigarettes",
    quantity: 4,
    unit: "pieces",
    trigger: "boredom",
    location: "home",
    mood: "neutral",
    intensity: 6,
    notes: "Watching TV",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1e3).toISOString()
  }
];
[
  {
    id: "1",
    user_id: "user123",
    date: (/* @__PURE__ */ new Date()).toISOString(),
    cravings: 5,
    cigarettes_avoided: 10,
    energy_level: 7,
    mood_score: "positive"
  },
  {
    id: "2",
    user_id: "user123",
    date: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(),
    cravings: 7,
    cigarettes_avoided: 8,
    energy_level: 6,
    mood_score: "neutral"
  },
  {
    id: "3",
    user_id: "user123",
    date: new Date(Date.now() - 48 * 60 * 60 * 1e3).toISOString(),
    cravings: 9,
    cigarettes_avoided: 5,
    energy_level: 4,
    mood_score: "negative"
  }
];
[
  {
    id: "1",
    user_id: "user123",
    title: "Throw away all smoking products",
    description: "Clear your home of cigarettes, lighters, and ashtrays",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString(),
    completed: false,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "2",
    user_id: "user123",
    title: "Download quit smoking app",
    description: "Get a tracking app to monitor your progress",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3).toISOString(),
    completed: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];

export { signInWithEmail as a, signOut as b, getCurrentSession as g, onAuthStateChange as o, supabase as s };
