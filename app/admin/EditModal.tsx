"use client";
import { useState } from "react";
// Yahan saare icons import hona zaroori hain
import { 
  X, Save, ShieldCheck, MapPin, Info, 
  Eye, EyeOff, Navigation, Loader2, Database, Hash 
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
        setDevice({
          ...device,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        });
        setIsLocating(false);
      },
      () => { alert("Allow GPS access"); setIsLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl flex flex-col max-h-[92vh] border border-white overflow-hidden animate-in zoom-in duration-300">
        
        {/* --- HEADER --- */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-left">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
               <Database size={24} />
            </div>
            <h3 className="text-[24px] font-[1000] text-slate-800 uppercase tracking-tight">Master Device Edit</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-2 transition-all active:scale-90">
            <X size={35} strokeWidth={3} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Hardware Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[30px]">
              <label className="text-[11px] font-[900] uppercase text-slate-400 mb-2 block tracking-widest text-left">Serial Number</label>
              <div className="flex items-center gap-2 text-slate-600 font-mono font-[1000] text-[18px] uppercase tracking-tighter">
                <Hash size={18} /> {device.sn}
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-[900] uppercase text-slate-400 ml-4 tracking-widest">Category</label>
              <select 
                value={device.category} 
                onChange={e => setDevice({...device, category: e.target.value})}
                className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-bold text-[16px] outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="DVR (Analog)">📹 DVR (Analog)</option>
                <option value="NVR (IP)">🖥️ NVR (IP)</option>
                <option value="IP Camera">👁️ IP Camera</option>
                <option value="Biometric">☝️ Biometric</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <label className="text-[11px] font-[900] uppercase text-slate-400 ml-4 tracking-widest">Site Name</label>
              <input value={device.site_name} onChange={e => setDevice({...device, site_name: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-bold text-[16px] shadow-sm outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-[900] uppercase text-slate-400 ml-4 tracking-widest">Model Number</label>
              <input value={device.model} onChange={e => setDevice({...device, model: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-100 rounded-[25px] font-bold text-[16px] shadow-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Security Credentials Section */}
          <div className="bg-[#f0f7ff] p-8 rounded-[40px] border border-blue-100 space-y-6">
            <div className="flex justify-between items-center px-1">
              <label className="text-[12px] font-[1000] uppercase text-blue-600 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={20} strokeWidth={3} /> Security Access
              </label>
              <button 
                type="button" onClick={() => setShowPass(!showPass)}
                className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm border border-blue-100 active:scale-90 transition-all"
              >
                {showPass ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
              </button>
            </div>

            <div className="space-y-4 text-left font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-[1000] text-blue-300 ml-4 uppercase">Host / IP Address</span>
                <input value={device.ip_address} onChange={e => setDevice({...device, ip_address: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-[16px] bg-white/70 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-[1000] text-blue-300 ml-4 uppercase tracking-tighter">User Pass</span>
                  <input type={showPass ? "text" : "password"} value={device.user_pass} onChange={e => setDevice({...device, user_pass: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-[16px] bg-white/70 outline-none" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-[1000] text-blue-300 ml-4 uppercase tracking-tighter">Admin Pass</span>
                  <input type={showPass ? "text" : "password"} value={device.admin_pass} onChange={e => setDevice({...device, admin_pass: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-[16px] bg-white/70 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-[1000] text-blue-300 ml-4 uppercase">V-Code</span>
                <input type={showPass ? "text" : "password"} value={device.v_code} onChange={e => setDevice({...device, v_code: e.target.value})} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-[16px] bg-white/70 outline-none" />
              </div>
            </div>
          </div>

          {/* GPS Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <label className="text-[11px] font-[900] uppercase text-slate-400 tracking-widest flex items-center gap-2 text-left">
                <MapPin size={16} /> GPS & Geofence
              </label>
              <button 
                type="button" onClick={handleGetLocation} disabled={isLocating}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[11px] font-black border border-emerald-100 active:scale-95 transition-all"
              >
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} SET LOCATION
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 border-2 border-slate-100 rounded-2xl text-center shadow-inner">
                <span className="text-[9px] font-black text-slate-300 uppercase block mb-1">Latitude</span>
                <input value={device.latitude} onChange={e => setDevice({...device, latitude: e.target.value})} className="w-full text-center font-bold text-[15px] outline-none" />
              </div>
              <div className="bg-white p-4 border-2 border-slate-100 rounded-2xl text-center shadow-inner">
                <span className="text-[9px] font-black text-slate-300 uppercase block mb-1">Longitude</span>
                <input value={device.longitude} onChange={e => setDevice({...device, longitude: e.target.value})} className="w-full text-center font-bold text-[15px] outline-none" />
              </div>
              <div className="bg-white p-4 border-2 border-blue-100 rounded-2xl text-center shadow-inner font-sans">
                <span className="text-[9px] font-black text-blue-300 uppercase block mb-1">Radius (M)</span>
                <input value={device.radius} onChange={e => setDevice({...device, radius: e.target.value})} className="w-full text-center font-black text-blue-600 text-[18px] outline-none" />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2 text-left pb-10">
            <label className="text-[11px] font-[900] uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
              <Info size={16} /> Technical Remarks
            </label>
            <textarea 
              rows={3} 
              value={device.device_notes} 
              onChange={e => setDevice({...device, device_notes: e.target.value})} 
              className="w-full p-6 border-2 border-slate-100 rounded-[30px] font-bold text-[15px] focus:border-blue-500 outline-none bg-[#fdfdfd] shadow-inner font-sans" 
            />
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-10">
          <button 
            disabled={isSaving}
            onClick={onUpdate}
            className="w-full bg-[#0061FF] text-white py-6 rounded-[30px] font-[1000] text-[18px] uppercase tracking-[2px] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? "SYNCING..." : "Save Master Data"}
          </button>
        </div>
      </div>
    </div>
  );
}