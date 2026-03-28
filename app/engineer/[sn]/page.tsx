"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from "@/lib/components/AuthGuard"; // 🛡️ Security
import { 
  ClipboardCheck, User, Wrench, CheckCircle2, 
  Calendar, Save, Loader2, ArrowLeft,
  MessageSquare, Clock, ShieldCheck
} from 'lucide-react';

export default function ServiceReportPage() {
  const params = useParams();
  const router = useRouter();
  const sn = params.sn as string;

  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    technician_name: '',
    work_done: '',
    service_type: 'Routine Service',
    status: 'Completed ✅',
    remarks: '',
    next_service_date: ''
  });

  useEffect(() => {
    const initializePage = async () => {
      // 1. Get User Session & Auto-fill Tech Name
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserRole(session.user.user_metadata?.role);
        setFormData(prev => ({ 
          ...prev, 
          technician_name: session.user.user_metadata?.full_name || session.user.email 
        }));
      }

      // 2. Fetch Device Data
      const { data } = await supabase.from('devices').select('site_name, model').eq('sn', sn).single();
      if (data) setDevice(data);
    };
    initializePage();
  }, [sn]);

  const handleSaveReport = async () => {
    if (!formData.work_done) return alert("⚠️ Please describe the Work Done!");
    
    setLoading(true);

    // 🟢 Transaction 1: Insert into Service Logs
    const { error: logError } = await supabase.from('service_logs').insert([{
      device_sn: sn,
      ...formData,
      created_at: new Date()
    }]);

    // 🟢 Transaction 2: Update Next Service Date in Main Devices Table
    // Isse Admin Dashboard par Indicator (Red/Green) automatic change ho jayega
    if (!logError && formData.next_service_date) {
      await supabase.from('devices').update({ 
        next_service_date: formData.next_service_date 
      }).eq('sn', sn);
    }

    if (!logError) {
      setShowSuccess(true);
      setTimeout(() => router.push('/admin'), 2500);
    } else {
      alert("❌ Error: " + logError.message);
    }
    setLoading(false);
  };

  // --- 🎨 UI INDICATOR LOGIC FOR FORM ---
  const getNextDateColor = () => {
    if (!formData.next_service_date) return "border-slate-100 bg-slate-50";
    return "border-emerald-200 bg-emerald-50 shadow-inner";
  };

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}>
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[500px] bg-white rounded-[60px] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
        
        {/* Progress Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-400"></div>

        {/* Header Section */}
        <div className="p-10 pb-4 relative">
          <button onClick={() => router.back()} className="absolute left-8 top-10 p-3 bg-white shadow-md rounded-2xl text-slate-400 hover:text-blue-600 transition-all active:scale-90 border border-slate-50">
            <ArrowLeft size={22} strokeWidth={3} />
          </button>

          <div className="flex flex-col items-center mt-4">
             <div className="bg-blue-50 p-6 rounded-[35px] mb-5 border border-blue-100 shadow-inner">
                <ClipboardCheck className="text-blue-600" size={38} strokeWidth={2.5} />
             </div>
             <h1 className="text-3xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none">Service Report</h1>
             <div className="mt-4 flex flex-col items-center">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck size={12} /> {userRole?.replace('_', ' ')} Verified
                </span>
                <p className="text-slate-400 font-bold text-[11px] uppercase mt-3 tracking-[4px]">{device?.site_name || 'Loading Site...'}</p>
             </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-10 space-y-6 max-h-[50vh] overflow-y-auto custom-scroll pb-10">
          
          {/* Technician Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
               <User size={13} className="text-blue-500" /> Technician Name
            </label>
            <input 
              readOnly 
              className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[30px] outline-none text-[16px] font-black text-slate-500 cursor-not-allowed"
              value={formData.technician_name}
            />
          </div>

          {/* Work Done / Issue */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
               <Wrench size={13} className="text-blue-500" /> Maintenance Details
            </label>
            <textarea 
              className="w-full p-7 bg-[#fcfdfe] border-2 border-slate-100 rounded-[35px] outline-none text-[15px] font-bold text-slate-700 focus:border-blue-300 focus:bg-white transition-all min-h-[140px] shadow-inner"
              placeholder="Describe parts replaced or issues fixed..."
              onChange={(e) => setFormData({...formData, work_done: e.target.value})}
            />
          </div>

          {/* Type & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none">Service Type</label>
              <select className="w-full p-6 bg-slate-50 border-none rounded-[30px] font-black text-slate-600 appearance-none cursor-pointer" onChange={(e)=>setFormData({...formData, service_type: e.target.value})}>
                <option>Routine Service</option>
                <option>Breakdown Repair</option>
                <option>New Installation</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none">System Status</label>
              <select className={`w-full p-6 rounded-[30px] font-black appearance-none cursor-pointer border-none ${formData.status.includes('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`} onChange={(e)=>setFormData({...formData, status: e.target.value})}>
                <option>Completed ✅</option>
                <option>Pending ⏳</option>
              </select>
            </div>
          </div>

          {/* 🔴 NEXT SERVICE DATE WITH INDICATOR */}
          <div className={`space-y-2 p-7 rounded-[40px] border-2 transition-all duration-500 ${getNextDateColor()}`}>
            <label className="text-[11px] font-[1000] text-emerald-700 uppercase ml-2 flex items-center gap-2 tracking-[2px]">
              <Calendar size={14} /> Schedule Next Visit
            </label>
            <input 
              type="date"
              className="w-full bg-transparent border-none outline-none font-black text-emerald-900 text-xl cursor-pointer mt-1"
              onChange={(e) => setFormData({...formData, next_service_date: e.target.value})}
            />
            {formData.next_service_date && (
               <p className="text-[9px] font-bold text-emerald-500 mt-2 ml-2 flex items-center gap-1">
                  <Clock size={10} /> Smart Alert will trigger on this date
               </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-10 bg-slate-50/50 pt-6">
          <button 
            onClick={handleSaveReport}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-[1000] py-8 rounded-[35px] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all disabled:opacity-50 text-xl uppercase tracking-widest shadow-blue-900/10"
          >
            {loading ? <Loader2 className="animate-spin" size={26} /> : <Save size={26} />} 
            {loading ? 'SYNCING DATA...' : 'Finish & Save'}
          </button>
        </div>
      </div>

      {/* ✅ SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-white rounded-[60px] p-14 w-full max-w-sm text-center shadow-3xl animate-in zoom-in-95">
            <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
              <CheckCircle2 size={56} className="text-emerald-500" />
            </div>
            <h3 className="text-3xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none mb-4">Log Synced!</h3>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">System history updated.<br/>Dashboard indicator is now live.</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </div>
    </AuthGuard>
  );
}