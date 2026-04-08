"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, ShieldCheck, XCircle, Smartphone, 
  History as HistoryIcon, Lock, AlertCircle, MessageSquare, Timer
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
  
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 🚩 COOLDOWN STATES
  const [cooldown, setCooldown] = useState(0);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [dialog, setDialog] = useState({
    isOpen: false, title: "", message: "", type: "info" as any
  });

  // 🕒 Logic: Timer Function
  const startCooldownTimer = (remainingTime: number) => {
    setIsCooldownActive(true);
    setCooldown(Math.ceil(remainingTime / 1000));

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);

      // 1. Check Cooldown First
      const lastRequest = localStorage.getItem(`last_req_${deviceId}`);
      if (lastRequest) {
        const timePassed = Date.now() - parseInt(lastRequest);
        const FIVE_MINUTES = 5 * 60 * 1000;
        if (timePassed < FIVE_MINUTES) {
          startCooldownTimer(FIVE_MINUTES - timePassed);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const metadata = session.user.user_metadata;
        setUserRole(metadata?.role || "user");
        const displayName = metadata?.full_name || metadata?.name || session.user.email?.split('@')[0];
        setUserName(displayName?.toUpperCase());
      }

      const { data: deviceData } = await supabase
        .from("devices")
        .select("*")
        .eq("device_sn", deviceId) 
        .single();
      
      if (deviceData) {
        setDevice(deviceData);
        const role = session?.user?.user_metadata?.role || "user";
        if (role === "super_admin" || role === "engineer") {
          setInRange(true); setLoading(false); return;
        }

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
          }, () => { setInRange(false); setLoading(false); }, { enableHighAccuracy: true });
        } else { setInRange(false); setLoading(false); }
      } else { setLoading(false); }
    };
    initializePage();

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [deviceId]);

  const handleRequest = async () => {
    // 🚩 Validation: Cooldown Check
    if (isCooldownActive) {
      setDialog({ isOpen: true, title: "Please Wait", message: `Aapne hal hi mein request bheji hai. Dubara request ${formatTime(cooldown)} baad karein.`, type: "warning" });
      return;
    }

    if (!mobile || mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
      setDialog({ isOpen: true, title: "Invalid Input", message: "Please provide a valid 10-digit WhatsApp number.", type: "warning" });
      return;
    }
    
    setReqLoading(true);
    try {
      await supabase.from("requests").insert([{ 
        device_sn: device.device_sn, 
        site_name: device.site_name, 
        mobile: mobile, 
        message: message, 
        status: 'pending' 
      }]);

      const res = await fetch("/api/request-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, device_id: device.device_sn })
      });

      if (!res.ok) throw new Error("Email dispatch failed");

      // ✅ SET COOLDOWN SUCCESS
      const now = Date.now();
      localStorage.setItem(`last_req_${deviceId}`, now.toString());
      startCooldownTimer(5 * 60 * 1000);

      setDialog({ 
        isOpen: true, 
        title: "Request Sent", 
        message: "Your request has been successfully dispatched. Please wait for the WhatsApp message.", 
        type: "success" 
      });
      setMobile(""); setMessage("");
    } catch (err) {
      setDialog({ isOpen: true, title: "System Failure", message: "Internal server error. Access dispatch failed.", type: "danger" });
    } finally {
      setReqLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px]">Checking Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-0 sm:p-4 font-sans text-left">
      <div className="w-full max-w-[480px] bg-white h-screen sm:h-auto sm:rounded-[50px] shadow-2xl overflow-hidden relative border-t sm:border border-white flex flex-col">
        
        <div className="bg-[#f0f7ff] p-8 sm:p-12 text-center border-b border-blue-50 relative shrink-0">
          {(userRole === "super_admin" || userRole === "engineer") && (
            <button onClick={() => router.push('/admin')} className="absolute top-4 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-95 transition-all">
              <ShieldCheck size={12} className={userRole === 'super_admin' ? 'text-blue-600' : 'text-emerald-600'} /> 
              <span className="text-[10px] font-[1000] uppercase tracking-widest text-slate-700">{userName || userRole}</span>
            </button>
          )}
          <h1 className="text-[28px] sm:text-[34px] font-[1000] text-slate-900 tracking-tighter uppercase italic mt-4 leading-tight truncate">{device?.site_name}</h1>
          <p className="text-slate-400 font-bold text-[9px] tracking-[3px] uppercase mt-2">Secure Terminal Access</p>
        </div>

        <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
          {inRange ? (
            <div className="space-y-6 pb-10">
              <div className="relative group">
                <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={20} />
                <input 
                  type="tel" maxLength={10} placeholder="WhatsApp Number" 
                  className="w-full py-5 sm:py-6 pl-16 pr-8 bg-slate-50 border-2 border-slate-100 rounded-[25px] sm:rounded-[30px] outline-none font-black focus:border-blue-500 transition-all text-lg"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} value={mobile}
                  disabled={isCooldownActive}
                />
              </div>

              <div className="relative group">
                <MessageSquare className="absolute left-6 top-6 text-slate-300 group-focus-within:text-blue-500" size={20} />
                <textarea 
                  placeholder="Optional Note / Issue" 
                  rows={3}
                  className="w-full py-6 pl-16 pr-8 bg-slate-50 border-2 border-slate-100 rounded-[25px] sm:rounded-[30px] outline-none font-bold text-slate-600 focus:border-blue-500 transition-all text-sm resize-none"
                  onChange={(e) => setMessage(e.target.value)} value={message}
                  disabled={isCooldownActive}
                />
              </div>
              
              {/* 🚀 SMART ACTION BUTTON */}
              <button 
                onClick={handleRequest} 
                disabled={reqLoading || isCooldownActive} 
                className={`w-full font-[1000] py-6 rounded-[30px] tracking-[2px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
                  isCooldownActive ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" : "bg-blue-600 text-white"
                }`}
              >
                {reqLoading ? (
                  <Loader2 className="animate-spin" />
                ) : isCooldownActive ? (
                  <><Timer size={20} className="animate-pulse" /> WAIT {formatTime(cooldown)}</>
                ) : (
                  <><Lock size={20} /> INITIALIZE ACCESS</>
                )}
              </button>

              <button onClick={() => setIsHistoryOpen(true)} className="w-full bg-white text-slate-400 font-black py-4 rounded-[30px] border-2 border-slate-100 flex items-center justify-center gap-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest">
                <HistoryIcon size={16} /> Site History
              </button>
            </div>
          ) : (
            <div className="py-16 text-center space-y-6">
               <XCircle size={64} className="text-red-500 mx-auto opacity-20" />
               <h2 className="text-2xl font-[1000] uppercase italic">Out of Range</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase leading-relaxed tracking-widest px-10">Access denied. You must be at the physical location to request credentials.</p>
               <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-90 transition-all">Retry GPS Node</button>
            </div>
          )}
        </div>

        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={device?.device_sn} siteName={device?.site_name} />
        <MasterDialog isOpen={dialog.isOpen} onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))} onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))} title={dialog.title} message={dialog.message} type={dialog.type} confirmText="Acknowledge" />
      </div>
    </div>
  );
}