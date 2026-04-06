"use client";
import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/config";
import { Printer, Camera } from "lucide-react";

export default function PrintStickersPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("print_stickers");
    if (data) {
      try { setItems(JSON.parse(data)); } catch (err) { console.error(err); }
    }
  }, []);

  const company = COMPANY;

  return (
    <div className="bg-slate-900 min-h-screen font-sans print:bg-white overflow-x-hidden">
      
      {/* 🚩 THE MASTER GRID: Strict 2x2 Logic for both Viewport & Print */}
      <div className="a4-container">
        {items.length > 0 ? items.map((device, index) => (
          <div key={index} className="sticker-slot">
            
            {/* --- 🛡️ THE PREMIUM CARD --- */}
            <div 
              className="sticker-card bg-white border-[3.5pt] border-[#1a4a8d] rounded-[45px] overflow-hidden relative flex flex-col h-full w-full shadow-2xl print:shadow-none"
              style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              
              {/* 1. Header: Solid Royal Blue */}
              <div 
                className="bg-[#1a4a8d] p-5 flex justify-between items-center text-white shrink-0"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                <div className="leading-none text-left">
                  <h1 className="text-[17pt] font-[1000] uppercase italic tracking-tighter leading-none">Security System</h1>
                  <h2 className="text-[9pt] font-black uppercase tracking-[3px] mt-1.5 opacity-90 italic leading-none">Maintenance</h2>
                </div>
                <div className="bg-white/10 border border-white/20 p-2 rounded-2xl shrink-0">
                  <Camera size={24} strokeWidth={2.5} className="text-white" />
                </div>
              </div>

              {/* 2. Body: Dot Matrix Pattern */}
              <div 
                className="p-6 flex flex-col items-center justify-between flex-1 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] overflow-hidden"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                
                {/* QR Section */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative p-3 bg-white border-2 border-slate-100 rounded-[35px] shadow-inner">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(company.portalUrl + '/' + device?.device_sn)}`} 
                      className="w-[100pt] h-[100pt] block" 
                      alt="QR"
                    />
                    {/* Industrial Corners */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[5px] border-l-[5px] border-[#1a4a8d] rounded-tl-2xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[5px] border-r-[5px] border-[#1a4a8d] rounded-br-2xl"></div>
                  </div>
                  <p className="text-[7pt] font-black text-slate-400 uppercase tracking-[4px] italic mt-2.5">Authorized Link</p>
                </div>

                {/* Info Matrix: Compact lines */}
                <div className="w-full space-y-5 px-3 shrink-0 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8.5pt] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">Asset Location</label>
                    <div className="w-full border-b-[2pt] border-slate-300 pb-1">
                       <span className="text-[13pt] font-[1000] text-[#1a4a8d] uppercase italic truncate block px-1 leading-none">
                         {device?.site_name || "---"}
                       </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8.5pt] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">Service Date</label>
                      <div className="w-full border-b-[2pt] border-slate-300 pb-5"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8.5pt] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">Technician</label>
                      <div className="w-full border-b-[2pt] border-slate-300 pb-5"></div>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="w-full mt-2 pt-4 border-t-2 border-dashed border-slate-200 flex flex-col items-center shrink-0">
                  <h3 className="text-[14pt] font-[1000] text-[#1a4a8d] uppercase italic tracking-[4px] leading-none">
                    {company.name}
                  </h3>
                  <p className="text-slate-500 text-[9pt] font-black uppercase tracking-[2px] mt-2 leading-none">
                    Support: {company.contact}
                  </p>
                </div>

              </div>
            </div>

            {/* PAGE BREAK (Every 4th) */}
            {(index + 1) % 4 === 0 && <div className="page-break" />}
          </div>
        )) : (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617]">
             <div className="animate-pulse text-slate-800 font-black uppercase tracking-[15px] text-2xl italic">System Standby</div>
          </div>
        )}
      </div>

      <button onClick={() => window.print()} className="fixed bottom-10 right-10 bg-blue-600 text-white px-12 py-6 rounded-full font-[1000] shadow-2xl hover:bg-blue-500 active:scale-95 transition-all uppercase tracking-[4px] italic border-b-[6px] border-blue-900 print:hidden z-[999] flex items-center gap-3">
        <Printer size={24} strokeWidth={3} />
        Initialize Print
      </button>

      <style jsx global>{`
        /* 🚩 VIEWPORT & PRINT UNIFIED BOX MODEL */
        * { box-sizing: border-box !important; }

        .a4-container {
          display: grid;
          grid-template-columns: 105mm 105mm; /* Locked to A4 width */
          grid-auto-rows: 148.5mm;           /* Locked to A4 height / 2 */
          width: 210mm;
          margin: 0 auto;
          background: #0f172a;
        }

        .sticker-slot {
          width: 105mm;
          height: 148.5mm;
          padding: 12mm; /* Breathing room */
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f172a;
        }

        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0 !important; 
          }
          
          /* 🚩 FORCE BACKGROUNDS */
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          
          .a4-container {
            display: grid !important;
            grid-template-columns: 105mm 105mm !important;
            grid-auto-rows: 148.5mm !important;
            width: 210mm !important;
            height: 297mm !important;
            gap: 0 !important;
            background: white !important;
          }

          .sticker-slot {
            background: white !important;
            padding: 10mm !important; 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 0.1pt solid #f1f5f9 !important; /* Visual guide for cutting */
          }

          .page-break {
            display: block;
            page-break-after: always;
            break-after: page;
          }
        }

        /* Responsive scaling for small screens so it doesn't break the layout */
        @media (max-width: 210mm) {
          .a4-container {
            transform: scale(calc(100vw / 210mm));
            transform-origin: top left;
          }
        }
      `}</style>
    </div>
  );
}