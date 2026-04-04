"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/components/AuthGuard";
import { 
  Lock, Mail, Loader2, ShieldCheck, 
  User, Cpu, ChevronRight, Activity, ArrowLeft
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
            // 🚩 METADATA: Ye data Admin Page ke 'userName' mein dikhega
            full_name: fullName,
            role: 'engineer', // Default role 'engineer'
            display_name: fullName.toUpperCase()
          }
        }
      });

      if (error) throw error;

      setDialog({
        isOpen: true,
        title: "Registration Success",
        message: "Operator profile created. Please check your email for the verification link.",
        type: "success"
      });
      
      // Clear fields
      setEmail(""); setPassword(""); setFullName("");
      
    } catch (err: any) {
      setDialog({ 
        isOpen: true, 
        title: "System Error", 
        message: err.message || "Registration failed. Try again.", 
        type: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <AuthGuard allowedRoles={["super_admin"]}>
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      
      {/* 🌌 Cyber Aura */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-[430px] bg-[#0f172a]/40 backdrop-blur-3xl rounded-[60px] p-10 sm:p-14 shadow-2xl border border-white/5 relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* 📟 Back to Login */}
        <button 
          onClick={() => router.push('/login')} 
          className="absolute top-10 left-10 text-slate-500 hover:text-blue-400 transition-all flex items-center gap-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Terminal</span>
        </button>

        {/* 📟 Header */}
        <div className="flex flex-col items-center mb-10 text-center pt-6">
          <div className="relative mb-6">
             <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[30px] border border-white/10 shadow-2xl">
                <User className="text-blue-400" size={32} strokeWidth={2.5} />
             </div>
          </div>
          
          <h1 className="text-[28px] font-[1000] text-white tracking-tighter uppercase italic leading-none">
            New <span className="text-blue-500">Operator</span>
          </h1>
          <p className="text-[9px] font-[1000] text-slate-500 uppercase tracking-[4px] italic mt-4">Registration Node</p>
        </div>

        {/* 📝 Form Section */}
        <form onSubmit={handleSignup} className="space-y-6 text-left">
          
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="text-[8px] text-slate-500 font-black uppercase ml-8 tracking-[4px]">Full Name</label>
            <div className="relative group">
              <User className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400" size={18} />
              <input type="text" required placeholder="VIJAY KUMAR" className="w-full p-5 pl-18 bg-white/[0.03] border-2 border-white/5 rounded-[25px] outline-none text-white font-bold focus:border-blue-500/30 transition-all placeholder:text-slate-800" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[8px] text-slate-500 font-black uppercase ml-8 tracking-[4px]">Operator Email</label>
            <div className="relative group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400" size={18} />
              <input type="email" required placeholder="OPERATOR@MODERN.PRO" className="w-full p-5 pl-18 bg-white/[0.03] border-2 border-white/5 rounded-[25px] outline-none text-white font-bold focus:border-blue-500/30 transition-all placeholder:text-slate-800" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[8px] text-slate-500 font-black uppercase ml-8 tracking-[4px]">Passkey</label>
            <div className="relative group">
              <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400" size={18} />
              <input type="password" required placeholder="••••••••" className="w-full p-5 pl-18 bg-white/[0.03] border-2 border-white/5 rounded-[25px] outline-none text-white font-bold focus:border-blue-500/30 transition-all placeholder:text-slate-800" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[13px] uppercase tracking-[5px] mt-4 border-b-[6px] border-blue-900 italic">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
            <span>{loading ? 'Processing...' : 'Register Operator'}</span>
          </button>
        </form>

        {/* 🏢 Branded Footer */}
<div className="mt-14 pt-10 border-t border-white/5 text-center flex flex-col items-center">
  
  {/* Description Line */}
  <p className="text-[10px] leading-relaxed text-slate-500 font-bold italic uppercase tracking-[2px] opacity-40 px-6 mb-6">
    High-Integrity Security & Surveillance Monitoring Systems.
  </p>
   
  {/* 🚩 Container Fix: Flex-row force karega sabko ek line mein lane ke liye */}
  <div className="flex flex-row items-center justify-center gap-2 text-[9px] font-[1000] uppercase tracking-[6px] italic">
    
    {/* Clickable Year Node */}
    <span 
      onClick={() => window.open('https://linktr.ee/wazahul', '_blank')}
      className="text-blue-500/40 hover:text-blue-400 transition-all cursor-pointer active:scale-90 flex items-center whitespace-nowrap"
    >
      &copy; 2026
    </span>

    {/* Static Branding Node */}
    <span className="text-slate-700 tracking-[8px] cursor-default select-none whitespace-nowrap">
      Modern Enterprises
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
    </AuthGuard> // 🛡️ Wrapper Closing Tag
  );
}