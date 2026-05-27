import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const navItems = [
  { icon: "📊", label: "Dashboard",          path: "/admin"           },
  { icon: "📚", label: "Manage Notes",        path: "/admin/notes"     },
  { icon: "🎤", label: "Interview Questions", path: "/admin/questions" },
  { icon: "💻", label: "Coding Questions",    path: "/admin/coding"    },
  { icon: "📝", label: "Technical MCQ",       path: "/admin/mcq"       },
  { icon: "👥", label: "Manage Users",        path: "/admin/users"     },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/admin/aptitude"  },
];

function AdminUsers() {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [toast, setToast]               = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [roleConfirm, setRoleConfirm]   = useState(null); // { id, newRole }

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role?role=${role}`);
      showToast(`Role updated to ${role}`);
      setRoleConfirm(null);
      fetchUsers();
    } catch {
      showToast("Role update failed", "error");
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      showToast("User deleted");
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const userCount  = users.filter(u => u.role === "USER").length;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span> {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Delete User?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-5">
              This will permanently remove the user and all their data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => deleteUser(deleteConfirm)}
                className="flex-1 py-2.5 text-sm font-medium bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Confirm Modal */}
      {roleConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">👑</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Change Role?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-5">
              Set this user's role to <span className="font-bold text-indigo-600">{roleConfirm.newRole}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRoleConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => updateRole(roleConfirm.id, roleConfirm.newRole)}
                className="flex-1 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition">
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-5 border-t border-white/10">
          <button onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">

        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 shadow-sm">
          <h2 className="text-xl font-black text-slate-800">Manage Users 👥</h2>
          <p className="text-slate-500 text-xs mt-0.5">{users.length} registered users</p>
        </div>

        <div className="p-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: "Total Users",  value: users.length,  icon: "👥", color: "bg-indigo-50 text-indigo-600"  },
              { label: "Regular Users",value: userCount,     icon: "👤", color: "bg-slate-50 text-slate-600"    },
              { label: "Admins",       value: adminCount,    icon: "👑", color: "bg-amber-50 text-amber-600"    },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg mb-3`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm" />
          </div>

          <p className="text-xs text-slate-400 mb-4">{filtered.length} users</p>

          {/* Users List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-slate-500 font-medium">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(user => (
                <div key={user.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all p-4">
                  <div className="flex items-center gap-4">

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                      user.role === "ADMIN"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-indigo-100 text-indigo-600"
                    }`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {user.role === "ADMIN" ? "👑 Admin" : "👤 User"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">ID: #{user.id}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {user.role === "USER" ? (
                        <button
                          onClick={() => setRoleConfirm({ id: user.id, newRole: "ADMIN" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition"
                        >
                          👑 Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => setRoleConfirm({ id: user.id, newRole: "USER" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
                        >
                          👤 Make User
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;