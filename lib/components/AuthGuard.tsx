"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // 👈 Ye interface Vercel build error ko fix karega
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 🚫 Agar session nahi hai, seedha login par bhejo
        router.replace("/login");
        return;
      }

      // 🔐 Role-based access check
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = session.user.user_metadata?.role; // Supabase user metadata se role nikaalna
        
        if (!allowedRoles.includes(userRole)) {
          // 🚫 Agar role match nahi karta, unauthorized page ya home par bhejo
          alert("Access Denied: You don't have permission to view this page.");
          router.replace("/"); 
          return;
        }
      }

      // ✅ Sab sahi hai, access allow karo
      setAuthorized(true);
    };

    checkUser();
  }, [router, allowedRoles]);

  // Jab tak check ho raha hai, ya unauthorized hai, Loading spinner dikhao
  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={50} />
        <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px]">
          Verifying Access...
        </p>
      </div>
    );
  }

  // Agar authorized hai, toh page ka content dikhao
  return <>{children}</>;
}