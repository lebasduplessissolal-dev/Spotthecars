import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Search, Crosshair, Loader2 } from "lucide-react";
import SpotMarkerPopup from "@/components/spots/SpotMarkerPopup";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const carIcon = new L.DivIcon({
  html: `<div style="background: #f97316; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
    <span style="transform: rotate(45deg); font-size: 14px;">🏎️</span>
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 15 });
    map.once("locationfound", () => setLocating(false));
    map.once("locationerror", () => setLocating(false));
  };
  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-6 right-4 z-[1000] bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl border border-zinc-700 rounded-full w-11 h-11 flex items-center justify-center"
    >
      {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
    </button>
  );
}

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ["carspots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('"CarSpot"')
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filteredSpots = spots.filter((spot) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      spot.brand?.toLowerCase().includes(q) ||
      spot.model?.toLowerCase().includes(q) ||
      spot.location_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative h-full">
      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            placeholder="Rechercher une marque, modèle, lieu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 text-white placeholder:text-zinc-500 rounded-full h-11 shadow-xl text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Counter */}
      <div className="absolute top-20 left-4 z-[1000]">
        <div className="bg-zinc-900/90 backdrop-blur-lg border border-zinc-800 rounded-full px-3 py-1.5 text-xs text-zinc-400 shadow-lg">
          <span className="text-orange-500 font-bold">{filteredSpots.length}</span> spots
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-zinc-950/80">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        className="h-full w-full"
        zoomControl={false}
        style={{ background: "#18181b" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredSpots.map((spot) =>
          spot.latitude && spot.longitude ? (
            <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={carIcon}>
              <Popup className="car-spot-popup">
                <SpotMarkerPopup spot={spot} />
              </Popup>
            </Marker>
          ) : null
        )}
        <LocateButton />
      </MapContainer>
    </div>
  );
}
