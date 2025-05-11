
import { createClient } from '@supabase/supabase-js';

// Default to empty strings if env variables are not available
// This prevents runtime errors, but service will be non-functional until proper values are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client if credentials are missing
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please make sure the environment variables are set correctly.');
}

// Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
