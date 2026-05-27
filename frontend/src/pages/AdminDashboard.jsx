import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../services/api";

const navItems = [
  { icon: "📊", label: "Dashboard",           path: "/admin"            },
  { icon: "📚", label: "Manage Notes",        path: "/admin/notes"      },
  { icon: "🎤", label: "Interview Questions", path: "/admin/questions"  },
  { icon: "💻", label: "Coding Questions",    path: "/admin/coding"     },
  { icon: "👥", label: "Manage Users",        path: "/admin/users"      },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/admin/aptitude"   },
  { icon: "📝", label: "Technical MCQ",       path: "/admin/mcq"        },
  { icon: "🎯", label: "Mock Interviews",     path: "/admin/mock" },
];

const quickActions = [
  { icon: "📝", label: "Add Note",      path: "/admin/notes",     color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100"  },
  { icon: "❓", label: "Add Question",  path: "/admin/questions", color: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"          },
  { icon: "🧮", label: "Add Quiz Q",    path: "/admin/aptitude",  color: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100"      },
  { icon: "👥", label: "View Users",    path: "/admin/users",     color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"},
];

function AdminDashboard() {
  const [stats, setStats]     = useState({ users: 0, notes: 0, questions: 0, aptitude: 0 });
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  if (!token || role !== "ADMIN") return <Navigate to="/login" />;

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const statCards = [
    { label: "Total Users",      value: stats.users,     icon: "👥", color: "from-indigo-500 to-violet-500",  bg: "bg-indigo-50 text-indigo-600"  },
    { label: "Total Notes",      value: stats.notes,     icon: "📚", color: "from-blue-500 to-cyan-500",      bg: "bg-blue-50 text-blue-600"      },
    { label: "Interview Qs",     value: stats.questions || "—", icon: "🎤", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 text-emerald-600"},
    { label: "Aptitude Qs",      value: stats.aptitude  || "—", icon: "🧮", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 text-amber-600"   },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ── */}
      <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚒️</span>
            <span className="text-xl font-black tracking-tight">PrepForge</span>
          </div>
          <span className="inline-block text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full tracking-wider uppercase">
            Admin Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all group"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shrink-0 h-screen sticky top-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-auto">

        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-800">Admin Dashboard 👑</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Overview of your PrepForge platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </div>

        <div className="p-8">

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center text-lg`}>
                    {card.icon}
                  </div>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.color}`} />
                </div>
                {loading ? (
                  <div className="h-8 bg-slate-100 rounded animate-pulse w-16 mb-1" />
                ) : (
                  <p className="text-3xl font-black text-slate-800">{card.value}</p>
                )}
                <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-1">Quick Actions</h3>
            <p className="text-slate-500 text-sm mb-5">Jump directly to manage content</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border font-semibold text-sm transition ${action.color}`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Manage Sections ── */}
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-1">Manage Modules</h3>
            <p className="text-slate-500 text-sm mb-5">Full control over all platform content</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: "📚", title: "Notes",
                  desc: `${stats.notes} notes published`,
                  path: "/admin/notes",
                  badge: "CRUD + File Upload",
                  color: "border-indigo-100 hover:border-indigo-300",
                  badgeColor: "bg-indigo-50 text-indigo-600"
                },
                {
                  icon: "🎤", title: "Interview Questions",
                  desc: `${stats.questions || 0} questions published`,
                  path: "/admin/questions",
                  badge: "CRUD",
                  color: "border-blue-100 hover:border-blue-300",
                  badgeColor: "bg-blue-50 text-blue-600"
                },
                {
                  icon: "🧮", title: "Aptitude Quiz",
                  desc: `${stats.aptitude || 0} questions in bank`,
                  path: "/admin/aptitude",
                  badge: "CRUD",
                  color: "border-amber-100 hover:border-amber-300",
                  badgeColor: "bg-amber-50 text-amber-600"
                },
                {
                  icon: "👥", title: "Users",
                  desc: `${stats.users} registered users`,
                  path: "/admin/users",
                  badge: "View + Role Management",
                  color: "border-emerald-100 hover:border-emerald-300",
                  badgeColor: "bg-emerald-50 text-emerald-600"
                },
              ].map((mod) => (
                <Link
                  key={mod.title}
                  to={mod.path}
                  className={`bg-white rounded-2xl border p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-200 group ${mod.color}`}
                >
                  <div className="text-3xl">{mod.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                        {mod.title}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{mod.desc}</p>
                  </div>
                  <span className="text-slate-300 group-hover:text-indigo-400 transition text-lg">→</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;