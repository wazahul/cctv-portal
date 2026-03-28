"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/components/AuthGuard"; 

import { 
  Search, Rocket, Pencil, MapPin, Plus, 
  Loader2, LogOut, ClipboardList, 
  History as HistoryIcon, ShieldCheck, User as UserIcon, ExternalLink
} from "lucide-react";
import EditModal from "./EditModal";
import HistoryModal from "./HistoryModal";

export default function AdminCentral() {
  const router = useRouter();
  
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserRole(session.user.user_metadata?.role || "user");
        fetchDevices();
      }
    };
    initialize();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("🚪 System Logout?\n\nKya aap pakka logout karna chahte hain?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const fetchDevices = async () => {
    setLoading(true);
    // ✅ Select all updated columns
    const { data, error } = await supabase
      .from("devices")
      .select(`*, service_logs (next_service_date)`)
      .order("site_name", { ascending: true });

    if (!error && data) {
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

  // ✅ Search Updated: Ab 'sn' ki jagah 'device_sn' filter karega
  const filtered = useMemo(() => devices.filter(d => 
    [d.site_name, d.device_sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
  ), [search, devices]);

  const stats = useMemo(() => ({
    totalSites: devices.length,
    activeTypes: new Set(devices.map(d => d.category || 'DVR')).size,
  }), [devices]);

  const trackOnMap = (device: any) => {
    const lat = device.latitude;
    const lng = device.longitude;

    if (!lat || lat === "0" || lat === 0 || !lng || lng === "0" || lng === 0) { 
      alert("⚠️ SITE LOCATION MISSING\n\nDatabase mein is site ke coordinates 0.0 hain. Pehle 'Edit' karke sahi location save karein."); 
      return; 
    }

    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${lat},${lng}&travelmode=driving`;
    window.open(mapUrl, '_blank');
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}> 
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 pb-24 text-left">
        
        <div className="sticky top-0 z-50 bg-[#f8fafc]/90 backdrop-blur-xl border-b border-slate-200/50 pb-6 pt-5 px-4">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 italic">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100 transition-transform active:scale-95">
                  <Rocket className="text-white" size={22} />
                </div>
                <div>
                   <h1 className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Admin Central</h1>
                   <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${isSuperAdmin ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                     {isSuperAdmin ? <ShieldCheck size={10} /> : <UserIcon size={10} />}
                     {userRole}
                   </div>
                </div>
              </div>
              
              <button onClick={handleLogout} className="p-4 bg-white border border-red-50 text-red-500 rounded-2xl shadow-lg active:scale-90 transition-all hover:bg-red-50">
                <LogOut size={20} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
              <input 
                type="text" 
                placeholder="Search site or SN..." 
                className="w-full p-5 pl-16 rounded-[30px] border-2 border-slate-100 bg-white outline-none font-bold text-slate-700 shadow-sm focus:border-blue-400 transition-all text-sm" 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sites</p>
              <h2 className="text-4xl font-[1000] text-slate-800 tracking-tighter italic">{stats.totalSites}</h2>
            </div>
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Types</p>
              <h2 className="text-4xl font-[1000] text-slate-800 tracking-tighter italic">{stats.activeTypes}</h2>
            </div>
          </div>

          <div className="space-y-7">
            {loading ? (
              <div className="flex flex-col items-center py-24"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : filtered.map((device) => (
              <div key={device.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden pt-14 group transition-all hover:shadow-2xl">
                
                <span className="absolute right-8 top-8 bg-blue-50/50 text-blue-600 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100/30">{device.category || 'DVR'}</span>
                
                <div className="space-y-4 mb-8">
                  {/* ✅ Link Updated: 'sn' -> 'device_sn' */}
                  <div 
                    onClick={() => window.open(`/request/${device.device_sn}`, '_blank')}
                    className="cursor-pointer group/link inline-flex items-center gap-2"
                  >
                    <h3 className="text-[24px] font-[1000] text-slate-800 leading-none uppercase italic tracking-tighter group-hover/link:text-blue-600 transition-colors">
                      {device.site_name}
                    </h3>
                    <ExternalLink size={16} className="text-slate-300 group-hover/link:text-blue-400 transition-colors" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white px-3.5 py-1.5 rounded-xl border-2 border-slate-100 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                      SN: {device.device_sn}
                    </div>
                    <button onClick={() => trackOnMap(device)} className="p-2.5 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-90 transition-all hover:bg-red-500 hover:text-white">
                      <MapPin size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-6 border-t border-slate-50">
                  <button onClick={() => { setSelectedDevice(device); setIsHistoryOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-blue-600 transition-all">
                    <div className="p-3 bg-slate-50 rounded-[20px]"><HistoryIcon size={20} /></div>
                    <span className="text-[9px] font-[1000] uppercase tracking-widest">History</span>
                  </button>

                  {isSuperAdmin && (
                    <>
                      <button onClick={() => router.push('/add-device')} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-emerald-600 transition-all">
                        <div className="p-3 bg-slate-50 rounded-[20px]"><Plus size={20} strokeWidth={3} /></div>
                        <span className="text-[9px] font-[1000] uppercase tracking-widest">Add New</span>
                      </button>
                      <button onClick={() => { setSelectedDevice(device); setIsModalOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-orange-500 transition-all">
                        <div className="p-3 bg-slate-50 rounded-[20px]"><Pencil size={20} /></div>
                        <span className="text-[9px] font-[1000] uppercase tracking-widest">Edit</span>
                      </button>
                    </>
                  )}

                  {/* ✅ Link Updated: 'sn' -> 'device_sn' */}
                  <button onClick={() => router.push(`/service/${device.device_sn}`)} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-indigo-600 transition-all">
                    <div className="p-3 bg-slate-50 rounded-[20px]"><ClipboardList size={20} /></div>
                    <span className="text-[9px] font-[1000] uppercase tracking-widest">Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <EditModal isOpen={isModalOpen} device={selectedDevice} setDevice={setSelectedDevice} onClose={() => setIsModalOpen(false)} onUpdate={fetchDevices} isSaving={isSaving} />
        {/* ✅ History Prop Updated: 'sn' -> 'device_sn' */}
        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={selectedDevice?.device_sn} siteName={selectedDevice?.site_name} />
      </div>
    </AuthGuard>
  );
}