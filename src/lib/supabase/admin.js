import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Supabase URL or Service Role Key is not defined in environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    return supabase;
}