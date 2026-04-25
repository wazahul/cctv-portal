"use client";
// aap/lib/components/StickerModal.tsx
import { useState, useMemo } from "react";
import { X, Printer, CheckSquare, Square, QrCode, Search, FilterX, Globe } from "lucide-react";

export default function StickerModal({ isOpen, onClose, devices }: { isOpen: boolean; onClose: () => void; devices: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); 

  // 🔍 MULTI-SEARCH LOGIC (No logic change)
  const filteredDevices = useMemo(() => {
    const keywords = searchQuery.toLowerCase().split(/[\s,]+/).filter(k => k.length > 0);
    if (keywords.length === 0) return devices;
    return devices.filter(d => {
      const siteInfo = `${d.site_name} ${d.device_sn} ${d.ip_address}`.toLowerCase();
      return keywords.some(key => siteInfo.includes(key));
    });
  }, [devices, searchQuery]);

  // 🔘 OLD LOGIC: Selection/Toggle (No change)
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // 🔘 SMART SELECT ALL (No logic change)
  const handleSelectAll = () => {
    const allFilteredIds = filteredDevices.map(d => d.device_sn);
    const areAllFilteredSelected = allFilteredIds.every(id => selectedIds.includes(id));
    if (areAllFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // 🚀 OLD LOGIC: Data saving (No change)
  const handleGenerate = () => {
    const selectedData = devices.filter(d => selectedIds.includes(d.device_sn));
    localStorage.setItem("print_stickers", JSON.stringify(selectedData));
    window.open("/admin/print-stickers", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[50px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
        
        {/* --- FIXED HEADER --- */}
        <div className="p-7 pb-1 bg-slate-50 flex justify-between items-center shrink-0 border-b border-slate-100 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100"><QrCode size={18} className="text-white" /></div>
            <div>
              <h2 className="text-xl font-[1000] uppercase italic text-slate-900 leading-none">Sticker Terminal</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select Sites to Print</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 active:scale-90 transition-all shadow-sm"><X size={18} strokeWidth={3} /></button>
        </div>

        {/* --- SCROLLABLE CONTAINER --- */}
        <div className="flex-1 overflow-y-auto custom-scroll bg-[#fcfdfe] relative">
          
          {/* 🔍 SEARCH INPUT AREA (Scrolls away) */}
          <div className="px-7 pt-1 pb-3 bg-white">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input 
                type="text"
                autoComplete="off"
                placeholder="Search: site, sn, ip..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-slate-50 rounded-[22px] outline-none font-bold text-slate-700 shadow-inner focus:border-blue-500 focus:bg-white transition-all text-sm" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full transition-all"
                >
                  <X size={14} strokeWidth={4} />
                </button>
              )}
            </div>
          </div>

          {/* 🚩 STICKY SELECTION BAR (Stays on top during scroll) */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 pt-0 z-20 py-4 z-20 flex justify-between items-center shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Selected: <span className="text-blue-600 font-[1000] italic">{selectedIds.length}</span>
            </p>
            <button 
              onClick={handleSelectAll}
              className="text-[9px] font-[1000] text-blue-600 uppercase tracking-[1px] bg-blue-50 px-4 py-2 rounded-full border border-blue-100 active:scale-95 transition-all shadow-sm"
            >
              {filteredDevices.length > 0 && filteredDevices.every(d => selectedIds.includes(d.device_sn)) 
                ? "Deselect Result" 
                : `Select Result (${filteredDevices.length})`}
            </button>
          </div>

          {/* LIST BODY */}
          <div className="p-6 space-y-3">
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <div key={device.device_sn} onClick={() => toggleSelect(device.device_sn)}
                  className={`flex items-center gap-4 p-5 rounded-[30px] border-2 transition-all cursor-pointer group active:scale-[0.97] ${selectedIds.includes(device.device_sn) ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                  
                  <div className={`p-1.5 rounded-xl border-2 transition-all ${selectedIds.includes(device.device_sn) ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                     {selectedIds.includes(device.device_sn) ? <CheckSquare size={16} className="text-white" /> : <Square size={16} className="text-transparent" />}
                  </div>

                  <div className="flex-1">
                    <p className="font-[1000] text-sm uppercase text-slate-800 italic tracking-tight">{device.site_name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">SN: {device.device_sn}</span>
                      {device.ip_address && (
                        <div className="flex items-center gap-1 text-[9px] font-black text-blue-400">
                          <Globe size={10} /> {device.ip_address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                <FilterX size={40} className="text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-[4px]">No sites match search</p>
              </div>
            )}
          </div>
        </div>

        {/* --- FIXED FOOTER ACTION --- */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 z-30">
          <button 
            disabled={selectedIds.length === 0} 
            onClick={handleGenerate}
            className="w-full bg-[#1a4a8d] hover:bg-blue-700 text-white font-[1000] py-5 rounded-[35px] shadow-xl active:scale-95 disabled:opacity-30 uppercase tracking-[3px] italic border-b-[6px] border-[#0a2e5c] transition-all flex items-center justify-center gap-4"
          >
            <Printer size={22} strokeWidth={3} />
            <span>Generate {selectedIds.length} Stickers</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}