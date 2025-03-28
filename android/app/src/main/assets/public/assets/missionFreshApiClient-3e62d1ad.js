import { a as ue } from './AuthProvider-b0b4665b.js';

const SUPABASE_URL = "https://zoubqdwxemivxrjruvam.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs";
const supabaseRestCall = async (endpoint, options = {}, session) => {
  if (!session?.user?.id) {
    throw new Error("User must be authenticated to make API calls");
  }
  let correctedEndpoint = endpoint;
  if (!/\/rest\/v1\/[a-z_]+\d/.test(endpoint)) {
    correctedEndpoint = endpoint.replace(/\/rest\/v1\/([a-z_]+)(?!\d)/g, "/rest/v1/$18");
  }
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
    ...options.headers
  };
  try {
    const response = await fetch(`${SUPABASE_URL}${correctedEndpoint}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText
      }));
      const errorMessage = `API Error (${response.status}): ${error.message || response.statusText}`;
      console.error(`Supabase REST API error: ${errorMessage} for endpoint ${correctedEndpoint}`);
      ue.error(errorMessage);
      throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Supabase REST API call failed:", error);
    ue.error("Network error occurred. Please check your connection.");
    throw error;
  }
};
const getConsumptionLogs = async (session, startDate, endDate) => {
  if (!session?.user?.id) {
    throw new Error("User must be authenticated to fetch consumption logs");
  }
  try {
    let endpoint = `/rest/v1/consumption_logs8?user_id=eq.${session.user.id}`;
    if (startDate) {
      endpoint += `&consumption_date=gte.${startDate}`;
    }
    if (endDate) {
      endpoint += `&consumption_date=lte.${endDate}`;
    }
    endpoint += "&order=consumption_date.desc";
    const response = await supabaseRestCall(endpoint, {
      method: "GET",
      headers: {
        "Range": "0-100",
        "Prefer": "return=representation"
      }
    }, session);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error fetching consumption logs:", error);
    throw error;
  }
};
const saveConsumptionLog = async (log, session = null) => {
  try {
    const response = await supabaseRestCall("/rest/v1/consumption_logs8", {
      method: "POST",
      headers: {
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        ...log,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }, session);
    return response[0];
  } catch (error) {
    console.error("Error saving consumption log:", error);
    throw error;
  }
};
const getFinancialTracking = async (session, startDate, endDate) => {
  if (!session?.user?.id) {
    throw new Error("User must be authenticated to fetch financial tracking data");
  }
  try {
    let endpoint = `/rest/v1/financial_tracking8?user_id=eq.${session.user.id}`;
    if (startDate) {
      endpoint += `&date=gte.${startDate}`;
    }
    if (endDate) {
      endpoint += `&date=lte.${endDate}`;
    }
    endpoint += "&order=date.desc";
    const response = await supabaseRestCall(endpoint, {
      method: "GET",
      headers: {
        "Prefer": "return=representation"
      }
    }, session);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error fetching financial tracking:", error);
    throw error;
  }
};
const getWishlistItems = async (session) => {
  if (!session?.user?.id) {
    throw new Error("User must be authenticated to fetch wishlist items");
  }
  try {
    const response = await supabaseRestCall(`/rest/v1/wishlist_items8?user_id=eq.${session.user.id}&order=price.desc`, {
      method: "GET",
      headers: {
        "Prefer": "return=representation"
      }
    }, session);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    throw error;
  }
};
const createWishlistItem = async (item, session) => {
  if (!session?.user?.id) {
    throw new Error("User must be authenticated to create wishlist item");
  }
  try {
    const response = await supabaseRestCall("/rest/v1/wishlist_items8", {
      method: "POST",
      headers: {
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        ...item,
        user_id: session.user.id,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }, session);
    return response[0];
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    throw error;
  }
};
const updateWishlistItem = async (id, updates, session = null) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/wishlist_items8?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      })
    }, session);
    return response[0];
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    throw error;
  }
};
const getGuideArticles = async (category, slug, limit, offset, session) => {
  try {
    let endpoint = `/rest/v1/guide_articles?select=*`;
    if (category) {
      endpoint += `&category=eq.${category}`;
    }
    if (slug) {
      endpoint += `&tags=cs.{${slug}}`;
    }
    endpoint += `&order=published_at.desc&limit=${limit}&offset=${offset}`;
    return await supabaseRestCall(endpoint, {}, session);
  } catch (error) {
    console.error("Error fetching guide articles:", error);
    throw error;
  }
};
const getGuideArticle = async (slug, session) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/guide_articles?slug=eq.${slug}&limit=1`, {
      method: "GET"
    }, session);
    if (response && response.length > 0) {
      return response[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching guide article with slug ${slug}:`, error);
    throw error;
  }
};
const getGuideCategories = async (session) => {
  try {
    const response = await supabaseRestCall(`/rest/v1/guide_articles?select=category&published_at=not.is.null`, {
      method: "GET"
    }, session);
    const categories = [...new Set(response.map((item) => item.category))].filter(Boolean).sort();
    return categories;
  } catch (error) {
    console.error("Error fetching guide categories:", error);
    throw error;
  }
};

export { saveConsumptionLog as a, getConsumptionLogs as b, getFinancialTracking as c, getWishlistItems as d, createWishlistItem as e, getGuideCategories as f, getGuideArticle as g, getGuideArticles as h, supabaseRestCall as s, updateWishlistItem as u };
