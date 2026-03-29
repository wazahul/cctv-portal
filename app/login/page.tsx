"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Rocket, Lock, Mail, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog"; // 🚩 Path correctly updated

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- MASTER DIALOG STATE ---
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "danger" | "success" | "warning",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // 🛡️ Using Master Dialog instead of alert or text error
        setDialog({
          isOpen: true,
          title: "Access Denied",
          message: "The credentials provided do not match our secure records. Please verify your Admin ID and Secret Key.",
          type: "danger"
        });
        setLoading(false);
      } else {
        router.push("/admin"); 
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "System Error",
        message: "Unable to establish a secure connection with the terminal. Check your network.",
        type: "warning"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans text-left overflow-hidden">
      
      {/* 📱 Mobile Optimized Container */}
      <div className="w-full max-w-[420px] bg-white rounded-[50px] sm:rounded-[55px] p-8 sm:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* 🌈 Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 shrink-0"></div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-blue-50/50 p-5 rounded-[28px] mb-5 shadow-inner border border-blue-100 group transition-all active:scale-90">
             <Rocket className="text-blue-600 group-hover:-rotate-12 transition-transform" size={34} strokeWidth={2.5} />
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">Console Access</h1>
          <p className="text-slate-400 text-[9px] font-[1000] mt-4 tracking-[4px] uppercase opacity-80 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Terminal 2026
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-[1000] uppercase ml-6 tracking-[2px]">Admin ID / Email</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="admin@modernenterprises.com"
                className="w-full p-5 pl-14 bg-[#fcfdfe] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-bold text-slate-800 focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-[1000] uppercase ml-6 tracking-[2px]">Encrypted Secret Key</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="password" 
                required
                placeholder="••••••••••••"
                className="w-full p-5 pl-14 bg-[#fcfdfe] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-bold text-slate-800 focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[14px] uppercase tracking-[3px] mt-4 border-b-4 border-slate-950 active:border-b-0"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} strokeWidth={2.5} />} 
            {loading ? 'Authenticating...' : 'INITIALIZE ACCESS'}
          </button>
        </form>

        <div className="mt-10 text-center">
           <div className="h-[1px] w-10 bg-slate-100 mx-auto mb-5 rounded-full"></div>
           <p className="text-[9px] font-[1000] text-slate-300 uppercase tracking-[5px] italic leading-relaxed">
             System Monitor v4.0<br/>Authorized Personnel Only
           </p>
        </div>
      </div>

      {/* 🛡️ MASTER DIALOG INTEGRATION */}
      <MasterDialog 
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText="Retry Access"
      />

      <style jsx global>{`
        input::placeholder { color: #cbd5e1; font-weight: 700; letter-spacing: 0.5px; }
      `}</style>
    </div>
  );
}