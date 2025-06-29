// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Anon Key from environment variables.
// The `!` asserts that these variables are definitely set.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single, exported Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
