"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY } from "@/lib/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  X, Calendar, User, Wrench, Clock, 
  Loader2, ClipboardList, FileText,
  Printer, MessageSquare, AlertCircle
} from "lucide-react";
import MasterDialog from "@/lib/components/MasterDialog"; 

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn: string;
  siteName: string;
}

export default function HistoryModal({ isOpen, onClose, sn, siteName }: HistoryModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "", type: "info" as any });

  // 🚩 POLISH 1: Viewport Lock & Body Freeze (No Background Scroll)
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width to prevent "layout shift"
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      // Setting dynamic VH for mobile address bar fixes
      const setVh = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);
      
      if (sn) fetchLogs();

      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
        window.removeEventListener('resize', setVh);
      };
    }
  }, [isOpen, sn]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("service_logs").select("*").eq("device_sn", sn).order("created_at", { ascending: false });
      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Sync Error", message: err.message, type: "danger" });
    } finally { setLoading(false); }
  };

  // --- PDF LOGIC (Polished Output) ---
  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Logo missing"));
      img.src = url;
    });
  };

  const applyBranding = async (doc: jsPDF) => {
    try {
      const imgData = await getBase64ImageFromURL("/logo.ico");
      doc.addImage(imgData, "PNG", 14, 10, 12, 12);
    } catch (e) { console.warn("Logo missing"); }
    doc.setTextColor(30, 41, 59).setFontSize(14).setFont("helvetica", "bold").text(COMPANY?.name || "MODERN ENTERPRISES", 28, 16);
    doc.setFontSize(7).setFont("helvetica", "normal").text(`${COMPANY?.contact} | ${COMPANY?.supportEmail}`, 28, 20);
    doc.setDrawColor(240).line(14, 25, 196, 25);
  };

  const downloadMasterPDF = async () => {
    try {
      const doc = new jsPDF();
      await applyBranding(doc);
      doc.setFontSize(11).setFont("helvetica", "bold").text(`SERVICE LOGS: ${siteName.toUpperCase()}`, 14, 35);
      autoTable(doc, {
        startY: 40,
        head: [['DATE', 'ENGINEER', 'WORK DESCRIPTION']],
        body: logs.map(log => [new Date(log.created_at).toLocaleDateString('en-GB'), log.technician_name.toUpperCase(), log.work_done]),
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 }
      });
      doc.save(`Logs_${siteName}.pdf`);
    } catch (e) { console.error(e); }
  };

  const downloadSingleReceipt = async (log: any) => {
    try {
      const doc = new jsPDF();
      await applyBranding(doc);
      doc.setFillColor(30, 41, 59).rect(14, 30, 182, 8, 'F');
      doc.setTextColor(255).setFontSize(8).text("MAINTENANCE COMPLETION RECEIPT", 75, 35);
      autoTable(doc, {
        startY: 45,
        body: [
          ["SITE NAME", siteName.toUpperCase()],
          ["ENGINEER", log.technician_name.toUpperCase()],
          ["WORK DONE", log.work_done],
          ["DATE", new Date(log.created_at).toLocaleDateString('en-GB')],
          ["REMARKS", log.remarks || "No additional remarks"]
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 }
      });
      doc.save(`Slip_${siteName}.pdf`);
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 🚩 POLISH 2: Smooth Fade Backdrop */}
      <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
        
        {/* 🚩 POLISH 3: Modal Architecture with Viewport Lock */}
        <div 
          style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          className="bg-white w-full max-w-xl sm:h-auto sm:max-h-[90vh] sm:rounded-[45px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-500"
        >
          
          {/* 🚩 POLISH 4: Sticky Glass Header */}
          <header className="sticky top-0 z-[110] p-6 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-xl shrink-0">
            <div className="text-left">
              <h2 className="text-xl font-[1000] text-slate-800 uppercase italic tracking-tighter flex items-center gap-2 leading-none">
                <ClipboardList className="text-blue-600" size={24} /> Service History
              </h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2 truncate max-w-[200px]">{siteName}</p>
            </div>
            <div className="flex gap-2">
              {logs.length > 0 && (
                <button onClick={downloadMasterPDF} className="p-3 bg-slate-900 text-white rounded-2xl active:scale-95 transition-all shadow-lg border-b-4 border-slate-700 active:border-b-0 flex items-center justify-center"><FileText size={18} /></button>
              )}
              <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 border-2 border-slate-100 border-b-4 active:border-b-0 active:scale-95 transition-all flex items-center justify-center"><X size={20} strokeWidth={3} /></button>
            </div>
          </header>

          {/* 🚩 POLISH 5: Smooth Scrolling Body with Tactile Cards */}
          <main className="flex-1 overflow-y-auto custom-scroll p-5 sm:p-8 space-y-5 bg-slate-50/40 scroll-smooth pb-32">
            {loading ? (
              <div className="py-32 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[5px]">Syncing Records</p>
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="relative p-6 rounded-[35px] border-2 border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group text-left">
                  
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[10px] font-[1000] text-blue-600 bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-tight leading-none">
                      <Calendar size={12} /> {new Date(log.created_at).toLocaleDateString('en-GB')}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadSingleReceipt(log); }} 
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border-2 border-emerald-100 border-b-4 active:border-b-0 active:scale-95 transition-all flex items-center justify-center"
                    >
                      <Printer size={16} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-3 rounded-[20px] text-slate-400 border border-slate-100"><User size={16} /></div>
                      <div>
                        <p className="text-slate-400 font-black text-[9px] uppercase tracking-[2px] leading-none">Service Engineer</p>
                        <p className="text-base font-black text-slate-800 uppercase mt-1.5 leading-none">{log.technician_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-orange-50 p-3 rounded-[20px] text-orange-500 border border-orange-100 mt-0.5"><Wrench size={16} /></div>
                      <div className="flex-1">
                        <p className="text-slate-400 font-black text-[9px] uppercase tracking-[2px] leading-none">Work Details</p>
                        <div className="text-sm text-slate-700 font-bold leading-relaxed mt-2 bg-slate-50/50 p-4 rounded-3xl border border-dashed border-slate-200">
                          {log.work_done}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-50 p-3 rounded-[20px] text-purple-600 mt-0.5"><MessageSquare size={16} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] leading-none">Technician Remarks</p>
                        <p className="text-sm text-slate-600 italic font-bold mt-2 leading-relaxed">"{log.remarks || 'Routine system maintenance completed.'}"</p>
                      </div>
                    </div>

                    {log.next_service_date && (
                      <div className="p-4 bg-emerald-600 text-white rounded-[30px] flex items-center justify-between border-b-4 border-emerald-800 active:border-b-0 active:translate-y-[2px] active:scale-95 transition-all shadow-lg shadow-emerald-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Clock size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase opacity-70 leading-none">Next Visit</p>
                            <p className="text-xs font-black uppercase mt-1">Next Service Date</p>
                          </div>
                        </div>
                        <span className="text-base font-[1000] italic">{new Date(log.next_service_date).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                 <AlertCircle size={48} className="text-slate-400" />
                 <p className="font-black text-[10px] uppercase tracking-[5px]">Zero Records Found</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <MasterDialog 
        isOpen={dialog.isOpen} 
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
        title={dialog.title} 
        message={dialog.message} 
        type={dialog.type} 
      />

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @media (max-width: 640px) { .custom-scroll { -webkit-overflow-scrolling: touch; } }
      `}</style>
    </>
  );
}