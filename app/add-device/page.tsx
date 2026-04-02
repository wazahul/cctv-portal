"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle, Rocket, Loader2, Database, 
  Disc, Navigation, MousePointer2, User, ShieldCheck, Hash, Monitor, X, Eye, EyeOff, Lock, Cpu
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
  const [showPass, setShowPass] = useState(false); // 🚩 Password Masking State
  
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSave = async () => {
    // 🚩 Professional English Validation Alerts
    if (!formData.device_sn.trim() || !formData.site_name.trim()) {
      setDialog({ 
        isOpen: true, 
        title: "Incomplete Configuration", 
        message: "Device Serial Number and Site Name are required fields for cloud registration.", 
        type: "warning", 
        onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
      });
      return;
    }
    
    setLoading(true);
    let finalLat: number | null = null;
    let finalLng: number | null = null;

    if (isManual) {
      finalLat = parseFloat(formData.latitude.trim());
      finalLng = parseFloat(formData.longitude.trim());
      if (isNaN(finalLat!) || isNaN(finalLng!)) {
        setDialog({ 
          isOpen: true, 
          title: "Invalid Coordinates", 
          message: "Please provide valid numerical GPS data for manual node registration.", 
          type: "danger", 
          onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
        });
        setLoading(false); return;
      }
    } else {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        setDialog({ 
          isOpen: true, 
          title: "Geolocation Timeout", 
          message: "Satellite sync failed. Please enable GPS or switch to Manual Pin mode.", 
          type: "warning", 
          onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
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
        isOpen: true, 
        title: "Registry Error", 
        message: error.message || "An unexpected error occurred during database synchronization.", 
        type: "danger", 
        onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
      });
    } else {
      setDialog({ 
        isOpen: true, 
        title: "Registration Success", 
        message: `Node ${formData.site_name} has been successfully synced to the Modern Cloud inventory.`, 
        type: "success", 
        onConfirm: () => router.push('/admin') 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-stretch sm:items-center justify-center p-0 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-[#f8fafc] h-[100dvh] sm:h-auto sm:max-h-[94vh] sm:rounded-[55px] shadow-2xl flex flex-col overflow-hidden relative border-t border-white/20 animate-in slide-in-from-bottom duration-700">
        
        {/* --- 🏗️ HEADER --- */}
        <div className="sticky top-0 z-[100] bg-white border-b border-slate-200/50 p-6 flex justify-between items-center shrink-0 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <div className="flex items-center gap-4 italic text-left">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100"><Cpu size={24} strokeWidth={2.5} /></div>
            <div>
              <h3 className="text-xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Register New Device</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mt-1.5 leading-none italic">Modern Enterprises</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="p-4 bg-slate-50 rounded-[22px] text-slate-400 active:scale-75 border border-slate-100 transition-all"><X size={24} strokeWidth={3} /></button>
        </div>

        {/* --- 📝 BODY --- */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-10 pt-8 pb-40 text-left overscroll-auto touch-pan-y custom-scroll bg-[#f8fafc]">
          
          <InputField label="Device Serial Number (SN)" icon="🔢" placeholder="AH1857798" 
            value={formData.device_sn} highlight
            onChange={(v: string) => setFormData({...formData, device_sn: v})} />
          
          <InputField label="Site / Client Name" icon="🏢" placeholder="Wazahul Villa" 
            value={formData.site_name} 
            onChange={(v: string) => setFormData({...formData, site_name: v})} />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest leading-none italic uppercase">📁 Category</label>
              <select className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-[1000] italic text-slate-800 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500 shadow-sm transition-all"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP System)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-[1000] uppercase text-blue-500 ml-4 tracking-widest leading-none italic uppercase flex items-center gap-1"><Disc size={12}/> Radius (M)</label>
              <input type="number" value={formData.radius} className="w-full p-5 bg-blue-50/50 border-2 border-blue-100 rounded-[25px] outline-none text-center font-black text-blue-600 focus:border-blue-500 transition-all shadow-inner"
                onChange={(e) => setFormData({...formData, radius: e.target.value})} />
            </div>
          </div>

          <div className="bg-slate-100 p-2 rounded-[32px] flex gap-2 border border-slate-200">
            <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-[1000] uppercase transition-all flex items-center justify-center gap-2 italic ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><Navigation size={14} /> Auto GPS</button>
            <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-[1000] uppercase transition-all flex items-center justify-center gap-2 italic ${isManual ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500'}`}><MousePointer2 size={14} /> Manual Pin</button>
          </div>

          {isManual && (
            <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
              <InputField label="📍 Latitude" placeholder="00.0000" value={formData.latitude} onChange={(v: string) => setFormData({...formData, latitude: v})} />
              <InputField label="📍 Longitude" placeholder="00.0000" value={formData.longitude} onChange={(v: string) => setFormData({...formData, longitude: v})} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <InputField label="Hardware Model" icon="🏷️" placeholder="DS-XXXX" value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
            <InputField label="Network IP" icon="🌐" placeholder="192.168.1.XX" value={formData.ip_address} onChange={(v: string) => setFormData({...formData, ip_address: v})} />
          </div>

          {/* 🔐 SECURITY CARD (Final Blueprint UI) */}
          <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center px-1 relative z-10">
              <div className="flex items-center gap-3 text-blue-600">
                <ShieldCheck size={22} strokeWidth={2.5}/>
                <span className="text-[12px] font-[1000] uppercase tracking-[2px] italic leading-none">Security Credentials</span>
              </div>
              <button type="button" onClick={() => setShowPass(!showPass)} className="p-3 bg-slate-50 rounded-2xl text-blue-500 border border-blue-100 active:scale-90 transition-all">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 text-left">
              <InputField label="User Login ID" icon="👤" placeholder="user" value={formData.user_name} onChange={(v: string) => setFormData({...formData, user_name: v})} light />
              <InputField label="User Password" icon="🔑" placeholder="****" value={formData.user_pass} type={showPass ? "text" : "password"} onChange={(v: string) => setFormData({...formData, user_pass: v})} light />
              <InputField label="Admin Login ID" icon="🛡️" placeholder="admin" value={formData.admin_name} onChange={(v: string) => setFormData({...formData, admin_name: v})} light />
              <InputField label="Admin Password" icon="🔒" placeholder="****" value={formData.admin_pass} type={showPass ? "text" : "password"} onChange={(v: string) => setFormData({...formData, admin_pass: v})} light />
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-50">
               <InputField label="Verification Code (V-Code)" icon="🛡️" placeholder="P2P Verification Code" value={formData.v_code} type={showPass ? "text" : "password"} onChange={(v: string) => setFormData({...formData, v_code: v})} light />
            </div>
          </div>

          <div className="space-y-4 pb-10">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-6 tracking-widest leading-none italic block">📝 Maintenance Remarks</label>
            <textarea className="w-full p-8 bg-white border-2 border-slate-100 rounded-[40px] outline-none text-sm font-bold text-slate-700 min-h-[140px] focus:border-blue-500 transition-all resize-none shadow-inner"
              placeholder="Important notes about this node..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
          </div>

          {/* 🚩 FINAL ACTION BUTTON (Non-Sticky for Browser UI) */}
          <div className="pt-10 pb-60 relative z-[150]">
            <button onClick={handleSave} disabled={loading}
              className="w-full bg-[#1a9e52] text-white font-[1000] py-7 rounded-[35px] flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(26,158,82,0.3)] active:scale-95 transition-all disabled:opacity-50 text-[17px] uppercase tracking-[4px] border-b-[8px] border-emerald-900 italic pointer-events-auto cursor-pointer">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />} 
              {loading ? 'SYNCING...' : 'Register Device'}
            </button>
            <p className="text-center mt-10 text-[10px] font-black text-slate-300 uppercase tracking-[6px] italic opacity-50">--- Modern Admin Engine ---</p>
          </div>

        </div>
      </div>

      <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(prev => ({...prev, isOpen: false}))} onConfirm={dialog.onConfirm} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="Understood" />
    </div>
  );
}

function InputField({ label, placeholder, onChange, value, highlight = false, icon, light = false, type = "text" }: any) {
  return (
    <div className="w-full text-left space-y-3">
      <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest leading-none flex items-center gap-2 italic uppercase">
        <span className="text-lg opacity-90">{icon}</span> {label}
      </label>
      <input 
        type={type}
        className={`w-full p-5 border-2 rounded-[25px] font-[1000] italic text-slate-800 text-sm outline-none transition-all shadow-sm active:scale-[0.98] ${
          light ? 'bg-slate-50 border-transparent focus:border-blue-200 shadow-inner' : highlight ? 'bg-white border-emerald-100 focus:border-emerald-500 shadow-emerald-50' : 'bg-white border-slate-100 focus:border-blue-500'
        }`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}