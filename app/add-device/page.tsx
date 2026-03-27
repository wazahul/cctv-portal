"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, XCircle, CheckCircle2 } from "lucide-react";

export default function RequestPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("loading");

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from("devices").select("*").eq("sn", deviceId).single();
      if (!data) { setStatus("error"); return; }
      setDevice(data);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, data.latitude, data.longitude);
          setInRange(dist <= 200); // 200 Meters Range
          setStatus("idle");
        },
        () => { alert("Please enable GPS"); setStatus("idle"); }
      );
    };
    init();
  }, [deviceId]);

  const handleRequest = async () => {
    if (mobile.length < 10) return alert("Enter valid mobile number");
    setStatus("loading");

    const res = await fetch("/api/request-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, device_id: device.sn }),
    });

    const data = await res.json();
    if (data.success) setStatus("success");
    else { alert("Error sending request"); setStatus("idle"); }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">VERIFYING...</div>;

  if (status === "success") return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
      <div className="animate-in zoom-in duration-300">
        <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-slate-800">REQUEST SENT!</h1>
        <p className="text-slate-500 mt-2">Admin will review your location and contact you on WhatsApp shortly.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-white overflow-hidden">
        
        <div className="bg-[#f0f7ff] p-8 text-center">
          <h1 className="text-2xl font-black text-blue-700 tracking-tight">{device?.site_name}</h1>
          <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Model: {device?.model}</p>
        </div>

        {inRange ? (
          <div className="p-8 space-y-6">
            <input 
              type="tel" 
              placeholder="Enter WhatsApp Number" 
              className="w-full p-5 border-2 border-orange-400 rounded-2xl outline-none font-bold text-slate-700 focus:bg-orange-50/30 transition-all"
              onChange={(e) => setMobile(e.target.value)}
            />
            <button 
              onClick={handleRequest}
              className="w-full bg-[#f1f5f9] hover:bg-emerald-50 text-slate-700 font-black py-5 rounded-[25px] border border-slate-100 transition-all uppercase tracking-wide"
            >
              Request Passwords
            </button>
            <button className="w-full bg-[#e2e8f0] text-slate-500 font-black py-5 rounded-[25px] border border-slate-100 uppercase tracking-wide">
              View Maintenance Logs
            </button>
          </div>
        ) : (
          <div className="p-10 text-center">
            <XCircle size={60} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-800 tracking-tight">NOT AT SITE</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium leading-relaxed">You must be within 200m of the site to request credentials.</p>
          </div>
        )}
      </div>
    </div>
  );
}