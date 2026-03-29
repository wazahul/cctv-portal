"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/components/AuthGuard"; 
import RequestManagerModal, { RequestNotification } from "../request/RequestManagerModal";

import { 
  Search, Rocket, Pencil, MapPin, Plus, 
  Loader2, LogOut, ClipboardList, 
  History as HistoryIcon, ShieldCheck, User as UserIcon, ExternalLink, CalendarClock, BellRing
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

  // ✅ PENDING REQUESTS STATES
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isReqManagerOpen, setIsReqManagerOpen] = useState(false);
  const [filterSn, setFilterSn] = useState<string | null>(null); // For direct bell click

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserRole(session.user.user_metadata?.role || "user");
        fetchData(); 
      }
    };
    initialize();

    // ✅ REALTIME SUBSCRIPTION: Nayi request aate hi Dashboard update hoga
    const channel = supabase
      .channel('realtime-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("🚪 System Logout?\n\nAre you sure?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // ✅ FETCH DEVICES & PENDING REQUESTS SIMULTANEOUSLY
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Devices with nested Service Logs
    const { data: deviceData } = await supabase
      .from("devices")
      .select(`*, service_logs (next_service_date)`)
      .order("site_name", { ascending: true });

    // 2. Fetch only PENDING Requests
    const { data: reqData } = await supabase
      .from("requests")
      .select("*")
      .eq("status", "pending");

    if (deviceData) {
      const processed = deviceData.map((device: any) => {
        const logs = device.service_logs || [];
        const validLogs = logs
          .filter((l: any) => l.next_service_date)
          .sort((a: any, b: any) => new Date(b.next_service_date).getTime() - new Date(a.next_service_date).getTime());
        
        return { 
          ...device, 
          next_service_date: validLogs.length > 0 ? validLogs[0].next_service_date : null 
        };
      });
      setDevices(processed);
    }
    
    if (reqData) setPendingRequests(reqData);
    setLoading(false);
  };

  const getServiceStatusStyles = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const serviceDate = new Date(dateString);
    serviceDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "bg-red-500 text-white border-red-600 animate-pulse";
    if (diffDays === 0) return "bg-orange-500 text-white border-orange-600 animate-bounce";
    if (diffDays <= 7) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const filtered = useMemo(() => devices.filter(d => 
    [d.site_name, d.device_sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
  ), [search, devices]);

  const stats = useMemo(() => ({
    totalSites: devices.length,
    activeTypes: new Set(devices.map(d => d.category || 'DVR')).size,
  }), [devices]);

  const isSuperAdmin = userRole === "super_admin";

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}> 
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 pb-24 text-left">
        
        {/* HEADER */}
        <div className="sticky top-0 z-50 bg-[#f8fafc]/90 backdrop-blur-xl border-b border-slate-200/50 pb-6 pt-5 px-4">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 italic">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100 transition-transform active:scale-95">
                  <Rocket className="text-white" size={22} />
                </div>
                <div>
                   <h1 className="text-xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Admin Central</h1>
                   <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isSuperAdmin ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                     {isSuperAdmin ? <ShieldCheck size={10} /> : <UserIcon size={10} />}
                     {userRole}
                   </div>
                </div>
              </div>

              <div className="flex gap-2">
                {/* 🔔 MAIN BELL: Shows ALL pending requests */}
                <button 
                  onClick={() => { setFilterSn(null); setIsReqManagerOpen(true); }}
                  className="relative p-4 bg-white border border-slate-200 text-red-500 rounded-2xl shadow-lg active:scale-90 transition-all"
                >
                  <BellRing size={20} />
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>

                <button onClick={handleLogout} className="p-4 bg-white border border-red-50 text-red-500 rounded-2xl shadow-lg active:scale-90">
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
              <input 
                type="text" 
                placeholder="Search site, SN or IP..." 
                className="w-full p-5 pl-16 rounded-[30px] border-2 border-slate-100 bg-white outline-none font-bold text-slate-700 shadow-sm focus:border-blue-400 text-sm" 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-8">
          {/* STATS */}
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

          {/* DEVICE LIST */}
          <div className="space-y-7">
            {loading ? (
              <div className="flex flex-col items-center py-24"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : filtered.map((device) => (
              <div key={device.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden pt-14 group transition-all hover:shadow-2xl">
                
                {/* 🔔 INDIVIDUAL CARD BELL: Click par sirf isi site ki request dikhegi */}
                <RequestNotification 
                  deviceSn={device.device_sn} 
                  pendingRequests={pendingRequests} 
                  onClick={() => {
                    setFilterSn(device.device_sn); 
                    setIsReqManagerOpen(true);
                  }} 
                />

                <span className="absolute right-8 top-8 bg-blue-50/50 text-blue-600 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest">{device.category || 'DVR'}</span>
                
                <div className="space-y-4 mb-8">
                  <div onClick={() => window.open(`/request/${device.device_sn}`, '_blank')} className="cursor-pointer group/link inline-flex items-center gap-2">
                    <h3 className="text-[24px] font-[1000] text-slate-800 leading-none uppercase italic tracking-tighter group-hover/link:text-blue-600 transition-colors">
                      {device.site_name}
                    </h3>
                    <ExternalLink size={16} className="text-slate-300 group-hover/link:text-blue-400 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white px-3.5 py-1.5 rounded-xl border-2 border-slate-100 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                        SN: {device.device_sn}
                      </div>
                      <button onClick={() => {/* Map logic */}} className="p-2.5 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-90 transition-all hover:bg-red-500 hover:text-white">
                        <MapPin size={18} />
                      </button>
                    </div>

                    {device.next_service_date && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${getServiceStatusStyles(device.next_service_date)}`}>
                        <CalendarClock size={14} />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase opacity-80 leading-none">Next Service</span>
                          <span className="text-[11px] font-bold">{new Date(device.next_service_date).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-6 border-t border-slate-50">
                  <button onClick={() => { setSelectedDevice(device); setIsHistoryOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-blue-600 transition-all">
                    <div className="p-3 bg-slate-50 rounded-[20px] group-hover:bg-blue-50 transition-colors"><HistoryIcon size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">History</span>
                  </button>
                  {isSuperAdmin && (
                    <>
                      <button onClick={() => router.push('/add-device')} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-emerald-600 transition-all">
                        <div className="p-3 bg-slate-50 rounded-[20px] group-hover:bg-emerald-50 transition-colors"><Plus size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Add</span>
                      </button>
                      <button onClick={() => { setSelectedDevice(device); setIsModalOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-orange-500 transition-all">
                        <div className="p-3 bg-slate-50 rounded-[20px] group-hover:bg-orange-50 transition-colors"><Pencil size={20} /></div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => router.push(`/service/${device.device_sn}`)} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-indigo-600 transition-all">
                    <div className="p-3 bg-slate-50 rounded-[20px] group-hover:bg-indigo-50 transition-colors"><ClipboardList size={20} /></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODALS */}
        {selectedDevice && (
          <>
            <EditModal isOpen={isModalOpen} device={selectedDevice} setDevice={setSelectedDevice} onClose={() => setIsModalOpen(false)} onUpdate={fetchData} isSaving={isSaving} />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} sn={selectedDevice?.device_sn} siteName={selectedDevice?.site_name} />
          </>
        )}
        
        {/* REQUEST MANAGER: Modal handles filtering by filterSn */}
        <RequestManagerModal 
          isOpen={isReqManagerOpen} 
          onClose={() => { setIsReqManagerOpen(false); setFilterSn(null); }} 
          onRefresh={fetchData} 
          filterSn={filterSn} 
        />

      </div>
    </AuthGuard>
  );
}