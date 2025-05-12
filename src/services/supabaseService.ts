
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://joosschalkvupfzhijid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb3NzY2hhbGt2dXBmemhpamlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5Nzg2NDYsImV4cCI6MjA2MjU1NDY0Nn0.qIwox1KLPZ-3BqU6zS-3YLXgbXuF0v91MyW39U7l2XY';

// Create a Supabase client with the appropriate types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export the supabase client for use throughout the application
export default supabase;
