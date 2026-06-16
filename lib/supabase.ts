// lib/supabase.ts
// Singleton Supabase client — prevents multiple GoTrueClient instances
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton map — one client per token
const clientCache = new Map<string, SupabaseClient>();

export function getSupabaseClient(token: string | null): SupabaseClient {
  const key = token || "anon";
  if (!clientCache.has(key)) {
    clientCache.set(key, createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: { persistSession: false },
    }));
  }
  return clientCache.get(key)!;
}

// Anonymous client for public reads (cigar catalog etc)
export const supabase = getSupabaseClient(null);
