"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  X, Calendar, User, Wrench, Clock, 
  Loader2, ClipboardList, Download, FileText,
  Printer
} from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn: string;
  siteName: string;
}

export default function HistoryModal({ isOpen, onClose, sn, siteName }: HistoryModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && sn) {
      const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("service_logs")
          .select("*")
          .eq("device_sn", sn)
          .order("created_at", { ascending: false });
        
        if (data) setLogs(data);
        if (error) console.error("Database Error:", error.message);
        setLoading(false);
      };
      fetchLogs();
    }
  }, [isOpen, sn]);

  // --- 🖼️ Helper: Image URL ko Base64 mein badalne ke liye ---
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
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  // --- 🎨 Common Branding & Footer ---
  const applyBrandingAndFooter = async (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // 1. Logo from Public Folder (logo.ico ya logo.png)
    try {
      const imgData = await getBase64ImageFromURL("/logo.ico");
      doc.addImage(imgData, "PNG", 14, 10, 20, 20);
    } catch (e) {
      console.error("Logo not found in public folder");
    }

    // 2. Header Info (Modern Enterprises)
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MODERN ENTERPRISES", 38, 18);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("INTERIOR DECORATOR & SECURITY SOLUTIONS", 38, 23);
    doc.text("Mob: +91 7021330886 | Email: me.cctv247@gmail.com", 38, 27);

    // 3. Footer Line & Details
    doc.setDrawColor(220, 220, 220);
    doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Modern Enterprises - Service Record - ${new Date().getFullYear()}`, 14, pageHeight - 12);
    
    // ✅ FIXED: TypeScript cast to 'any' to bypass build error
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.text(`Page ${pageCount}`, pageWidth - 25, pageHeight - 12);
    
    doc.text("This is a computer generated document.", 14, pageHeight - 8);
  };

  // --- 📑 1. MASTER PDF LOGIC ---
  const downloadMasterPDF = async () => {
    const doc = new jsPDF();
    await applyBrandingAndFooter(doc);

    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("FULL MAINTENANCE HISTORY", 14, 42);
    doc.setFontSize(10);
    doc.text(`SITE: ${siteName} | SN: ${sn}`, 14, 48);

    const tableRows = logs.map(log => [
      new Date(log.created_at).toLocaleDateString(),
      log.technician_name.toUpperCase(),
      log.service_type || 'Routine',
      log.work_done,
      log.status.replace(/✅|⏳/g, '')
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['DATE', 'TECHNICIAN', 'TYPE', 'WORK DESCRIPTION', 'STATUS']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 },
    });

    doc.save(`History_${siteName}.pdf`);
  };

  // --- 📑 2. SINGLE RECEIPT LOGIC ---
  const downloadSingleReceipt = async (log: any) => {
    const doc = new jsPDF();
    await applyBrandingAndFooter(doc);

    // Header Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 35, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("SERVICE COMPLETION SLIP", 80, 43);

    // Service Details
    doc.setTextColor(40);
    doc.text(`SITE NAME : ${siteName}`, 14, 60);
    doc.text(`SERIAL NO : ${sn}`, 14, 67);
    doc.text(`JOB DATE  : ${new Date(log.created_at).toLocaleDateString()}`, 14, 74);
    
    autoTable(doc, {
      startY: 85,
      body: [
        ["TECHNICIAN", log.technician_name.toUpperCase()],
        ["SERVICE TYPE", log.service_type || "Routine"],
        ["WORK DONE", log.work_done],
        ["NEXT VISIT", log.next_service_date || "Not Scheduled"],
        ["REMARKS", log.remarks || "-"]
      ],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: 0 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    doc.save(`Slip_${siteName}_${new Date(log.created_at).toLocaleDateString()}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-white rounded-[50px] shadow-2xl overflow-hidden border border-white relative animate-in slide-in-from-bottom-20 duration-500">
        
        <div className="h-2.5 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-[#fcfdfe]">
          <div className="text-left">
            <h2 className="text-2xl font-[1000] text-slate-800 uppercase italic tracking-tighter flex items-center gap-2">
              <ClipboardList className="text-blue-600" size={24} /> Archive Vault
            </h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{siteName}</p>
          </div>
          
          <div className="flex gap-2">
            {logs.length > 0 && (
              <button 
                onClick={downloadMasterPDF}
                className="p-4 bg-slate-900 text-white rounded-[25px] active:scale-90 flex items-center gap-2 shadow-lg"
              >
                <FileText size={20} />
                <span className="text-[10px] font-black uppercase hidden sm:block">History PDF</span>
              </button>
            )}
            <button onClick={onClose} className="p-4 bg-white rounded-[25px] shadow-sm text-slate-400 hover:text-red-500 border border-slate-100 active:scale-90 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scroll space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="py-24 flex flex-col items-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative p-6 rounded-[35px] border border-slate-200 bg-white group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-slate-500">{new Date(log.created_at).toLocaleDateString()}</span>
                  <button 
                     onClick={() => downloadSingleReceipt(log)}
                     className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <Printer size={16} />
                  </button>
                </div>
                <p className="text-[14px] font-black text-slate-800 uppercase">{log.technician_name}</p>
                <p className="text-[13px] text-slate-600 italic">"{log.work_done}"</p>
              </div>
            ))
          ) : (
            <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
               <ClipboardList size={64} />
               <p className="font-black text-[10px] uppercase tracking-[5px]">No Records Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}