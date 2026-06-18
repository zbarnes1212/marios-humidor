// /lib/mario/validateMarioAccess.ts
// Server-side membership validation for all Mario requests.
// Called by /api/chat before any prompt is built or Claude is contacted.
// If this returns false, the request is rejected with a 403 — no exceptions.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function validateMarioAccess(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  if (!userId) {
    return { allowed: false, reason: "No user ID provided" };
  }

  try {
    // Use service role key so RLS doesn't block the read
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("profiles")
      .select("membership_tier")
      .eq("id", userId)
      .single();

    if (error || !data) {
      // No profile row = free user, no access
      return { allowed: false, reason: "No profile found" };
    }

    if (data.membership_tier !== "pro") {
      return { allowed: false, reason: "Free tier — upgrade required" };
    }

    return { allowed: true };

  } catch (e) {
    console.error("[validateMarioAccess] error:", e);
    return { allowed: false, reason: "Validation error" };
  }
}
