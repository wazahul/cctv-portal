"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShieldCheck, MapPin, XCircle, Smartphone, History } from "lucide-react";

export default function RequestPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;

  const [device, setDevice] = useState<any>(null);
  const [mobile, setMobile] = useState("");
  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);

  // --- 📏 Range Check Logic ---
  const checkAccess = (siteLat: number, siteLon: number) => {
    if (!navigator.geolocation) return alert("GPS not supported");

    navigator.geolocation.getCurrentPosition((pos) => {
      const R = 6371000; // Meters
      const dLat = (siteLat - pos.coords.latitude) * Math.PI / 180;
      const dLon = (siteLon - pos.coords.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(pos.coords.latitude * Math.PI/180) * Math.cos(siteLat * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      setInRange(distance <= 200); // 200 meters range
      setLoading(false);
    }, (err) => {
      alert("Please enable Location to proceed");
      setLoading(false);
    });
  };

  useEffect(() => {
    const getDevice = async () => {
      const { data } = await supabase.from("devices").select("*").eq("sn", deviceId).single();
      if (data) {
        setDevice(data);
        checkAccess(data.latitude, data.longitude);
      } else {
        alert("Invalid QR Code");
        setLoading(false);
      }
    };
    getDevice();
  }, [deviceId]);

  const handleRequest = async () => {
    if (mobile.length < 10) return alert("Enter valid WhatsApp number");
    setReqLoading(true);

    const res = await fetch("/api/request-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, device_id: device.sn }),
    });

    const data = await res.json();
    setReqLoading(false);

    if (data.success) {
      alert("✅ Request Sent! Opening WhatsApp...");
      window.open(data.waLink, "_blank");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse text-xl">VERIFYING LOCATION...</div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white">
        
        {/* Header - Image Style */}
        <div className="bg-[#f0f7ff] p-8 text-center border-b border-blue-50">
          <h1 className="text-[32px] font-black text-blue-700 tracking-tight leading-none mb-4">
            {device?.site_name || "CCTV PORTAL"}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">Model</span>
            <span className="text-slate-500 font-bold text-sm">Model: {device?.model}</span>
          </div>
        </div>

        {inRange ? (
          <div className="p-8 space-y-5">
            {/* Input - Match Image Styling */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📱</div>
              <input 
                type="tel"
                placeholder="Enter WhatsApp Number"
                className="w-full py-5 pl-12 pr-4 bg-white border-2 border-orange-400 rounded-2xl outline-none text-slate-600 font-bold placeholder:text-slate-400 placeholder:font-medium focus:shadow-[0_0_15px_rgba(251,146,60,0.2)] transition-all"
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={handleRequest}
                disabled={reqLoading}
                className="w-full bg-[#f1f5f9] hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-black py-5 rounded-[25px] tracking-wide text-[16px] uppercase border border-slate-100 transition-all flex items-center justify-center gap-2"
              >
                {reqLoading ? <Loader2 className="animate-spin" /> : "Request Passwords"}
              </button>

              <button className="w-full bg-[#e2e8f0] hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-black py-5 rounded-[25px] tracking-wide text-[16px] uppercase transition-all flex items-center justify-center gap-2">
                View Maintenance Logs
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-8 font-black uppercase tracking-widest">
              Automated Alert | Modern Enterprise 2026
            </p>
          </div>
        ) : (
          /* OUT OF RANGE VIEW */
          <div className="p-12 text-center">
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-black text-slate-800">OUT OF RANGE</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed font-medium">
              You are too far from the site location. Please be present at <span className="text-slate-800 font-bold">{device?.site_name}</span> to request access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}