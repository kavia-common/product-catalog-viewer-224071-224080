//
// Supabase client initialization with safe environment handling and feature flag fallback
//

import { createClient } from "@supabase/supabase-js";

// PUBLIC_INTERFACE
export function getSupabaseConfig() {
  /**
   * Returns sanitized Supabase configuration from environment variables.
   * Does NOT log or expose secrets.
   *
   * - REACT_APP_SUPABASE_URL
   * - REACT_APP_SUPABASE_ANON_KEY
   * - REACT_APP_FEATURE_FLAGS: supports "mock_api" to force mock mode
   */
  const cfg = {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
    flags: (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase(),
  };
  return cfg;
}

let cachedClient = null;

// PUBLIC_INTERFACE
export function getSupabaseClient() {
  /**
   * Returns a singleton Supabase client if URL and KEY are provided.
   * If not configured, returns null so callers can gracefully fallback to mock or HTTP API.
   */
  if (cachedClient) return cachedClient;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
