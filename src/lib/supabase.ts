import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (() => {
  throw new Error('VITE_SUPABASE_URL is not defined in .env file. Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
})();

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (() => {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in .env file. Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
})();

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);