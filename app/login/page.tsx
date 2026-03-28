"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Rocket, Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid Email or Password");
      setLoading(false);
    } else {
      router.push("/admin"); // Login ke baad Admin Central par redirect
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[50px] p-10 shadow-2xl border border-white relative overflow-hidden text-left">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-500"></div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-blue-50 p-5 rounded-[25px] mb-4 shadow-inner group transition-all">
             <Rocket className="text-blue-600 group-hover:rotate-12 transition-transform" size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-[28px] font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">Portal Access</h1>
          <p className="text-slate-400 text-[10px] font-black mt-3 tracking-[3px] uppercase opacity-70">Secure Admin Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase ml-5 tracking-widest">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/50" size={18} />
              <input 
                type="email" 
                required
                placeholder="admin@company.com"
                className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-[25px] outline-none text-sm font-bold text-slate-700 focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-black uppercase ml-5 tracking-widest">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500/50" size={18} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-[25px] outline-none text-sm font-bold text-slate-700 focus:border-blue-200 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-[11px] font-black uppercase p-4 rounded-2xl text-center border border-red-100 animate-pulse tracking-wider">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-sm uppercase tracking-[3px] mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} 
            {loading ? 'Authenticating...' : 'Enter Console'}
          </button>
        </form>

        {/* Footer Info */}
        <p className="mt-10 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Authorized Personnel Only © 2026
        </p>
      </div>
    </div>
  );
}