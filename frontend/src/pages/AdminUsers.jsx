import { useEffect, useState } from "react";
import { Search, X, CheckCircle2, Users, User, Crown, Shield } from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

function AdminUsers() {
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [toast,         setToast]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [roleConfirm,   setRoleConfirm]   = useState(null);
  const [filterRole,    setFilterRole]    = useState("All");

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
    } catch { showToast("Failed to fetch users", "error"); }
    finally { setLoading(false); }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role?role=${role}`);
      showToast(`Role updated to ${role}`);
      setRoleConfirm(null);
      fetchUsers();
    } catch { showToast("Role update failed", "error"); }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      showToast("User deleted");
      setDeleteConfirm(null);
      fetchUsers();
    } catch { showToast("Delete failed", "error"); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === "All" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const userCount  = users.filter(u => u.role === "USER").length;

  // Generate avatar color from name
  const avatarColor = (name, role) => role === "ADMIN"
    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";

  return (
    <AdminLayout>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-bold border ${
          toast.type === "error"
            ? "bg-[#0d0f28] border-rose-500/30 text-rose-300"
            : "bg-[#0d0f28] border-emerald-500/30 text-emerald-300"
        }`}>
          {toast.type === "error" ? <X size={14}/> : <CheckCircle2 size={14}/>}
          {toast.msg}
        </div>
      )}

      {/* ── Delete modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-[#0d0f28] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={20} className="text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete User?</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-5">
              This will permanently remove the user and all their data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
                Cancel
              </button>
              <button onClick={() => deleteUser(deleteConfirm)}
                className="flex-1 py-2.5 text-sm font-medium bg-rose-500 text-white rounded-xl hover:bg-rose-400 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Role confirm modal ── */}
      {roleConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-[#0d0f28] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown size={20} className="text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Change Role?</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-5">
              Set this user's role to{" "}
              <span className={`font-bold ${roleConfirm.newRole === "ADMIN" ? "text-amber-400" : "text-indigo-400"}`}>
                {roleConfirm.newRole}
              </span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRoleConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
                Cancel
              </button>
              <button onClick={() => updateRole(roleConfirm.id, roleConfirm.newRole)}
                className="flex-1 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 max-w-[1400px] mx-auto space-y-6">

        {/* ── Page header ── */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Manage Users</h2>
          <p className="text-xs text-slate-500 mt-1">{users.length} registered users</p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users",   value: users.length, icon: <Users size={18}/>,  cls: "text-white border-white/10 bg-white/[0.03]"           },
            { label: "Regular Users", value: userCount,    icon: <User size={18}/>,   cls: "text-indigo-400 border-indigo-500/20 bg-indigo-500/[0.05]" },
            { label: "Admins",        value: adminCount,   icon: <Crown size={18}/>,  cls: "text-amber-400 border-amber-500/20 bg-amber-500/[0.05]"    },
          ].map(s => (
            <div key={s.label} className={`border rounded-2xl p-5 ${s.cls}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="opacity-60">{s.icon}</div>
              </div>
              <p className="text-3xl font-black tracking-tight">{loading ? "—" : s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search + filter row ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0d0f28] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition" />
          </div>
          {/* Role filter pills */}
          <div className="flex gap-1.5">
            {["All","USER","ADMIN"].map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filterRole === r
                    ? r === "ADMIN"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : r === "USER"
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "bg-white/[0.08] border-white/20 text-white"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-slate-300"
                }`}>
                {r === "ADMIN" ? "👑 Admins" : r === "USER" ? "👤 Users" : "All"}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600">{filtered.length} of {users.length} users</p>

        {/* ── Users list ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/[0.06] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/[0.06] rounded w-1/4" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#0d0f28] border border-dashed border-white/[0.06] rounded-2xl">
            <Search size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium text-sm">No users found</p>
            <p className="text-slate-600 text-xs mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(user => (
              <div key={user.id}
                className="bg-[#0d0f28] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl transition-all p-4">
                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${avatarColor(user.name, user.role)}`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-200">{user.name}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        user.role === "ADMIN"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-white/[0.04] border-white/[0.08] text-slate-500"
                      }`}>
                        {user.role === "ADMIN" ? <><Crown size={9}/>Admin</> : <><User size={9}/>User</>}
                      </span>
                      {/* Verified badge if applicable */}
                      {user.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 size={9}/>Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-700 mt-0.5">ID: #{user.id}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {user.role === "USER" ? (
                      <button onClick={() => setRoleConfirm({ id: user.id, newRole: "ADMIN" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition">
                        <Crown size={12}/>Make Admin
                      </button>
                    ) : (
                      <button onClick={() => setRoleConfirm({ id: user.id, newRole: "USER" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:bg-white/[0.08] transition">
                        <User size={12}/>Make User
                      </button>
                    )}
                    <button onClick={() => setDeleteConfirm(user.id)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;