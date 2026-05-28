import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, BookOpen, MessageSquare, Award, FileText, 
  Terminal, Video, Bookmark, BarChart3, User, LogOut,
  ChevronLeft, ChevronRight
} from "lucide-react";

// Modern unified technical metadata configuration array
const navItems = [
  { icon: <Home size={18} />, label: "Dashboard", path: "/dashboard" },
  { icon: <BookOpen size={18} />, label: "Notes", path: "/notes" },
  { icon: <MessageSquare size={18} />, label: "Interview Questions", path: "/questions" },
  { icon: <Award size={18} />, label: "Aptitude Quiz", path: "/quiz" },
  { icon: <FileText size={18} />, label: "Technical MCQ", path: "/mcq" },
  { icon: <Terminal size={18} />, label: "Coding Practice", path: "/coding" },
  { icon: <Video size={18} />, label: "Mock Interview", path: "/mock" },
  { icon: <Bookmark size={18} />, label: "Bookmarks", path: "/bookmarks" },
  { icon: <BarChart3 size={18} />, label: "Progress", path: "/progress" },
  { icon: <User size={18} />, label: "Profile", path: "/profile" },
];

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside 
      className={`
        ${isOpen ? "w-[260px]" : "w-[78px]"}
        transition-all duration-300 ease-in-out
        h-screen sticky top-0 shrink-0
        bg-[#090d23] border-r border-white/5
        flex flex-col overflow-hidden z-40 select-none
      `}
    >
      {/* Premium Ambient Background Glow Vectors */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 blur-[100px] pointer-events-none" />

        {/* ── HEADER: BRANDING AREA ── */}
    <div className="relative z-10 h-20 px-4 border-b border-white/5 flex items-center justify-between gap-2">
      
      {/* 1. BRANDING LOGO: Wrapped in its own container so its hitbox cannot grow past its width */}
      <div className={`transition-all duration-200 ${isOpen ? "w-auto flex-1" : "w-10"}`}>
        <Link to="/dashboard" className="flex items-center gap-3 min-w-0 w-fit">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 rounded-xl" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <Terminal size={20} className="text-white" />
            </div>
          </div>
          
          {isOpen && (
            <div className="leading-tight min-w-0 transition-opacity duration-200 animate-in fade-in duration-300">
              <h2 className="text-[15px] font-bold text-white tracking-tight truncate">
                PrepForge
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Placement Suite
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* 2. ISOLATED TOGGLE BUTTON: Explicitly stops event propagation from hitting the parent link container */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // <-- CRITICAL: Stops the browser from triggering background Link clicks!
          setIsOpen(!isOpen);
        }}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 shrink-0 relative z-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

    </div>

      {/* ── BODY: NAVIGATION RUNTIME LINKS ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              title={!isOpen ? item.label : undefined}
              aria-label={item.label}
              className={`
                group relative flex items-center gap-3.5 py-3 rounded-xl transition-all duration-200
                ${isOpen ? "px-4" : "justify-center px-0"}
                ${isActive
                  ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-white shadow-inner"
                  : "hover:bg-white/[0.04] text-slate-400 hover:text-slate-100 border border-transparent"
                }
              `}
            >
              {/* Left Active Visual Bar Indicator */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500" />
              )}

              {/* Wrapped Monochromatic Icon Box */}
              <div 
                className={`
                  shrink-0 transition-all duration-200
                  ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}
                `}
              >
                {item.icon}
              </div>

              {/* Cleaned Dynamic Text Label Mapping Area */}
              {isOpen && (
                <span className={`text-[13px] font-medium tracking-wide truncate transition-all duration-200
                  ${isActive ? "text-white font-semibold" : "text-slate-300 group-hover:text-white"}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── FOOTER: ENGAGEMENT & SYSTEM CONTROL ── */}
      <div className="relative z-10 p-3 border-t border-white/5 space-y-2 bg-[#06091a]">
        
        {/* Daily Progress Module Container */}
        {isOpen && (
          <div className="rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/[0.04] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  Daily Goal
                </p>
                <h3 className="text-xs font-bold text-slate-200 mt-0.5">
                  6 of 10 Cleared
                </h3>
              </div>
              <span className="text-lg filter drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]">🔥</span>
            </div>
            
            {/* Cleaner, High-Contrast Sleek Micro Progress Bar Meter */}
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/50" />
            </div>
          </div>
        )}

        {/* Hardened System Destruction Session Action Button */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className={`
            w-full flex items-center gap-3.5 rounded-xl transition-all duration-200 group
            bg-rose-500/[0.04] hover:bg-rose-500/[0.10] border border-rose-500/10
            ${isOpen ? "px-4 py-3" : "justify-center py-3"}
          `}
        >
          <LogOut size={16} className="text-rose-400 group-hover:text-rose-300 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          
          {isOpen && (
            <div className="text-left leading-none">
              <p className="text-[13px] font-semibold text-rose-400 group-hover:text-rose-300">
                Logout Session
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;