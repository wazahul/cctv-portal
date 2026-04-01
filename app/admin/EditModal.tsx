"use client";
import { useState, useEffect } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, User, Lock
} from "lucide-react";

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: any) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 🛡️ VIEWPORT LOCK: Background scroll prevent karne ke liye
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("GPS not supported");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (typeof setDevice === 'function') {
          setDevice({
            ...device,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          });
        }
        setIsLocating(false);
      },
      () => { alert("Allow GPS access"); setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      
      {/* 📱 100dvh Wrapper for Mobile App-Shell Feel */}
      <div className="bg-[#f8fafc] w-full max-w-2xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh] border-t sm:border border-white overflow-hidden animate-in slide-in-from-bottom duration-500 relative">
        
        {/* --- 🏗️ HEADER --- */}
        <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 italic">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-100">
               <Database size={20} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Sync Master</h3>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1.5 leading-none">Modern Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 border border-slate-100 transition-all">
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-8 pt-8 pb-32 text-left overscroll-contain custom-scroll bg-[#f8fafc]">
          
          {/* Identity Section */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-[3px] leading-none">
               <Hash size={14} className="text-blue-500" /> Device Serial
             </label>
             <div className="p-6 bg-white border-2 border-slate-100 border-dashed rounded-[30px] font-mono font-black text-slate-500 text-sm text-center shadow-sm uppercase">
               {device.device_sn}
             </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField label="Site Name" icon={<Monitor size={14}/>} value={device.site_name} onChange={(v: string) => setDevice({...device, site_name: v})} />
            
            <div className="space-y-2">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-3 tracking-widest">Category</label>
              <select 
                value={device.category} 
                onChange={e => setDevice({...device, category: e.target.value})} 
                className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-black text-sm outline-none appearance-none cursor-pointer focus:border-blue-500 shadow-sm transition-all"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>

            <InputField label="Model No." value={device.model} onChange={(v: string) => setDevice({...device, model: v})} />
            <InputField label="Network IP" value={device.ip_address} onChange={(v: string) => setDevice({...device, ip_address: v})} />
          </div>

          {/* ✅ Section 3: Network & Security (Added Missing User/Admin Names) */}
          <div className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-[1000] uppercase text-slate-900 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={18} className="text-blue-600" /> Security Credentials
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 border border-slate-200 active:scale-95 transition-all">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {/* User Access */}
              <InputField label="User Name" icon={<User size={12}/>} value={device.user_name} onChange={(v: string) => setDevice({...device, user_name: v})} light />
              <InputField label="User Pass" icon={<Lock size={12}/>} type={showPass ? "text" : "password"} value={device.user_pass} onChange={(v: string) => setDevice({...device, user_pass: v})} light />
              
              {/* Admin Access */}
              <InputField label="Admin Name" icon={<ShieldCheck size={12}/>} value={device.admin_name} onChange={(v: string) => setDevice({...device, admin_name: v})} light />
              <InputField label="Admin Pass" icon={<Lock size={12}/>} type={showPass ? "text" : "password"} value={device.admin_pass} onChange={(v: string) => setDevice({...device, admin_pass: v})} light />
            </div>

            <InputField label="Verification V-Code" type={showPass ? "text" : "password"} value={device.v_code} onChange={(v: string) => setDevice({...device, v_code: v})} light />
          </div>

          {/* GPS Card */}
          <div className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-xl space-y-5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-[1000] uppercase text-slate-900 flex items-center gap-2 tracking-widest">
                <MapPin size={18} className="text-red-500" /> GPS Geofence
              </label>
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[9px] font-black bg-slate-900 text-white px-5 py-3 rounded-full active:scale-95 shadow-lg flex items-center gap-2 transition-all">
                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} SYNC GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {['latitude', 'longitude', 'radius'].map((key) => (
                 <div key={key} className="p-4 rounded-[22px] bg-slate-50 border border-slate-100 shadow-inner text-center">
                   <label className="text-[8px] font-black uppercase text-slate-400 block mb-1 leading-none">{key.slice(0,3)}</label>
                   <input value={device[key]} onChange={e => setDevice({...device, [key]: e.target.value})} className="w-full bg-transparent text-center font-mono font-black text-[11px] text-slate-800 outline-none" />
                 </div>
               ))}
            </div>
          </div>

          {/* ✅ Section 5: Maintenance Notes (Added Remarks) */}
          <div className="space-y-3">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
              <Info size={16} className="text-slate-300" /> Technical Remarks
            </label>
            <textarea 
              rows={3} 
              value={device.device_notes} 
              onChange={e => setDevice({...device, device_notes: e.target.value})} 
              className="w-full p-6 bg-white border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none focus:border-blue-500 shadow-sm resize-none" 
              placeholder="Hardware details, location notes or pending work..." 
            />
          </div>
        </div>

        {/* --- 💾 ACTION FOOTER --- */}
        <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 shrink-0 mb-[env(safe-area-inset-bottom)]">
          <button 
            onClick={onUpdate} 
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-[1000] uppercase text-sm tracking-[3px] shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all border-b-4 border-blue-800"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
            {isSaving ? "Syncing Configuration..." : "Sync Master Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 🧰 InputField Sub-Component
function InputField({ label, icon, value, onChange, type = "text", light = false }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-3 tracking-widest flex items-center gap-1 leading-none uppercase">
        {icon}{label}
      </label>
      <input 
        type={type} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-5 border-2 rounded-[25px] font-black text-sm outline-none transition-all ${
          light ? 'bg-slate-50 border-transparent focus:border-blue-200 shadow-inner' : 'bg-white border-slate-100 focus:border-blue-500 shadow-sm'
        }`} 
      />
    </div>
  );
}