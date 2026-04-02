"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShieldAlert, Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    // 🛡️ BROWSER BAR FIX: Page load hote hi body overflow control
    document.body.style.overflow = authorized ? 'unset' : 'hidden';

    const checkUser = async () => {
      try {
        // 1. Current Session Check (Fastest)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.warn("Session Missing - Redirecting to Login");
          router.replace("/login");
          return;
        }

        // 2. Server-Side Verification (Securest)
        // getUser() call direct server se user data fetch karta hai, token refresh handle karne ke liye
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User verification failed:", userError?.message || "Auth session missing!");
          await supabase.auth.signOut(); // Purana token clear karein
          router.replace("/login");
          return;
        }

        // 🔐 ROLE-BASED ACCESS CHECK
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = user.user_metadata?.role || "user";
          
          if (!allowedRoles.includes(userRole)) {
            setErrorStatus("ACCESS_DENIED");
            // 2 second baad wapas home par bhej dena
            setTimeout(() => router.replace("/"), 2500);
            return;
          }
        }

        // ✅ Sab kuch sahi hai!
        setAuthorized(true);

      } catch (err) {
        console.error("Critical Auth Error:", err);
        router.replace("/login");
      }
    };

    checkUser();

    // 🔄 REALTIME AUTH LISTENER
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthorized(false);
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
      document.body.style.overflow = 'unset';
    };
  }, [router, allowedRoles, authorized]);

  // 🚫 1. Access Denied View (Premium Blueprint Style)
  if (errorStatus === "ACCESS_DENIED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffafa] p-6 text-center">
        <div className="bg-red-50 p-6 rounded-[35px] border-2 border-red-100 shadow-2xl shadow-red-100/50 animate-in zoom-in duration-500">
          <ShieldAlert size={60} className="text-red-500 mb-6 mx-auto animate-pulse" />
          <h2 className="text-2xl font-[1000] text-red-900 uppercase italic tracking-tighter leading-none">Access Denied</h2>
          <div className="h-1 w-20 bg-red-200 mx-auto my-4 rounded-full"></div>
          <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest leading-relaxed">
            Aapke paas is secure node <br/> ko access karne ki permission nahi hai.
          </p>
        </div>
      </div>
    );
  }

  // ⏳ 2. Loading View (Modern Enterprises Branding)
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600 mb-8" size={54} strokeWidth={2.5} />
          <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] text-blue-100" size={18} />
        </div>
        <p className="font-[1000] text-slate-900 text-[11px] uppercase tracking-[6px] italic animate-pulse">
          Securely Verifying Node...
        </p>
        <div className="mt-4 flex gap-1">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  // 🏗️ 3. Main Content
  return <>{children}</>;
}