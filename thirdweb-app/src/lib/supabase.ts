import { createClient } from '@supabase/supabase-js';

// Create a singleton Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Export a function to get the client to ensure it's only created in browser context
export const getSupabaseClient = () => {
  // Ensure we're only creating the client in browser context
  if (typeof window === 'undefined') {
    throw new Error('Supabase client cannot be created in server context');
  }
  
  return createSupabaseClient();
}; 