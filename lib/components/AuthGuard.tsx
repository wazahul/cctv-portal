"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // getSession() session check karta hai aur agar zaroorat ho toh refresh bhi karta hai
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Agar refresh token invalid ho ya session na mile, toh seedha login par
          console.warn("Session error or expired:", error?.message);
          router.replace("/login");
          return;
        }

        // 🔐 Role-based access check
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = session.user.user_metadata?.role;
          
          if (!allowedRoles.includes(userRole)) {
            alert("Access Denied: You don't have permission to view this page.");
            router.replace("/"); 
            return;
          }
        }

        // ✅ Agar sab sahi hai, toh access de do
        setAuthorized(true);

      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      }
    };

    checkUser();
  }, [router, allowedRoles]);

  // Jab tak verification ho raha hai, loading dikhao
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={50} />
          <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px]">
            Verifying Access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}