"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Rocket, Pencil, ExternalLink, AlertTriangle, Calendar } from "lucide-react";
import EditModal from "./EditModal"; // 👈 Naya module import kiya

export default function AdminCentral() {
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async () => {
    setLoading(true);
    const { data } = await supabase.from("devices").select("*").order("site_name", { ascending: true });
    if (data) setDevices(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return devices.filter(d => 
      [d.site_name, d.sn, d.ip_address].some(val => val?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, devices]);

  const handleUpdate = async () => {
    if (!selectedDevice?.id) return;
    setIsSaving(true);
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
        latitude: parseFloat(selectedDevice.latitude) || 0,
        longitude: parseFloat(selectedDevice.longitude) || 0,
        radius: parseFloat(selectedDevice.radius) || 100,
        device_notes: selectedDevice.device_notes
      })
      .eq("id", selectedDevice.id);

    if (error) alert("❌ Error: " + error.message);
    else {
      alert("✅ Updated Successfully!");
      fetchDevices();
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 font-sans antialiased text-slate-800">
      
      {/* Header & Search */}
      <div className="max-w-2xl mx-auto space-y-6 mb-10">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <Rocket className="text-slate-900" size={26} strokeWidth={2.5} />
            <h1 className="text-2xl font-[1000] text-[#1e293b] tracking-tight text-left">Admin Central</h1>
          </div>
          <div className="bg-[#dcfce7] text-[#15803d] px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short'}).toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[28px] border-b-4 border-blue-600 shadow-sm text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Sites</p>
            <h2 className="text-3xl font-[1000] text-slate-800">{devices.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-[28px] border-b-4 border-blue-600 shadow-sm text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Types</p>
            <h2 className="text-3xl font-[1000] text-slate-800">{new Set(devices.map(d => d.category)).size}</h2>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={22} strokeWidth={3} />
          <input type="text" placeholder="Search site, SN, or IP..." className="w-full p-5 pl-14 rounded-[22px] border-2 border-emerald-500 bg-white outline-none font-bold text-slate-600 shadow-sm" onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Device Cards */}
      <div className="max-w-2xl mx-auto space-y-8">
        {filtered.map((device) => (
          <div key={device.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-lg relative text-left">
            <span className="absolute right-8 top-8 bg-blue-50 text-blue-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{device.category || 'DVR'}</span>
            <div className="mb-6">
              <h3 className="text-xl font-[1000] text-slate-800 mb-2">{device.site_name}</h3>
              <div className="bg-slate-50 inline-block px-3 py-1 rounded-lg border font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{device.sn}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setSelectedDevice({...device}); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 py-4 border-2 border-orange-400 text-orange-500 font-black rounded-2xl text-xs uppercase active:scale-95 transition-all"><Pencil size={18} /> Edit</button>
              <button onClick={() => window.open(`/request/${device.sn}`, '_blank')} className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase shadow-lg active:scale-95 transition-all tracking-widest font-bold">🔗 Open</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Separate Edit Modal Component --- */}
      <EditModal 
        isOpen={isModalOpen} 
        device={selectedDevice} 
        setDevice={setSelectedDevice} 
        onClose={() => setIsModalOpen(false)} 
        onUpdate={handleUpdate} 
        isSaving={isSaving} 
      />

      <div className="h-20" />
    </div>
  );
}