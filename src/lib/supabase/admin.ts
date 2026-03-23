import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Server-only admin client using the service role key.
 * Bypasses RLS — use only in route handlers / server actions.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
