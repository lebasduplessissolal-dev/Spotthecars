import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Camera, MapPin, Loader2, Crosshair, Send } from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pinIcon = new L.DivIcon({
  html: `<div style="background: #f97316; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
    <span style="transform: rotate(45deg); display:block; text-align:center; font-size: 12px; margin-top:4px;">📍</span>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const categories = [
  { value: "supercar", label: "Supercar" },
  { value: "hypercar", label: "Hypercar" },
  { value: "classic", label: "Classique" },
  { value: "sport", label: "Sport" },
  { value: "luxury", label: "Luxe" },
];

function LocationPicker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); },
  });
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
    map.once("locationfound", (e) => setPosition([e.latlng.lat, e.latlng.lng]));
  };
  return (
    <>
      {position && <Marker position={position} icon={pinIcon} />}
      <button
        type="button"
        onClick={handleLocate}
        className="absolute bottom-3 right-3 z-[1000] bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-full w-9 h-9 flex items-center justify-center"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </>
  );
}

export default function AddSpot() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [position, setPosition] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    brand: "", model: "", color: "", category: "",
    photo_url: "", description: "", location_name: "",
  });

  const createSpot = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from("carspot").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carspots"] });
      toast.success("Spot ajouté avec succès !");
      navigate("/Map");
    },
    onError: (err) => toast.error(err.message),
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("spot-photos")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error("Erreur upload photo");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("spot-photos").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, photo_url: publicUrl }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!position) { toast.error("Touchez la carte pour placer le spot !"); return; }
    if (!form.brand || !form.model) { toast.error("Renseignez au moins la marque et le modèle !"); return; }
    createSpot.mutate({
      ...form,
      latitude: position[0],
      longitude: position[1],
      spotter_name: user?.user_metadata?.full_name || user?.email || "Anonyme",
      created_by: user?.email || "anonyme",
      likes: 0,
    });
  };

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-full bg-zinc-950 pb-6">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">Nouveau Spot</h1>
        <p className="text-sm text-zinc-500 mt-1">Épinglez une voiture que vous venez de croiser</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">
        {/* Map */}
        <div className="space-y-2">
          <label className="text-zinc-300 flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-orange-500" />
            Position <span className="text-zinc-600 text-xs">(touchez la carte)</span>
          </label>
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 h-48">
            <MapContainer center={[46.603354, 1.888334]} zoom={6} className="h-full w-full" zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          {position && (
            <p className="text-xs text-orange-400">📍 {position[0].toFixed(5)}, {position[1].toFixed(5)}</p>
          )}
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <label className="text-zinc-300 flex items-center gap-2 text-sm font-medium">
            <Camera className="w-4 h-4 text-orange-500" /> Photo
          </label>
          {form.photo_url ? (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800">
              <img src={form.photo_url} alt="preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-zinc-900/90 text-white text-xs px-3 py-1 rounded-lg"
                onClick={() => updateField("photo_url", "")}
              >Changer</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-orange-500/50 transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-zinc-600 mb-2" />
                  <span className="text-xs text-zinc-500">Ajouter une photo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          )}
        </div>

        {/* Brand + Model */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-zinc-300 text-sm font-medium">Marque *</label>
            <input placeholder="Ferrari" value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500" />
          </div>
          <div className="space-y-2">
            <label className="text-zinc-300 text-sm font-medium">Modèle *</label>
            <input placeholder="488 GTB" value={form.model}
              onChange={(e) => updateField("model", e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500" />
          </div>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-zinc-300 text-sm font-medium">Couleur</label>
          <input placeholder="Rouge" value={form.color}
            onChange={(e) => updateField("color", e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500" />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-zinc-300 text-sm font-medium">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c.value} type="button" onClick={() => updateField("category", c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  form.category === c.value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-zinc-300 text-sm font-medium">Lieu</label>
          <input placeholder="Paris, Champs-Élysées" value={form.location_name}
            onChange={(e) => updateField("location_name", e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-zinc-300 text-sm font-medium">Commentaire</label>
          <textarea placeholder="Moteur qui ronronnait comme un lion..." value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500 resize-none h-20" />
        </div>

        {/* Submit */}
        <button type="submit" disabled={createSpot.isPending}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-base shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all">
          {createSpot.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" />Publier le Spot</>}
        </button>
      </form>
    </div>
  );
}
