"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, ShieldCheck, User as UserIcon, XCircle, 
  CheckCircle2, Smartphone, History as HistoryIcon, Lock, AlertCircle
} from "lucide-react";
import HistoryModal from "../../admin/HistoryModal";

export default function RequestPage() {
  const params = useParams();
  const router = useRouter(); 
  const deviceId = params.deviceId as string; // Serial Number from URL

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); 
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role || "user";
      setUserRole(role);

      // 🔍 2️⃣ FETCH DATA: Updated to use 'device_sn'
      const { data: deviceData, error } = await supabase
        .from("devices")
        .select("*")
        .eq("device_sn", deviceId) // ✅ Changed 'sn' to 'device_sn'
        .single();
      
      if (deviceData) {
        setDevice(deviceData);

        // 🛡️ ROLE BYPASS logic
        if (role === "super_admin" || role === "engineer") {
          setInRange(true); 
          setLoading(false);
          return;
        }

        // 📏 GPS Check
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const R = 6371000;
            const dLat = (deviceData.latitude - pos.coords.latitude) * Math.PI / 180;
            const dLon = (deviceData.longitude - pos.coords.longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(pos.coords.latitude * Math.PI/180) * Math.cos(deviceData.latitude * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
            
            setInRange(distance <= (deviceData.radius || 200));
            setLoading(false);
          }, (err) => {
            setInRange(false);
            setLoading(false);
          }, { enableHighAccuracy: true });
        } else {
          setInRange(false);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initializePage();
  }, [deviceId]);

  // --- 🚨 Password Request Logic: Now saving to Database ---
  const handleRequest = async () => {
    if (mobile.length < 10) { setShowErrorDialog(true); return; }
    setReqLoading(true);
    
    try {
      // 🟢 1. Save to 'requests' table (Isse Admin Dashboard blink karega)
      const { error } = await supabase
        .from("requests")
        .insert([{ 
          device_sn: device.device_sn, // ✅ Changed to 'device_sn'
          site_name: device.site_name, 
          mobile: mobile, 
          status: 'pending' 
        }]);

      if (error) throw error;

      // 🟢 2. WhatsApp Notification (Optional API)
      await fetch("/api/request-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, device_id: device.device_sn, site_name: device.site_name }),
      });

      setShowSuccessDialog(true);
      setMobile("");
    } catch (err) {
      alert("❌ System Error: Request not saved.");
    }
    setReqLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] gap-4 text-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px]">Checking Node Status...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[480px] bg-white rounded-[50px] shadow-2xl overflow-hidden relative border border-white">
        
        {/* HEADER */}
        <div className="bg-[#f0f7ff] p-12 text-center border-b border-blue-50 relative">
          {(userRole === "super_admin" || userRole === "engineer") && (
            <button 
              onClick={() => router.push('/admin')} 
              className={`absolute top-4 right-6 px-4 py-2 rounded-full text-[9px] font-[1000] uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-90 transition-all text-white ${userRole === 'super_admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}
            >
              {userRole === 'super_admin' ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
              {userRole === 'super_admin' ? 'Super Admin' : 'Engineer'}
            </button>
          )}

          <h1 className="text-[34px] font-[1000] text-slate-900 tracking-tighter uppercase italic mt-4 leading-tight">{device?.site_name || "Unknown Site"}</h1>
          <p className="text-slate-400 font-bold text-[10px] tracking-[3px] uppercase mt-2">Verified Secure Node</p>
        </div>

        {/* --- MAIN UI --- */}
        {inRange ? (
          <div className="p-10 space-y-6">
            <div className="relative group">
              <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="tel" 
                maxLength={10}
                placeholder="WhatsApp Number" 
                className="w-full py-6 pl-16 pr-8 bg-slate-50 border-2 border-slate-100 rounded-[30px] outline-none text-slate-800 font-black focus:border-blue-500 transition-all text-lg"
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                value={mobile}
              />
            </div>
            
            <button 
              onClick={handleRequest} 
              disabled={reqLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-[1000] py-6 rounded-[35px] tracking-widest uppercase shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {reqLoading ? <Loader2 className="animate-spin" /> : <><Lock size={20} strokeWidth={3} /> Request Passwords</>}
            </button>

            <button onClick={() => setIsHistoryOpen(true)} className="w-full bg-white text-slate-500 font-black py-6 rounded-[35px] tracking-widest uppercase border-2 border-slate-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
              <HistoryIcon size={20} /> Maintenance Logs
            </button>
          </div>
        ) : (
          <div className="p-16 text-center">
             <div className="bg-red-50 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100">
               <XCircle size={60} className="text-red-500" />
             </div>
             <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic">Access Denied</h2>
             <p className="text-slate-500 text-[11px] mt-4 font-bold uppercase tracking-widest leading-relaxed">
               Aap site ke radius se bahar hain.<br/>Kripya physical location par scan karein.
             </p>
             <button onClick={() => window.location.reload()} className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest active:scale-90 shadow-lg">Retry GPS</button>
          </div>
        )}

        {/* MODALS & DIALOGS */}
        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={device?.device_sn} siteName={device?.site_name} />
        
        {showSuccessDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl animate-in zoom-in-95">
              <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-[1000] text-slate-900 uppercase italic mb-4">Request Sent!</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed">Admin notified.<br/>Passwords WhatsApp par aayenge.</p>
              <button onClick={() => setShowSuccessDialog(false)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[25px] tracking-widest uppercase text-xs shadow-lg">Got it</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}