"use client";
// app/request/[deviceId]/page.tsx
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import { 
  Loader2, Lock, Timer, History as HistoryIcon, 
  Smartphone, MessageSquare, HelpCircle, CheckCircle2, XCircle 
} from "lucide-react";
import HistoryModal from "../../admin/HistoryModal";
import MasterDialog from "@/lib/components/MasterDialog";

export default function RequestPage() {
  const params = useParams();
  const deviceId = params.deviceId as string; 

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0); 
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", type: "info" as any });

  useEffect(() => {
    const init = async () => {
      // 1. Get Session & Security Flag
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role;
      const authorized = role === "super_admin" || role === "engineer";
      setIsAuthorized(authorized);

      // 2. Fetch Device
      const { data: dev } = await supabase.from("devices").select("*").eq("device_sn", deviceId).single();
      if (dev) {
        setDevice(dev);
        if (authorized) { setInRange(true); setLoading(false); return; }

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const R = 6371000;
              const dLat = (dev.latitude - pos.coords.latitude) * Math.PI / 180;
              const dLon = (dev.longitude - pos.coords.longitude) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(pos.coords.latitude * Math.PI/180) * Math.cos(dev.latitude * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
              const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
              setInRange(distance <= (dev.radius || 200));
              setLoading(false);
            }, 
            () => { setInRange(false); setLoading(false); }, 
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else { setInRange(false); setLoading(false); }
      }
    };
    init();
  }, [deviceId]);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => setCooldownTime(p => p - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  const handleRequest = async () => {
    if (mobile.length !== 10) {
      setDialog({ isOpen: true, title: "Invalid", message: "Please enter a valid 10-digit number.", type: "warning" });
      return;
    }
    setReqLoading(true);

    try {
      const currentLocalTime = new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Kolkata',
      }).format(new Date());

      const res = await fetch("/api/request-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mobile, device_id: deviceId, 
          message: message || "Password Request",
          date_time: currentLocalTime,
          is_authorized: isAuthorized // 🛡️ Passing bypass flag to API
        }),
      });

      const result = await res.json();
      if (!result.success) {
        if (result.wait) setCooldownTime(result.wait);
        setDialog({ isOpen: true, title: "Blocked", message: result.error, type: "danger" });
      } else {
        setDialog({ isOpen: true, title: "Success", message: "Request sent successfully. You will be contacted via WhatsApp.", type: "success" });
        setMobile(""); setMessage(""); setIsFormOpen(false);
      }
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Error", message: "Dispatch failed. Please check your connection.", type: "danger" });
    } finally { setReqLoading(false); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

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
        <div className="p-8 space-y-6">
          {inRange ? (
            <div className="space-y-6">
              {!isFormOpen ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                  <button onClick={() => setIsFormOpen(true)} className="flex flex-col items-center p-8 bg-slate-50 rounded-[40px] border-2 border-slate-100 active:scale-95 transition-all group shadow-sm hover:bg-white hover:border-blue-200">
                    <div className="p-4 bg-blue-100 rounded-3xl mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <HelpCircle size={28} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Forgot<br/>Password</span>
                  </button>
                  <button onClick={() => setIsHistoryOpen(true)} className="flex flex-col items-center p-8 bg-slate-50 rounded-[40px] border-2 border-slate-100 active:scale-95 transition-all group shadow-sm hover:bg-white hover:border-emerald-200">
                    <div className="p-4 bg-emerald-100 rounded-3xl mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <HistoryIcon size={28} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Maintenance<br/>History</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-500 bg-slate-50/80 p-6 rounded-[40px] border border-slate-100">
                  <div className="flex items-center gap-2 px-2">
                    <Timer size={14} className="text-blue-500 animate-pulse" />
                    <span className="text-[10px] tracking-[4px] font-black text-slate-400 uppercase italic">Access Request</span>
                  </div>

                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={18} />
                    <input 
                      type="tel" maxLength={10} placeholder="WhatsApp Number" 
                      className="w-full py-4 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-[22px] outline-none font-black text-sm focus:border-blue-500 transition-all shadow-inner"
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} value={mobile}
                    />
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500" size={18} />
                    <textarea 
                      placeholder="Issue Details..." rows={2}
                      className="w-full py-4 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-[22px] outline-none font-bold text-xs focus:border-blue-500 transition-all resize-none shadow-inner"
                      onChange={(e) => setMessage(e.target.value)} value={message}
                    />
                  </div>

                  {cooldownTime > 0 ? (
                    <div className="bg-orange-50 border-2 border-dashed border-orange-100 p-4 rounded-[25px] flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1 italic">Cooldown Active</p>
                        <p className="text-xl font-[1000] text-orange-600 tracking-tighter">{formatTime(cooldownTime)}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleRequest} 
                      disabled={reqLoading || mobile.length < 10}
                      className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-[1000] uppercase text-[11px] tracking-[4px] shadow-xl active:scale-95 disabled:opacity-50 transition-all italic border-b-4 border-blue-900"
                    >
                      {reqLoading ? <Loader2 className="animate-spin" size={18} /> : "Submit Request"}
                    </button>
                  )}
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
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[4px] mt-2 leading-relaxed px-4"> Please be present at the site to sync GPS. </p>
              <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest active:scale-90 transition-all border-b-4 border-black">Retry GPS Sync</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pb-10 text-center border-t border-slate-50 pt-6">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] italic">{COMPANY?.branding?.tagline2 || "SECURITY SOLUTIONS & INTERIOR DECORATOR"}</p>
        </div>
      </div>

      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={deviceId} siteName={device?.site_name} />
      <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(p => ({...p, isOpen: false}))} onConfirm={() => setDialog(p => ({...p, isOpen: false}))} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="OK" />
    </div>
  );
}