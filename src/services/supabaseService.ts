
import { createClient } from '@supabase/supabase-js';

// Default to empty strings if env variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client that logs errors but doesn't crash the app
const createDummyClient = () => {
  // Return an object that mimics the Supabase client interface but returns empty data
  return {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    // Add other commonly used methods with appropriate fallbacks
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: 'Not configured' }),
        getPublicUrl: () => ({ publicURL: '' }),
      }),
    },
  };
};

// Determine if we should use a real or dummy client
const useRealClient = supabaseUrl && supabaseKey;

// Create and export the appropriate Supabase client
let supabase;

if (useRealClient) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = createDummyClient();
  }
} else {
  console.warn('Supabase credentials missing. Using dummy client. CSV data will be used instead.');
  supabase = createDummyClient();
}

export default supabase;
