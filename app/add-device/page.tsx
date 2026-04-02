"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle, Loader2, Cpu, X, Eye, EyeOff, 
  Navigation, MousePointer2, ShieldCheck, Disc,
  Lock, Layers, Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterDialog from '@/lib/components/MasterDialog';

// --- 🛡️ Strict TypeScript Interface ---
interface FormData {
  device_sn: string; site_name: string; category: string; model: string;
  ip_address: string; user_name: string; user_pass: string; admin_name: string;
  admin_pass: string; v_code: string; device_notes: string; radius: string;
  latitude: string; longitude: string;
}

export default function AddDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any, 
    onConfirm: () => setDialog(prev => ({...prev, isOpen: false}))
  });

  const [formData, setFormData] = useState<FormData>({
    device_sn: '', site_name: '', category: 'DVR (Analog)', model: '',
    ip_address: '', user_name: 'user', user_pass: '', 
    admin_name: 'admin', admin_pass: '', 
    v_code: '', device_notes: '', radius: '100', latitude: '', longitude: '' 
  });

  // 🛡️ BLUEPRINT HMODAL: Browser Environment Setup (Scroll-to-Hide Logic)
  useEffect(() => {
    // 1. Lock Body Scroll to force internal container scroll (Triggers Browser UI Hiding)
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // 2. Dynamic Viewport Height Fix for Mobile
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setHeight);
    setHeight();

    return () => { 
      document.body.style.overflow = 'unset'; 
      window.removeEventListener('resize', setHeight);
    };
  }, []);

  const handleSave = async () => {
    if (!formData.device_sn.trim() || !formData.site_name.trim()) {
      setDialog({ 
        isOpen: true, title: "Incomplete Configuration", 
        message: "Device Serial Number and Site Name are critical for Device registration.", 
        type: "warning", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
      });
      return;
    }
    
    setLoading(true);
    let finalLat: number | null = null;
    let finalLng: number | null = null;

    if (isManual) {
      finalLat = parseFloat(formData.latitude.trim());
      finalLng = parseFloat(formData.longitude.trim());
    } else {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        setDialog({ 
          isOpen: true, title: "Satellite Sync Failed", 
          message: "Could not fetch GPS data. Switching to Manual Pin is recommended.", 
          type: "warning", onConfirm: () => setIsManual(true)
        });
        setLoading(false); return;
      }
    }

    const { error } = await supabase.from('devices').insert([{ 
      device_sn: formData.device_sn.trim().toUpperCase(), 
      site_name: formData.site_name.trim(),
      category: formData.category, 
      model: formData.model.trim(), 
      ip_address: formData.ip_address.trim(),
      user_name: formData.user_name, 
      user_pass: formData.user_pass,
      admin_name: formData.admin_name, 
      admin_pass: formData.admin_pass,
      v_code: formData.v_code, 
      device_notes: formData.device_notes,
      radius: parseInt(formData.radius) || 200, 
      latitude: finalLat, 
      longitude: finalLng 
    }]);

    if (error) {
      setDialog({ 
        isOpen: true, title: "Registry Error", 
        message: error.message, type: "danger", 
        onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
      });
    } else {
      setDialog({ 
        isOpen: true, title: "Device Synchronized", 
        message: `Device ${formData.site_name} is now live in the Modern Cloud.`, 
        type: "success", onConfirm: () => router.push('/admin') 
      });
    }
    setLoading(false);
  };

  return (
    // 🚩 ROOT: Absolute fixed position for maximum browser sync
    <div className="fixed inset-0 bg-slate-900/10 flex items-stretch sm:items-center justify-center p-0 animate-in fade-in duration-500 backdrop-blur-sm z-[100]">
      
      {/* ✨ HMODAL MAIN CONTAINER: Dynamic Height Sync */}
      <div 
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        className="w-full max-w-2xl bg-white sm:h-auto sm:max-h-[96vh] sm:rounded-[55px] shadow-[0_50px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-700"
      >
        
        {/* 🏗️ HMODAL STICKY HEADER */}
        <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center shrink-0 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <div className="flex items-center gap-4 italic text-left">
            <div className="bg-blue-600 p-4 rounded-[22px] text-white shadow-xl shadow-blue-100">
              <Cpu size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Register New Device</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[4px] mt-1.5 leading-none italic">Modern Enterprises</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="p-4 bg-slate-50 rounded-[25px] text-slate-400 active:scale-75 border border-slate-100 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* 📝 HMODAL SCROLLABLE BODY: Natural Scroll hides Browser UI */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-12 pt-8 pb-44 text-left overscroll-contain touch-pan-y custom-scroll bg-[#fcfdfe]">
          
          {/* Identity Section */}
          <div className="space-y-8 animate-in slide-in-from-left duration-500">
            <InputField label="Device Serial Number" icon="🔢" placeholder="AH1857798" 
              value={formData.device_sn} highlight
              onChange={(v: string) => setFormData({...formData, device_sn: v})} />
            
            <InputField label="Site / Client Identifier" icon="🏢" placeholder="Wazahul Villa" 
              value={formData.site_name} 
              onChange={(v: string) => setFormData({...formData, site_name: v})} />
          </div>

          {/* Logic & Categorization */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-5 tracking-[3px] italic">Category</label>
              <div className="relative">
                <select className="w-full p-5 bg-white border-2 border-slate-100 rounded-[28px] font-black italic text-slate-800 text-[12px] outline-none appearance-none cursor-pointer focus:border-blue-500 shadow-sm transition-all"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="DVR (Analog)">📹 DVR (Analog)</option>
                  <option value="NVR (IP System)">🖥️ NVR (IP)</option>
                  <option value="IP Camera">👁️ IP Camera</option>
                  <option value="Biometric">☝️ Biometric</option>
                </select>
                <Layers className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-blue-500 ml-5 tracking-[3px] italic flex items-center gap-1"><Disc size={10}/> Safe Radius</label>
              <input type="number" value={formData.radius} className="w-full p-5 bg-blue-50/30 border-2 border-blue-100 rounded-[28px] outline-none text-center font-black text-blue-600 focus:border-blue-500 transition-all shadow-inner text-sm"
                onChange={(e) => setFormData({...formData, radius: e.target.value})} />
            </div>
          </div>

          {/* GPS Toggle */}
          <div className="bg-slate-100/50 p-2 rounded-[35px] flex gap-2 border border-slate-200/50">
            <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-4 rounded-[28px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 italic ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <Navigation size={14} /> Satellite
            </button>
            <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-4 rounded-[28px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 italic ${isManual ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <MousePointer2 size={14} /> Manual
            </button>
          </div>

          {isManual && (
            <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
              <InputField label="📍 Latitude" placeholder="00.0000" value={formData.latitude} onChange={(v: string) => setFormData({...formData, latitude: v})} />
              <InputField label="📍 Longitude" placeholder="00.0000" value={formData.longitude} onChange={(v: string) => setFormData({...formData, longitude: v})} />
            </div>
          )}

          {/* Network Details */}
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Model No" icon="⚙️" placeholder="DS-XXXX" value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
            <InputField label="Static IP" icon="🌐" placeholder="192.168.1.XX" value={formData.ip_address} onChange={(v: string) => setFormData({...formData, ip_address: v})} />
          </div>

          {/* Security Vault Card */}
          <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10 px-1">
              <div className="flex items-center gap-3 text-blue-600">
                <ShieldCheck size={22} strokeWidth={2.5}/>
                <span className="text-[11px] font-[1000] uppercase tracking-[3px] italic">Access Vault</span>
              </div>
              <button type="button" onClick={() => setShowPass(!showPass)} className="p-3.5 bg-slate-50 rounded-2xl text-blue-500 border border-blue-100 active:scale-90 transition-all shadow-sm">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <InputField label="User ID" icon="👤" value={formData.user_name} onChange={(v: string) => setFormData({...formData, user_name: v})} light />
              <InputField label="User Pass" icon="🔑" type={showPass ? "text" : "password"} value={formData.user_pass} onChange={(v: string) => setFormData({...formData, user_pass: v})} light />
              <InputField label="Admin ID" icon="🛡️" value={formData.admin_name} onChange={(v: string) => setFormData({...formData, admin_name: v})} light />
              <InputField label="Admin Pass" icon="🔒" type={showPass ? "text" : "password"} value={formData.admin_pass} onChange={(v: string) => setFormData({...formData, admin_pass: v})} light />
            </div>

            <div className="relative z-10 pt-6 border-t border-slate-50">
               <InputField label="Verification Code" icon="🛡️" type={showPass ? "text" : "password"} placeholder="P2P Code" value={formData.v_code} onChange={(v: string) => setFormData({...formData, v_code: v})} light />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-6 tracking-[3px] italic flex items-center gap-2 leading-none block">
              <Info size={14} className="text-slate-300" /> Technical Remarks
            </label>
            <textarea className="w-full p-8 bg-white border-2 border-slate-100 rounded-[40px] outline-none text-sm font-bold text-slate-700 min-h-[160px] focus:border-blue-500 transition-all resize-none shadow-inner"
              placeholder="Enter critical Device details..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
          </div>

          {/* 🚩 FINAL FOOTER ACTION */}
          <div className="pt-10 pb-60 relative z-[50]">
            <button onClick={handleSave} disabled={loading}
              className="w-full bg-[#1a9e52] text-white font-[1000] py-8 rounded-[38px] flex items-center justify-center gap-4 shadow-[0_25px_60px_rgba(26,158,82,0.35)] active:scale-95 transition-all disabled:opacity-50 text-[16px] uppercase tracking-[5px] border-b-[8px] border-emerald-900 italic">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />} 
              {loading ? 'SYNCING DATA...' : 'Save & Continue'}
            </button>
            <p className="text-center mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[8px] italic opacity-40">Modern Cloud Engine</p>
          </div>

        </div>
      </div>

      <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(prev => ({...prev, isOpen: false}))} onConfirm={dialog.onConfirm} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="Acknowledge" />
    </div>
  );
}

// Sub-Component: InputField (HModal Consistent Style)
function InputField({ label, placeholder, onChange, value, highlight = false, icon, light = false, type = "text" }: any) {
  return (
    <div className="w-full text-left space-y-3">
      <label className="text-[9px] font-black uppercase text-slate-400 ml-5 tracking-[3px] italic flex items-center gap-2 leading-none uppercase">
        <span className="text-lg opacity-80">{icon}</span> {label}
      </label>
      <input 
        type={type}
        className={`w-full p-5 border-2 rounded-[28px] font-black italic text-slate-800 text-[13px] outline-none transition-all shadow-sm active:scale-[0.99] ${
          light ? 'bg-slate-50 border-transparent focus:border-blue-200 shadow-inner' : highlight ? 'bg-white border-emerald-100 focus:border-emerald-500 shadow-emerald-50' : 'bg-white border-slate-100 focus:border-blue-500'
        }`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}