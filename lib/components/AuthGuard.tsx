"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 🚫 Agar session nahi hai, login par bhejo
        router.replace("/login");
      } else {
        // ✅ Agar session hai, access allow karo
        setAuthorized(true);
      }
    };
    checkUser();
  }, [router]);

  // Jab tak check ho raha hai, Loading spinner dikhao
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