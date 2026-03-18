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

export default function SpotMarkerPopup({ spot }) {
  return (
    <div className="min-w-[200px] p-1">
      {spot.photo_url && (
        <img
          src={spot.photo_url}
          alt={`${spot.brand} ${spot.model}`}
          className="w-full h-28 object-cover rounded-lg mb-2"
        />
      )}
      <div className="font-bold text-sm text-zinc-900">
        {spot.brand} {spot.model}
      </div>
      {spot.color && <div className="text-xs text-zinc-500">{spot.color}</div>}
      {spot.category && (
        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
          {categoryLabels[spot.category]}
        </span>
      )}
      {spot.location_name && (
        <div className="text-xs text-zinc-500 mt-1">{spot.location_name}</div>
      )}
      <div className="text-[10px] text-zinc-400 mt-1">
        {moment(spot.created_date).fromNow()} — {spot.spotter_name || "Anonyme"}
      </div>
    </div>
  );
}