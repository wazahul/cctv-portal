"use client";
// app/add-device/page.tsx 
import AuthGuard from "@/lib/components/AuthGuard";
import { useState } from 'react';
import dynamic from "next/dynamic"; // 🚩 Map integration ke liye
import { COMPANY } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';
import { encryptData } from '@/lib/crypto';

import { 
  MapPin, Loader2, Database, Disc, Navigation, MousePointer2, 
  ShieldCheck, Hash, X, Monitor, Key, Lock, Fingerprint, User, 
  CircuitBoard, ClipboardEdit, Globe, Settings, Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterDialog from '@/lib/components/MasterDialog';

// 🚩 Dynamic Import for MapPicker (No SSR Error)
const MapPicker = dynamic(() => import("@/lib/components/MapPicker"), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-[35px] flex items-center justify-center border-2 border-dashed border-slate-200">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Syncing Satellite Map...</p>
    </div>
  )
});

interface FormData {
  device_sn: string; site_name: string; category: string; model: string;
  ip_address: string; user_name: string; user_pass: string;
  admin_name: string; admin_pass: string; v_code: string;
  device_notes: string; radius: string; latitude: string; longitude: string;
}

export default function AddDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  
  // 🔔 Master Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any, 
    onConfirm: () => setDialog(prev => ({...prev, isOpen: false}))
  });

  const [formData, setFormData] = useState<FormData>({
    device_sn: '', site_name: '', category: 'DVR (Analog)', model: '',
    ip_address: '', user_name: 'user', user_pass: '', 
    admin_name: 'admin', admin_pass: '', 
    v_code: '', device_notes: '', radius: '100', latitude: '19.1623522', longitude: '72.9335731' 
  });

  const handleSave = async () => {
    // 🚩 Validation Check
    if (!formData.device_sn || !formData.site_name) {
      setDialog({ 
        isOpen: true, title: "Missing Data", 
        message: "Serial Number aur Site Name daalna zaroori hai bhai!", 
        type: "warning", 
        onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
      });
      return;
    }
    
    setLoading(true);
    let finalLat = parseFloat(formData.latitude);
    let finalLng = parseFloat(formData.longitude);

    if (!isManual) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        console.warn("Auto GPS Timeout, using Picker/Manual coordinates.");
      }
    }

    try {
      // 🔒 Encryption & Insertion
      const { error } = await supabase.from('devices').insert([{ 
        ...formData,
        user_pass: formData.user_pass ? encryptData(formData.user_pass) : '',
        admin_pass: formData.admin_pass ? encryptData(formData.admin_pass) : '',
        v_code: formData.v_code ? encryptData(formData.v_code) : '',
        radius: parseInt(formData.radius) || 100,
        latitude: finalLat,
        longitude: finalLng 
      }]);

      if (error) throw error;

      setDialog({ 
        isOpen: true, title: "Registered!", 
        message: `${formData.site_name} successfully add ho gaya hai.`, 
        type: "success", 
        onConfirm: () => router.push('/admin') 
      });
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Database Error", message: err.message, type: "danger", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 overflow-y-auto custom-scroll">
        
        <div className="bg-white w-full max-w-xl min-h-screen sm:min-h-0 sm:h-auto sm:max-h-[95vh] sm:rounded-[45px] shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-500">

          {/* 🏗️ STICKY HEADER (Original unchanged) */}
          <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-xl p-6 flex justify-between items-center shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-3 italic text-left">
              <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-100">
                <CircuitBoard size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Register Device</h3>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[3px] mt-1.5 leading-none italic">{COMPANY?.name || "Modern Enterprises"}</p>
              </div>
            </div>
            <button onClick={() => router.back()} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90 border border-slate-200/50 shadow-inner">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* 📝 FORM BODY */}
          <div className="flex-1 p-6 sm:p-10 space-y-8 bg-white pb-28 text-left">
            
            <InputField label="Device Serial Number (SN)" placeholder="S0420250605CCWRGB..." value={formData.device_sn} icon={<Hash size={14}/>} onChange={(v: string) => setFormData({...formData, device_sn: v.toUpperCase()})} highlight={true} />
            
            <InputField label="Site / Client Name" placeholder="Ex: Shaikh Villa" value={formData.site_name} icon={<Database size={14}/>} onChange={(v: string) => setFormData({...formData, site_name: v})} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1.5"><Monitor size={12}/> Category</label>
                <select className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[25px] outline-none text-sm font-bold text-slate-700 appearance-none focus:border-blue-400 transition-all shadow-sm"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="DVR (Analog)">📹 DVR (Analog)</option>
                  <option value="NVR (IP System)">🖥️ NVR (IP)</option>
                  <option value="IP Camera">👁️ IP Camera</option>
                  <option value="Biometric">☝️ Biometric</option>
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-blue-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1.5"><Target size={12}/> Radius (M)</label>
                <input type="number" value={formData.radius} className="w-full p-5 bg-blue-50/50 border-2 border-blue-50 rounded-[25px] outline-none text-center font-black text-blue-600 focus:border-blue-400 transition-all shadow-sm"
                  onChange={(e) => setFormData({...formData, radius: e.target.value})} />
              </div>
            </div>

            {/* 📍 GPS CONTROLS WITH MAP INTEGRATION */}
            <div className="bg-slate-50 p-2 rounded-[30px] flex gap-2 border border-slate-100">
              <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Navigation size={14} /> Auto GPS</button>
              <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${isManual ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}><MapPin size={14} /> Manual Map</button>
            </div>

            {isManual && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                {/* 🚩 INTERACTIVE SATELLITE MAP */}
                <MapPicker 
                  lat={parseFloat(formData.latitude)} 
                  lng={parseFloat(formData.longitude)} 
                  radius={parseInt(formData.radius)} 
                  onLocationChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Latitude" icon={<Globe size={12}/>} value={formData.latitude} onChange={(v) => setFormData({...formData, latitude: v})} />
                  <InputField label="Longitude" icon={<Globe size={12}/>} value={formData.longitude} onChange={(v) => setFormData({...formData, longitude: v})} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Model No." placeholder="iDS-7104HQHI-M1/S" icon={<Settings size={12}/>} value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
              <InputField label="Static IP" placeholder="192.168.0.101" icon={<Navigation size={12}/>} value={formData.ip_address} onChange={(v: string) => setFormData({...formData, ip_address: v})} />
            </div>

            {/* Security Credentials Group */}
            <div className="bg-blue-50/30 p-6 rounded-[40px] border border-blue-100/50 space-y-6">
              <div className="flex items-center gap-2 px-2 italic font-black text-blue-600 text-[10px] uppercase tracking-widest leading-none"><ShieldCheck size={16} /> Security Credentials</div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="User ID" icon={<User size={12}/>} value={formData.user_name} onChange={(v: string) => setFormData({...formData, user_name: v})} />
                <InputField label="User Pass" icon={<Key size={12}/>} placeholder="****" value={formData.user_pass} onChange={(v: string) => setFormData({...formData, user_pass: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Admin ID" icon={<ShieldCheck size={12}/>} value={formData.admin_name} onChange={(v: string) => setFormData({...formData, admin_name: v})} />
                <InputField label="Admin Pass" icon={<Lock size={12}/>} placeholder="****" value={formData.admin_pass} onChange={(v: string) => setFormData({...formData, admin_pass: v})} />
              </div>
              <InputField label="P2P V-Code" icon={<Fingerprint size={12}/>} placeholder="Verification Code" value={formData.v_code} onChange={(v: string) => setFormData({...formData, v_code: v})} />
            </div>

            {/* Notes Section */}
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-6 tracking-widest flex items-center gap-1.5"><ClipboardEdit size={12}/> Maintenance Notes</label>
              <textarea className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[30px] outline-none text-sm font-bold text-slate-700 min-h-[120px] focus:border-blue-400 transition-all resize-none shadow-inner"
                placeholder="Hardware specifics..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
            </div>

            {/* Register Button */}
            <div className="pt-6">
              <button onClick={handleSave} disabled={loading}
                className="w-full bg-[#1a9e52] hover:bg-emerald-700 text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[16px] uppercase tracking-[4px] border-b-[6px] border-emerald-900 italic">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Database size={24} />} 
                {loading ? 'Processing...' : 'Register Device'}
              </button>
            </div>
            <p className="text-[22px] text-center mt-8 sm:text-[14px] font-[1000] text-emerald-200 tracking-tighter uppercase italic leading-none">
             <span>
              {(COMPANY?.app?.name || "Cctv Portal").split(' ')[0]}
             </span>
             <span className="text-blue-200 italic ml-1.5">
              {(COMPANY?.app?.name || "Cctv Portal").split(' ')[1] || ""}
             </span>
             <span className="text-blue-300/50 italic text-[14px] sm:text-[10px] ml-3 tracking-[2px] font-black">
              {COMPANY?.app?.version || "v2.0"}
             </span>
            </p>

          </div>
        </div>
      </div>

      <MasterDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog(prev => ({...prev, isOpen: false}))} 
        onConfirm={dialog.onConfirm} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type} 
        confirmText="Understood" 
      />
    </AuthGuard>
  );
}

function InputField({ label, placeholder, onChange, value, highlight = false, icon }: {
  label: string; placeholder?: string; onChange: (v: string) => void; value: string; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="w-full text-left font-bold space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1.5">{icon}{label}</label>
      <input className={`w-full p-5 bg-slate-50 border-2 rounded-[25px] outline-none text-sm font-bold text-slate-700 transition-all shadow-sm ${highlight ? 'border-emerald-100 focus:border-emerald-400' : 'border-slate-50 focus:border-blue-400'}`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}