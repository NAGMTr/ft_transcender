import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-black border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <img className="w-16 h-16" src="/iconBet_white.png" alt="" />
      </Link>

      {/* Menu */}
      <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
        
        <Link
          to="/"
          className={`transition-colors ${
            isActive("/")
              ? "text-[#00FF9D]"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Ranks
        </Link>

        <Link
          to="/leaderboard"
          className={`transition-colors ${
            isActive("/leaderboard")
              ? "text-[#00FF9D]"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Leaderboard
        </Link>

        <Link
          to="/jogos"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          Jogos
        </Link>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          
          <button
            onClick={() => setOpen(!open)}
            className="text-white hover:text-[#00FF9D] transition-colors"
          >
            {profile?.firstName}
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              
              <Link
                to="/settings"
                className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>

              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
              >
                Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}