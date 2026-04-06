"use client";
import AuthGuard from "@/lib/components/AuthGuard";
import { useState } from 'react';
import { COMPANY } from '@/lib/config';
import { supabase } from '@/lib/supabaseClient';
import { encryptData } from '@/lib/crypto';
import { 
  MapPin, Loader2, Database, Disc, Navigation, MousePointer2, 
  ShieldCheck, Hash, X, Monitor, Key, Lock, Fingerprint, User, 
  CircuitBoard, ClipboardEdit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterDialog from '@/lib/components/MasterDialog';

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
    v_code: '', device_notes: '', radius: '100', latitude: '', longitude: '' 
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
    let finalLat: number | null = null;
    let finalLng: number | null = null;

    if (isManual) {
      finalLat = parseFloat(formData.latitude.trim()) || null;
      finalLng = parseFloat(formData.longitude.trim()) || null;
    } else {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 8000 })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        setDialog({ 
          isOpen: true, title: "GPS Timeout", 
          message: "Auto-GPS fail ho gaya. Manual mode use karein.", 
          type: "warning", 
          onConfirm: () => setDialog(prev => ({...prev, isOpen: false})) 
        });
        setLoading(false); return;
      }
    }

    try {
      // 🔒 Encryption & Insertion
      const { error } = await supabase.from('devices').insert([{ 
        ...formData,
        user_pass: formData.user_pass ? encryptData(formData.user_pass) : '',
        admin_pass: formData.admin_pass ? encryptData(formData.admin_pass) : '',
        v_code: formData.v_code ? encryptData(formData.v_code) : '',
        radius: parseInt(formData.radius) || 200,
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
      {/* 🚩 MAIN CONTENT OVERLAY (Z-Index 100) */}
      <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 overflow-y-auto custom-scroll">
        
        <div className="bg-white w-full max-w-xl min-h-screen sm:min-h-0 sm:h-auto sm:max-h-[95vh] sm:rounded-[45px] shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-500">

          {/* Sticky Header */}
          <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-xl p-6 flex justify-between items-center shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-3 italic">
              <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-100">
                <CircuitBoard size={22} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Register Device</h3>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[3px] mt-1.5 leading-none italic">{COMPANY.name}</p>
              </div>
            </div>
            <button onClick={() => router.back()} className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90 border border-slate-200/50 shadow-inner">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Form Body */}
          <div className="flex-1 p-6 sm:p-10 space-y-8 bg-white pb-20">
            
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
                <label className="text-[9px] font-black text-blue-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1.5"><Disc size={12}/> Radius (M)</label>
                <input type="number" value={formData.radius} className="w-full p-5 bg-blue-50/50 border-2 border-blue-50 rounded-[25px] outline-none text-center font-black text-blue-600 focus:border-blue-400 transition-all shadow-sm"
                  onChange={(e) => setFormData({...formData, radius: e.target.value})} />
              </div>
            </div>

            {/* GPS Controls */}
            <div className="bg-slate-50 p-2 rounded-[30px] flex gap-2 border border-slate-100">
              <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase flex items-center justify-center gap-2 ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Navigation size={14} /> Auto GPS</button>
              <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase flex items-center justify-center gap-2 ${isManual ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}><MousePointer2 size={14} /> Manual</button>
            </div>

            {isManual && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <InputField label="Latitude" placeholder="19.0..." icon={<MapPin size={12}/>} value={formData.latitude} onChange={(v: string) => setFormData({...formData, latitude: v})} />
                <InputField label="Longitude" placeholder="72.8..." icon={<MapPin size={12}/>} value={formData.longitude} onChange={(v: string) => setFormData({...formData, longitude: v})} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Model No." placeholder="iDS-7104HQHI-M1/S" icon={<Monitor size={12}/>} value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
              <InputField label="Static IP" placeholder="192.168.0.101" icon={<Navigation size={12}/>} value={formData.ip_address} onChange={(v: string) => setFormData({...formData, ip_address: v})} />
            </div>

            {/* Security Credentials Group */}
            <div className="bg-blue-50/30 p-6 rounded-[40px] border border-blue-100/50 space-y-6">
              <div className="flex items-center gap-2 px-2 italic font-black text-blue-600 text-[10px] uppercase tracking-widest"><ShieldCheck size={16} /> Security Credentials</div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="User Login ID" icon={<User size={12}/>} placeholder="user" value={formData.user_name} onChange={(v: string) => setFormData({...formData, user_name: v})} />
                <InputField label="User Secret Key" icon={<Key size={12}/>} placeholder="****" value={formData.user_pass} onChange={(v: string) => setFormData({...formData, user_pass: v})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Admin ID" icon={<ShieldCheck size={12}/>} placeholder="admin" value={formData.admin_name} onChange={(v: string) => setFormData({...formData, admin_name: v})} />
                <InputField label="Admin Pass" icon={<Lock size={12}/>} placeholder="****" value={formData.admin_pass} onChange={(v: string) => setFormData({...formData, admin_pass: v})} />
              </div>
              <InputField label="P2P V-Code" icon={<Fingerprint size={12}/>} placeholder="Verification Code" value={formData.v_code} onChange={(v: string) => setFormData({...formData, v_code: v})} />
            </div>

            {/* Notes Section */}
            <div className="space-y-2 text-left pb-4">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-6 tracking-widest flex items-center gap-1.5"><ClipboardEdit size={12}/> Maintenance Notes</label>
              <textarea className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[30px] outline-none text-sm font-bold text-slate-700 min-h-[120px] focus:border-blue-400 transition-all resize-none shadow-inner"
                placeholder="Hardware specifics..." value={formData.device_notes} onChange={(e) => setFormData({...formData, device_notes: e.target.value})} />
            </div>

            {/* Register Button */}
            <div className="pt-6">
              <button onClick={handleSave} disabled={loading}
                className="w-full bg-[#1a9e52] hover:bg-emerald-700 text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[16px] uppercase tracking-[4px] border-b-4 border-emerald-900 italic">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Database size={24} />} 
                {loading ? 'Processing...' : 'Register Device'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚩 MASTER DIALOG LAYER (Z-Index 9999 - Dead Center) */}
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
  label: string; placeholder: string; onChange: (v: string) => void; value: string; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="w-full text-left font-bold space-y-2">
      <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest leading-none flex items-center gap-1.5">{icon}{label}</label>
      <input className={`w-full p-5 bg-slate-50 border-2 rounded-[25px] outline-none text-sm font-bold text-slate-700 transition-all shadow-sm ${highlight ? 'border-emerald-100 focus:border-emerald-400' : 'border-slate-50 focus:border-blue-400'}`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}