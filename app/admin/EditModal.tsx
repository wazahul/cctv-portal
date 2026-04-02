"use client";
import React, { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Cpu, Hash, Layers, Target, KeyRound
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

  // 🛡️ HMODAL LOCK & VIEWPORT SYNC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const setHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      window.addEventListener('resize', setHeight);
      setHeight();
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
        setDevice({ 
          ...device, 
          latitude: pos.coords.latitude.toFixed(8),
          longitude: pos.coords.longitude.toFixed(8) 
        });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 animate-in fade-in duration-300">
      
      <div 
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        className="bg-[#fcfdfe] w-full max-w-xl sm:h-auto sm:max-h-[95vh] sm:rounded-[45px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-500"
      >
        
        {/* 🏗️ STICKY HEADER */}
        <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-xl p-4 flex justify-between items-center shrink-0 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center gap-3 italic text-left">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-lg font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Edit Device Details</h3>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[3px] mt-1 leading-none italic">Modern Enterprises</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-100 rounded-xl text-slate-400 active:scale-90 border border-slate-200/50">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 📝 SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-7 pt-6 pb-44 text-left overscroll-contain touch-pan-y custom-scroll bg-[#fcfdfe]">
          
          {/* Identity Section */}
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
              <Hash size={12} className="text-blue-500" /> Device SN
            </label>
            <div className="p-4 bg-slate-50 border-2 border-slate-100 border-dashed rounded-[22px] font-mono font-black text-slate-500 text-[11px] text-center shadow-inner italic break-all select-all">
              {device.device_sn}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Site Name" icon="🏢" value={device.site_name} onChange={(v:any) => handleChange('site_name', v)} />
            
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
                <Layers size={12} className="text-blue-500"/> Category
              </label>
              <select 
                value={device.category} 
                onChange={e => handleChange('category' as any, e.target.value)} 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black italic text-slate-800 text-[12px] outline-none appearance-none focus:border-blue-500 shadow-sm transition-all"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>

            <InputField label="Model No." icon="⚙️" value={device.model} onChange={(v:any) => handleChange('model', v)} />
            <InputField label="Network IP" icon="🌐" value={device.ip_address} onChange={(v:any) => handleChange('ip_address', v)} />
          </div>

          {/* 🔐 Security Credentials (V-CODE ADDED HERE) */}
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
              <InputField label="User ID" icon="👤" value={device.user_name} onChange={(v:any) => handleChange('user_name', v)} light />
              <InputField label="User Pass" icon="🔑" type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v:any) => handleChange('user_pass', v)} light />
              <InputField label="Admin ID" icon="🛠️" value={device.admin_name} onChange={(v:any) => handleChange('admin_name', v)} light />
              <InputField label="Admin Pass" icon="🔒" type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v:any) => handleChange('admin_pass', v)} light />
            </div>

            {/* 🛡️ THE MISSING V-CODE FIELD */}
            <div className="pt-2 relative z-10">
              <InputField 
                label="Verification Code (V-Code)" 
                icon={<KeyRound size={16} className="text-orange-500" />} 
                type={showPass ? "text" : "password"} 
                value={device.v_code} 
                onChange={(v:any) => handleChange('v_code', v)} 
                light 
              />
            </div>
          </div>

          {/* 📍 GPS SECTION */}
          <div className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[11px] font-[1000] text-red-600 uppercase tracking-[2px] italic flex items-center gap-2">
                  <MapPin size={18} /> Satellite Sync
                </span>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-7">Geofence Accuracy</span>
              </div>
              <button onClick={handleGetLocation} disabled={isLocating} 
                className="bg-slate-900 text-white px-5 py-3 rounded-2xl active:scale-95 shadow-2xl flex items-center gap-2 transition-all group border-b-4 border-black">
                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} className="group-hover:translate-x-1 transition-transform" />}
                <span className="text-[10px] font-black uppercase italic tracking-widest">Update GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-4 italic uppercase">📍 Latitude</label>
                  <input value={device.latitude || ""} onChange={e => handleChange('latitude', e.target.value)} 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-black text-[13px] text-slate-800 outline-none shadow-inner focus:border-red-200 transition-all" placeholder="0.000000" />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-4 italic uppercase">📍 Longitude</label>
                  <input value={device.longitude || ""} onChange={e => handleChange('longitude', e.target.value)} 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-black text-[13px] text-slate-800 outline-none shadow-inner focus:border-red-200 transition-all" placeholder="0.000000" />
                </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 ml-4 italic uppercase flex items-center gap-2">
                   <Target size={12} className="text-blue-500" /> Safe Radius (Meters)
                 </label>
                 <div className="relative">
                   <input type="number" value={device.radius || "100"} onChange={e => handleChange('radius', e.target.value)} 
                     className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl font-black text-[13px] text-blue-900 outline-none shadow-sm focus:border-blue-400 transition-all pl-12" />
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-300 text-xs italic">M</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2 italic">
              <Info size={14} className="text-slate-300" /> Technical Remarks
            </label>
            <textarea 
              rows={4} value={device.device_notes || ""} onChange={e => handleChange('device_notes' as any, e.target.value)} 
              className="w-full p-5 bg-white border border-slate-200 rounded-[30px] font-bold text-slate-700 outline-none text-[12px] focus:border-blue-500 transition-all resize-none shadow-inner shadow-slate-50" 
              placeholder="Enter site specific notes..."
            />
          </div>

          {/* 🚩 FOOTER ACTION */}
          <div className="pt-6 pb-20">
            <button 
              onClick={(e) => { e.preventDefault(); onUpdate(); }} disabled={isSaving}
              className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-[1000] uppercase text-[15px] tracking-[4px] flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all border-b-[6px] border-blue-900 italic"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
              {isSaving ? "SYNCING..." : "Update Device"}
            </button>
            <p className="text-center mt-8 text-[8px] font-black text-slate-300 uppercase tracking-[6px] italic opacity-40">Modern Cloud Engine</p>
          </div>

        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, value, onChange, type = "text", light = false }: any) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest italic flex items-center gap-2">
        <span className="text-base opacity-70">{icon}</span> {label}
      </label>
      <input 
        type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-4 border rounded-2xl font-black italic text-slate-800 text-[12px] outline-none transition-all shadow-sm ${light ? 'bg-slate-50 border-transparent focus:border-blue-100 shadow-inner' : 'bg-white border-slate-200 focus:border-blue-500 shadow-sm'}`} 
      />
    </div>
  );
}