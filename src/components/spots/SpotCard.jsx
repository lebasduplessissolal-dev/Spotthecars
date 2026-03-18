import { MapPin, Clock, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

const categoryLabels = {
  supercar: "Supercar",
  hypercar: "Hypercar",
  classic: "Classique",
  sport: "Sport",
  luxury: "Luxe",
  tuned: "Tuné",
  rare: "Rare",
};

const categoryColors = {
  supercar: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  hypercar: "bg-red-500/20 text-red-400 border-red-500/30",
  classic: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  sport: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  luxury: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  tuned: "bg-green-500/20 text-green-400 border-green-500/30",
  rare: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function SpotCard({ spot, compact = false }) {
  return (
    <div className={`group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 ${compact ? "" : "hover:shadow-xl hover:shadow-orange-500/5"}`}>
      {spot.photo_url && !compact && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={spot.photo_url}
            alt={`${spot.brand} ${spot.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          {spot.category && (
            <Badge className={`absolute top-3 left-3 ${categoryColors[spot.category]} border text-[10px] font-semibold`}>
              {categoryLabels[spot.category]}
            </Badge>
          )}
        </div>
      )}

      <div className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className={`font-bold text-white truncate ${compact ? "text-sm" : "text-lg"}`}>
              {spot.brand} {spot.model}
            </h3>
            {spot.color && (
              <p className="text-xs text-zinc-500 mt-0.5">{spot.color}</p>
            )}
          </div>
          {compact && spot.category && (
            <Badge className={`${categoryColors[spot.category]} border text-[9px] font-semibold flex-shrink-0`}>
              {categoryLabels[spot.category]}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-500">
          {spot.location_name && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {spot.location_name}
            </span>
          )}
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />
            {moment(spot.created_date).fromNow()}
          </span>
        </div>

        {spot.description && !compact && (
          <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{spot.description}</p>
        )}

        {!compact && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
            <span className="text-xs text-zinc-600">
              par <span className="text-zinc-400">{spot.spotter_name || "Anonyme"}</span>
            </span>
            <div className="flex items-center gap-1 text-zinc-500">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs">{spot.likes || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}