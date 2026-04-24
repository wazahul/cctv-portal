// lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🛡️ Service Role Key sirf server par available hogi
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 🌐 1. PUBLIC CLIENT (For Frontend/Client Components)
 * Standard SSR compatible browser client.
 */
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * 🛡️ 2. ADMIN CLIENT (For API Routes & Server Actions)
 * Iska use wahan karein jahan Auth Rules bypass karne hon (e.g. Password Reset)
 * CRITICAL: NEVER import this into a 'use client' file.
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;