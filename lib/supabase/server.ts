import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // ignorado em server components (apenas route handlers/server actions podem setar)
        }
      },
    },
  });
}

export function createSupabaseService() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRole(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
