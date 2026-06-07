import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Search, Crosshair, Loader2, MapPin } from "lucide-react";
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

function FlyToCity({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, { animate: true, duration: 1.2 });
    }
  }, [coords]);
  return null;
}

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
  const [spotSearch, setSpotSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [flyCoords, setFlyCoords] = useState(null);
  const cityDebounceRef = useRef(null);

  useEffect(() => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    if (citySearch.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }
    cityDebounceRef.current = setTimeout(async () => {
      setCityLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearch.trim())}&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "fr,en" } }
        );
        const data = await res.json();
        setCitySuggestions(data);
      } catch {
        setCitySuggestions([]);
      } finally {
        setCityLoading(false);
      }
    }, 400);
  }, [citySearch]);

  const handleSelectCity = (suggestion) => {
    setFlyCoords([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setCitySearch(suggestion.display_name.split(",")[0]);
    setCitySuggestions([]);
  };

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ["carspots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carspot")
        .select("*")
        .order("created_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const filteredSpots = spots.filter((spot) => {
    if (!spotSearch) return true;
    const q = spotSearch.toLowerCase();
    return (
      spot.brand?.toLowerCase().includes(q) ||
      spot.model?.toLowerCase().includes(q) ||
      spot.location_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative h-full">

      {/* Barres de recherche côte à côte */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">

        {/* Ville */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 z-10" />
          <input
            placeholder="Ville..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 text-white placeholder:text-zinc-500 rounded-full h-11 shadow-xl text-sm focus:outline-none focus:border-orange-500"
          />
          {cityLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500 animate-spin" />
          )}
          {citySuggestions.length > 0 && (
            <ul className="absolute top-full mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-[1001]">
              {citySuggestions.map((s) => (
                <li
                  key={s.place_id}
                  onClick={() => handleSelectCity(s)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-800 cursor-pointer text-sm text-white border-b last:border-b-0 border-zinc-800"
                >
                  <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
                  <span className="truncate">{s.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Marque / modèle */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            placeholder="Marque, modèle..."
            value={spotSearch}
            onChange={(e) => setSpotSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 text-white placeholder:text-zinc-500 rounded-full h-11 shadow-xl text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Compteur */}
        <div className="flex items-center bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-full px-3 shadow-xl text-xs text-zinc-400 whitespace-nowrap flex-shrink-0">
          <span className="text-orange-500 font-bold">{filteredSpots.length}</span>&nbsp;spots
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
        <FlyToCity coords={flyCoords} />
        <LocateButton />
      </MapContainer>
    </div>
  );
}
