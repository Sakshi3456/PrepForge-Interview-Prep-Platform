import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { icon: "🏠", label: "Dashboard",          path: "/dashboard"  },
  { icon: "📚", label: "Notes",              path: "/notes"      },
  { icon: "🎤", label: "Interview Questions", path: "/questions"  },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/quiz"       },
  { icon: "📝", label: "Technical MCQ",       path: "/mcq"        },
  { icon: "💻", label: "Coding Practice",     path: "/coding"     },
  { icon: "🎯", label: "Mock Interview",      path: "/mock"       },
  { icon: "⭐", label: "Bookmarks",           path: "/bookmarks"  },
  { icon: "📊", label: "Progress",            path: "/progress"   },
  { icon: "👤", label: "Profile",             path: "/profile"    },
];

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className={`
      ${isOpen ? "w-[240px]" : "w-[72px]"}
      transition-all duration-300
      h-screen sticky top-0 shrink-0
      bg-[#070b1d]
      border-r border-white/5
      flex flex-col overflow-hidden
      z-40
    `}>

      {/* Background glows */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* ── TOP: Logo + Toggle ── */}
      <div className="relative z-10 px-3 pt-4 pb-4 border-b border-white/5 flex items-center justify-between gap-2">

        {/* Logo — hidden when collapsed */}
        {isOpen && (
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-violet-500 blur-xl opacity-30 rounded-xl" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg text-base">
                ⚒️
              </div>
            </div>
            <div className="leading-tight min-w-0">
              <h2 className="text-[15px] font-bold text-white tracking-tight truncate">
                PrepForge
              </h2>
              <p className="text-[11px] text-slate-400">
                Placement Platform
              </p>
            </div>
          </Link>
        )}

        {/* Collapsed logo */}
        {!isOpen && (
          <Link to="/dashboard" className="mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 blur-xl opacity-30 rounded-xl" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-base shadow-lg">
                ⚒️
              </div>
            </div>
          </Link>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
        >
          {isOpen ? "←" : "→"}
        </button>
      </div>

      {/* ── NAV LINKS ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              title={!isOpen ? item.label : undefined}
              aria-label={item.label}
              className={`
                group relative flex items-center gap-3
                ${isOpen ? "px-3 py-2.5" : "justify-center px-0 py-2.5"}
                rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-400/20"
                  : "hover:bg-white/[0.05] border border-transparent"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
              )}

              {/* Icon */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[18px]
                transition-all duration-200
                ${isActive
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md"
                  : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                }
              `}>
                {item.icon}
              </div>

              {/* Label — only when expanded */}
              {isOpen && (
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium leading-none truncate ${
                    isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                  }`}>
                    {item.label}
                  </p>
                  {/* ── FIX: sub-label 12px ── */}
                  <p className="text-[12px] text-slate-500 mt-1">
                    Continue →
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── BOTTOM: Daily Goal + Logout ── */}
      <div className="relative z-10 p-2 border-t border-white/5 space-y-2">

        {/* Daily Goal — only when expanded */}
        {isOpen && (
          <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/5 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                {/* ── FIX: label 12px tracking 0.10em ── */}
                <p className="text-[12px] uppercase tracking-[0.10em] text-slate-400 font-medium">
                  Daily Goal
                </p>
                <h3 className="text-[13px] font-bold text-white mt-0.5">
                  6/10 Completed
                </h3>
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            {/* ── FIX: brighter progress bar fill ── */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-white/80" />
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className={`
            w-full flex items-center gap-3
            ${isOpen ? "px-3 py-2.5" : "justify-center py-2.5"}
            rounded-xl
            bg-rose-500/[0.08] hover:bg-rose-500/[0.15]
            border border-rose-500/10
            transition-all duration-200 group
          `}
        >
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0 text-[18px]">
            🚪
          </div>
          {isOpen && (
            <div className="text-left">
              <p className="text-[13px] font-semibold text-rose-300 leading-none">Logout</p>
              <p className="text-[12px] text-rose-400/70 mt-1">End session</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;