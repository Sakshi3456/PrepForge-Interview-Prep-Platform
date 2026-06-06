import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

const quickActions = [
  { icon: "📝", label: "Add Note",      path: "/admin/notes",     color: "bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100/80 border-indigo-100"  },
  { icon: "❓", label: "Add Question",  path: "/admin/questions", color: "bg-blue-50/60 text-blue-600 hover:bg-blue-100/80 border-blue-100"          },
  { icon: "🧮", label: "Add Quiz Q",    path: "/admin/aptitude",  color: "bg-amber-50/60 text-amber-600 hover:bg-amber-100/80 border-amber-100"      },
  { icon: "👥", label: "View Users",    path: "/admin/users",     color: "bg-emerald-50/60 text-emerald-600 hover:bg-emerald-100/80 border-emerald-100"},
];

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, notes: 0, questions: 0, aptitude: 0 });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch administrative platform insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (!token || role !== "ADMIN") return <Navigate to="/login" replace />;

  const statCards = [
    { label: "Total Users",   value: stats.users ?? 0,     icon: "👥", dotColor: "bg-indigo-500",  iconBg: "bg-indigo-50 text-indigo-600"  },
    { label: "Total Notes",   value: stats.notes ?? 0,     icon: "📚", dotColor: "bg-blue-500",    iconBg: "bg-blue-50 text-blue-600"      },
    { label: "Interview Qs",  value: stats.questions ?? 0, icon: "🎤", dotColor: "bg-emerald-500", iconBg: "bg-emerald-50 text-emerald-600"},
    { label: "Aptitude Qs",   value: stats.aptitude ?? 0,  icon: "🧮", dotColor: "bg-amber-500",   iconBg: "bg-amber-50 text-amber-600"    },
  ];

  const modulesData = [
    { icon: "📚", title: "Notes", desc: `${stats.notes ?? 0} notes published`, path: "/admin/notes", badge: "CRUD + File Upload", color: "border-slate-100 hover:border-slate-200 hover:shadow-indigo-500/5", badgeColor: "bg-indigo-50 text-indigo-600" },
    { icon: "🎤", title: "Interview Questions", desc: `${stats.questions ?? 0} questions published`, path: "/admin/questions", badge: "CRUD", color: "border-slate-100 hover:border-slate-200 hover:shadow-blue-500/5", badgeColor: "bg-blue-50 text-blue-600" },
    { icon: "🧮", title: "Aptitude Quiz", desc: `${stats.aptitude ?? 0} questions in bank`, path: "/admin/aptitude", badge: "CRUD", color: "border-slate-100 hover:border-slate-200 hover:shadow-amber-500/5", badgeColor: "bg-amber-50 text-amber-600" },
    { icon: "👥", title: "Users", desc: `${stats.users ?? 0} registered users`, path: "/admin/users", badge: "View + Role Management", color: "border-slate-100 hover:border-slate-200 hover:shadow-emerald-500/5", badgeColor: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <AdminLayout>
      <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-fade-in">

        {/* ── Stat Analytics Grid ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center text-xl font-medium`}>
                  {card.icon}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${card.dotColor}`} />
              </div>
              {loading ? (
                <div className="h-9 bg-slate-100 rounded-lg animate-pulse w-20 mb-1" />
              ) : (
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</h3>
              )}
              <p className="text-xs font-semibold text-slate-400 mt-1 tracking-wide uppercase">{card.label}</p>
            </div>
          ))}
        </section>

        {/* ── Quick Interaction Modules ── */}
        <section>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Quick Actions</h3>
            <p className="text-slate-400 text-xs">Jump directly into content routing triggers</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border font-bold text-sm transition-all duration-150 shadow-sm hover:-translate-y-0.5 ${action.color}`}
              >
                <span className="text-2xl mb-0.5">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── System Core Modules ── */}
        <section>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Manage Modules</h3>
            <p className="text-slate-400 text-xs">Full transactional system orchestration access control</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulesData.map((mod) => (
              <Link
                key={mod.title}
                to={mod.path}
                className={`bg-white rounded-2xl border p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group ${mod.color}`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100/60 group-hover:bg-white transition-colors duration-200">
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-150">
                      {mod.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate">{mod.desc}</p>
                </div>
                <span className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-150 text-xl font-bold pr-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;