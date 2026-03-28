
"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Rocket, Pencil, MapPin, Plus, 
  Loader2, Globe, AlertTriangle, LogOut, 
  ClipboardList, Menu, X, History as HistoryIcon
} from "lucide-react";
import EditModal from "./EditModal";
import HistoryModal from "./HistoryModal";

export default function AdminCentral() {
  const router = useRouter();
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("devices")
      .select(`*, service_logs (next_service_date)`)
      .order("site_name", { ascending: true });

    if (error) {
      console.error("Fetch Error:", error.message);
    } else if (data) {
      const processed = data.map((device: any) => {
        const logs = device.service_logs || [];
        const latestDate = logs.length > 0 
          ? logs.sort((a: any, b: any) => 
              new Date(b.next_service_date).getTime() - new Date(a.next_service_date).getTime()
            )[0].next_service_date 
          : null;
        return { ...device, next_service_date: latestDate };
      });
      setDevices(processed);
    }
    setLoading(false);
  };

  // 📊 --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalSites = devices.length;
    const activeTypes = new Set(devices.map(d => d.category || 'DVR')).size;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();
    return { totalSites, activeTypes, today };
  }, [devices]);

  const filtered = useMemo(() => {
    return devices.filter(d => 
      [d.site_name, d.sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, devices]);

  const handleUpdate = async () => {
    if (!selectedDevice?.id) return;
    setIsSaving(true);
    const { error } = await supabase.from("devices").update({
      ...selectedDevice,
      latitude: parseFloat(selectedDevice.latitude),
      longitude: parseFloat(selectedDevice.longitude)
    }).eq("id", selectedDevice.id);

    if (error) alert("❌ Error: " + error.message);
    else {
      alert("✅ Updated Successfully!");
      fetchDevices();
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  const trackOnMap = (device: any) => {
    const lat = parseFloat(device.latitude);
    const lng = parseFloat(device.longitude);
    if (!lat || !lng || lat === 0) { alert("GPS coordinates miss hain!"); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 pb-24 text-left">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-50 bg-[#f8fafc]/90 backdrop-blur-xl border-b border-slate-200/50 pb-6 pt-5 px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex justify-between items-center text-left">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100 group-active:scale-90 transition-all">
                <Rocket className="text-white" size={22} strokeWidth={3} />
              </div>
              <h1 className="text-xl font-[1000] text-slate-900 tracking-tighter italic uppercase">Admin Central</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Date Badge */}
              <div className="hidden sm:block bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-100">
                {stats.today}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-4 rounded-2xl shadow-xl transition-all active:scale-90 ${isMenuOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-[30px] shadow-2xl border border-slate-50 p-2 z-[60]">
                    <button onClick={() => router.push('/add-device')} className="w-full flex items-center gap-3 p-4 hover:bg-emerald-50 text-emerald-700 rounded-[22px] transition-all font-bold text-sm">
                      <Plus size={18} strokeWidth={3} /> Add New Device
                    </button>
                    <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 text-red-600 rounded-[22px] transition-all font-bold text-sm">
                      <LogOut size={18} /> Logout System
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} strokeWidth={3.5} />
            <input 
              type="text" 
              placeholder="Search site, SN, or IP..." 
              className="w-full p-5 pl-16 rounded-[30px] border-2 border-slate-100 bg-white outline-none font-bold text-slate-700 shadow-sm focus:border-blue-400 focus:ring-4 ring-blue-50 transition-all text-sm" 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        {/* 📊 --- STATS CARDS SECTION --- */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transition-all group-hover:h-2"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sites</p>
            <h2 className="text-4xl font-[1000] text-slate-800 tracking-tighter italic">{stats.totalSites}</h2>
          </div>
          <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 transition-all group-hover:h-2"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Types</p>
            <h2 className="text-4xl font-[1000] text-slate-800 tracking-tighter italic">{stats.activeTypes}</h2>
          </div>
        </div>

        {/* --- DEVICE LIST --- */}
        <div className="space-y-7">
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4 text-center">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="font-black text-slate-400 text-[10px] uppercase tracking-[5px]">Updating Inventory...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((device) => {
              const nextDateStr = device.next_service_date;
              const today = new Date(); today.setHours(0,0,0,0);
              const nextDate = nextDateStr ? new Date(nextDateStr) : null;
              if(nextDate) nextDate.setHours(0,0,0,0);
              const diffDays = nextDate ? Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

              let alertStyle = "bg-slate-200 text-slate-500";
              let statusText = nextDateStr ? nextDate?.toLocaleDateString('en-IN', {day:'2-digit', month:'short'}).toUpperCase() : "";

              if (diffDays !== null) {
                if (diffDays < 0) { alertStyle = "bg-[#ff3b30] text-white animate-pulse shadow-lg"; statusText = `⚠️ LATE ${Math.abs(diffDays)}D`; }
                else if (diffDays === 0) { alertStyle = "bg-[#ff9500] text-white animate-bounce shadow-md"; statusText = "🚨 TODAY"; }
                else if (diffDays <= 3) { alertStyle = "bg-[#ffcc00] text-black font-black"; statusText = `📅 ${statusText}`; }
                else { alertStyle = "bg-[#34c759] text-white"; statusText = `📅 ${statusText}`; }
              }

              return (
                <div key={device.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden transition-all hover:shadow-2xl pt-14 text-left">
                  {nextDateStr && <div className={`absolute left-0 top-0 px-6 py-2.5 rounded-br-[25px] text-[10px] font-[1000] tracking-widest z-10 shadow-sm ${alertStyle}`}>{statusText}</div>}
                  <span className="absolute right-8 top-8 bg-blue-50/50 text-blue-600 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100/30">{device.category || 'DVR'}</span>
                  <div className="space-y-4 mb-8">
                    <h3 className="text-[24px] font-[1000] text-slate-800 leading-none uppercase italic tracking-tighter">{device.site_name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">SN: {device.sn}</div>
                      {parseFloat(device.latitude) ? (
                        <button onClick={() => trackOnMap(device)} className="p-2.5 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-90 shadow-sm transition-all"><MapPin size={18} fill="currentColor" fillOpacity={0.2} /></button>
                      ) : (
                        <div className="p-2.5 bg-slate-50 text-slate-300 rounded-2xl border border-slate-100"><AlertTriangle size={18} /></div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1 pt-6 border-t border-slate-50">
                    <button onClick={() => { setSelectedDevice(device); setIsHistoryOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 rounded-3xl transition-all active:scale-90 text-slate-400 hover:text-blue-600">
                      <div className="p-3 bg-slate-50 rounded-[20px]"><HistoryIcon size={20} /></div>
                      <span className="text-[9px] font-[1000] uppercase tracking-widest">History</span>
                    </button>
                    <button onClick={() => router.push(`/engineer/${device.sn}`)} className="flex-1 flex flex-col items-center gap-2 p-2 rounded-3xl transition-all active:scale-90 text-slate-400 hover:text-emerald-600">
                      <div className="p-3 bg-slate-50 rounded-[20px]"><ClipboardList size={20} /></div>
                      <span className="text-[9px] font-[1000] uppercase tracking-widest">Report</span>
                    </button>
                    <button onClick={() => { setSelectedDevice(device); setIsModalOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 rounded-3xl transition-all active:scale-90 text-slate-400 hover:text-orange-500">
                      <div className="p-3 bg-slate-50 rounded-[20px]"><Pencil size={20} /></div>
                      <span className="text-[9px] font-[1000] uppercase tracking-widest">Edit</span>
                    </button>
                    <button onClick={() => window.open(`/request/${device.sn}`, '_blank')} className="flex-1 flex flex-col items-center gap-2 p-2 rounded-3xl transition-all active:scale-90 text-slate-400 hover:text-indigo-600">
                      <div className="p-3 bg-slate-50 rounded-[20px]"><Globe size={20} /></div>
                      <span className="text-[9px] font-[1000] uppercase tracking-widest">Portal</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest opacity-40 italic">No Site Found</div>
          )}
        </div>
      </div>

      <EditModal isOpen={isModalOpen} device={selectedDevice} setDevice={setSelectedDevice} onClose={() => setIsModalOpen(false)} onUpdate={handleUpdate} isSaving={isSaving} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={selectedDevice?.sn} siteName={selectedDevice?.site_name} />
    </div>
  );
}
