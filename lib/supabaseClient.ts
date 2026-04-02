// lib/supabaseClient.ts (Refined Version)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🛡️ Guard: Agar variables miss ho rahe hain toh terminal mein alert karega
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE MISSING: Check your .env.local or Vercel Environment Variables.");
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'modern-ent-auth',
      // Is line se server-side rendering (SSR) mein error nahi aayega
      storage: typeof window !== 'undefined' ? window.localStorage : undefined, 
    }
  }
);