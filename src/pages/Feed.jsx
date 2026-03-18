import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter } from "lucide-react";
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

  const filteredSpots = activeFilter === "all"
    ? spots
    : spots.filter((s) => s.category === activeFilter);

  return (
    <div className="min-h-full bg-zinc-950 pb-6">
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <p className="text-sm text-zinc-500 mt-1">Les dernières voitures repérées</p>
      </div>

      <div className="px-5 py-3 overflow-x-auto">
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
