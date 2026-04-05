"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/components/AuthGuard";
import { 
  Lock, Mail, Loader2, ShieldCheck, 
  User, Cpu, Activity, ArrowLeft
} from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any,
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'engineer', 
            display_name: fullName.toUpperCase()
          }
        }
      });

      if (error) throw error;

      setDialog({
        isOpen: true,
        title: "✅ Registration Success",
        message: "Operator profile created. Please verify your email to activate the node.",
        type: "success"
      });
      
      setEmail(""); setPassword(""); setFullName("");
      
    } catch (err: any) {
      setDialog({ 
        isOpen: true, 
        title: "🚨 System Error", 
        message: err.message || "Registration failed. Try again.", 
        type: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      {/* 🔒 FIXED: Scroll-Locked Background Container */}
      <div className="h-[100dvh] w-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden fixed inset-0">
        
        {/* 🌑 Deep Background Accent */}
        <div className="absolute inset-0 bg-[#020617]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_#1e293b_0%,_transparent_50%)] opacity-20"></div>

        {/* 📟 The Solid Terminal Card */}
        <div className="w-full max-w-[460px] bg-[#0f172a] rounded-[55px] p-10 sm:p-14 shadow-[20px_20px_60px_#01040a,_-20px_-20px_60px_#03081e] border border-slate-800 relative z-10 animate-in fade-in zoom-in duration-500">
          
          {/* 📟 BACK TO TERMINAL (Top Position) */}
          <button 
            onClick={() => router.push('/login')} 
            className="absolute top-10 left-10 text-slate-600 hover:text-blue-400 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Back</span>
          </button>

          {/* 🏗️ Header Section */}
          <div className="flex flex-col mb-10 text-left pt-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#1e293b] p-3 rounded-2xl border border-slate-700 shadow-xl shrink-0">
                <User className="text-blue-400" size={28} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-[22px] sm:text-[26px] font-[1000] text-white tracking-tighter uppercase italic leading-none">
                  New <span className="text-blue-500 italic">Operator</span>
                </h1>
                <div className="flex items-center gap-2 mt-2.5">
                  <Activity size={10} className="text-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[3px] italic leading-none">
                    Access Setup
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 📝 Form Section */}
          <form onSubmit={handleSignup} className="space-y-4 text-left">
            
            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px] flex items-center gap-2">
                <User size={12} className="text-blue-500/40" /> Full Name
              </label>
              <input 
                type="text" 
                required 
                placeholder="wazahul" 
                className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500/50 transition-all placeholder:text-slate-800 shadow-inner" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px] flex items-center gap-2">
                <Mail size={12} className="text-blue-500/40" /> Operator Email
              </label>
              <input 
                type="email" 
                required 
                placeholder="Ex: operator@gmail.com" 
                className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500/50 transition-all placeholder:text-slate-800 shadow-inner" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px] flex items-center gap-2">
                <Lock size={12} className="text-blue-500/40" /> Private Passkey
              </label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500/50 transition-all placeholder:text-slate-800 shadow-inner" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {/* Action Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[1000] py-5 rounded-[30px] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all disabled:opacity-50 text-[14px] uppercase tracking-[5px] mt-6 border-b-[6px] border-blue-900 active:border-b-0 italic"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
              <span>{loading ? 'Processing...' : 'Register Operator'}</span>
            </button>
          </form>

          {/* 🏢 Branded Footer */}
          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col items-center gap-4">
            
            <div className="flex flex-row items-center justify-center gap-2 text-[9px] font-[1000] uppercase tracking-[6px] italic">
              <span 
                onClick={() => window.open(COMPANY.links.linktree, '_blank')}
                className="text-blue-500/40 hover:text-blue-400 transition-all cursor-pointer active:scale-90 whitespace-nowrap"
              >
                &copy; {COMPANY.branding.copyRightYear}
              </span>
              <span className="text-slate-700 tracking-[8px] cursor-default whitespace-nowrap">
                {COMPANY.name}
              </span>
            </div>
          </div>
        </div>

        <MasterDialog 
          isOpen={dialog.isOpen} 
          onClose={() => { setDialog(prev => ({ ...prev, isOpen: false })); if(dialog.type === 'success') router.push('/login'); }} 
          onConfirm={() => { setDialog(prev => ({ ...prev, isOpen: false })); if(dialog.type === 'success') router.push('/login'); }} 
          title={dialog.title} 
          message={dialog.message} 
          type={dialog.type} 
          confirmText="Acknowledged" 
        />
      </div>
    </AuthGuard>
  );
}