import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter, Search } from "lucide-react";
import SpotCard from "@/components/spots/SpotCard";

const categories = [
  { value: "all", label: "Tous" },
  { value: "supercar", label: "Supercar" },
  { value: "hypercar", label: "Hypercar" },
  { value: "classic", label: "Classique" },
  { value: "sport", label: "Sport" },
  { value: "luxury", label: "Luxe" },
];

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ["carspots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carspot")
        .select("*")
        .order("created_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const filteredSpots = spots.filter((s) => {
    const matchCat = activeFilter === "all" || s.category === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      s.brand?.toLowerCase().includes(q) ||
      s.model?.toLowerCase().includes(q) ||
      s.location_name?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-full bg-zinc-950 pb-6">
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <p className="text-sm text-zinc-500 mt-1">Les dernières voitures repérées</p>
      </div>

      {/* Barre de recherche unifiée */}
      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            placeholder="Rechercher un véhicule ou une localité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Filtres catégorie */}
      <div className="px-5 pb-3 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === cat.value
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : filteredSpots.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <Filter className="w-8 h-8 mb-2" />
          <p className="text-sm">Aucun spot trouvé</p>
        </div>
      ) : (
        <div className="px-5 space-y-4 mt-2">
          {filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
