import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Only available on Server

/**
 * 🌐 1. PUBLIC CLIENT (For Frontend/Client Components)
 * Ye client browser mein auth aur realtime handle karega.
 */
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * 🛡️ 2. ADMIN CLIENT (For API Routes & Server Actions)
 * Ye client authentication ko bypass kar sakta hai. 
 * Iska istemal sirf backend files (.ts) mein karein.
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * 💡 TIP: 
 * Client Components mein "supabase" use karein.
 * API Routes (app/api/...) mein "supabaseAdmin" use karein.
 */