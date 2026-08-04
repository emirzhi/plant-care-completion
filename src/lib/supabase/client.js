import {createClient} from "@supabase/supabase-js";

// create supabase client for interacting with the database

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default supabase;