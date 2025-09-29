import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,   // ✅ keeps user logged in
    autoRefreshToken: true, // ✅ refreshes tokens automatically
    detectSessionInUrl: true
  }
});
// Types
export interface Profile {
  id: string;
  email: string; 
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

export interface HealthAssessmentData {
  id: string;
  user_id: string;
  created_at: string;
  sleep_hours: number;
  stress_level: number;
  exercise_frequency: number;
  diet_quality: number;
  social_connection: number;
  health_score: number;
}

export interface MentalHealthResource {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  category: 'Article' | 'Exercise' | 'Video';
  url: string | null;
  content: string | null;
}
