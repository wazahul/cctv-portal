"use client";
import { useState, useEffect } from 'react';
import { COMPANY } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from "@/lib/components/AuthGuard"; 
import MasterDialog from '@/lib/components/MasterDialog'; 
import { 
  ClipboardCheck, User, Wrench, CheckCircle2, 
  Calendar, Save, Loader2, ArrowLeft,
  MessageSquare, ShieldCheck, Tag, Edit3, X
} from 'lucide-react';

export default function ServiceReportPage() {
  const params = useParams();
  const router = useRouter();
  const sn = params.sn as string;

  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>(""); 
  
  // 🛡️ MasterDialog State
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any,
    onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
  });

  const [formData, setFormData] = useState({
    technician_name: '',
    work_done: '',
    service_type: 'Routine Service',
    status: 'Completed ✅',
    remarks: '',
    next_service_date: ''
  });

  // 🛡️ BLUEPRINT HMODAL: Browser Sync & Environment Setup
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setHeight);
    setHeight();

    const fetchInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0];
        setDisplayName(name);
        setFormData(prev => ({ ...prev, technician_name: name }));
      }
      // Fetching Site Name using device_sn
      const { data } = await supabase.from('devices').select('site_name').eq('device_sn', sn).maybeSingle();
      if (data) setDevice(data);
    };

    fetchInitialData();
    return () => { 
      document.body.style.overflow = 'unset'; 
      window.removeEventListener('resize', setHeight);
    };
  }, [sn]);

  const handleSaveReport = async () => {
    // 🚩 Validation with MasterDialog (Professional English)
    if (!formData.technician_name.trim()) {
      setDialog({
        isOpen: true, title: "Auth Required",
        message: "Technician identity is required to authorize this maintenance log.",
        type: "warning", onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }
    if (!formData.work_done.trim()) {
      setDialog({
        isOpen: true, title: "Technical Details Missing",
        message: "Please provide a brief description of the technical work completed.",
        type: "warning", onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
      });
      return;
    }

    setLoading(true);

    // 🟢 Insert into service_logs (Matches your SQL Schema)
    const { error: logError } = await supabase.from('service_logs').insert([
      { 
        device_sn: sn, 
        site_name: device?.site_name, 
        technician_name: formData.technician_name,
        work_done: formData.work_done,
        service_type: formData.service_type,
        status: formData.status,
        remarks: formData.remarks,
        next_service_date: formData.next_service_date || null,
        created_at: new Date() 
      }
    ]);

    // 🟢 Update devices table for next maintenance tracking
    if (!logError && formData.next_service_date) {
      await supabase.from('devices').update({ 
        next_service_date: formData.next_service_date,
        last_maintenance: new Date() 
      }).eq('device_sn', sn); 
    }

    if (!logError) {
      setDialog({
        isOpen: true, title: "Report Synchronized",
        message: "Technical service log has been successfully uploaded to the cloud.",
        type: "success", onConfirm: () => router.push('/admin') 
      });
    } else {
      setDialog({
        isOpen: true, title: "Database Conflict",
        message: logError.message,
        type: "danger", onConfirm: () => setDialog(prev => ({ ...prev, isOpen: false }))
      });
    }
    setLoading(false);
  };

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}>
    <div className="fixed inset-0 bg-slate-900/10 flex items-stretch sm:items-center justify-center z-[100] backdrop-blur-sm">
      
      {/* ✨ HMODAL MAIN CONTAINER */}
      <div 
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        className="w-full max-w-xl bg-white sm:h-auto sm:max-h-[95vh] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-700"
      >
        
        {/* 🏗️ HMODAL STICKY HEADER (No Line Look) */}
        <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-xl p-4 flex justify-between items-center shrink-0 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center gap-3 italic text-left">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Create Service Report</h3>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[3px] mt-1 leading-none italic"> {COMPANY.name}</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="p-2.5 bg-slate-100 rounded-xl text-slate-400 active:scale-90 border border-slate-200/50">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 📝 HMODAL SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 space-y-6 pt-5 pb-40 text-left overscroll-contain touch-pan-y custom-scroll bg-[#fcfdfe]">
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 animate-in fade-in duration-500">
            <div className="px-3 py-1 bg-slate-900 text-white rounded-full flex items-center gap-2 border border-slate-700">
              <ShieldCheck size={10} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest">{displayName}</span>
            </div>
            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full flex items-center gap-2">
              <Tag size={10} className="text-blue-500" />
              <span className="text-[9px] font-mono font-black text-slate-500 tracking-wider">SN: {sn}</span>
            </div>
          </div>

          <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[4px] italic border-l-4 border-blue-500 pl-3">
            {device?.site_name || 'Loading Site...'}
          </h2>

          <div className="space-y-5">
            {/* Technician Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-3 tracking-widest italic flex items-center gap-2">
                <User size={12} className="text-blue-500" /> Technician
              </label>
              <div className="relative">
                <input type="text" className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-xs font-black text-slate-700 focus:border-blue-500 shadow-sm transition-all italic"
                  value={formData.technician_name} onChange={(e) => setFormData({...formData, technician_name: e.target.value})} />
                <Edit3 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>

            {/* Work Done */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-3 tracking-widest italic flex items-center gap-2">
                <Wrench size={12} className="text-blue-500" /> Work Description
              </label>
              <textarea className="w-full p-5 bg-white border border-slate-200 rounded-[25px] outline-none font-bold text-slate-700 focus:border-blue-500 transition-all min-h-[110px] shadow-inner text-xs resize-none"
                placeholder="Brief technical details of fixed issues..." value={formData.work_done} onChange={(e) => setFormData({...formData, work_done: e.target.value})} />
            </div>

            {/* Grid Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-3 italic">Job Type</label>
                <select className="w-full p-3.5 bg-slate-50 border-none rounded-2xl font-black text-slate-600 outline-none text-[10px] shadow-sm cursor-pointer appearance-none"
                  value={formData.service_type} onChange={(e)=>setFormData({...formData, service_type: e.target.value})}>
                  <option value="Routine Service">Routine Service</option>
                  <option value="Breakdown">Breakdown</option>
                  <option value="Emergency">Emergency 🚨</option>
                  <option value="Installation">Installation</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-3 italic">Status</label>
                <select className={`w-full p-3.5 rounded-2xl font-black outline-none text-[10px] shadow-sm appearance-none ${formData.status.includes('✅') ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}
                  value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})}>
                  <option value="Completed ✅">Completed ✅</option>
                  <option value="Pending ⏳">Pending ⏳</option>
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-3 tracking-widest italic flex items-center gap-2">
                <MessageSquare size={12} className="text-blue-500" /> Technical Remarks
              </label>
              <input className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm text-xs" 
                placeholder="Additional engineer notes..." value={formData.remarks} onChange={(e)=>setFormData({...formData, remarks: e.target.value})} />
            </div>

            {/* Next Visit */}
            <div className={`p-5 rounded-[30px] border-2 transition-all ${formData.next_service_date ? 'border-emerald-100 bg-emerald-50/30 shadow-inner' : 'border-slate-50 bg-slate-50'}`}>
              <label className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-2 tracking-[2px] italic leading-none">
                <Calendar size={12} /> Schedule Next Visit
              </label>
              <input type="date" className="w-full bg-transparent border-none outline-none font-black text-emerald-900 mt-2 cursor-pointer text-base" 
                onChange={(e)=>setFormData({...formData, next_service_date: e.target.value})} />
            </div>
          </div>

          {/* 🚩 FOOTER ACTION */}
          <div className="pt-4 pb-20 relative z-[50]">
            <button 
              onClick={handleSaveReport} disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 transition-all active:scale-95 text-sm uppercase tracking-[4px] italic shadow-xl border-b-[6px] border-black"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
              Submit Report
            </button>
            <p className="text-center mt-6 text-[8px] font-black text-slate-300 uppercase tracking-[6px] italic opacity-40">Modern Cloud Engine</p>
          </div>

        </div>
      </div>

      {/* 🛡️ MasterDialog Replacement for alerts */}
      <MasterDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={dialog.onConfirm} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type} 
      />

    </div>
    </AuthGuard>
  );
}