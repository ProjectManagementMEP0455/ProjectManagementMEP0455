import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// Read credentials from localStorage.
const supabaseUrl = localStorage.getItem('supabaseUrl');
const supabaseAnonKey = localStorage.getItem('supabaseAnonKey');

// If credentials are not found in localStorage (e.g., on first load),
// we use valid placeholder values to initialize the client. This prevents the
// app from crashing on startup with a "supabaseUrl is required" error.
// The App.tsx component has logic to detect that the app is not configured
// and will show the SetupPage, so this placeholder client is never used for API calls.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);
