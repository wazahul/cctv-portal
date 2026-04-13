"use client";
// app/request/[deviceId]/page.tsx
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import { 
  Loader2, ShieldCheck, XCircle, Smartphone, 
  History as HistoryIcon, Lock, Timer, MapPin, HelpCircle, MessageSquare, CheckCircle2
} from "lucide-react";
import HistoryModal from "../../admin/HistoryModal";
import MasterDialog from "@/lib/components/MasterDialog";

export default function RequestPage() {
  const params = useParams();
  const router = useRouter(); 
  const deviceId = params.deviceId as string; 

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", type: "info" as any });

  useEffect(() => {
    const init = async () => {
      // 1. Get User Role for Bypass Logic
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role || "user";

      // 2. Fetch Device Data
      const { data: dev } = await supabase.from("devices").select("*").eq("device_sn", deviceId).single();
      if (dev) {
        setDevice(dev);

        // 🚩 MASTER LOGIC: Admin or Engineer bypasses GPS check
        if (role === "super_admin" || role === "engineer") {
          setInRange(true);
          setLoading(false);
          return;
        }

        // 3. Regular User GPS Check
      if ("geolocation" in navigator) {
        // 🎯 Accurate tracking ke liye navigator options set kiye hain
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const R = 6371000; // Earth radius in meters
            const userLat = pos.coords.latitude;
            const userLon = pos.coords.longitude;
            const devLat = dev.latitude;
            const devLon = dev.longitude;

            // 📐 Haversine Formula: Do points ke beech ka rasta nikalne ke liye
            const dLat = (devLat - userLat) * Math.PI / 180;
            const dLon = (devLon - userLon) * Math.PI / 180;
            
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(userLat * Math.PI/180) * Math.cos(devLat * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            
            const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
            
            // 📏 Geofence Check: Kya user radius (default 200m) ke andar hai?
            setInRange(distance <= (dev.radius || 200));
            setLoading(false);
          }, 
          (err) => { 
            console.error("🚨 GPS Connection Failed:", err.message);
            // Error aane par access block karein
            setInRange(false); 
            setLoading(false); 
          }, 
          { 
            enableHighAccuracy: true, // 🎯 Sabse accurate GPS data
            timeout: 12000,           // ⏰ 12 second tak wait karega (Satellite link fix)
            maximumAge: 0             // 🔄 Cache location use nahi karega, hamesha fresh data
          }
        );
      } else { 
        // Agar browser GPS support nahi karta
        console.warn("⚠️ Geolocation not supported by browser");
        setInRange(false); 
        setLoading(false); 
      }

      }
    };
    init();
  }, [deviceId]);

  const handleRequest = async () => {
  if (!mobile || mobile.length !== 10) {
      setDialog({ isOpen: true, title: "Error", message: "Please enter a valid 10-digit mobile number.", type: "warning" });
      return;
  }
  setReqLoading(true);
  try {
    const res = await fetch("/api/request-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, device_id: deviceId, message: message || "Password Request" }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    setDialog({ isOpen: true, title: "Success", message: "Request sent successfully. You will be contacted via WhatsApp.", type: "success" });
    setMobile(""); setMessage(""); setIsFormOpen(false);
  } catch (err: any) {
    setDialog({ isOpen: true, title: "Error", message: "Dispatch failed. Please check your connection.", type: "danger" });
  } finally { setReqLoading(false); }
};

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 italic">Authenticating Access...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 sm:p-6 text-left">
      <div className="w-full max-w-[420px] bg-white rounded-[45px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-white flex flex-col transition-all duration-500">
        
        {/* Header */}
        <div className="bg-[#d5e0dd] pt-8 pb-6 px-6 text-center border-b border-blue-50">
          <h1 className="text-2xl sm:text-3xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none truncate px-2">
            {device?.site_name}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-emerald-500 bg-emerald-8 w-fit mx-auto px-4 py-1 rounded-full border border-emerald-100">
             <CheckCircle2 size={14} className="animate-pulse" />
             <p className="text-emerald-700 font-bold text-[9px] tracking-[2px] uppercase">Location Sync Success</p>
          </div>
        </div>

        {/* Action Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {inRange ? (
            <div className="space-y-6">
              
              {/* Grid Menu Actions */}
              {!isFormOpen && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-slate-100 rounded-[35px] hover:border-blue-200 hover:bg-white transition-all group active:scale-95"
                  >
                    <div className="p-3 bg-blue-50 rounded-2xl mb-3 group-hover:bg-blue-100 transition-colors">
                      <HelpCircle className="text-blue-500" size={28} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 text-center leading-tight">Forgot<br/>Password</span>
                  </button>

                  <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-slate-100 rounded-[35px] hover:border-emerald-200 hover:bg-white transition-all group active:scale-95"
                  >
                    <div className="p-3 bg-emerald-50 rounded-2xl mb-3 group-hover:bg-emerald-100 transition-colors">
                      <HistoryIcon className="text-emerald-500" size={28} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 text-center leading-tight">Maintenance<br/>History</span>
                  </button>
                </div>
              )}

              {/* Request Form */}
              {isFormOpen && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-500 bg-blue-50/30 p-6 rounded-[35px] border-2 border-blue-50">
                  <div className="text-center mb-4">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Access Request</p>
                  </div>
                  
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={18} />
                    <input 
                      type="tel" maxLength={10} placeholder="WhatsApp Number" 
                      className="w-full py-4 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-[22px] outline-none font-black text-sm focus:border-blue-500 transition-all shadow-inner"
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} value={mobile}
                    />
                  </div>

                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500" size={18} />
                    <textarea 
                      placeholder="Issue Details..." rows={2}
                      className="w-full py-4 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-[22px] outline-none font-bold text-xs focus:border-blue-500 transition-all resize-none shadow-inner"
                      onChange={(e) => setMessage(e.target.value)} value={message}
                    />
                  </div>

                  <button 
                    onClick={handleRequest} 
                    disabled={reqLoading || mobile.length < 10}
                    className="w-full bg-blue-600 text-white py-4 rounded-[22px] font-black uppercase text-[10px] tracking-[3px] shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-800"
                  >
                    {reqLoading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    Submit Request
                  </button>
                  
                  <button onClick={() => setIsFormOpen(false)} className="w-full text-[9px] font-black text-slate-400 uppercase tracking-[2px] pt-1">Go Back</button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-5">
               <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                  <XCircle size={40} className="text-red-500" />
               </div>
               <h2 className="text-xl font-black uppercase italic text-slate-800">Out of Range</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[4px] px-4 leading-relaxed"> Please be present at the site to sync GPS. </p>
               <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-90 transition-all">Retry GPS Sync</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pb-8 text-center pt-6 border-t border-slate-50">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[5px] italic">Powered by {COMPANY?.name || "Modern Enterprises"}</p>
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={deviceId} siteName={device?.site_name} />
      <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(p => ({...p, isOpen: false}))} onConfirm={() => setDialog(p => ({...p, isOpen: false}))} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="OK" />
    </div>
  );
}