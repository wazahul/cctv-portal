"use client";
// aap/lib/components/StickerModal.tsx - 
import { useState } from "react";
import { X, Printer, CheckSquare, Square, QrCode } from "lucide-react";

export default function StickerModal({ isOpen, onClose, devices }: { isOpen: boolean; onClose: () => void; devices: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleGenerate = () => {
    const selectedData = devices.filter(d => selectedIds.includes(d.device_sn));
    localStorage.setItem("print_stickers", JSON.stringify(selectedData));
    window.open("/admin/print-stickers", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-[50px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="p-8 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><QrCode size={20} className="text-white" /></div>
            <div>
              <h2 className="text-xl font-[1000] uppercase italic text-slate-900 leading-none">Sticker Terminal</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select Sites to Print</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        {/* 🔘 SELECT ALL BUTTON ADDED */}
       <div className="px-8 pb-4 flex justify-end">
      <button 
      onClick={() => {
      if (selectedIds.length === devices.length) setSelectedIds([]);
      else setSelectedIds(devices.map(d => d.device_sn));
      }}
      className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full border border-blue-100 active:scale-95 transition-all"
     >
    {selectedIds.length === devices.length ? "Deselect All" : "Select All Sites"}
     </button>
    </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {devices.map((device) => (
            <div key={device.device_sn} onClick={() => toggleSelect(device.device_sn)}
              className={`flex items-center gap-4 p-5 rounded-[30px] border-2 transition-all cursor-pointer ${selectedIds.includes(device.device_sn) ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white"}`}>
              <div className={`p-1.5 rounded-lg border-2 ${selectedIds.includes(device.device_sn) ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                 {selectedIds.includes(device.device_sn) ? <CheckSquare size={16} className="text-white" /> : <Square size={16} className="text-transparent" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-sm uppercase text-slate-800 italic">{device.site_name}</p>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mt-1">SN: {device.device_sn}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-slate-50">
  <button 
    disabled={selectedIds.length === 0} 
    onClick={handleGenerate}
    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[1000] py-4 rounded-[35px] shadow-xl active:scale-95 disabled:opacity-30 uppercase tracking-[3px] italic border-b-[6px] border-blue-900 transition-all flex items-center justify-center gap-4"
  >
    <Printer size={22} strokeWidth={3} />
    <span>Generate {selectedIds.length} Stickers</span>
  </button>
</div>
      </div>
    </div>
  );
}