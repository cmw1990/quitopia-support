const SUPABASE_URL = "https://zoubqdwxemivxrjruvam.supabase.co" ;
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs" ;
const supabaseRestCall = async (endpoint, options = {}, session) => {
  const url = `${SUPABASE_URL}${endpoint}`;
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers || {}
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error("Supabase REST call failed:", error);
    throw error;
  }
};
const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || response.statusText;
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }
  return response;
};
const apiRequest = async (endpoint, method = "GET", body, session, queryParams) => {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : "count=exact"
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  const options = {
    method,
    headers
  };
  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(url.toString(), options);
    await handleApiError(response);
    return method === "DELETE" ? null : await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};
const getNicotineConsumptionLogs = async (userId, startDate, endDate, session) => {
  return apiRequest(
    "mission4_consumption_logs",
    "GET",
    void 0,
    session,
    {
      "user_id": `eq.${userId}`,
      "consumption_date": `gte.${startDate}&consumption_date=lte.${endDate}`,
      "order": "consumption_date.desc"
    }
  );
};
const addNicotineConsumptionLog = async (log, session) => {
  return apiRequest("mission4_consumption_logs", "POST", log, session);
};
const getNicotineProducts = async (filters, session) => {
  const queryParams = {
    "order": "brand.asc,name.asc",
    "limit": filters.limit?.toString() || "50",
    "offset": filters.offset?.toString() || "0"
  };
  if (filters.category) {
    queryParams["category"] = `eq.${filters.category}`;
  }
  if (filters.brand) {
    queryParams["brand"] = `eq.${filters.brand}`;
  }
  if (filters.nicotine_strength_min !== void 0) {
    queryParams["nicotine_strength"] = `gte.${filters.nicotine_strength_min}`;
  }
  if (filters.nicotine_strength_max !== void 0) {
    queryParams["nicotine_strength"] = `lte.${filters.nicotine_strength_max}`;
  }
  return apiRequest("mission4_products", "GET", void 0, session, queryParams);
};
const getUserProgress = async (userId, startDate, endDate, session) => {
  try {
    const userProfile = await getUserProfile(userId, session);
    const progressEntries = await getProgressData(userId, startDate, endDate, session);
    let smokeFreeStreak = 0;
    let streakBroken = false;
    const sortedEntries = [...progressEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const entry of sortedEntries) {
      if (entry.smoke_free) {
        smokeFreeStreak++;
      } else {
        streakBroken = true;
        break;
      }
    }
    let totalSavings = 0;
    if (userProfile?.quit_date && userProfile?.price_per_pack && userProfile?.daily_cigarettes) {
      const quitDate = new Date(userProfile.quit_date);
      const today = /* @__PURE__ */ new Date();
      const daysSinceQuit = Math.max(0, Math.floor((today.getTime() - quitDate.getTime()) / (1e3 * 60 * 60 * 24)));
      const packsPerDay = userProfile.daily_cigarettes / (userProfile.cigarettes_per_pack || 20);
      totalSavings = userProfile.price_per_pack * packsPerDay * daysSinceQuit;
    }
    let healthScore = 0;
    if (userProfile?.quit_date) {
      const quitDate = new Date(userProfile.quit_date);
      const today = /* @__PURE__ */ new Date();
      const daysSinceQuit = Math.max(0, Math.floor((today.getTime() - quitDate.getTime()) / (1e3 * 60 * 60 * 24)));
      if (daysSinceQuit <= 3) {
        healthScore = Math.min(30, daysSinceQuit * 10);
      } else if (daysSinceQuit <= 14) {
        healthScore = 30 + Math.min(20, (daysSinceQuit - 3) * 2);
      } else if (daysSinceQuit <= 90) {
        healthScore = 50 + Math.min(30, (daysSinceQuit - 14) * 0.4);
      } else {
        healthScore = 80 + Math.min(20, (daysSinceQuit - 90) * 0.07);
      }
    }
    return {
      userProfile: userProfile || void 0,
      progressEntries,
      smokeFreeStreak,
      totalSavings,
      healthScore
    };
  } catch (error) {
    console.error("Error getting user progress:", error);
    return {
      progressEntries: [],
      smokeFreeStreak: 0,
      totalSavings: 0,
      healthScore: 0
    };
  }
};
const addProgressEntry = async (entry, session) => {
  return apiRequest("mission4_progress", "POST", entry, session);
};
const getHealthImprovements = async (userId, session, quitDate) => {
  if (!quitDate) {
    try {
      const userProfile = await getUserProfile(userId, session);
      if (userProfile?.quit_date) {
        quitDate = userProfile.quit_date;
      }
    } catch (error) {
      console.error("Error getting user profile for health improvements:", error);
    }
  }
  try {
    const healthMilestones = await apiRequest(
      "mission4_health_milestones",
      "GET",
      void 0,
      session,
      { "order": "days_required.asc" }
    );
    if (!quitDate) {
      return healthMilestones.map((milestone) => ({
        ...milestone,
        achieved: false
      }));
    }
    const quitDateObj = new Date(quitDate);
    const today = /* @__PURE__ */ new Date();
    const daysSinceQuit = Math.max(0, Math.floor((today.getTime() - quitDateObj.getTime()) / (1e3 * 60 * 60 * 24)));
    return healthMilestones.map((milestone) => ({
      ...milestone,
      achieved: daysSinceQuit >= milestone.days_required
    }));
  } catch (error) {
    console.error("Error getting health improvements:", error);
    return [];
  }
};
const getUserProfile = async (userId, session) => {
  try {
    const data = await apiRequest(
      "mission4_user_profiles",
      "GET",
      void 0,
      session,
      { "user_id": `eq.${userId}` }
    );
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
const getProgressData = async (userId, startDate, endDate, session) => {
  try {
    const data = await apiRequest(
      "mission4_progress",
      "GET",
      void 0,
      session,
      {
        "user_id": `eq.${userId}`,
        "date": `gte.${startDate}&date=lte.${endDate}`,
        "order": "date.desc"
      }
    );
    return data || [];
  } catch (error) {
    console.error("Error fetching progress data:", error);
    return [];
  }
};
const shareProgressToSocial = async (userId, progressId, platform, message, session) => {
  try {
    if (!session?.access_token) {
      return {
        success: false,
        error: "Authentication required"
      };
    }
    let targetProgressId = progressId;
    if (progressId === "latest") {
      const latestEntries = await apiRequest(
        "mission4_progress",
        "GET",
        void 0,
        session,
        {
          "user_id": `eq.${userId}`,
          "order": "date.desc",
          "limit": "1"
        }
      );
      if (latestEntries && latestEntries.length > 0) {
        targetProgressId = latestEntries[0].id || "";
      } else {
        return {
          success: false,
          error: "No progress data available to share"
        };
      }
    }
    const shareData = {
      user_id: userId,
      progress_id: targetProgressId,
      platform,
      message,
      shared_at: (/* @__PURE__ */ new Date()).toISOString(),
      is_public: true
    };
    const shareResult = await apiRequest(
      "mission4_social_shares",
      "POST",
      shareData,
      session
    );
    if (shareResult && shareResult.length > 0) {
      try {
        await apiRequest(
          "mission4_social_share_analytics",
          "POST",
          {
            user_id: userId,
            share_id: shareResult[0].id,
            platform,
            content_type: "progress",
            share_date: (/* @__PURE__ */ new Date()).toISOString(),
            engagement_clicks: 0,
            engagement_likes: 0,
            engagement_shares: 0
          },
          session
        );
      } catch (analyticsError) {
        console.error("Failed to record share analytics:", analyticsError);
      }
      return {
        success: true,
        shareUrl: shareResult[0].share_url || `${window.location.origin}/share/${shareResult[0].id}`,
        shareId: shareResult[0].id,
        message: `Successfully shared to ${platform}`
      };
    }
    return {
      success: false,
      error: "Failed to create share record"
    };
  } catch (error) {
    console.error("Error in shareProgressToSocial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
const addConsumptionLog = async (log, session) => {
  return addNicotineConsumptionLog(log, session);
};
const getConsumptionLogs = async (userId, startDate, endDate, session) => {
  return getNicotineConsumptionLogs(userId, startDate, endDate, session);
};
const getAllProducts = async (session) => {
  return getNicotineProducts({}, session);
};
const syncHealthData = async (userId, healthData, session) => {
  try {
    if (healthData.steps) {
      await apiRequest(
        "mission4_step_data",
        "POST",
        {
          user_id: userId,
          date: healthData.steps.date,
          step_count: healthData.steps.step_count,
          distance: healthData.steps.distance,
          calories_burned: healthData.steps.calories_burned,
          source: healthData.steps.source || "manual"
        },
        session
      );
    }
    return {
      success: true,
      message: "Health data synchronized successfully"
    };
  } catch (error) {
    console.error("Error syncing health data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
const getCravingEntries = async (userId, startDate, endDate, session) => {
  try {
    return apiRequest(
      "mission4_craving_logs",
      "GET",
      void 0,
      session,
      {
        "user_id": `eq.${userId}`,
        "date": `gte.${startDate}&date=lte.${endDate}`,
        "order": "date.desc,time.desc"
      }
    );
  } catch (error) {
    console.error("Error fetching craving entries:", error);
    return [];
  }
};
const saveEnergyPlan = async (plan, session) => {
  try {
    return apiRequest(
      "mission4_energy_plans",
      "POST",
      plan,
      session
    );
  } catch (error) {
    console.error("Error saving energy plan:", error);
    throw error;
  }
};
const saveMoodSupportPlan = async (plan, session) => {
  try {
    return apiRequest(
      "mission4_mood_plans",
      "POST",
      plan,
      session
    );
  } catch (error) {
    console.error("Error saving mood support plan:", error);
    throw error;
  }
};
const saveFatigueManagementPlan = async (plan, session) => {
  try {
    return apiRequest(
      "mission4_fatigue_plans",
      "POST",
      plan,
      session
    );
  } catch (error) {
    console.error("Error saving fatigue management plan:", error);
    throw error;
  }
};

export { saveMoodSupportPlan as a, saveFatigueManagementPlan as b, getConsumptionLogs as c, getAllProducts as d, addConsumptionLog as e, syncHealthData as f, getCravingEntries as g, getUserProgress as h, getHealthImprovements as i, addProgressEntry as j, supabaseRestCall as k, getNicotineProducts as l, shareProgressToSocial as m, saveEnergyPlan as s };
