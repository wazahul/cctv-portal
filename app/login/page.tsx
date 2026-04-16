"use client";
// app/login/page.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import { useRouter } from "next/navigation";
import { 
  Mail, Loader2, ShieldCheck, Cpu, Fingerprint, Activity
} from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email, password,
      });
      if (signInError) {
        setDialog({
          isOpen: true, title: "🚨 Access Denied",
          message: "Security mismatch. Verify Operator ID & Passkey.",
          type: "danger"
        });
        setLoading(false);
      } else {
        router.push("/admin"); 
      }
    } catch (err: any) {
      setDialog({ isOpen: true, title: "📡 Terminal Offline", message: "System link failure.", type: "warning" });
      setLoading(false);
    }
  };

  return (
    /* 🔒 FIX: h-[100dvh] aur overflow-hidden se background scroll band ho jayega */
    <div className="h-[100dvh] w-screen bg-[#020617] flex items-center justify-center p-6 font-sans relative overflow-hidden fixed inset-0">
      
      {/* 🌑 Deep Background Accent */}
      <div className="absolute inset-0 bg-[#020617]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_#1e293b_0%,_transparent_50%)] opacity-20"></div>

      {/* 📟 The Solid Terminal Card */}
      <div className="w-full max-w-[440px] bg-[#0f172a] rounded-[50px] p-8 sm:p-12 shadow-[20px_20px_60px_#01040a,_-20px_-20px_60px_#03081e] border border-slate-800 relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* 🏗️ Header Section */}
        <div className="flex flex-col mb-8 text-left">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e293b] p-3 rounded-2xl border border-slate-700 shadow-lg shrink-0">
              <Cpu className="text-blue-500" size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[22px] sm:text-[26px] font-[1000] text-white tracking-tighter uppercase italic leading-none">
                Modern <span className="text-blue-500 italic">Sentinel</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Activity size={10} className="text-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] italic leading-none">
                  Surveillance System
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 📝 Form Section */}
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px] flex items-center gap-2">
              <Mail size={12} className="text-blue-500/40" /> Operator Email
            </label>
            <input 
              type="email" 
              required 
              placeholder="Ex: operator@gmail.com" 
              className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500/50 transition-all placeholder:text-slate-800 shadow-inner" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px] flex items-center gap-2">
              <Fingerprint size={12} className="text-blue-500/40" /> Private Passkey
            </label>
            <input 
              type="password" 
              required 
              placeholder="••••••••••••" 
              className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500/50 transition-all placeholder:text-slate-800 shadow-inner" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[1000] py-4.5 rounded-[30px] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all disabled:opacity-50 text-[14px] uppercase tracking-[5px] mt-6 border-b-[5px] border-blue-900 active:border-b-0 italic"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
            <span>{loading ? 'Initializing...' : 'Initialize Access'}</span>
          </button>
        </form>

        {/* 🏢 Branded Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-left">
          <p className="text-[9px] font-[1000] uppercase tracking-[6px] italic text-slate-600">
            <span 
              onClick={() => router.push('/signup')}
              className="hover:text-blue-500 transition-all cursor-pointer px-1" >
              &copy; {COMPANY?.branding?.copyRightYear || "2026"}
            </span>
            <span className="ml-2 tracking-[4px]">{COMPANY?.name || "Modern Enterprises"}</span>
          </p>
        </div>
      </div>

      <MasterDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type} 
      />
    </div>
  );
}