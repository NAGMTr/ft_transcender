import { Link, useLocation } from "react-router-dom";

export default function Navbar(){
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;
    return(
        <nav className="w-full bg-black border-b border-zinc-800 px-6 py-4 flex items-center justify-center sticky top-0 z-50">
           <Link to="/" className="flex items-center gap-2 group" >
                <img className="w-16 h-16" src="/iconBet_white.png" alt="" />
           </Link>
           <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
        <Link to="/" className={`transition-colors ${isActive('/') ? 'text-[#00FF9D]' : 'text-zinc-500 hover:text-white'}`}
        >
          Ranks
        </Link>
        <Link to="/leaderboard" className={`transition-colors ${isActive('/leaderboard') ? 'text-[#00FF9D]' : 'text-zinc-500 hover:text-white transition-colors'}`}>
          Leaderboard
        </Link>
        <Link to="/jogos"  className="text-zinc-500 hover:text-white transition-colors text-zinc-700" // Opaco pois ainda não existe
        >
          Jogos
        </Link>
      </div>
        </nav>
    )
}