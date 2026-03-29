"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, MessageCircle, ShieldCheck, Loader2, BellRing, Hash, MessageSquare } from "lucide-react";

// --- COMPONENT 1: The Blinking Bell Notification (For Card) ---
export function RequestNotification({ deviceSn, pendingRequests, onClick }: { deviceSn: string, pendingRequests: any[], onClick: () => void }) {
  const hasRequest = pendingRequests.some(r => r.device_sn === deviceSn);
  if (!hasRequest) return null;

  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="absolute left-4 top-4 bg-red-500 text-white p-2 rounded-2xl shadow-lg shadow-red-200 animate-bounce z-[20]">
      <BellRing size={18} className="animate-pulse" />
      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
      </span>
    </button>
  );
}

// --- COMPONENT 2: The Main Manager Modal ---
export default function RequestManagerModal({ isOpen, onClose, onRefresh, filterSn }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, filterSn?: string | null }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isOpen) fetchRequests(); }, [isOpen, filterSn]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase.from("requests").select("*").eq("status", "pending");
    if (filterSn) query = query.eq("device_sn", filterSn);
    const { data: reqData } = await query.order("created_at", { ascending: false });

    if (reqData?.length) {
      const { data: devData } = await supabase.from("devices").select("device_sn, user_name, user_pass").in("device_sn", reqData.map(r => r.device_sn));
      setRequests(reqData.map(req => ({ ...req, deviceDetails: devData?.find(d => d.device_sn === req.device_sn) })));
    } else setRequests([]);
    setLoading(false);
  };

  const generatePortalId = (sn: string) => {
    if (!sn || sn.length < 8) return "ME_ADMIN";
    return `ME_${sn.slice(-8).slice(0, 4).toLowerCase()}`;
  };

  const handleAction = async (req: any) => {
    try {
      const { error } = await supabase.from("requests").update({ status: 'done' }).eq("id", req.id);
      if (error) throw error;

      const userNote = req.message ? `%0A*Note:* ${req.message}` : "";
      const msg = `*MODERN ENTERPRISES*%0A*Site:* ${req.site_name}%0A*Portal ID:* ${generatePortalId(req.device_sn)}%0A*User:* ${req.deviceDetails?.user_name}%0A*Pass:* ${req.deviceDetails?.user_pass}${userNote}`;

      window.open(`https://wa.me/91${req.mobile}?text=${msg}`, '_blank');
      fetchRequests(); onRefresh();
      if (filterSn) onClose();
    } catch (err: any) { alert(err.message); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white">
        <div className="p-6 border-b flex justify-between items-center bg-red-50/50">
          <h2 className="text-xl font-black text-red-600 uppercase italic flex items-center gap-2"><ShieldCheck size={22} /> Tasks</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-red-500 shadow-sm"><X size={20} /></button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 bg-slate-50/30">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32}/></div>
          ) : requests.map(req => (
            <div key={req.id} className="p-4 rounded-[25px] border border-slate-100 bg-white flex flex-col gap-3 hover:shadow-lg transition-all">
              
              {/* Header Line */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-800 uppercase italic truncate">{req.site_name}</h3>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                   <Hash size={10} className="text-slate-400" />
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">SN: {req.device_sn}</span>
                </div>
              </div>

              {/* User Message Sticker */}
              {req.message && (
                <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-2xl border-l-4 border-l-yellow-400 border border-yellow-100">
                  <MessageSquare size={14} className="text-yellow-600 mt-0.5" />
                  <p className="text-[11px] font-bold text-yellow-800 leading-tight italic">"{req.message}"</p>
                </div>
              )}

              {/* Footer Line */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                     <span className="text-[8px] font-black text-blue-500 uppercase">Portal ID</span>
                     <span className="text-[11px] font-bold text-slate-700">{generatePortalId(req.device_sn)}</span>
                   </div>
                   <div className="w-[1px] h-6 bg-slate-100 border-l ml-2"></div>
                   <div className="flex flex-col ml-1">
                     <span className="text-[8px] font-black text-slate-400 uppercase">WA</span>
                     <span className="text-[11px] font-bold text-slate-700">{req.mobile}</span>
                   </div>
                </div>
                <button onClick={() => handleAction(req)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">
                  <MessageCircle size={14}/> Send & Done
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}