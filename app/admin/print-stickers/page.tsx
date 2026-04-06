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
      
      <div className="a4-container mx-auto">
        {items.length > 0 ? items.map((device, index) => (
          <div key={index} className="sticker-slot">
            
            <div 
              className="sticker-card bg-white border-[3pt] border-[#1a4a8d] rounded-[40px] overflow-hidden relative flex flex-col h-full w-full shadow-2xl print:shadow-none print:border-[#1a4a8d]"
              /* 🚩 CRITICAL: Force background color and graphics for this card */
              style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              
              {/* Header: Added explicit style for print engine */}
              <div 
                className="bg-[#1a4a8d] p-5 flex justify-between items-center text-white shrink-0"
                style={{ backgroundColor: '#1a4a8d', WebkitPrintColorAdjust: 'exact' }}
              >
                <div className="leading-none text-left">
                  <h1 className="text-[16pt] font-[1000] uppercase italic tracking-tighter">Security System</h1>
                  <h2 className="text-[8pt] font-black uppercase tracking-[2px] mt-1 opacity-90">Maintenance</h2>
                </div>
                <Camera size={28} className="text-white mr-5" />
              </div>

              {/* Body: Force background pattern for print */}
              <div 
                className="p-4 flex flex-col items-center justify-between flex-1 overflow-hidden"
                style={{ 
                  backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
                  backgroundSize: '20px 20px',
                  WebkitPrintColorAdjust: 'exact'
                }}
              >
                
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative p-2.5 bg-white border-2 border-blue-200 rounded-[16px]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(company.portalUrl + '/' + device?.device_sn)}`} 
                      className="w-[120pt] h-[120pt] block" 
                      alt="QR"
                    />
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[5px] border-l-[5px] border-[#1a4a8d] rounded-tl-2xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[5px] border-r-[5px] border-[#1a4a8d] rounded-br-2xl"></div>
                  </div>
                  <p className="text-[6.5pt] font-black text-slate-400 uppercase tracking-[3px] mt-1 italic">Scan to View Logs & Reports</p>
                </div>

                <div className="w-full space-y-4 px-2 shrink-0 text-left">
                  <div>
                    <label className="text-[7.5pt] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none"> Site Location </label>
                    <div className="w-full border-b-[2pt] border-gray-400 pb-0.5">
                       <span className="text-[12pt] font-[1000] text-[#1a4a8d] uppercase italic truncate block px-1 leading-none">
                         {device?.site_name || "---"}
                       </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-b-[2pt] border-gray-400 pb-5">
                      <label className="text-[7.5pt] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">Service Date</label>
                    </div>
                    <div className="border-b-[2pt] border-gray-400 pb-5">
                      <label className="text-[7.5pt] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">Technician Sign.</label>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-1 border-t-2 border-dashed border-gray-200 flex flex-col items-center shrink-0">
                  <h3 className="text-[12pt] mt-5 font-[1000] text-[#1a4a8d] uppercase italic tracking-[3px] leading-none">
                    {company.name}
                  </h3>
                  <p className="text-slate-500 text-[8pt] font-black mt-3 leading-none pb-2">
                     Support: {company.contact}
                  </p>
                </div>
              </div>
            </div>

            {(index + 1) % 4 === 0 && <div className="page-break" />}
          </div>
        )) : null}
      </div>

      <button onClick={() => window.print()} className="fixed bottom-10 right-10 bg-blue-600 text-white px-12 py-6 rounded-full font-[1000] shadow-2xl hover:bg-blue-500 active:scale-95 transition-all uppercase tracking-[4px] italic border-b-[6px] border-blue-900 print:hidden z-[999] flex items-center gap-3">
        <Printer size={24} /> Initialize Print
      </button>

      <style jsx global>{`
        * { box-sizing: border-box !important; }

        /* Screen View */
        .a4-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          width: 210mm;
          margin: 0 auto;
        }

        .sticker-slot {
          height: 148.5mm;
          width: 105mm;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10mm;
        }

        @media print {
          @page { size: A4 portrait; margin: 0 !important; }
          
          /* 🚩 Global Print Fix for all Browsers */
          * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            color-adjust: exact !important;
          }

          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          
          .a4-container {
            display: grid !important;
            grid-template-columns: 105mm 105mm !important;
            grid-auto-rows: 143mm !important; /* Mobile safe height */
            gap: 0 !important;
            width: 210mm !important;
          }

          .sticker-slot {
            width: 105mm !important;
            height: 143mm !important;
            padding: 8mm !important; 
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
          }

          .page-break {
            display: block;
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
}