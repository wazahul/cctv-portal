"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  
  // --- MASTER DIALOG STATE ---
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "danger" | "success" | "warning",
  });

  useEffect(() => {
    if (isOpen && sn) {
      fetchLogs();
    }
  }, [isOpen, sn]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_logs")
        .select("*")
        .eq("device_sn", sn)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      if (data) setLogs(data);
    } catch (err: any) {
      setDialog({
        isOpen: true,
        title: "Sync Error",
        message: "Cloud se records fetch karne mein dikkat hui: " + err.message,
        type: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 🖼️ PDF Helper ---
  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
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
    } catch (e) { console.warn("Logo skipped"); }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16).setFont("helvetica", "bold").text("MODERN ENTERPRISES", 35, 18);
    doc.setFontSize(7).setFont("helvetica", "normal").text("SECURITY SOLUTIONS & INTERIOR DECORATOR", 35, 22);
    doc.text("Mob: +91 7021330886 | me.cctv247@gmail.com", 35, 25);
    doc.setDrawColor(230, 230, 230).line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    doc.setFontSize(7).setTextColor(120).text(`Generated on ${new Date().toLocaleString()}`, 14, pageHeight - 10);
  };

  const downloadMasterPDF = async () => {
    try {
      const doc = new jsPDF();
      await applyBrandingAndFooter(doc);
      doc.setFontSize(12).setFont("helvetica", "bold").text("MAINTENANCE HISTORY REPORT", 14, 40);
      doc.setFontSize(9).setFont("helvetica", "normal").text(`SITE: ${siteName} | SN: ${sn}`, 14, 46);

      const tableRows = logs.map(log => [
        new Date(log.created_at).toLocaleDateString('en-GB'),
        log.technician_name.toUpperCase(),
        log.work_done,
        log.status?.replace(/✅|⏳/g, '') || 'Completed'
      ]);

      autoTable(doc, {
        startY: 52,
        head: [['DATE', 'ENGINEER', 'WORK DESCRIPTION', 'STATUS']],
        body: tableRows,
        headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
      });

      doc.save(`History_${siteName}.pdf`);
      setDialog({ isOpen: true, title: "Success", message: "Full History PDF download ho gayi hai.", type: "success" });
    } catch (err: any) {
      setDialog({ isOpen: true, title: "Export Error", message: "Report banane mein problem hui.", type: "danger" });
    }
  };

  const downloadSingleReceipt = async (log: any) => {
    try {
      const doc = new jsPDF();
      await applyBrandingAndFooter(doc);
      doc.setFillColor(30, 41, 59).rect(0, 35, 210, 10, 'F');
      doc.setTextColor(255, 255, 255).setFontSize(9).text("SERVICE COMPLETION SLIP", 85, 41);
      
      doc.setTextColor(40).setFontSize(10);
      doc.text(`SITE: ${siteName}`, 14, 55);
      doc.text(`DATE: ${new Date(log.created_at).toLocaleDateString('en-GB')}`, 14, 62);
      
      autoTable(doc, {
        startY: 70,
        body: [
          ["ENGINEER", log.technician_name.toUpperCase()],
          ["WORK DONE", log.work_done],
          ["NEXT VISIT", log.next_service_date || "Not Scheduled"],
          ["REMARKS", log.remarks || "-"]
        ],
        theme: 'grid',
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] } }
      });

      doc.save(`Slip_${siteName}.pdf`);
    } catch (e) {
      setDialog({ isOpen: true, title: "PDF Error", message: "Receipt download nahi ho saki.", type: "danger" });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
        
        {/* 📱 Mobile: Bottom Sheet Design | 💻 Desktop: Centered Card */}
        <div className="w-full max-w-xl bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden border-t sm:border border-white relative animate-in slide-in-from-bottom duration-500 max-h-[92vh] flex flex-col">
          
          {/* Gradient Top Border */}
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 shrink-0"></div>
          
          {/* HEADER */}
          <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0 text-left">
            <div>
              <h2 className="text-xl sm:text-2xl font-[1000] text-slate-800 uppercase italic tracking-tighter flex items-center gap-2 leading-none">
                <ClipboardList className="text-blue-600" size={24} /> Service History
              </h2>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1.5 truncate max-w-[180px]">{siteName}</p>
            </div>
            
            <div className="flex gap-2">
              {logs.length > 0 && (
                <button onClick={downloadMasterPDF} className="p-3 bg-slate-900 text-white rounded-2xl active:scale-90 flex items-center gap-2 shadow-lg transition-all hover:bg-blue-600">
                  <FileText size={18} />
                  <span className="text-[9px] font-black uppercase hidden sm:block">Full Report</span>
                </button>
              )}
              <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90 border border-slate-100">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* BODY (Touch-Friendly Scroll) */}
          <div className="p-5 sm:p-8 overflow-y-auto custom-scroll space-y-5 bg-slate-50/50 flex-1 pb-12">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Cloud Data...</p>
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="relative p-5 rounded-[30px] border border-slate-200 bg-white shadow-sm active:scale-[0.98] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase leading-none">
                      <Calendar size={12} /> {new Date(log.created_at).toLocaleDateString('en-GB')}
                    </span>
                    <button 
                       onClick={(e) => { e.stopPropagation(); downloadSingleReceipt(log); }}
                       className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl active:scale-90 border border-emerald-100 shadow-sm"
                    >
                      <Printer size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-xl text-slate-600"><User size={14} /></div>
                      <div>
                        <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest">Technician</p>
                        <p className="text-sm font-bold text-slate-800 uppercase leading-none mt-1">{log.technician_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-orange-50 p-2 rounded-xl text-orange-600 mt-0.5"><Wrench size={14} /></div>
                      <div>
                        <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest">Work Done</p>
                        <p className="text-sm text-slate-700 font-medium leading-tight mt-1">{log.work_done}</p>
                      </div>
                    </div>

                    {/* Remarks Section */}
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 mt-0.5"><MessageSquare size={16} /></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] leading-none">Engineer Remarks</p>
                        <p className="text-sm text-slate-600 italic font-bold mt-1.5 leading-relaxed">
                          {log.remarks ? `"${log.remarks}"` : "No special remarks provided."}
                        </p>
                      </div>
                    </div>

                    {log.next_service_date && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Clock size={16} className="text-emerald-600" />
                           <span className="text-[10px] font-black text-emerald-800 uppercase leading-none">Next Visit</span>
                         </div>
                         <span className="text-xs font-black text-emerald-600">{new Date(log.next_service_date).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                 <AlertCircle size={48} />
                 <p className="font-black text-[10px] uppercase tracking-[4px]">No Records Found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🛡️ MASTER DIALOG INTEGRATION (No more Native Alerts) */}
      <MasterDialog 
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText="Understood"
      />
    </>
  );
}