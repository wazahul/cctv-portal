"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from "@/lib/components/AuthGuard"; 
import { 
  ClipboardCheck, User, Wrench, CheckCircle2, 
  Calendar, Save, Loader2, ArrowLeft,
  MessageSquare, ShieldCheck, Tag, Edit3
} from 'lucide-react';

export default function ServiceReportPage() {
  const params = useParams();
  const router = useRouter();
  const sn = params.sn as string; // URL params se SN le rahe hain

  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [displayName, setDisplayName] = useState<string>(""); 
  
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        setDisplayName(name);
        setFormData(prev => ({ ...prev, technician_name: name }));
      }

      // ✅ FIX 1: Fetching device using 'device_sn'
      const { data } = await supabase
        .from('devices')
        .select('site_name')
        .eq('device_sn', sn) 
        .single();
        
      if (data) setDevice(data);
    };
    initializePage();
  }, [sn]);

  const handleSaveReport = async () => {
    if (!formData.technician_name) return alert("⚠️ Please enter Technician Name!");
    if (!formData.work_done) return alert("⚠️ Please describe the Work Done!");
    
    setLoading(true);

    // 🟢 Step 1: Insert into service_logs
    // ✅ FIX 2: Check if your 'service_logs' table also uses 'device_sn'
    const { error: logError } = await supabase.from('service_logs').insert([
      { 
        device_sn: sn, // Link using device_sn
        site_name: device?.site_name, // Site name bhi save karein for quick logs
        ...formData, 
        created_at: new Date() 
      }
    ]);

    // 🟢 Step 2: Update devices table with next_service_date
    if (!logError && formData.next_service_date) {
      // ✅ FIX 3: Updating 'devices' table using 'device_sn'
      await supabase.from('devices')
        .update({ 
            next_service_date: formData.next_service_date,
            last_maintenance: new Date() // maintenance history sync
        })
        .eq('device_sn', sn); 
    }

    if (!logError) {
      setShowSuccess(true);
      setTimeout(() => router.push('/admin'), 2000);
    } else {
      alert("❌ Error: " + logError.message);
    }
    setLoading(false);
  };

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}>
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans text-left text-slate-800">
      <div className="w-full max-w-[480px] bg-white rounded-[55px] shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden">
        
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 to-emerald-500"></div>

        {/* Header */}
        <div className="p-8 pb-4 relative">
          <button onClick={() => router.back()} className="absolute left-6 top-8 p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 border border-slate-100 active:scale-90 transition-all">
            <ArrowLeft size={20} strokeWidth={3} />
          </button>

          <div className="flex flex-col items-center mt-6">
             <div className="bg-blue-50/50 p-5 rounded-[30px] mb-4 border border-blue-100 shadow-inner">
                <ClipboardCheck className="text-blue-600" size={32} strokeWidth={2.5} />
             </div>
             <h1 className="text-2xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none text-center">Service Report</h1>
             
             {/* Identity & SN Badges */}
             <div className="mt-6 flex flex-wrap justify-center gap-2">
                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full flex items-center gap-2 border border-slate-700 shadow-lg">
                   <ShieldCheck size={12} className="text-emerald-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{displayName}</span>
                </div>
                <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
                   <Tag size={12} className="text-blue-500" />
                   <span className="text-[10px] font-mono font-black text-slate-500 tracking-wider uppercase">SN: {sn}</span>
                </div>
             </div>

             <h2 className="text-slate-400 font-bold text-[10px] uppercase tracking-[5px] italic mt-5 text-center px-4">
                {device?.site_name || 'LOADING SITE INFO...'}
             </h2>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-10 space-y-6 max-h-[42vh] overflow-y-auto custom-scroll pb-6">
          
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
               <User size={13} className="text-blue-500" /> Technician Name
            </label>
            <div className="relative">
              <input 
                type="text"
                className="w-full p-5 bg-[#fcfdfe] border-2 border-slate-50 rounded-[25px] outline-none text-[15px] font-black text-slate-700 focus:border-blue-300 focus:bg-white transition-all shadow-inner pr-12"
                value={formData.technician_name}
                onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
                placeholder="Enter technician name"
              />
              <Edit3 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
               <Wrench size={13} className="text-blue-500" /> Work Done / Issue
            </label>
            <textarea 
              className="w-full p-6 bg-[#fcfdfe] border-2 border-slate-50 rounded-[35px] outline-none font-bold text-slate-700 focus:border-blue-300 transition-all min-h-[110px] shadow-inner text-sm"
              placeholder="Explain fixed issues..."
              onChange={(e) => setFormData({...formData, work_done: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Job Type</label>
              <select className="w-full p-5 bg-slate-50 border-none rounded-[25px] font-black text-slate-600 appearance-none outline-none text-xs cursor-pointer shadow-sm" onChange={(e)=>setFormData({...formData, service_type: e.target.value})}>
                <option value="Routine Service">Routine Service</option>
                <option value="Breakdown">Breakdown</option>
                <option value="Emergency">Emergency 🚨</option>
                <option value="Installation">Installation</option>
                <option value="Preventive Maintenance">Preventive</option>
                <option value="Complaint">Complaint</option>
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Status</label>
              <select className={`w-full p-5 rounded-[25px] font-black border-none outline-none appearance-none text-xs shadow-sm ${formData.status.includes('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`} onChange={(e)=>setFormData({...formData, status: e.target.value})}>
                <option value="Completed ✅">Completed ✅</option>
                <option value="Pending ⏳">Pending ⏳</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest flex items-center gap-2">
               <MessageSquare size={13} className="text-blue-500" /> Additional Remarks
            </label>
            <input className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[28px] font-bold text-slate-700 outline-none focus:border-blue-300 transition-all shadow-sm" placeholder="Extra notes..." onChange={(e)=>setFormData({...formData, remarks: e.target.value})} />
          </div>

          <div className={`p-7 rounded-[40px] border-2 transition-all ${formData.next_service_date ? 'border-emerald-200 bg-emerald-50/50 shadow-emerald-50 shadow-inner' : 'border-slate-50 bg-slate-50'}`}>
            <label className="text-[11px] font-[1000] text-emerald-700 uppercase flex items-center gap-2 tracking-[2px]">
              <Calendar size={14} /> Schedule Next Visit
            </label>
            <input type="date" className="w-full bg-transparent border-none outline-none font-black text-emerald-900 mt-2 cursor-pointer text-xl" onChange={(e)=>setFormData({...formData, next_service_date: e.target.value})} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-10 bg-slate-50/50 pt-4">
          <button 
            onClick={handleSaveReport}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-[1000] py-7 rounded-[35px] flex items-center justify-center gap-4 transition-all active:scale-95 text-xl uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={26} strokeWidth={2.5} />} 
            SAVE SERVICE LOG
          </button>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[50px] p-12 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
             <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-6" />
             <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter text-slate-900">Synced!</h3>
             <p className="text-slate-500 text-[10px] font-bold uppercase mt-2 tracking-widest">Report Filed Successfully.</p>
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