"use client";
import React, { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Loader2, X, MapPin, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

// 🚩 Leaflet Marker Icon Fix
const getIcon = () => {
  if (typeof window === 'undefined') return null;
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });
};

// 🔍 IMPROVED SEARCH COMPONENT
function SearchControl({ setPosition }: { setPosition: (lat: string, lng: string) => void }) {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query || query.length < 3) return;

    setSearching(true);
    try {
      // 🚀 Better Search Query: Added countrycodes=in to stick to India
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=3&addressdetails=1`;
      
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        // Sabse pehla result uthao
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);

        // ✈️ Smooth Flight to Location
        map.flyTo([newLat, newLon], 19, {
          animate: true,
          duration: 1.5
        });

        // Update Coordinates
        setPosition(newLat.toFixed(8), newLon.toFixed(8));
        setIsOpen(false); // Close bar after success
      } else {
        alert("Bhai, location nahi mili. Thoda area ka naam ya city bhi saath mein likho!");
      }
    } catch (err) {
      console.error("Search Error:", err);
      alert("Network issue hai bhai, phir se try karo.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="absolute top-4 left-4 z-[1000] flex items-center gap-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center bg-white/95 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden">
        <div className="px-2 text-slate-300 border-r border-slate-100 bg-slate-50/50">
          <GripVertical size={16} />
        </div>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 transition-all active:scale-90 ${isOpen ? 'text-red-500' : 'text-blue-600'}`}
        >
          {isOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSearch} className="flex items-center animate-in slide-in-from-left-2 fade-in duration-300">
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Area, City, or Landmark..." 
            className="w-48 sm:w-72 bg-white/95 backdrop-blur-2xl border border-white py-3.5 px-5 rounded-2xl text-[12px] font-black text-slate-800 shadow-2xl outline-none italic placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={searching}
            className="ml-2 p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl active:scale-90 disabled:opacity-50"
          >
            {searching ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
          </button>
        </form>
      )}
    </motion.div>
  );
}

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) map.setView(coords);
  }, [coords, map]);
  return null;
}

function LocationPicker({ position, setPosition }: any) {
  const icon = useMemo(() => getIcon(), []);
  useMapEvents({
    click(e) {
      setPosition(e.latlng.lat.toFixed(8), e.latlng.lng.toFixed(8));
    },
  });
  if (!icon) return null;
  return (
    <Marker 
      position={position} 
      icon={icon} 
      draggable={true}
      eventHandlers={useMemo(() => ({
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos.lat.toFixed(8), pos.lng.toFixed(8));
        },
      }), [setPosition])}
    />
  );
}

interface MapPickerProps {
  lat: number; lng: number; radius: number;
  onLocationChange: (lat: string, lng: string) => void;
}

export default function MapPicker({ lat, lng, radius, onLocationChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const center = useMemo<[number, number]>(() => {
    return [Number(lat) || 19.1623522, Number(lng) || 72.9335731];
  }, [lat, lng]);

  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="h-[350px] w-full bg-slate-100 rounded-[40px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <Loader2 className="animate-spin text-blue-500 mb-2" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waking up Engine...</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-slate-200 group touch-none">
      <MapContainer 
        center={center} 
        zoom={19} 
        maxZoom={20} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
        
        <RecenterMap coords={center} />
        <SearchControl setPosition={onLocationChange} />
        <LocationPicker position={center} setPosition={onLocationChange} />
        
        <Circle 
          center={center} 
          radius={Number(radius) || 100} 
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }} 
        />
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg pointer-events-none">
         <p className="text-[7px] font-black text-white/80 uppercase tracking-widest italic leading-none">Modern Satellite Sync</p>
      </div>
    </div>
  );
}