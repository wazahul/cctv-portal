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

  // 1. Viewport Lock Logic (Immune to Mobile Browser UI shifts)
  useEffect(() => {
    if (isOpen) {
      const setVh = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVh();
      window.addEventListener('resize', setVh);
      document.body.style.overflow = 'hidden';
      if (sn) fetchLogs();
      
      return () => {
        window.removeEventListener('resize', setVh);
        document.body.style.overflow = 'unset';
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

  const applyBrandingAndFooter = async (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    try {
      const imgData = await getBase64ImageFromURL("/logo.ico");
      doc.addImage(imgData, "PNG", 14, 10, 15, 15);
    } catch (e) { console.warn("Logo missing"); }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16).setFont("helvetica", "bold").text(COMPANY?.name || "MODERN ENTERPRISES", 35, 18);
    doc.setFontSize(7).setFont("helvetica", "normal").text(COMPANY?.branding?.tagline2 || "SECURITY SOLUTIONS", 35, 22);
    doc.text(`Mob: ${COMPANY?.contact} | ${COMPANY?.supportEmail}`, 35, 25);
    doc.setDrawColor(230, 230, 230).line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    doc.setFontSize(7).setTextColor(120).text(`Generated on ${new Date().toLocaleString()}`, 14, pageHeight - 10);
  };

  const downloadMasterPDF = async () => {
    try {
      const doc = new jsPDF();
      await applyBrandingAndFooter(doc);
      doc.setFontSize(12).setFont("helvetica", "bold").text("MAINTENANCE HISTORY REPORT", 14, 40);
      autoTable(doc, {
        startY: 52,
        head: [['DATE', 'ENGINEER', 'WORK DESCRIPTION', 'STATUS']],
        body: logs.map(log => [new Date(log.created_at).toLocaleDateString('en-GB'), log.technician_name.toUpperCase(), log.work_done, 'Completed']),
        headStyles: { fillColor: [30, 41, 59] },
      });
      doc.save(`History_${siteName}.pdf`);
    } catch (e) { console.error(e); }
  };

  const downloadSingleReceipt = async (log: any) => {
    try {
      const doc = new jsPDF();
      await applyBrandingAndFooter(doc);
      doc.setFillColor(30, 41, 59).rect(0, 35, 210, 10, 'F');
      doc.setTextColor(255, 255, 255).setFontSize(9).text("SERVICE COMPLETION SLIP", 85, 41);
      autoTable(doc, {
        startY: 55,
        body: [["ENGINEER", log.technician_name.toUpperCase()], ["WORK DONE", log.work_done], ["DATE", new Date(log.created_at).toLocaleDateString('en-GB')], ["REMARKS", log.remarks || "-"]],
        theme: 'grid',
      });
      doc.save(`Slip_${siteName}.pdf`);
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 🚩 VIEWPORT LOCK PARENT */}
      <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-stretch sm:items-center justify-center p-0 animate-in fade-in duration-300">
        
        {/* 🚩 MODAL STRUCTURE */}
        <div 
          style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
          className="bg-[#fcfdfe] w-full max-w-xl sm:h-auto sm:max-h-[95vh] sm:rounded-[45px] shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom duration-500"
        >
          
          {/* 🚩 STICKY HEADER (Glassmorphism) */}
          <header className="sticky top-0 z-[110] p-6 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur-xl shrink-0 text-left">
            <div>
              <h2 className="text-xl font-[1000] text-slate-800 uppercase italic tracking-tighter flex items-center gap-2 leading-none">
                <ClipboardList className="text-blue-600" size={24} /> Service History
              </h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1.5 truncate max-w-[180px]">{siteName}</p>
            </div>
            <div className="flex gap-2">
              {logs.length > 0 && (
                <button 
                  onClick={downloadMasterPDF} 
                  className="p-3 bg-slate-900 text-white rounded-2xl border-b-4 border-slate-700 active:scale-95 transition-all shadow-lg"
                >
                  <FileText size={18} />
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-3 bg-slate-50 rounded-2xl text-slate-400 border-2 border-slate-100 border-b-4 active:border-b-0 active:scale-95 transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
          </header>

          {/* 🚩 INDEPENDENT SCROLL BODY */}
          <main className="flex-1 overflow-y-auto custom-scroll p-6 sm:p-10 space-y-5 bg-slate-50/50 pb-24 touch-pan-y" style={{ overscrollBehavior: 'contain' }}>
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Accessing Records...</p>
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="relative p-6 rounded-[35px] border-2 border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group text-left">
                  
                  <div className="flex justify-between items-start mb-5">
                    <span className="text-[10px] font-[1000] text-blue-600 bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-tight">
                      <Calendar size={12} /> {new Date(log.created_at).toLocaleDateString('en-GB')}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadSingleReceipt(log); }}
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border-2 border-emerald-100 border-b-4 active:border-b-0 active:scale-95 transition-all"
                    >
                      <Printer size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-3 rounded-[20px] text-slate-400 border border-slate-100"><User size={16} /></div>
                      <div>
                        <p className="text-slate-400 font-black text-[8px] uppercase tracking-[2px] leading-none">Technician</p>
                        <p className="text-sm font-black text-slate-800 uppercase mt-1.5">{log.technician_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-orange-50 p-3 rounded-[20px] text-orange-500 border border-orange-100 mt-0.5"><Wrench size={16} /></div>
                      <div className="flex-1">
                        <p className="text-slate-400 font-black text-[8px] uppercase tracking-[2px] leading-none">Work Done</p>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed mt-2 bg-slate-50/50 p-4 rounded-3xl border border-dashed border-slate-200">{log.work_done}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-50 p-3 rounded-[20px] text-purple-600 mt-0.5 text-left"><MessageSquare size={16} /></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] leading-none">Engineer Remarks</p>
                        <p className="text-sm text-slate-600 italic font-bold mt-2 leading-relaxed">"{log.remarks || 'No special remarks provided.'}"</p>
                      </div>
                    </div>

                    {log.next_service_date && (
                      <div className="p-4 bg-emerald-600 text-white rounded-[25px] flex items-center justify-between border-b-4 border-emerald-800 active:scale-95 transition-all shadow-lg mt-2">
                        <div className="flex items-center gap-3">
                          <Clock size={18} />
                          <div>
                            <p className="text-[8px] font-black uppercase opacity-70 leading-none">Suggested Visit</p>
                            <p className="text-xs font-black uppercase mt-1">Next Service</p>
                          </div>
                        </div>
                        <span className="text-sm font-[1000] italic">{new Date(log.next_service_date).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                 <AlertCircle size={48} />
                 <p className="font-black text-[10px] uppercase tracking-[5px]">No Records Found</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 🚩 DEAD-CENTER DIALOG (Parallel to main content) */}
      <div className="fixed inset-0 pointer-events-none z-[1000] flex items-center justify-center">
        <div className="pointer-events-auto">
          <MasterDialog 
            isOpen={dialog.isOpen} 
            onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
            onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))} 
            title={dialog.title} 
            message={dialog.message} 
            type={dialog.type} 
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @media (max-width: 640px) {
          .custom-scroll { -webkit-overflow-scrolling: touch; }
        }
      `}</style>
    </>
  );
}