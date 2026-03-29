// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'; // 👈 Ye line zaroori hai

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,      // Session ko browser mein save rakhta hai
      autoRefreshToken: true,    // Token expire hone par apne aap naya mangwa leta hai
      detectSessionInUrl: true,  // Email login ya OAuth ke liye zaroori hai
      storageKey: 'modern-ent-auth', // Optional: Unique key taaki doosre apps se clash na ho
      storage: typeof window !== 'undefined' ? window.localStorage : undefined, 
    }
  }
);