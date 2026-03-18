import { Outlet, Link, useLocation } from "react-router-dom";
import { Map, PlusCircle, List, User } from "lucide-react";

const navItems = [
  { path: "/Map", icon: Map, label: "Carte" },
  { path: "/AddSpot", icon: PlusCircle, label: "Spotter" },
  { path: "/Feed", icon: List, label: "Feed" },
  { path: "/Profile", icon: User, label: "Profil" },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-orange-500"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}