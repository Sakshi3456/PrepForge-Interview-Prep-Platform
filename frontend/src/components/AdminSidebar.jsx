import { Link, useNavigate, useLocation } from "react-router-dom";

const adminNavItems = [
  { icon: "📊", label: "Dashboard",          path: "/admin"           },
  { icon: "📚", label: "Manage Notes",        path: "/admin/notes"     },
  { icon: "🎤", label: "Interview Questions", path: "/admin/questions" },
  { icon: "💻", label: "Coding Questions",    path: "/admin/coding"    },
  { icon: "📝", label: "Technical MCQ",       path: "/admin/mcq"       },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/admin/aptitude"  },
  { icon: "🎯", label: "Mock Interviews",     path: "/admin/mock"      },
  { icon: "👥", label: "Manage Users",        path: "/admin/users"     },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚒️</span>
          <span className="text-xl font-black">PrepForge</span>
        </div>
        <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full tracking-wider uppercase">
          Admin Panel
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {adminNavItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.label} to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/20 text-white font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-5 border-t border-white/10">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition">
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;