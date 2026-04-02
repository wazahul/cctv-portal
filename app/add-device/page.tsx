"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle, Loader2, Cpu, X, Eye, EyeOff, 
  Navigation, MousePointer2, ShieldCheck, Disc, Lock, Layers, Info,
  Hash, Building, Tag, Globe, Smartphone, Key
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
    ip_address: '', user_name: 'user', user_pass: 'Sitename@7021sn', 
    admin_name: 'admin', admin_pass: 'DVR@MNDMsn', 
    v_code: 'Wqa...', device_notes: '', radius: '100', latitude: '', longitude: '' 
  });

  // 🛡️ BLUEPRINT HMODAL: Browser Environment Setup (Scroll Lock & Hide UI)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
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
    let finalLat = isManual ? parseFloat(formData.latitude) : null;
    let finalLng = isManual ? parseFloat(formData.longitude) : null;

    if (!isManual) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        setIsManual(true);
        setLoading(false); return;
      }
    }

    const { error } = await supabase.from('devices').insert([{ 
      ...formData, 
      device_sn: formData.device_sn.trim().toUpperCase(), 
      latitude: finalLat, 
      longitude: finalLng,
      radius: parseInt(formData.radius) || 200 
    }]);

    if (error) {
      setDialog({ isOpen: true, title: "Registry Error", message: error.message, type: "danger", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
    } else {
      setDialog({ isOpen: true, title: "Device Synchronized", message: `Device ${formData.site_name} is now live in the Modern Cloud.`, type: "success", onConfirm: () => router.push('/admin') });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-stretch sm:items-center justify-center z-[100] backdrop-blur-sm">
      
      {/* ✨ HMODAL MAIN CONTAINER: Slim Spacing Edition */}
      <div 
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        className="w-full max-w-xl bg-white sm:h-auto sm:max-h-[96vh] sm:rounded-[45px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-500"
      >
        
        {/* 🏗️ HMODAL STICKY HEADER */}
        <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-xl p-4 flex justify-between items-center shrink-0 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center gap-3 italic text-left">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-lg font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Register New Device</h3>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[3px] mt-1 leading-none italic">Modern Enterprises</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="p-2.5 bg-slate-100 rounded-xl text-slate-400 active:scale-90 border border-slate-200/50">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 📝 HMODAL SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-7 pt-6 pb-40 text-left overscroll-contain touch-pan-y custom-scroll bg-[#fcfdfe]">
          
          {/* IDENTITY SECTION */}
          <div className="grid gap-6">
            <InputField label="Device Serial Number" icon="🔢" placeholder="AH1857798" value={formData.device_sn} highlight onChange={(v:any) => setFormData({...formData, device_sn: v})} />
            <InputField label="Site / Client Identifier" icon="🏢" placeholder="Wazahul Villa" value={formData.site_name} onChange={(v:any) => setFormData({...formData, site_name: v})} />
          </div>

          {/* CATEGORY & RADIUS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest italic flex items-center gap-1.5"><Layers size={12}/> Category</label>
              <div className="relative">
                <select className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black italic text-slate-800 text-[11px] outline-none appearance-none focus:border-blue-500 shadow-sm transition-all"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="DVR (Analog)">📹 DVR (Analog)</option>
                  <option value="NVR (IP System)">🖥️ NVR (IP)</option>
                  <option value="IP Camera">👁️ IP Camera</option>
                  <option value="Biometric">☝️ Biometric</option>
                </select>
              </div>
            </div>
            <InputField label="Safe Radius" icon="🎯" value={formData.radius} type="number" onChange={(v:any) => setFormData({...formData, radius: v})} />
          </div>

          {/* GPS TOGGLE */}
          <div className="bg-slate-100/80 p-1.5 rounded-[22px] flex gap-2 border border-slate-200/50">
            <button onClick={() => setIsManual(false)} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${!isManual ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
              <Navigation size={14} /> Satellite
            </button>
            <button onClick={() => setIsManual(true)} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${isManual ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400'}`}>
              <MousePointer2 size={14} /> Manual
            </button>
          </div>

          {isManual && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <InputField label="📍 Latitude" placeholder="00.0000" value={formData.latitude} onChange={(v:any) => setFormData({...formData, latitude: v})} />
              <InputField label="📍 Longitude" placeholder="00.0000" value={formData.longitude} onChange={(v:any) => setFormData({...formData, longitude: v})} />
            </div>
          )}

          {/* HARDWARE & IP */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Model No" icon="⚙️" placeholder="DS-XXXX" value={formData.model} onChange={(v:any) => setFormData({...formData, model: v})} />
            <InputField label="Static IP" icon="🌐" placeholder="192.168.1.XX" value={formData.ip_address} onChange={(v:any) => setFormData({...formData, ip_address: v})} />
          </div>

          {/* SECURITY VAULT */}
          <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10 px-1">
              <span className="text-[10px] font-[1000] text-blue-600 uppercase tracking-widest italic flex items-center gap-2">
                <ShieldCheck size={16}/> Access Vault
              </span>
              <button onClick={() => setShowPass(!showPass)} className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 active:scale-90 transition-all">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <InputField label="User ID" icon="👤" value={formData.user_name} onChange={(v:any) => setFormData({...formData, user_name: v})} light />
              <InputField label="User Pass" icon="🔑" type={showPass ? "text" : "password"} value={formData.user_pass} onChange={(v:any) => setFormData({...formData, user_pass: v})} light />
              <InputField label="Admin ID" icon="🛠️" value={formData.admin_name} onChange={(v:any) => setFormData({...formData, admin_name: v})} light />
              <InputField label="Admin Pass" icon="🔒" type={showPass ? "text" : "password"} value={formData.admin_pass} onChange={(v:any) => setFormData({...formData, admin_pass: v})} light />
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-50">
               <InputField label="Verification Code" icon="🛡️" type={showPass ? "text" : "password"} placeholder="P2P Code" value={formData.v_code} onChange={(v:any) => setFormData({...formData, v_code: v})} light />
            </div>
          </div>

          {/* REMARKS */}
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2"><Info size={14}/> Technical Remarks</label>
            <textarea className="w-full p-6 bg-white border border-slate-200 rounded-[30px] outline-none text-xs font-bold text-slate-700 min-h-[140px] focus:border-blue-500 transition-all resize-none shadow-inner"
              placeholder="Enter critical Device details..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
          </div>

          {/* 🚩 FOOTER ACTION */}
          <div className="pt-4 pb-40">
            <button onClick={handleSave} disabled={loading}
              className="w-full bg-[#1a9e52] text-white font-[1000] py-6 rounded-[28px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50 text-base uppercase tracking-[4px] italic border-b-[6px] border-emerald-900">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />} 
              {loading ? 'SYNCING...' : 'Save & Continue'}
            </button>
            <p className="text-center mt-10 text-[9px] font-black text-slate-300 uppercase tracking-[8px] italic opacity-40">Modern Cloud Engine</p>
          </div>

        </div>
      </div>

      <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(prev => ({...prev, isOpen: false}))} onConfirm={dialog.onConfirm} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="Acknowledge" />
    </div>
  );
}

function InputField({ label, placeholder, onChange, value, highlight, light, type = "text", icon }: any) {
  return (
    <div className="w-full text-left space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest italic flex items-center gap-2 uppercase">
        <span className="text-base opacity-70">{icon}</span> {label}
      </label>
      <input type={type} className={`w-full p-4 border rounded-2xl font-black italic text-slate-800 text-[12px] outline-none transition-all shadow-sm active:scale-[0.99] ${light ? 'bg-slate-50 border-transparent focus:border-blue-100 shadow-inner' : highlight ? 'bg-white border-emerald-100 focus:border-emerald-500 shadow-emerald-50' : 'bg-white border-slate-200 focus:border-blue-500'}`} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}