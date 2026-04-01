"use client";
import React, { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, Cpu, User, Lock
} from "lucide-react";

interface DeviceData {
  device_sn: string; site_name: string; category: string; model: string;
  ip_address: string; user_name: string; user_pass: string; admin_name: string;
  admin_pass: string; v_code: string; latitude: string | number;
  longitude: string | number; radius: string | number; device_notes: string;
  [key: string]: any;
}

interface EditModalProps {
  isOpen: boolean; device: DeviceData | null; onClose: () => void;
  onUpdate: () => void; isSaving: boolean; setDevice: (device: DeviceData) => void;
}

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: EditModalProps) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 🛡️ BROWSER AUTO-HIDE LOGIC
  useEffect(() => {
    if (isOpen) {
      // Background ko scroll se rokna hai par browser interaction allow karni hai
      document.body.style.overflow = 'hidden';
      document.documentElement.style.scrollBehavior = 'smooth';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleChange = (key: keyof DeviceData, value: string) => {
    if (typeof setDevice === "function") setDevice({ ...device, [key]: value });
  };

  const handleGetLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDevice({ ...device, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/90 backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 animate-in fade-in duration-300">
      
      {/* 📱 100dvh + OVERSCROLL: Isse browser bar scroll hone par hide honge */}
      <div className="bg-[#f8fafc] w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:rounded-[50px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-500">
        
        {/* --- 🏗️ HEADER (Sticky) --- */}
        <div className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-200/50 p-5 flex justify-between items-center shrink-0 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center gap-4 italic text-left">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100/50">
               <Cpu size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Edit Master</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mt-1.5 leading-none italic">Configuration v3.5</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-[20px] text-slate-400 active:scale-90 border border-slate-100 shadow-sm transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 BODY (Natural Scroll) --- */}
        {/* touch-pan-y aur overscroll-auto browser ko bars hide karne par majboor karte hain */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-10 pt-8 pb-60 text-left overscroll-auto touch-pan-y custom-scroll bg-[#f8fafc]">
          
          {/* Device identity */}
          <div className="space-y-3">
             <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-[4px] leading-none italic uppercase">
               <Hash size={14} className="text-blue-500" /> Device SN
             </label>
             <div className="p-8 bg-white border-2 border-slate-100 border-dashed rounded-[35px] font-mono font-black text-slate-500 text-sm text-center shadow-inner italic">
               {device.device_sn}
             </div>
          </div>

          {/* Site Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            <InputField label="Site Name" icon="🏢" value={device.site_name} onChange={(v:any) => handleChange('site_name', v)} />
            <div className="space-y-3">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest leading-none uppercase italic text-left block">Category</label>
              <select 
                value={device.category} 
                onChange={e => handleChange('category', e.target.value)} 
                className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-[1000] italic text-slate-800 text-sm outline-none appearance-none cursor-pointer focus:border-blue-500 shadow-sm transition-all"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>
            <InputField label="Model No." icon="🏷️" value={device.model} onChange={(v:any) => handleChange('model', v)} />
            <InputField label="Network IP" icon="🌐" value={device.ip_address} onChange={(v:any) => handleChange('ip_address', v)} />
          </div>

          {/* Security Credentials */}
          <div className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10 px-1">
              <label className="text-[11px] font-[1000] uppercase text-slate-900 flex items-center gap-2 tracking-[2px] font-black italic uppercase">
                <ShieldCheck size={20} className="text-blue-600" /> Security Access
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="p-3 bg-slate-50 rounded-2xl text-blue-500 border border-blue-100 active:scale-95 transition-all shadow-sm">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <InputField label="User Name" icon="👤" value={device.user_name} onChange={(v:any) => handleChange('user_name', v)} light />
              <InputField label="User Pass" icon="🔑" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v:any) => handleChange('user_pass', v)} light />
              <InputField label="Admin Name" icon="🛠️" value={device.admin_name} onChange={(v:any) => handleChange('admin_name', v)} light />
              <InputField label="Admin Pass" icon="🔒" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v:any) => handleChange('admin_pass', v)} light />
            </div>
            <InputField label="V-Code (Verification)" icon="🛡️" type={showPass ? "text" : "password"} value={device.v_code} onChange={(v:any) => handleChange('v_code', v)} light />
          </div>

          {/* GPS Section */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-[1000] uppercase text-slate-900 flex items-center gap-2 tracking-widest leading-none font-black italic uppercase">
                <MapPin size={20} className="text-red-500" /> GPS Geofence
              </label>
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[10px] font-black bg-slate-900 text-white px-6 py-4 rounded-[20px] active:scale-95 shadow-lg flex items-center gap-2 transition-all">
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} FETCH GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 font-mono">
               {['latitude', 'longitude', 'radius'].map((key) => (
                 <div key={key} className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 shadow-inner text-center">
                   <label className="text-[9px] font-[1000] uppercase text-slate-400 block mb-1 leading-none uppercase italic">{key.slice(0,3)}</label>
                   <input value={device[key] || ""} onChange={e => handleChange(key as any, e.target.value)} className="w-full bg-transparent text-center font-black text-sm text-slate-800 outline-none" />
                 </div>
               ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-4">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-5 tracking-widest flex items-center gap-2 leading-none uppercase italic text-left block">
              <Info size={18} className="text-slate-300" /> Technical Remarks
            </label>
            <textarea rows={4} value={device.device_notes || ""} onChange={e => handleChange('device_notes', e.target.value)} className="w-full p-7 bg-white border-2 border-slate-100 rounded-[40px] font-[1000] italic text-sm outline-none focus:border-blue-500 shadow-inner resize-none transition-all shadow-slate-100" />
          </div>

          {/* 🚩 FINAL BUTTON: Non-Sticky, At the very end of content */}
          <div className="pt-10 pb-40 relative z-[150]">
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); onUpdate(); }} 
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-7 rounded-[35px] font-[1000] uppercase text-[17px] tracking-[5px] shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 active:scale-[0.92] disabled:opacity-50 transition-all border-b-[8px] border-blue-900 italic pointer-events-auto cursor-pointer"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} 
              {isSaving ? "SYNCING..." : "Sync Master Data"}
            </button>
            <p className="text-center mt-10 text-[10px] font-black text-slate-300 uppercase tracking-[6px] italic opacity-50">--- Modern Admin Engine ---</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, value, onChange, type = "text", light = false }: any) {
  return (
    <div className="space-y-3 text-left">
      <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest leading-none uppercase italic flex items-center gap-2">
        <span className="text-lg opacity-90">{icon}</span> {label}
      </label>
      <input 
        type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-5 border-2 rounded-[25px] font-[1000] italic text-slate-800 text-sm outline-none transition-all shadow-sm ${light ? 'bg-slate-50 border-transparent focus:border-blue-200 shadow-inner' : 'bg-white border-slate-100 focus:border-blue-500 shadow-sm'}`} 
      />
    </div>
  );
}