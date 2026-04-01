"use client";
import { useState } from "react";
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash, Monitor 
} from "lucide-react";

export default function EditModal({ isOpen, device, onClose, onUpdate, isSaving, setDevice }: any) {
  const [showPass, setShowPass] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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
      
      {/* 📱 Mobile: Bottom Sheet | 💻 Desktop: Centered Modal */}
      <div className="bg-white w-full max-w-2xl rounded-t-[35px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] border-t sm:border border-white overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        
        {/* --- 📌 HEADER --- */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
               <Database size={18} />
            </div>
            <div>
              <h3 className="text-[18px] font-[1000] text-slate-800 uppercase tracking-tight leading-none">Edit Site Data</h3>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[2px] mt-1 italic">Modern Enterprises</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 p-2 bg-slate-50 rounded-full active:scale-90 transition-all">
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* --- 📝 BODY --- */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto custom-scrollbar pb-32 text-left">
          
          {/* Section 1: Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest">
                <Hash size={12} className="text-blue-500" /> Device Serial Number
              </label>
              <div className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl font-mono font-black text-slate-600 text-[15px]">
                {device.device_sn}
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <label className="flex items-center gap-2 text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest">
                <Monitor size={12} className="text-blue-500" /> Device Category
              </label>
              <select 
                value={device.category} 
                onChange={e => setDevice({...device, category: e.target.value})}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 appearance-none shadow-sm cursor-pointer"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>
          </div>

          {/* Section 2: Site Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest">Client / Site Name</label>
              <input value={device.site_name} onChange={e => setDevice({...device, site_name: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 shadow-sm transition-all" placeholder="Enter site name..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-1 tracking-widest">Hardware Model No.</label>
              <input value={device.model} onChange={e => setDevice({...device, model: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 shadow-sm transition-all" placeholder="Enter model number..." />
            </div>
          </div>

          {/* Section 3: Network & Security */}
          <div className="bg-blue-50/40 p-6 rounded-[35px] border border-blue-100/50 space-y-5 text-left">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-[1000] uppercase text-blue-600 flex items-center gap-2 tracking-widest leading-none">
                <ShieldCheck size={16} strokeWidth={3} /> Network / Security Access
              </label>
              <button type="button" onClick={() => setShowPass(!showPass)} className="bg-white p-2 rounded-xl text-blue-500 shadow-sm border border-blue-100 active:scale-90">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-blue-400 ml-3 uppercase">Static IP / Domain URL</label>
                <input value={device.ip_address} onChange={e => setDevice({...device, ip_address: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-sm bg-white/80 outline-none focus:border-blue-400 shadow-sm transition-all" placeholder="e.g. 192.168.1.10" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-blue-400 ml-3 uppercase">User Password</label>
                  <input type={showPass ? "text" : "password"} value={device.user_pass} onChange={e => setDevice({...device, user_pass: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-sm bg-white/80 outline-none focus:border-blue-400 shadow-sm" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-blue-400 ml-3 uppercase">Admin Password</label>
                  <input type={showPass ? "text" : "password"} value={device.admin_pass} onChange={e => setDevice({...device, admin_pass: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-sm bg-white/80 outline-none focus:border-blue-400 shadow-sm" />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-blue-400 ml-3 uppercase">Verification Code (V-Code)</label>
                <input type={showPass ? "text" : "password"} value={device.v_code} onChange={e => setDevice({...device, v_code: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-sm bg-white/80 outline-none focus:border-blue-400 shadow-sm" placeholder="Device V-Code" />
              </div>
            </div>
          </div>

          {/* Section 4: Location Settings */}
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-[1000] uppercase text-slate-400 flex items-center gap-2 tracking-widest leading-none">
                <MapPin size={15} className="text-red-500" /> GPS & Geofence
              </label>
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={isLocating} 
                className="text-[10px] font-black bg-emerald-600 text-white px-4 py-2 rounded-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-50 transition-all"
              >
                {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} FETCH GPS
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 ml-2 uppercase text-center block leading-none">Lat</label>
                <input value={device.latitude} onChange={e => setDevice({...device, latitude: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold text-xs outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 ml-2 uppercase text-center block leading-none">Lon</label>
                <input value={device.longitude} onChange={e => setDevice({...device, longitude: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold text-xs outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-blue-400 ml-2 uppercase text-center block leading-none">Rad(m)</label>
                <input value={device.radius} onChange={e => setDevice({...device, radius: e.target.value})} className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-center font-black text-blue-600 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* Section 5: Remarks */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-[1000] uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
              <Info size={14} className="text-slate-300" /> Maintenance Remarks
            </label>
            <textarea 
              rows={2} 
              value={device.device_notes} 
              onChange={e => setDevice({...device, device_notes: e.target.value})} 
              className="w-full p-5 border-2 border-slate-100 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 bg-[#fdfdfd] shadow-inner resize-none transition-all" 
              placeholder="Important notes about this site..."
            />
          </div>
        </div>

        {/* --- 💾 FOOTER (Balanced Buttons) --- */}
        <div className="p-5 sm:p-7 bg-white border-t border-slate-50 sticky bottom-0 z-10 flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 active:scale-95 transition-all bg-slate-50"
          >
            Cancel
          </button>
          <button 
            disabled={isSaving}
            onClick={onUpdate}
            className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-[1000] uppercase text-[12px] tracking-[2px] shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? "SYNCING..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}