"use client";
// app/signup/page.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/components/AuthGuard";
import { 
  Lock, Mail, Loader2, ShieldCheck, 
  User, Activity, ArrowLeft, Users
} from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState("engineer"); // Default role
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
            role: userType, // 🚩 Ab yahan 'admin' ya 'engineer' jayega
            display_name: fullName.toUpperCase()
          }
        }
      });

      if (error) throw error;

      setDialog({
        isOpen: true,
        title: "✅ Node Deployed",
        message: `${userType.toUpperCase()} profile created for ${fullName}. Activation link dispatched.`,
        type: "success"
      });
      
      setEmail(""); setPassword(""); setFullName("");
      
    } catch (err: any) {
      setDialog({ 
        isOpen: true, 
        title: "🚨 System Error", 
        message: err.message || "Registration failed.", 
        type: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
    if(dialog.type === 'success') router.push('/admin');
  };

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-y-auto">
        
        <div className="fixed inset-0 bg-[#020617] -z-10"></div>
        <div className="w-full max-w-[480px] bg-[#0f172a] rounded-[45px] p-8 sm:p-14 shadow-2xl border border-slate-800 relative my-10">
          
          <button onClick={() => router.push('/admin')} className="mb-8 text-slate-500 hover:text-blue-400 transition-all flex items-center gap-2 group">
            <ArrowLeft size={18} />
            <span className="text-[10px] font-black uppercase tracking-[3px] italic text-left">Back to Terminal</span>
          </button>

          <div className="flex flex-col mb-10 text-left">
            <div className="flex items-center gap-4">
              <div className="bg-[#1e293b] p-3 rounded-2xl border border-slate-700">
                <Users className="text-blue-400" size={26} />
              </div>
              <div>
                <h1 className="text-[24px] font-[1000] text-white tracking-tighter uppercase italic leading-none">
                  User <span className="text-blue-500">Registry</span>
                </h1>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[4px] mt-2 italic">Assign System Role</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-5 text-left">
            
            {/* 🚩 ROLE SELECTION DROPDOWN */}
            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px]">Access Level</label>
              <select 
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner"
              >
                <option value="engineer">FIELD ENGINEER</option>
                <option value="super_admin">SYSTEM ADMIN</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px]">Full Identity</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Wazahul Qamar" className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px]">Operator Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@gmail.com" className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-slate-500 font-black uppercase ml-4 tracking-[4px]">Passkey</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 bg-[#020617] border-2 border-slate-800 rounded-[25px] outline-none text-[14px] font-bold text-white focus:border-blue-500 transition-all" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[1000] py-5 rounded-[30px] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all text-[13px] uppercase tracking-[4px] border-b-[6px] border-blue-900 active:border-b-0 italic">
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />} 
              <span>{loading ? 'Initializing...' : 'Deploy Operator'}</span>
            </button>
          </form>
        </div>

        <MasterDialog isOpen={dialog.isOpen} onClose={closeDialog} onConfirm={closeDialog} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="Acknowledge" />
      </div>
    </AuthGuard>
  );
}