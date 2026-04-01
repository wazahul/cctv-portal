"use client";
import { useState } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor, User, Lock
} from "lucide-react";

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: any) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen || !device) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
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
      () => { setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-md flex items-start justify-center animate-in fade-in duration-300">
      
      {/* 📱 Full Screen Container - Maximized for Admin Tasks */}
      <div className="bg-white w-full max-w-2xl h-full sm:h-[95vh] sm:mt-6 sm:rounded-[45px] shadow-2xl flex flex-col overflow-y-auto custom-scroll animate-in slide-in-from-bottom-10 duration-500">
        
        {/* --- 🏗️ HEADER (Sticky Branding) --- */}
        <div className="p-6 flex justify-between items-center border-b border-slate-50 shrink-0 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl">
               <Database size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[18px] font-[1000] italic tracking-tighter text-slate-900 uppercase leading-none">Edit Site Data</h3>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mt-1.5 italic">Modern Admin Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-full text-slate-400 active:scale-90 transition-all border border-slate-100">
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 BODY --- */}
        <div className="p-6 sm:p-10 space-y-8 text-left">
          
          {/* Identity Section */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest">
               <Hash size={14} className="text-blue-500" /> Unique Terminal ID
             </label>
             <div className="w-full p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[25px] font-mono font-black text-slate-500 text-xs break-all text-center">
               {device.device_sn}
             </div>
          </div>

          {/* Site & Model (NEW FIELD ADDED) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-2 tracking-widest">🏢 Site Name</label>
              <input value={device.site_name} onChange={e => setDevice({...device, site_name: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-[20px] font-black text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-2 tracking-widest">🏷️ Model No.</label>
              <input value={device.model} onChange={e => setDevice({...device, model: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-[20px] font-black text-sm outline-none focus:border-blue-500" placeholder="DS-XXXXX" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-2 tracking-widest">📁 Device Category</label>
            <select value={device.category} onChange={e => setDevice({...device, category: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-[20px] font-[1000] text-sm outline-none appearance-none">
              <option value="DVR (Analog)">📹 DVR (Analog)</option>
              <option value="NVR (IP)">🖥️ NVR (IP)</option>
              <option value="IP Camera">👁️ IP Camera</option>
              <option value="Biometric">☝️ Biometric</option>
            </select>
          </div>

          {/* 🛡️ SECURITY BOX (Instruction: Light Blue Card & Emojis) */}
          <div className="bg-blue-50 p-7 rounded-[40px] border border-blue-100 space-y-6 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-[1000] uppercase text-blue-600 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={18} strokeWidth={3} /> Access Protocols 🔐
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="bg-white p-2.5 rounded-xl text-blue-500 active:scale-95 border border-blue-100 shadow-sm">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-blue-400 ml-4 uppercase">🌐 Static IP / URL</label>
                <input value={device.ip_address} onChange={e => setDevice({...device, ip_address: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-black text-sm text-slate-700 outline-none focus:border-blue-300" />
              </div>

              {/* USER & ADMIN NAMES (NEW FIELDS ADDED) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest">👤 User Name</label>
                  <input value={device.user_name} onChange={e => setDevice({...device, user_name: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-black text-sm text-slate-700 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest">🛡️ Admin Name</label>
                  <input value={device.admin_name} onChange={e => setDevice({...device, admin_name: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-black text-sm text-slate-700 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest">🔑 User Password</label>
                  <input type={showPass ? "text" : "password"} value={device.user_pass} onChange={e => setDevice({...device, user_pass: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-black text-sm text-slate-700 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-blue-400 ml-4 uppercase tracking-widest">🔒 Admin Password</label>
                  <input type={showPass ? "text" : "password"} value={device.admin_pass} onChange={e => setDevice({...device, admin_pass: e.target.value})} className="w-full p-4 bg-white border-2 border-white rounded-[20px] font-black text-sm text-slate-700 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* GPS Section */}
          <div className="space-y-5">
            <div className="flex justify-between items-center px-2">
              <label className="text-[11px] font-[1000] uppercase text-slate-400 flex items-center gap-2 tracking-widest">
                <MapPin size={16} className="text-red-500" /> GPS Geofence 📍
              </label>
              <button type="button" onClick={handleGetLocation} disabled={isLocating} className="text-[9px] font-black bg-slate-900 text-white px-5 py-3 rounded-2xl active:scale-95 flex items-center gap-2 transition-all">
                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} SYNC GPS
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {[
                 { label: 'Lat', key: 'latitude' },
                 { label: 'Lon', key: 'longitude' },
                 { label: 'Rad(m)', key: 'radius', color: 'text-blue-600 bg-blue-50' }
               ].map((item) => (
                 <div key={item.key} className={`p-4 rounded-[22px] border border-slate-100 shadow-inner ${item.color || 'bg-slate-50 text-slate-700'}`}>
                   <label className="text-[8px] font-black uppercase text-slate-400 text-center block mb-1">{item.label}</label>
                   <input value={device[item.key]} onChange={e => setDevice({...device, [item.key]: e.target.value})} className="w-full bg-transparent text-center font-[1000] text-sm outline-none" />
                 </div>
               ))}
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
              <Info size={16} className="text-slate-300" /> Maintenance Notes 📝
            </label>
            <textarea rows={3} value={device.device_notes} onChange={e => setDevice({...device, device_notes: e.target.value})} className="w-full p-6 bg-slate-50/50 border-2 border-slate-50 rounded-[35px] font-bold text-sm outline-none focus:border-blue-500 shadow-inner resize-none transition-all" placeholder="Enter hardware specific notes here..." />
          </div>

          {/* --- 💾 ACTION BUTTONS (Instruction: Size chota kare) --- */}
          <div className="pt-8 flex flex-col gap-4 pb-20">
            <button 
              onClick={onUpdate}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-4.5 rounded-[22px] font-[1000] uppercase text-[13px] tracking-[3px] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all border-b-4 border-blue-800"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {isSaving ? "Syncing..." : "Update Master Data"}
            </button>
            <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-400 rounded-[22px] font-black uppercase text-[11px] tracking-[2px] active:scale-95 transition-all">
              Discard Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}