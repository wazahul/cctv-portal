"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  MapPin, CheckCircle, Rocket, Loader2, Database, 
  Disc, Navigation, MousePointer2, User, ShieldCheck, Hash, Monitor, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterDialog from '@/lib/components/MasterDialog';

interface FormData {
  device_sn: string;
  site_name: string;
  category: string;
  model: string;
  ip_address: string;
  user_name: string; // 🆕 Added
  user_pass: string;
  admin_name: string; // 🆕 Added
  admin_pass: string;
  v_code: string;
  device_notes: string;
  radius: string;
  latitude: string;
  longitude: string;
}

export default function AddDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isManual, setIsManual] = useState(false);
  
  // Master Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any, onConfirm: () => setDialog(prev => ({...prev, isOpen: false}))
  });

  const [formData, setFormData] = useState<FormData>({
    device_sn: '', site_name: '', category: 'DVR (Analog)', model: '',
    ip_address: '', user_name: 'admin', user_pass: '', 
    admin_name: 'admin', admin_pass: '', 
    v_code: '', device_notes: '', radius: '100', latitude: '', longitude: '' 
  });

  const handleSave = async () => {
    if (!formData.device_sn || !formData.site_name) {
      setDialog({ isOpen: true, title: "Missing Data", message: "Serial Number and Site Name are mandatory.", type: "warning", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
      return;
    }
    
    setLoading(true);
    let finalLat: number | null = null;
    let finalLng: number | null = null;

    if (isManual) {
      finalLat = parseFloat(formData.latitude.trim());
      finalLng = parseFloat(formData.longitude.trim());
      if (isNaN(finalLat!) || isNaN(finalLng!)) {
        setDialog({ isOpen: true, title: "GPS Error", message: "Please enter valid coordinates for manual pinning.", type: "danger", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
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
        setDialog({ isOpen: true, title: "GPS Timeout", message: "Auto-GPS fail. Switch to Manual Mode.", type: "warning", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
        setLoading(false); return;
      }
    }

    const { error } = await supabase.from('devices').insert([{ 
      device_sn: formData.device_sn, site_name: formData.site_name,
      category: formData.category, model: formData.model, ip_address: formData.ip_address,
      user_name: formData.user_name, user_pass: formData.user_pass,
      admin_name: formData.admin_name, admin_pass: formData.admin_pass,
      v_code: formData.v_code, device_notes: formData.device_notes,
      radius: parseInt(formData.radius) || 200, latitude: finalLat, longitude: finalLng 
    }]);

    if (error) {
      setDialog({ isOpen: true, title: "Database Error", message: error.message, type: "danger", onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) });
    } else {
      setDialog({ 
        isOpen: true, title: "Registered!", message: `${formData.site_name} has been added to cloud inventory.`, type: "success", 
        onConfirm: () => router.push('/admin') 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-0 sm:p-4 font-sans text-left">
      <div className="w-full max-w-[520px] bg-white h-screen sm:h-auto sm:rounded-[55px] shadow-2xl border-t sm:border border-white relative overflow-hidden flex flex-col">
        
        {/* 🌈 TOP GRADIENT */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 shrink-0"></div>

        {/* 📌 NON-STICKY HEADER */}
        <div className="p-8 pb-4 text-center shrink-0">
          <div className="flex justify-between items-start">
             <button onClick={() => router.back()} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 border border-slate-100 transition-all"><X size={20}/></button>
             <div className="bg-blue-50 p-4 rounded-[25px] shadow-inner"><Rocket className="text-blue-600" size={28} strokeWidth={2.5} /></div>
             <div className="w-12"></div>
          </div>
          <h1 className="text-[26px] font-[1000] text-slate-900 tracking-tighter uppercase italic mt-4 leading-none">Register Device</h1>
          <p className="text-slate-400 text-[9px] font-black mt-2 tracking-[3px] uppercase italic opacity-60">Terminal Input Module</p>
        </div>

        {/* 📝 FORM BODY (Touch Optimized Scroll) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-7 custom-scroll pb-10">
          
          <InputField label="🔢 Device Serial Number (SN)" placeholder="DS-XXXXX" 
            value={formData.device_sn} icon={<Hash size={14}/>}
            onChange={(v) => setFormData({...formData, device_sn: v.toUpperCase()})} highlight={true} />
          
          <InputField label="🏢 Site / Client Name" placeholder="Ex: Modern Towers" 
            value={formData.site_name} icon={<Database size={14}/>}
            onChange={(v) => setFormData({...formData, site_name: v})} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none">📁 Category</label>
              <select className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[25px] outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:border-blue-400 transition-all"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="DVR (Analog)">📹 DVR</option>
                <option value="NVR (IP System)">🖥️ NVR</option>
                <option value="IP Camera">👁️ IP Cam</option>
                <option value="Biometric">☝️ Bio</option>
              </select>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-blue-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1"><Disc size={12}/> Radius (M)</label>
              <input type="number" value={formData.radius} className="w-full p-5 bg-blue-50/50 border-2 border-blue-50 rounded-[25px] outline-none text-center font-black text-blue-600 focus:border-blue-400 transition-all"
                onChange={(e) => setFormData({...formData, radius: e.target.value})} />
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-[30px] flex gap-2 border border-slate-100">
            <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Navigation size={14} /> Auto GPS</button>
            <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${isManual ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}><MousePointer2 size={14} /> Manual</button>
          </div>

          {isManual && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <InputField label="📍 Latitude" placeholder="19.076" value={formData.latitude} onChange={(v) => setFormData({...formData, latitude: v})} />
              <InputField label="📍 Longitude" placeholder="72.877" value={formData.longitude} onChange={(v) => setFormData({...formData, longitude: v})} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="🏷️ Model No." placeholder="DS-7B08..." value={formData.model} onChange={(v) => setFormData({...formData, model: v})} />
            <InputField label="🌐 Static IP" placeholder="192.168.1.1" value={formData.ip_address} onChange={(v) => setFormData({...formData, ip_address: v})} />
          </div>

          {/* 🔐 ACCESS CREDENTIALS SECTION */}
          <div className="bg-blue-50/30 p-6 rounded-[40px] border border-blue-100/50 space-y-6">
            <div className="flex items-center gap-2 px-2"><ShieldCheck size={16} className="text-blue-500"/><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Access Credentials</span></div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="👤 User Login ID" placeholder="admin" value={formData.user_name} onChange={(v) => setFormData({...formData, user_name: v})} />
              <InputField label="🔑 User Secret Key" placeholder="****" value={formData.user_pass} onChange={(v) => setFormData({...formData, user_pass: v})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="🛡️ Admin Login ID" placeholder="admin" value={formData.admin_name} onChange={(v) => setFormData({...formData, admin_name: v})} />
              <InputField label="🔒 Admin Secret Key" placeholder="****" value={formData.admin_pass} onChange={(v) => setFormData({...formData, admin_pass: v})} />
            </div>

            <InputField label="🔐 P2P V-Code" placeholder="Verification Code" value={formData.v_code} onChange={(v) => setFormData({...formData, v_code: v})} />
          </div>

          <div className="space-y-2 text-left pb-4">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-6 tracking-widest leading-none">📝 Maintenance Notes</label>
            <textarea className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[30px] outline-none text-sm font-bold text-slate-700 min-h-[120px] focus:border-blue-400 transition-all resize-none shadow-inner"
              placeholder="Hardware specifics, history, or issues..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
          </div>
        </div>

        {/* 💾 STICKY FOOTER */}
        <div className="p-6 bg-white border-t border-slate-50 shrink-0">
          <button onClick={handleSave} disabled={loading}
            className="w-full bg-[#1a9e52] hover:bg-emerald-700 text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[16px] uppercase tracking-[4px] border-b-4 border-emerald-900 active:border-b-0">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Database size={24} />} 
            {loading ? 'Processing...' : 'Register Secure Node'}
          </button>
        </div>
      </div>

      <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(prev => ({...prev, isOpen: false}))} onConfirm={dialog.onConfirm} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="Understood" />
    </div>
  );
}

function InputField({ label, placeholder, onChange, value, highlight = false, icon }: any) {
  return (
    <div className="w-full text-left font-bold space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1">{icon}{label}</label>
      <input className={`w-full p-5 bg-slate-50 border-2 rounded-[25px] outline-none text-sm font-bold text-slate-700 transition-all ${highlight ? 'border-emerald-100 focus:border-emerald-400' : 'border-slate-50 focus:border-blue-400'}`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}