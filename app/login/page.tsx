"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Rocket, Lock, Mail, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Access Denied: Invalid Credentials");
        setLoading(false);
      } else {
        // ✅ Login successful, redirecting to Admin Central
        // Note: Admin page par 'device_sn' ka logic setup hona zaroori hai
        router.push("/admin"); 
      }
    } catch (err) {
      setError("System Connection Error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[420px] bg-white rounded-[55px] p-12 shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
        
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"></div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="bg-blue-50/50 p-6 rounded-[30px] mb-5 shadow-inner border border-blue-100 group transition-all">
             <Rocket className="text-blue-600 group-hover:-rotate-12 transition-transform" size={38} strokeWidth={2.5} />
          </div>
          <h1 className="text-[32px] font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">Console Access</h1>
          <p className="text-slate-400 text-[11px] font-[1000] mt-4 tracking-[4px] uppercase opacity-80 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Terminal 2026
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-7">
          
          <div className="space-y-2.5">
            <label className="text-[10px] text-slate-400 font-[1000] uppercase ml-6 tracking-[2px]">Admin ID / Email</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 transition-colors group-focus-within:text-blue-600" size={20} />
              <input 
                type="email" 
                required
                placeholder="admin@modernenterprises.com"
                className="w-full p-6 pl-16 bg-[#fcfdfe] border-2 border-slate-50 rounded-[30px] outline-none text-[15px] font-bold text-slate-800 focus:border-blue-400 focus:bg-white transition-all shadow-sm shadow-slate-100"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] text-slate-400 font-[1000] uppercase ml-6 tracking-[2px]">Encrypted Secret Key</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 transition-colors group-focus-within:text-blue-600" size={20} />
              <input 
                type="password" 
                required
                placeholder="••••••••••••"
                className="w-full p-6 pl-16 bg-[#fcfdfe] border-2 border-slate-50 rounded-[30px] outline-none text-[15px] font-bold text-slate-800 focus:border-blue-400 focus:bg-white transition-all shadow-sm shadow-slate-100"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase p-5 rounded-[25px] flex items-center justify-center gap-3 border-2 border-red-100 animate-in fade-in zoom-in-95 tracking-widest leading-none">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-[1000] py-7 rounded-[35px] flex items-center justify-center gap-4 shadow-2xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 text-[16px] uppercase tracking-[4px] mt-6 border-b-4 border-slate-950 active:border-0"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} strokeWidth={2.5} />} 
            {loading ? 'Authenticating...' : 'INITIALIZE ACCESS'}
          </button>
        </form>

        <div className="mt-12 text-center">
           <div className="h-[2px] w-12 bg-slate-100 mx-auto mb-6 rounded-full"></div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[6px] italic leading-relaxed">
             System Monitor v4.0<br/>Authorized Personnel Only
           </p>
        </div>
      </div>

      <style jsx global>{`
        input::placeholder { color: #cbd5e1; font-weight: 700; letter-spacing: 1px; }
      `}</style>
    </div>
  );
}