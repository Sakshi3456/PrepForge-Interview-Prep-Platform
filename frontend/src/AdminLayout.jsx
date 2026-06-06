import { Link, useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: "📊", label: "Dashboard",   path: "/admin" },
  { icon: "📝", label: "Notes",       path: "/admin/notes" },
  { icon: "❓", label: "Questions",   path: "/admin/questions" },
  { icon: "🧮", label: "Aptitude",    path: "/admin/aptitude" },
  { icon: "💻", label: "Coding",      path: "/admin/coding" },
  { icon: "📋", label: "MCQ",         path: "/admin/mcq" },
  { icon: "🎭", label: "Mock Sets",   path: "/admin/mock" },
  { icon: "👥", label: "Users",       path: "/admin/users" },
];

function AdminLayout({ children, currentViewTitle }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0d131f] flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-slate-800/60 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800/60">
          <h1 className="text-lg font-black text-white">⚒️ PrepForge</h1>
          <p className="text-xs text-slate-500 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                location.pathname === item.path
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-150 text-left"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-10 bg-[#111827]/80 backdrop-blur border-b border-slate-800/60 px-8 py-4">
          <h2 className="text-sm font-bold text-slate-300">{currentViewTitle}</h2>
        </header>
        <div>{children}</div>
      </main>

    </div>
  );
}

export default AdminLayout;