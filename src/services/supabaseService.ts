
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please make sure the environment variables are set correctly.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
