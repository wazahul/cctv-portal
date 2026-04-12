// aap/lib/supabaseClient.ts - 
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 🛡️ Admin Client (Server-side updates ke liye)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl || '', supabaseServiceKey) 
  : null;

// 🌐 Public Client (Frontend ke liye)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'modern-ent-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined, 
    }
  }
);