"use client";
import React, { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, Cpu 
} from "lucide-react";

interface DeviceData {
  device_sn: string;
  site_name: string;
  category: string;
  model: string;
  ip_address: string;
  user_name: string;
  user_pass: string;
  admin_name: string;
  admin_pass: string;
  v_code: string;
  latitude: string | number;
  longitude: string | number;
  radius: string | number;
  device_notes: string;
  [key: string]: any;
}

interface EditModalProps {
  isOpen: boolean;
  device: DeviceData | null;
  onClose: () => void;
  onUpdate: () => void;
  isSaving: boolean;
  setDevice: (device: DeviceData) => void;
}

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: EditModalProps) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 🛡️ CRITICAL FIX: Browser bar hide karne ke liye Body scroll lock zaroori hai
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed"; // iOS Safari fix
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleChange = (key: keyof DeviceData, value: string) => {
    if (typeof setDevice === "function") {
      setDevice({ ...device, [key]: value });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDevice({
          ...device,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        });
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    // 🚩 Viewport Fix: h-[100dvh] browser bars ko responsive banata hai
    <div className="fixed inset-0 z-[2000] bg-slate-900/70 backdrop-blur-md flex items-start justify-center overflow-hidden touch-none">
      
      {/* 📱 Full Screen Container */}
      <div className="bg-white w-full max-w-2xl h-[100dvh] sm:h-[92vh] sm:mt-6 sm:rounded-[45px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden touch-auto">
        
        {/* --- 🏗️ HEADER (Icon BG Removed) --- */}
        <div className="p-6 flex justify-between items-center border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-4 text-left">
            <div className="text-blue-600">
               <Database size={30} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[20px] font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Terminal Config</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mt-2 leading-none italic uppercase">Modern Admin Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-300 active:scale-90 transition-all border border-slate-100 shadow-sm">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 SCROLLABLE BODY (Browser UI trigger) --- */}
        {/* touch-pan-y aur Overscroll behavior browser ko signal deta hai bar hide karne ke liye */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-8 pt-8 pb-32 text-left custom-scroll touch-pan-y overscroll-contain">
          
          {/* Identity Section */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 ml-1 tracking-widest leading-none">
               <Hash size={14} className="text-blue-500" /> Serial Number
             </label>
             <div className="w-full p-5 bg-slate-50 border border-slate-200 border-dashed rounded-[22px] font-mono font-black text-slate-500 text-sm break-all text-center">
               {device.device_sn}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Site Name" icon={<Monitor size={12}/>} value={device.site_name} onChange={(v: string) => handleChange('site_name', v)} />
            <div className="space-y-2.5 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest leading-none">Category</label>
              <select 
                value={device.category} 
                onChange={e => handleChange('category', e.target.value)} 
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>
            <InputField label="Model Number" icon={<Cpu size={12}/>} value={device.model} onChange={(v: string) => handleChange('model', v)} />
            <InputField label="Static IP / URL" icon={<Monitor size={12}/>} value={device.ip_address} onChange={(v: string) => handleChange('ip_address', v)} />
          </div>

          {/* --- 🔐 ACCESS CREDENTIALS (Sky Blue Theme) --- */}
          <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100 space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <label className="text-[11px] font-black uppercase text-blue-600 flex items-center gap-2 tracking-widest leading-none uppercase">
                <ShieldCheck size={18} strokeWidth={2.5} /> Security Keys
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="p-2.5 bg-white rounded-xl text-blue-500 shadow-sm border border-blue-100 active:scale-95">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <InputField label="User Name" value={device.user_name} onChange={(v: string) => handleChange('user_name', v)} light />
              <InputField label="User Password" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v: string) => handleChange('user_pass', v)} light />
              <InputField label="Admin Name" value={device.admin_name} onChange={(v: string) => handleChange('admin_name', v)} light />
              <InputField label="Admin Password" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v: string) => handleChange('admin_pass', v)} light />
            </div>
            <InputField label="V-Code" type={showPass ? "text" : "password"} value={device.v_code} onChange={(v: string) => handleChange('v_code', v)} light />
          </div>

          {/* GPS Section */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-2">
              <label className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest leading-none uppercase">
                <MapPin size={16} className="text-red-500" /> GPS Geofencing
              </label>
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={isLocating} 
                className="text-[10px] font-black bg-slate-900 text-white px-5 py-3 rounded-xl active:scale-95 flex items-center gap-2 shadow-lg transition-all"
              >
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} SYNC GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {['latitude', 'longitude', 'radius'].map((key) => (
                 <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                   <label className="text-[8px] font-black uppercase text-slate-400 text-center block mb-1 leading-none uppercase">{key.slice(0,3)}</label>
                   <input 
                    value={device[key as keyof DeviceData]} 
                    onChange={e => handleChange(key as keyof DeviceData, e.target.value)} 
                    className="w-full bg-transparent text-center font-bold text-xs outline-none" 
                   />
                 </div>
               ))}
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 leading-none uppercase">
              <Info size={16} className="text-slate-300" /> Site Notes
            </label>
            <textarea 
              rows={3} 
              value={device.device_notes} 
              onChange={e => handleChange('device_notes', e.target.value)} 
              className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-[30px] font-bold text-sm outline-none focus:border-blue-400 shadow-inner resize-none" 
              placeholder="Hardware notes..." 
            />
          </div>

          {/* --- 💾 ACTION BUTTONS --- */}
          <div className="pt-10 flex flex-col gap-3 pb-20">
            <button 
              onClick={onUpdate}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black uppercase text-[14px] tracking-[3px] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all border-b-4 border-blue-800"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18}/>} 
              {isSaving ? "Syncing..." : "Sync Master Data"}
            </button>
            <button onClick={onClose} className="w-full py-4 text-slate-400 font-black uppercase text-[12px] tracking-[2px] active:scale-95 transition-all uppercase">
              Discard Changes
            </button>
          </div>
          
          {/* Scroll trigger hack: Ensures browser recognizes there is content to scroll */}
          <div className="h-10 opacity-0 pointer-events-none">.</div>
        </div>
      </div>
    </div>
  );
}

// 🧰 Sub-Component: InputField
interface InputFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  light?: boolean;
}

function InputField({ label, icon, value, onChange, type = "text", light = false }: InputFieldProps) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest flex items-center gap-1 leading-none uppercase">
        {icon}{label}
      </label>
      <input 
        type={type}
        value={value || ""} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        className={`w-full p-4 border-2 rounded-2xl font-bold text-sm outline-none transition-all ${
          light ? 'bg-white border-transparent focus:border-blue-300' : 'bg-white border-slate-100 focus:border-blue-500'
        }`} 
      />
    </div>
  );
}