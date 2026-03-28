"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/components/AuthGuard"; 
import { 
  Loader2, Smartphone, Send, ShieldCheck, 
  User as UserIcon, AlertCircle, CheckCircle2 
} from "lucide-react";

export default function UserPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserRole(session?.user?.user_metadata?.role || "user");
    };
    getSession();
  }, []);

  const handleSubmit = async () => {
    if (mobile.length !== 10) {
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      // 🟢 1. Direct Database Insert (Naye 'device_sn' ke saath)
      // Note: General service ke liye hum 'GENERAL' ya koi default SN use kar sakte hain
      const { error } = await supabase
        .from("requests")
        .insert([
          { 
            device_sn: "GENERAL", // ✅ 'sn' ki jagah 'device_sn'
            site_name: "General Service Request",
            mobile: mobile,
            status: 'pending' // 🚨 Dashboard blink trigger
          }
        ]);

      if (error) throw error;

      // 🔵 2. API Call (WhatsApp Notification ke liye)
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mobile, 
          role: userRole,
          device_sn: "GENERAL" // ✅ Updated Key
        }),
      });

      const data = await res.json();
      if (data.success || !error) {
        setShowSuccess(true);
        setMobile("");
      }
    } catch (err: any) {
      console.error("Request Error:", err.message);
      alert("System Error: Data not saved.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}> 
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 font-sans text-left">
        
        {/* DASHBOARD BUTTON */}
        <button 
          onClick={() => router.push('/admin')}
          className={`mb-8 px-8 py-4 rounded-[24px] flex items-center gap-3 text-[10px] font-black uppercase tracking-[2px] border transition-all active:scale-95 shadow-2xl ${
            userRole === 'super_admin' 
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-900/20' 
            : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
          }`}
        >
          {userRole === 'super_admin' ? <ShieldCheck size={16} strokeWidth={3} /> : <UserIcon size={16} strokeWidth={3} />}
          Go to {userRole?.replace('_', ' ')} Dashboard
        </button>

        <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[55px] border border-white/10 text-center w-full max-w-sm shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full"></div>

          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[35px] flex items-center justify-center mx-auto mb-10 shadow-blue-500/40 shadow-2xl relative z-10">
            <Smartphone size={40} className="text-white" />
          </div>

          <h2 className="mb-3 text-[32px] font-[1000] text-white italic uppercase tracking-tighter leading-none italic relative z-10">Request Service</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[4px] mb-12 italic relative z-10">Modern Enterprises Node</p>

          <div className="space-y-6 relative z-10 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">WhatsApp Number</label>
              <input
                type="tel"
                maxLength={10}
                placeholder="00000 00000"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full p-6 bg-white/5 text-white rounded-[32px] border-2 border-white/5 outline-none focus:border-blue-500 transition-all font-black text-2xl placeholder:text-slate-800 shadow-inner"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-[1000] py-7 rounded-[32px] uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-xl shadow-blue-900/40"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={22} strokeWidth={3} /> Submit Now</>}
            </button>
          </div>
        </div>

        {/* DIALOGS */}
        {showError && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-[45px] p-12 w-full max-w-xs text-center border-b-[8px] border-red-500 animate-in zoom-in-95">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-[1000] text-slate-900 uppercase italic mb-4 tracking-tighter">Invalid Input</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-8">Please enter 10 digit number</p>
              <button onClick={() => setShowError(false)} className="w-full bg-red-500 text-white py-5 rounded-[25px] font-black uppercase text-xs">Try Again</button>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-[45px] p-12 w-full max-w-xs text-center border-b-[8px] border-emerald-500 animate-in zoom-in-95">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-[1000] text-slate-900 uppercase italic mb-4 tracking-tighter">Request Sent</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-8 leading-relaxed">Admin notified.<br/>Check WhatsApp soon.</p>
              <button onClick={() => setShowSuccess(false)} className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase text-xs">Got it</button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}