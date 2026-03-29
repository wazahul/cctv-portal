"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, MessageCircle, ShieldCheck, Loader2, BellRing, Hash, MessageSquare } from "lucide-react";

// --- 🔔 COMPONENT 1: Card Bell (Clean & Minimal) ---
export function RequestNotification({ deviceSn, pendingRequests, onClick }: { deviceSn: string, pendingRequests: any[], onClick: () => void }) {
  const hasRequest = pendingRequests.some(r => r.device_sn === deviceSn);
  if (!hasRequest) return null;

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }} 
      className="absolute left-5 top-5 text-red-600 hover:scale-110 active:scale-90 transition-transform z-[20] p-1"
    >
      {/* Sirf Pulse rakha hai, Bounce Delete kar diya hai */}
      <BellRing size={22} className="animate-pulse" />
      
      {/* Tiny Status Dot */}
      <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white"></span>
      </span>
    </button>
  );
}

// --- 🛡️ COMPONENT 2: Main Manager Modal ---
export default function RequestManagerModal({ isOpen, onClose, onRefresh, filterSn }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, filterSn?: string | null }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (isOpen) fetchRequests(); }, [isOpen, filterSn]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase.from("requests").select("*").eq("status", "pending");
      if (filterSn) query = query.eq("device_sn", filterSn);
      const { data: reqData } = await query.order("created_at", { ascending: false });

      if (reqData?.length) {
        const { data: devData } = await supabase
          .from("devices")
          .select("device_sn, user_name, user_pass")
          .in("device_sn", reqData.map(r => r.device_sn));

        setRequests(reqData.map(req => ({ 
          ...req, 
          deviceDetails: devData?.find(d => d.device_sn === req.device_sn) 
        })));
      } else {
        setRequests([]);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
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
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden border-t sm:border border-white animate-in slide-in-from-bottom duration-300">
        
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={22} /> Tasks Manager
          </h2>
          <button onClick={onClose} className="p-2.5 bg-white rounded-full text-slate-400 shadow-sm active:scale-90 border">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4 bg-slate-50/50 pb-10">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32}/></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending tasks</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="p-5 rounded-[30px] border border-slate-200 bg-white flex flex-col gap-4 shadow-sm active:border-blue-200 transition-all">
                
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-[1000] text-slate-900 uppercase italic leading-tight pr-4">{req.site_name}</h3>
                  <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border uppercase whitespace-nowrap">SN: {req.device_sn}</span>
                </div>

                {req.message && (
                  <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                    <MessageSquare size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-yellow-900 leading-snug italic">"{req.message}"</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-blue-500 uppercase">Portal ID</span>
                      <span className="text-xs font-bold text-slate-800">{generatePortalId(req.device_sn)}</span>
                    </div>
                    <div className="flex flex-col border-l pl-4">
                      <span className="text-[8px] font-black text-slate-400 uppercase">WhatsApp</span>
                      <span className="text-xs font-bold text-slate-800">{req.mobile}</span>
                    </div>
                  </div>
                  <button onClick={() => handleAction(req)} className="w-full sm:w-auto bg-green-600 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase shadow-lg shadow-green-100 active:scale-95">
                    <MessageCircle size={18}/> Send & Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}