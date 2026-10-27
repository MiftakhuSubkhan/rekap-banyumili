/**
 * supabaseClient.js - Supabase Client Initialization & Config
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'banyumili_supabase_config';

/**
 * Get stored Supabase configuration
 */
export function getSupabaseConfig() {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (!raw) return null;
    const config = JSON.parse(raw);
    if (config.url && config.anonKey) {
      return config;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Save Supabase configuration
 */
export function saveSupabaseConfig(url, anonKey) {
  if (!url || !anonKey) {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    supabaseInstance = null;
    return;
  }
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  supabaseInstance = createClient(cleanUrl, cleanKey);
}

// Singleton client instance
let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  const config = getSupabaseConfig();
  if (config && config.url && config.anonKey) {
    supabaseInstance = createClient(config.url, config.anonKey);
    return supabaseInstance;
  }
  return null;
}
