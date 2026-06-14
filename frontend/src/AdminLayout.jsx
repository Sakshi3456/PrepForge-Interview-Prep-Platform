import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, MessageSquare, Brain,
  Code2, ClipboardList, Trophy, Users, LogOut,
  ChevronLeft, ChevronRight, Terminal
} from "lucide-react";

const adminNavItems = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard",           path: "/admin"           },
  { icon: <FileText size={18} />,        label: "Notes",                path: "/admin/notes"     },
  { icon: <MessageSquare size={18} />,   label: "Interview Questions",  path: "/admin/questions" },
  { icon: <Brain size={18} />,           label: "Aptitude Quiz",        path: "/admin/aptitude"  },
  { icon: <Code2 size={18} />,           label: "Coding Questions",     path: "/admin/coding"    },
  { icon: <ClipboardList size={18} />,   label: "Technical MCQ",        path: "/admin/mcq"       },
  { icon: <Trophy size={18} />,          label: "Mock Interviews",      path: "/admin/mock"      },
  { icon: <Users size={18} />,           label: "Users",                path: "/admin/users"     },
];

function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Derive current page title from nav items
  const currentItem = adminNavItems.find(i => i.path === location.pathname);
  const pageTitle = currentItem?.label ?? "Admin Panel";

  return (
    <div
      className={`grid min-h-screen bg-[#080c1a] antialiased text-slate-100 transition-all duration-300 ${
        isOpen ? "grid-cols-[260px_1fr]" : "grid-cols-[78px_1fr]"
      }`}
    >
      {/* ── SIDEBAR ── */}
      <aside
        className={`
          ${isOpen ? "w-[260px]" : "w-[78px]"}
          transition-all duration-300 ease-in-out
          h-screen sticky top-0 shrink-0
          bg-[#06080f] border-r border-white/[0.05]
          flex flex-col overflow-hidden z-40 select-none
        `}
      >
        {/* Ambient glows — amber tinted to distinguish from user UI */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-orange-500/8 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 h-20 px-4 border-b border-white/[0.05] flex items-center justify-between gap-2">
          <div className={`transition-all duration-200 ${isOpen ? "w-auto flex-1" : "w-10"}`}>
            <Link to="/admin" className="flex items-center gap-3 min-w-0 w-fit">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-amber-500 blur-md opacity-30 rounded-xl" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-950/50">
                  <Terminal size={20} className="text-white" />
                </div>
              </div>
              {isOpen && (
                <div className="leading-tight min-w-0 animate-in fade-in duration-200">
                  <h2 className="text-[15px] font-bold text-white tracking-tight truncate">
                    PrepForge
                  </h2>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 tracking-wider uppercase">
                    Admin
                  </span>
                </div>
              )}
            </Link>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 shrink-0 relative z-50"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                title={!isOpen ? item.label : undefined}
                className={`
                  group relative flex items-center gap-3.5 py-3 rounded-xl transition-all duration-200
                  ${isOpen ? "px-4" : "justify-center px-0"}
                  ${isActive
                    ? "bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/25 text-white shadow-inner"
                    : "hover:bg-white/[0.04] text-slate-400 hover:text-slate-100 border border-transparent"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500 shadow-lg shadow-amber-500/40" />
                )}
                <div className={`shrink-0 transition-all duration-200 ${isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"}`}>
                  {item.icon}
                </div>
                {isOpen && (
                  <span className={`text-[13px] font-medium tracking-wide truncate transition-all duration-200 ${isActive ? "text-white font-semibold" : "text-slate-300 group-hover:text-white"}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative z-10 p-3 border-t border-white/[0.05] bg-[#04060c]">
          {isOpen && (
            <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/10 px-3.5 py-3 mb-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Signed in as</p>
              <p className="text-xs font-bold text-amber-400">Administrator</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3.5 rounded-xl transition-all duration-200 group
              bg-rose-500/[0.04] hover:bg-rose-500/[0.10] border border-rose-500/10
              ${isOpen ? "px-4 py-3" : "justify-center py-3"}
            `}
          >
            <LogOut size={16} className="text-rose-400 group-hover:text-rose-300 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {isOpen && (
              <p className="text-[13px] font-semibold text-rose-400 group-hover:text-rose-300">
                Logout
              </p>
            )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#080c1a]/80 backdrop-blur-md border-b border-white/[0.05] px-8 flex items-center gap-3">
          <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h2 className="text-sm font-bold text-slate-200 tracking-wide">{pageTitle}</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider uppercase">
              Admin Panel
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;