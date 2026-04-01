"use client";
import React, { useState, useEffect, useRef } from "react";
// 🚩 FIXED: lucide-center ko lucide-react se replace kiya
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, Cpu 
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🛡️ BROWSER UI HIDE LOGIC (Fixed for Mobile Browsers)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleChange = (key: keyof DeviceData, value: string) => {
    if (typeof setDevice === "function") setDevice({ ...device, [key]: value });
  };

  const handleGetLocation = () => {
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
    <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-start justify-center overflow-hidden touch-none">
      
      {/* 📱 FULL VIEWPORT (dvh handles mobile bars dynamically) */}
      <div className="bg-white w-full max-w-2xl h-[100dvh] sm:h-[92vh] sm:mt-6 sm:rounded-[50px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden touch-auto">
        
        {/* --- 🏗️ HEADER --- */}
        <div className="p-7 flex justify-between items-center border-b border-slate-50 shrink-0 bg-white z-30">
          <div className="flex items-center gap-5">
            <div className="text-blue-600">
               <Database size={32} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h3 className="text-[22px] font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Edit Site Data</h3>
              <p className="text-[11px] font-black text-blue-500 uppercase tracking-[3.5px] mt-2 italic leading-none uppercase">Modern Admin Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-[22px] text-slate-400 active:scale-95 transition-all border border-slate-100 shadow-sm">
            <X size={26} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 SCROLLABLE BODY --- */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-7 sm:px-12 space-y-10 pt-10 pb-32 text-left overscroll-contain touch-pan-y custom-scroll">
          
          <div className="min-h-[102%]"> 

            <div className="space-y-4 mb-10">
               <label className="flex items-center gap-2 text-[12px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest leading-none">
                 <Hash size={16} className="text-blue-500" /> Device SN
               </label>
               <div className="w-full p-7 bg-slate-50 border border-slate-200 border-dashed rounded-[35px] font-mono font-black text-slate-500 text-sm text-center shadow-inner break-all">
                 {device.device_sn}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <InputField label="Site Name" icon={<Monitor size={14}/>} value={device.site_name} onChange={(v: string) => handleChange('site_name', v)} />
              <div className="space-y-3">
                <label className="text-[11px] font-[1000] uppercase text-slate-400 ml-3 tracking-widest leading-none uppercase">Category</label>
                <select 
                  value={device.category} 
                  onChange={e => handleChange('category', e.target.value)} 
                  className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-black text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="DVR (Analog)">📹 DVR (Analog)</option>
                  <option value="NVR (IP)">🖥️ NVR (IP)</option>
                  <option value="IP Camera">👁️ IP Camera</option>
                  <option value="Biometric">☝️ Biometric</option>
                </select>
              </div>
              <InputField label="Model Number" icon={<Cpu size={14}/>} value={device.model} onChange={(v: string) => handleChange('model', v)} />
              <InputField label="Network IP / URL" icon={<Monitor size={14}/>} value={device.ip_address} onChange={(v: string) => handleChange('ip_address', v)} />
            </div>

            {/* --- 🔐 CREDENTIALS (Sky Blue) --- */}
            <div className="bg-blue-50/60 p-8 rounded-[45px] border border-blue-100 space-y-8 mb-10">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-[1000] uppercase text-blue-600 flex items-center gap-2 tracking-widest leading-none uppercase">
                  <ShieldCheck size={20} strokeWidth={2.5} /> Security Keys
                </label>
                <button type="button" onClick={() => setShowPass(!showPass)} className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm border border-blue-100 active:scale-95 transition-all">
                  {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-5 relative z-10">
                <InputField label="User Name" value={device.user_name} onChange={(v: string) => handleChange('user_name', v)} light />
                <InputField label="User Password" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v: string) => handleChange('user_pass', v)} light />
                <InputField label="Admin Name" value={device.admin_name} onChange={(v: string) => handleChange('admin_name', v)} light />
                <InputField label="Admin Password" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v: string) => handleChange('admin_pass', v)} light />
              </div>
              <InputField label="V-Code" type={showPass ? "text" : "password"} value={device.v_code} onChange={(v: string) => handleChange('v_code', v)} light />
            </div>

            {/* GPS Section */}
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center px-2">
                <label className="text-[12px] font-[1000] uppercase text-slate-400 flex items-center gap-2 tracking-widest leading-none uppercase">
                  <MapPin size={18} className="text-red-500" /> GPS Geofencing
                </label>
                <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[11px] font-black bg-slate-900 text-white px-6 py-4 rounded-[22px] active:scale-95 flex items-center gap-2 shadow-xl transition-all">
                  {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />} FETCH GPS
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 {['latitude', 'longitude', 'radius'].map((key) => (
                   <div key={key} className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 shadow-inner text-center">
                     <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 leading-none uppercase">{key.slice(0,3)}</label>
                     <input value={device[key as keyof DeviceData]} onChange={e => handleChange(key as keyof DeviceData, e.target.value)} className="w-full bg-transparent text-center font-[1000] text-sm text-slate-800 outline-none" />
                   </div>
                 ))}
              </div>
            </div>

            {/* --- 💾 ACTION BUTTONS --- */}
            <div className="flex flex-col gap-4 pb-40">
              <button 
                onClick={onUpdate} disabled={isSaving}
                className="w-full bg-blue-600 text-white py-6 rounded-[35px] font-[1000] uppercase text-[16px] tracking-[4px] shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 transition-all border-b-8 border-blue-900"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Sync Master Data
              </button>
              <button onClick={onClose} className="w-full py-5 bg-slate-100 text-slate-400 rounded-[35px] font-black uppercase text-[12px] tracking-[2.5px] active:scale-95">Discard Changes</button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-Component: InputField
interface InputFieldProps {
  label: string; icon?: React.ReactNode; value: string | number;
  onChange: (v: string) => void; type?: string; light?: boolean;
}

function InputField({ label, icon, value, onChange, type = "text", light = false }: InputFieldProps) {
  return (
    <div className="space-y-3 text-left">
      <label className="text-[11px] font-[1000] uppercase text-slate-400 ml-3 tracking-widest flex items-center gap-1 leading-none uppercase">{icon}{label}</label>
      <input 
        type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-5 border-2 rounded-[25px] font-black text-sm outline-none transition-all ${light ? 'bg-white border-transparent focus:border-blue-300 shadow-sm' : 'bg-white border-slate-100 focus:border-blue-500'}`} 
      />
    </div>
  );
}