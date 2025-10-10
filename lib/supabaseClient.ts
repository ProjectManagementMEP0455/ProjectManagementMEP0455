import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// --- IMPORTANT SETUP STEP ---
// To get this application running, you MUST replace the placeholder values below
// with your actual Supabase project URL and public anon key.
//
// 1. Go to your Supabase project dashboard.
// 2. Navigate to Settings > API.
// 3. Copy the "Project URL" and paste it into `supabaseUrl`.
// 4. Copy the "public" key (also called the "anon" key) and paste it into `supabaseAnonKey`.
//
// It is highly recommended to use environment variables for these in a real production environment.
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

// The createClient function requires a valid URL format.
// The previous placeholder 'YOUR_SUPABASE_URL' was causing a crash on startup.
// These new placeholders are syntactically valid to prevent the crash,
// but the application will not function until you replace them with your real credentials.
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
