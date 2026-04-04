"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Lock, Mail, Loader2, ShieldCheck, 
  Cpu, Fingerprint, ChevronRight, Activity
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
          isOpen: true, title: "Access Denied",
          message: "Security mismatch. Verify Operator ID & Passkey.",
          type: "danger"
        });
        setLoading(false);
      } else {
        router.push("/admin"); 
      }
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Error", message: "Terminal Offline.", type: "warning" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      
      {/* 🌌 Cyber Aura Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[100px]"></div>

      {/* 📟 The Elite Card */}
      <div className="w-full max-w-[430px] bg-[#0f172a]/40 backdrop-blur-3xl rounded-[60px] p-10 sm:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* 📟 Header Section */}
        <div className="flex flex-col items-center mb-12 text-center text-left">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-[35px] blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-7 rounded-[35px] border border-white/10 shadow-2xl group transition-all hover:rotate-6 cursor-pointer">
              <Cpu className="text-blue-400" size={40} strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-[32px] font-[1000] text-white tracking-tighter uppercase italic leading-none">
            Modern <span className="text-blue-500 italic">Sentinel</span>
          </h1>

          {/* 🛡️ Sleek Branded Badge (Clean Style) */}
          <div className="flex items-center gap-3 mt-6">
            <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-blue-500/40"></div>
            <div className="flex items-center gap-2">
              <Activity size={10} className="text-blue-500 animate-pulse" />
              <span className="text-[9px] font-[1000] text-blue-400/80 uppercase tracking-[4px] italic">
                Advanced Surveillance Systems
              </span>
            </div>
            <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-blue-500/40"></div>
          </div>
        </div>

        {/* 📝 Form Section */}
        <form onSubmit={handleLogin} className="space-y-8 text-left">
          <div className="space-y-3">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-8 tracking-[4px]">Operator Link</label>
            <div className="relative group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-all" size={20} />
              <input type="email" required placeholder="ADMIN@MODERN.PRO" className="w-full p-6 pl-18 bg-white/[0.03] border-2 border-white/5 rounded-[30px] outline-none text-[15px] font-bold text-white focus:border-blue-500/30 focus:bg-white/[0.05] transition-all placeholder:text-slate-800" onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] text-slate-500 font-black uppercase ml-8 tracking-[4px]">Private Passkey</label>
            <div className="relative group">
              <Fingerprint className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-all" size={20} />
              <input type="password" required placeholder="••••••••••••" className="w-full p-6 pl-18 bg-white/[0.03] border-2 border-white/5 rounded-[30px] outline-none text-[15px] font-bold text-white focus:border-blue-500/30 focus:bg-white/[0.05] transition-all placeholder:text-slate-800" onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[1000] py-6 rounded-[35px] flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] active:scale-95 active:translate-y-1 transition-all disabled:opacity-50 text-[15px] uppercase tracking-[6px] mt-6 border-b-[6px] border-blue-900 active:border-b-0 italic">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <ShieldCheck size={22} />} 
            <span>{loading ? 'Verifying...' : 'Initialize'}</span>
            <ChevronRight size={18} className="absolute right-10 opacity-30" />
          </button>
        </form>

        {/* 🏢 Branded Footer */}
        <div className="mt-14 pt-10 border-t border-white/5 text-center">
   <p className="text-[10px] leading-relaxed text-slate-500 font-bold italic uppercase tracking-[2px] opacity-40 px-6 mb-6">
     High-Integrity Security & Surveillance Monitoring Systems.
   </p>
   
   <p className="text-[9px] font-[1000] uppercase tracking-[6px] italic cursor-default">
     <span 
       onClick={() => router.push('/signup')}
       className="text-blue-500/30 hover:text-blue-400 transition-all cursor-pointer active:scale-90 px-2 py-1"
       title="Operator Registration" >
       &copy; 2026
     </span>

     <span className="text-slate-700 ml-2 tracking-[8px]">
       Modern Enterprises
     </span>
   </p>
</div>

      </div>

      {/* Linked MasterDialog */}
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
        input:-webkit-autofill {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}