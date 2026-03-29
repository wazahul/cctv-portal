"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // 1. Pehle current session check karein
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // 🚩 Agar session error hai ya session hi nahi hai
        if (sessionError || !session) {
          console.warn("No active session found, redirecting...");
          router.replace("/login");
          return;
        }

        // 2. SERVER-SIDE VERIFICATION: getUser() refresh token issues ko fix karta hai
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          // Token expire ho chuka hai aur refresh nahi ho raha
          console.error("User verification failed:", userError?.message);
          await supabase.auth.signOut(); // Purana kachra saaf karein
          router.replace("/login");
          return;
        }

        // 🔐 ROLE-BASED ACCESS CHECK
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = user.user_metadata?.role || "user";
          
          if (!allowedRoles.includes(userRole)) {
            setErrorStatus("ACCESS_DENIED");
            setTimeout(() => router.replace("/"), 2000);
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

    // 🔄 REALTIME AUTH LISTENER: Agar doosre tab mein logout ho, toh yahan bhi update ho jaye
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthorized(false);
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, allowedRoles]);

  // 🚫 Access Denied View
  if (errorStatus === "ACCESS_DENIED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
        <ShieldAlert size={60} className="text-red-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-[1000] text-red-700 uppercase italic">Access Denied</h2>
        <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
          Aapke paas is page ko dekhne ki permission nahi hai.
        </p>
      </div>
    );
  }

  // ⏳ Loading View
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px] animate-pulse">
          Securely Verifying Node...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}