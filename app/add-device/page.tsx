"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, CheckCircle, Rocket, Loader2, Database, Disc, Navigation, MousePointer2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- TypeScript Interfaces Updated ---
interface FormData {
  device_sn: string; // ✅ Changed from sn to device_sn
  site_name: string;
  category: string;
  model: string;
  ip_address: string;
  user_pass: string;
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

  const [formData, setFormData] = useState<FormData>({
    device_sn: '', // ✅ Updated
    site_name: '', 
    category: 'DVR (Analog)',
    model: '', 
    ip_address: '', 
    user_pass: '',
    admin_pass: '', 
    v_code: '', 
    device_notes: '',
    radius: '100',
    latitude: '', 
    longitude: '' 
  });

  const handleSave = async () => {
    // ✅ Updated Validation
    if (!formData.device_sn || !formData.site_name) return alert("⚠️ Please fill Device SN and Site Name!");
    
    setLoading(true);
    let finalLat: number | null = null;
    let finalLng: number | null = null;

    if (isManual) {
      finalLat = parseFloat(formData.latitude.trim());
      finalLng = parseFloat(formData.longitude.trim());
      
      if (isNaN(finalLat) || isNaN(finalLng)) {
        alert("⚠️ Please enter valid Manual Latitude/Longitude!");
        setLoading(false);
        return;
      }
    } else {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { 
            enableHighAccuracy: true, 
            timeout: 10000 
          })
        );
        finalLat = pos.coords.latitude;
        finalLng = pos.coords.longitude;
      } catch (e) { 
        alert("📍 Auto-GPS fail! Map se coordinates nikal kar 'Manual Mode' use karein.");
        setLoading(false);
        return;
      }
    }

    // 🟢 Supabase Insert Updated for 'device_sn'
    const { error } = await supabase.from('devices').insert([
      { 
        device_sn: formData.device_sn, // ✅ Updated key
        site_name: formData.site_name,
        category: formData.category,
        model: formData.model,
        ip_address: formData.ip_address,
        user_pass: formData.user_pass,
        admin_pass: formData.admin_pass,
        v_code: formData.v_code,
        device_notes: formData.device_notes,
        radius: parseInt(formData.radius) || 200,
        latitude: finalLat, 
        longitude: finalLng 
      }
    ]);

    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert("✅ Device Successfully Registered!");
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[480px] bg-white rounded-[50px] p-10 shadow-2xl border border-white relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-400"></div>

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-50 p-5 rounded-[25px] mb-3 shadow-inner">
             <Rocket className="text-blue-600" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-[24px] font-[1000] text-slate-800 tracking-tight leading-none uppercase italic">Register Device</h1>
          <p className="text-slate-400 text-[10px] font-black mt-2 tracking-widest uppercase opacity-60 italic">CCTV Inventory Portal</p>
        </div>

        <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-3 custom-scroll mb-8 px-1">
          
          {/* ✅ SN Input updated to device_sn */}
          <InputField label="🔢 DEVICE SERIAL (SN)" placeholder="SN-XXXXX" 
            value={formData.device_sn}
            onChange={(v: string) => setFormData({...formData, device_sn: v.toUpperCase()})} highlight={true} />
          
          <InputField label="🏢 SITE NAME" placeholder="Ex: Shaikh Villa" 
            value={formData.site_name}
            onChange={(v: string) => setFormData({...formData, site_name: v})} />

          <div className="grid grid-cols-2 gap-4">
            <div className="text-left font-bold">
              <label className="text-[10px] text-slate-400 uppercase ml-4 tracking-widest leading-none">📁 Category</label>
              <select 
                className="w-full p-5 mt-2 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-bold text-slate-700 appearance-none cursor-pointer focus:border-blue-200 transition-all"
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="DVR (Analog)">📟 DVR</option>
                <option value="NVR (IP System)">🖥️ NVR</option>
                <option value="IP Camera">👁️ IP Cam</option>
                <option value="Biometric">☝️ Bio</option>
              </select>
            </div>
            <div className="text-left font-bold">
              <label className="text-[10px] text-blue-400 uppercase ml-4 flex items-center gap-1 tracking-widest leading-none"><Disc size={12}/> Radius (M)</label>
              <input 
                type="number" 
                value={formData.radius} 
                className="w-full p-5 mt-2 bg-blue-50/30 border-2 border-blue-50 rounded-[25px] outline-none text-center font-black text-blue-600 focus:border-blue-200"
                onChange={(e) => setFormData({...formData, radius: e.target.value})} 
              />
            </div>
          </div>

          {/* ... Maps & Location Logic ... */}
          <div className="bg-slate-50 p-2 rounded-[25px] flex gap-2 border border-slate-100 mt-2">
            <button type="button" onClick={() => setIsManual(false)} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 ${!isManual ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}><Navigation size={14} /> Auto GPS</button>
            <button type="button" onClick={() => setIsManual(true)} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 ${isManual ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400'}`}><MousePointer2 size={14} /> Manual Pin</button>
          </div>

          {isManual && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <InputField label="📍 LATITUDE" placeholder="19.0760" value={formData.latitude} onChange={(v: string) => setFormData({...formData, latitude: v})} />
              <InputField label="📍 LONGITUDE" placeholder="72.8777" value={formData.longitude} onChange={(v: string) => setFormData({...formData, longitude: v})} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="🏷️ MODEL" placeholder="Model No." value={formData.model} onChange={(v: string) => setFormData({...formData, model: v})} />
            <InputField label="🌐 IP ADDRESS" placeholder="192.168..." value={formData.ip_address} onChange={(v: string) => setFormData({...formData, ip_address: v})} />
          </div>

          <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="👤 USER PASS" placeholder="****" value={formData.user_pass} onChange={(v: string) => setFormData({...formData, user_pass: v})} />
              <InputField label="🔑 ADMIN PASS" placeholder="****" value={formData.admin_pass} onChange={(v: string) => setFormData({...formData, admin_pass: v})} />
            </div>
            <InputField label="🔐 V-CODE" placeholder="P2P Verification Code" value={formData.v_code} onChange={(v: string) => setFormData({...formData, v_code: v})} />
          </div>

          <div className="text-left font-bold pb-2">
            <label className="text-[10px] text-slate-400 uppercase ml-4 tracking-widest leading-none">📝 DEVICE NOTES</label>
            <textarea 
              className="w-full p-5 mt-2 bg-[#f8fafc] border-2 border-slate-50 rounded-[25px] outline-none text-[14px] font-semibold text-slate-700 min-h-[100px] focus:border-blue-200 transition-all"
              placeholder="Ex: HDD 2TB, 4CH DVR, Power backup issues..." 
              value={formData.device_notes}
              onChange={(e) => setFormData({...formData, device_notes: e.target.value})} 
            />
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-[#1a9e52] hover:bg-emerald-700 text-white font-[1000] py-6 rounded-[30px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 text-[18px] uppercase tracking-widest border-b-4 border-emerald-800"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Database size={24} />} 
          {loading ? 'Processing...' : 'Register Device'}
        </button>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}

// Sub-component remains the same
interface InputProps {
  label: string; placeholder: string; onChange: (value: string) => void; value: string; highlight?: boolean;
}

function InputField({ label, placeholder, onChange, value, highlight = false }: InputProps) {
  return (
    <div className="w-full text-left font-bold">
      <label className="text-[10px] text-slate-400 uppercase ml-4 tracking-widest leading-none">{label}</label>
      <input 
        className={`w-full p-5 mt-2 bg-[#f8fafc] border-2 rounded-[25px] outline-none text-[15px] font-bold text-slate-700 transition-all ${highlight ? 'border-emerald-100 focus:border-emerald-400' : 'border-slate-50 focus:border-blue-200'}`}
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}