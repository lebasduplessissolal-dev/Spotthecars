import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Trophy, Eye, Star, LogOut } from "lucide-react";
import SpotCard from "@/components/spots/SpotCard";

export default function Profile() {
  const { user, logout } = useAuth();

  const { data: allSpots = [], isLoading } = useQuery({
    queryKey: ["carspots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carspot").select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const mySpots = user ? allSpots.filter((s) => s.created_by === user.email) : [];
  const totalLikes = mySpots.reduce((sum, s) => sum + (s.likes || 0), 0);
  const uniqueBrands = [...new Set(mySpots.map((s) => s.brand))].length;

  const stats = [
    { icon: Eye, label: "Spots", value: mySpots.length, color: "text-orange-500" },
    { icon: Star, label: "Likes reçus", value: totalLikes, color: "text-yellow-500" },
    { icon: Trophy, label: "Marques", value: uniqueBrands, color: "text-blue-500" },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email || "?";

  return (
    <div className="min-h-full bg-zinc-950 pb-6">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-orange-500/20 to-zinc-950 pt-10 pb-6 px-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-orange-500/20">
            {displayName[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="absolute top-6 right-5 text-zinc-500 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-1">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My spots */}
      <div className="px-5 mt-5">
        <h2 className="text-lg font-bold text-white mb-3">Mes Spots</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : mySpots.length === 0 ? (
          <div className="text-center py-12 text-zinc-600">
            <MapPin className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm">Vous n'avez pas encore spotté de voiture</p>
            <p className="text-xs text-zinc-700 mt-1">Allez sur "Spotter" pour ajouter votre premier spot !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySpots.map((spot) => <SpotCard key={spot.id} spot={spot} compact />)}
          </div>
        )}
      </div>
    </div>
  );
}
