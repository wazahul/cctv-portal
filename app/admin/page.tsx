"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/lib/components/AuthGuard"; 
import RequestManagerModal, { RequestNotification } from "../request/RequestManagerModal";

import { 
  Search, Rocket, Pencil, MapPin, Plus, X,
  Loader2, LogOut, ClipboardList, 
  History as HistoryIcon, ShieldCheck, User as UserIcon, ExternalLink, CalendarClock, BellRing
} from "lucide-react";
import EditModal from "./EditModal";
import HistoryModal from "./HistoryModal";
import MasterDialog from "@/lib/components/MasterDialog"; // 🚩 Path correctly updated as per your lib folder

export default function AdminCentral() {
  const router = useRouter();
  
  // --- STATES ---
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  const [userRole, setUserRole] = useState("user"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  // --- MASTER DIALOG STATE ---
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "danger" | "success" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  // Request Management States
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isReqManagerOpen, setIsReqManagerOpen] = useState(false);
  const [filterSn, setFilterSn] = useState<string | null>(null);

  // --- INITIALIZE & REALTIME ---
  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserRole(session.user.user_metadata?.role || "user");
        fetchData(); 
      }
    };
    initialize();

    const channel = supabase
      .channel('admin-realtime-v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: deviceData } = await supabase
        .from("devices")
        .select(`*, service_logs (next_service_date)`)
        .order("site_name", { ascending: true });

      const { data: reqData } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (deviceData) {
        const processed = deviceData.map((device: any) => {
          const logs = device.service_logs || [];
          const validLogs = logs
            .filter((l: any) => l.next_service_date)
            .sort((a: any, b: any) => new Date(b.next_service_date).getTime() - new Date(a.next_service_date).getTime());
          return { ...device, next_service_date: validLogs.length > 0 ? validLogs[0].next_service_date : null };
        });
        setDevices(processed);
      }
      if (reqData) setPendingRequests(reqData);
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setLoading(false); }
  };

  // ✅ DATABASE UPDATE LOGIC (Triggered by Master Dialog)
  const handleUpdateDevice = async () => {
    if (!selectedDevice) return;
    setDialog(prev => ({ ...prev, isOpen: false })); // Dialog band karein
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("devices")
        .update({
          site_name: selectedDevice.site_name,
          category: selectedDevice.category,
          model: selectedDevice.model,
          ip_address: selectedDevice.ip_address,
          user_pass: selectedDevice.user_pass,
          admin_pass: selectedDevice.admin_pass,
          v_code: selectedDevice.v_code,
          latitude: selectedDevice.latitude ? parseFloat(selectedDevice.latitude) : null,
          longitude: selectedDevice.longitude ? parseFloat(selectedDevice.longitude) : null,
          radius: selectedDevice.radius ? parseFloat(selectedDevice.radius) : 100,
          device_notes: selectedDevice.device_notes
        })
        .eq("device_sn", selectedDevice.device_sn);

      if (error) throw error;
      
      setIsModalOpen(false);
      setSelectedDevice(null);
      fetchData(); 
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // --- TRIGGER DIALOGS ---
  const triggerUpdateConfirm = () => {
    setDialog({
      isOpen: true,
      title: "Confirm Master Sync?",
      message: `Kya aap ${selectedDevice?.site_name} ka master data database mein update karna chahte hain?`,
      type: "info",
      onConfirm: handleUpdateDevice,
    });
  };

  const triggerLogoutConfirm = () => {
    setDialog({
      isOpen: true,
      title: "System Logout?",
      message: "Kya aap Modern Systems portal se bahar nikalna chahte hain?",
      type: "danger",
      onConfirm: handleLogout,
    });
  };

  const trackOnMap = (device: any) => {
    const { latitude, longitude } = device;
    if (!latitude || !longitude) return alert("⚠️ Location missing");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  const filtered = useMemo(() => devices.filter(d => 
    [d.site_name, d.device_sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
  ), [search, devices]);

  const stats = useMemo(() => ({
    totalSites: devices.length,
    pending: pendingRequests.length,
    activeTypes: new Set(devices.map(d => d.category || 'DVR')).size,
  }), [devices, pendingRequests]);

  const getServiceStatusStyles = (dateString: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const serviceDate = new Date(dateString);
    const diffDays = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "bg-red-600 text-white border-red-700"; 
    if (diffDays === 0) return "bg-orange-600 text-white border-orange-700"; 
    if (diffDays <= 7) return "bg-orange-100 text-orange-700 border-orange-200"; 
    return "bg-emerald-50 text-emerald-700 border-emerald-100"; 
  };

  const isSuperAdmin = userRole === "super_admin";

  return (
    <AuthGuard allowedRoles={["super_admin", "engineer"]}> 
      <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 pb-24 text-left">
        
        {/* --- STICKY HEADER --- */}
        <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 pb-5 pt-5 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 italic">
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-100"><Rocket className="text-white" size={20} /></div>
              <div>
                 <h1 className="text-lg sm:text-xl font-[1000] text-slate-900 tracking-tighter uppercase leading-none">Admin Central</h1>
                 <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isSuperAdmin ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   {isSuperAdmin ? <ShieldCheck size={10} /> : <UserIcon size={10} />}
                   {userRole}
                 </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`p-4 rounded-2xl shadow-lg transition-all active:scale-90 ${isSearchOpen ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600'}`}><Search size={20} /></button>
              <button onClick={() => { setFilterSn(null); setIsReqManagerOpen(true); }} className="relative p-4 bg-white border border-slate-200 text-red-500 rounded-2xl shadow-lg active:scale-95 transition-all">
                <BellRing size={22} />
                {stats.pending > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white font-black px-1 shadow-sm">{stats.pending}</span>}
              </button>
              <button onClick={triggerLogoutConfirm} className="p-4 bg-white border border-red-50 text-red-500 rounded-2xl shadow-lg active:scale-90"><LogOut size={20} /></button>
            </div>
          </div>

          {isSearchOpen && (
            <div className="max-w-2xl mx-auto mt-4 px-0 animate-in slide-in-from-top-4 duration-300">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input autoFocus type="text" placeholder="Search site, SN or IP..." className="w-full p-5 pl-16 pr-16 bg-white border-2 border-blue-100 rounded-[25px] outline-none font-bold text-slate-700 shadow-xl focus:border-blue-500 transition-all text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                <button onClick={() => { setIsSearchOpen(false); setSearch(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400"><X size={18} /></button>
              </div>
            </div>
          )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total Sites</p>
              <h2 className="text-4xl font-[1000] text-slate-800 tracking-tighter italic leading-none mt-1">{stats.totalSites}</h2>
            </div>
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden text-right">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Active Types</p>
              <h2 className="text-4xl font-[1000] text-slate-800 tracking-tighter italic leading-none mt-1">{stats.activeTypes}</h2>
            </div>
          </div>

          {/* DEVICE LIST */}
          <div className="space-y-7 pb-20">
            {loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={48} /></div> : filtered.map((device) => (
              <div key={device.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden pt-14 group active:scale-[0.98] transition-all">
                <RequestNotification deviceSn={device.device_sn} pendingRequests={pendingRequests} onClick={() => { setFilterSn(device.device_sn); setIsReqManagerOpen(true); }} />
                <span className="absolute right-8 top-8 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest">{device.category || 'DVR'}</span>
                
                <div className="space-y-4 mb-8">
                  <div onClick={() => window.open(`/request/${device.device_sn}`, '_blank')} className="cursor-pointer group/link inline-flex items-center gap-2">
                    <h3 className="text-[24px] font-[1000] text-slate-800 uppercase italic tracking-tighter leading-none">{device.site_name}</h3>
                    <ExternalLink size={16} className="text-slate-300" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border-2 border-slate-100 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-tighter">SN: {device.device_sn}</div>
                      <button onClick={() => trackOnMap(device)} className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 active:scale-90 shadow-sm"><MapPin size={18} /></button>
                    </div>
                    {device.next_service_date && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${getServiceStatusStyles(device.next_service_date)}`}>
                        <CalendarClock size={14} />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase leading-none opacity-80">Next Service</span>
                          <span className="text-[11px] font-bold mt-1 leading-none">{new Date(device.next_service_date).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* THUMB-FRIENDLY BUTTONS */}
                <div className="flex items-center justify-between gap-1 pt-6 border-t border-slate-50">
                  <button onClick={() => { setSelectedDevice(device); setIsHistoryOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-blue-600 transition-all"><div className="p-3 bg-slate-50 rounded-[20px] active:bg-blue-50"><HistoryIcon size={20} /></div><span className="text-[9px] font-black uppercase tracking-widest">History</span></button>
                  {isSuperAdmin && (
                    <>
                      <button onClick={() => router.push('/add-device')} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-emerald-600"><div className="p-3 bg-slate-50 rounded-[20px] active:bg-emerald-50"><Plus size={20} /></div><span className="text-[9px] font-black uppercase tracking-widest">Add</span></button>
                      <button onClick={() => { setSelectedDevice(device); setIsModalOpen(true); }} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-orange-500"><div className="p-3 bg-slate-50 rounded-[20px] active:bg-orange-50"><Pencil size={20} /></div><span className="text-[9px] font-black uppercase tracking-widest">Edit</span></button>
                    </>
                  )}
                  <button onClick={() => router.push(`/service/${device.device_sn}`)} className="flex-1 flex flex-col items-center gap-2 p-2 text-slate-400 active:text-indigo-600"><div className="p-3 bg-slate-50 rounded-[20px] active:bg-indigo-50"><ClipboardList size={20} /></div><span className="text-[9px] font-black uppercase tracking-widest">Report</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- GLOBAL MODALS --- */}
        <MasterDialog 
          isOpen={dialog.isOpen}
          onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={dialog.onConfirm}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          isLoading={isSaving}
          confirmText="Yes, Sync Now"
        />

        {selectedDevice && (
          <>
            <EditModal 
              isOpen={isModalOpen} 
              device={selectedDevice} 
              setDevice={setSelectedDevice} 
              onClose={() => { setIsModalOpen(false); setSelectedDevice(null); }} 
              onUpdate={triggerUpdateConfirm} // 🚩 FIXED: Master Dialog trigger
              isSaving={isSaving} 
            />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => { setIsHistoryOpen(false); setSelectedDevice(null); }} sn={selectedDevice?.device_sn} siteName={selectedDevice?.site_name} />
          </>
        )}
        <RequestManagerModal isOpen={isReqManagerOpen} onClose={() => { setIsReqManagerOpen(false); setFilterSn(null); }} onRefresh={fetchData} filterSn={filterSn} />
      </div>
    </AuthGuard>
  );
}