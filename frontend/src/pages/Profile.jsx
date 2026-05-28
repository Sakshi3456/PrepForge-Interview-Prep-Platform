import { useEffect, useState } from "react";
import { 
  Target, Award, Star, Activity, Edit3, X, Terminal, Video, GraduationCap, Check
} from "lucide-react";
import api from "../services/api";

const TARGET_ROLES = [
  "Java Developer", "React Developer", "Full Stack Developer", 
  "Python Developer", "Data Analyst", "DevOps Engineer", 
  "Android Developer", "General / Not decided",
];

function Profile() {
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", targetRole: "", college: "", bio: "", 
  });

  useEffect(() => { 
    fetchProfile(); 
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/profile/${userId}`);
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        targetRole: res.data.targetRole || "",
        college: res.data.college || "",
        bio: res.data.bio || "",
      });
    } catch (err) {
      console.error("Profile payload sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/profile/${userId}`, form);
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Configuration commit channel error", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-16 relative animate-pulse">
        <div className="h-44 bg-slate-100 rounded-[24px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-2xl border border-slate-200/60" />)}
        </div>
      </div>
    );
  }
  
  if (!profile) return null;

  const accuracy = Math.round(profile.overallAccuracy || 0);

  return (
    <div className="space-y-8 pb-16 relative">
      
      {/* ── PROFILE HEADER JUMBOTRON GRADIENT BANNER ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#121635] via-[#1b1e4b] to-[#2b1f5d] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          
          {/* Brand-Accented Dynamic Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-3xl font-black text-white shrink-0 shadow-inner">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          
          {/* Identity Matrix Text Rows */}
          <div className="flex-1 space-y-1">
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              Verified Candidate Matrix
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">{profile.name}</h1>
            <p className="text-slate-300 text-xs font-medium">{profile.email}</p>
            
            {/* Structural Metadata Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.targetRole && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">
                  <Target size={11} className="text-indigo-400" /> {profile.targetRole}
                </span>
              )}
              {profile.college && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wide">
                  <GraduationCap size={12} className="text-purple-400" /> {profile.college}
                </span>
              )}
            </div>
          </div>

          {/* Configuration Editor Toggle Button */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 ${
              editMode 
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" 
                : "bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.12]"
            }`}
          >
            {editMode ? <X size={13} /> : <Edit3 size={13} />}
            <span>{editMode ? "Close Editor" : "Modify Credentials"}</span>
          </button>
        </div>
      </div>

      {/* ── METRICS MONITOR MATRIX GRID ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Accuracy", value: `${accuracy}%`, icon: <Target size={15} />, color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
          { label: "Current Streak", value: `${profile.currentStreak || 0} 🔥`, icon: <Activity size={15} />, color: "text-amber-500 bg-amber-50 border-amber-100" },
          { label: "Coding Tasks", value: profile.codeSolved || 0, icon: <Terminal size={15} />, color: "text-rose-500 bg-rose-50 border-rose-100" },
          { label: "AI Mock Runs", value: profile.mockInterviewsDone || 0, icon: <Video size={15} />, color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
        ].map((s, i) => (
          <div key={i} className="group bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-105 ${s.color}`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-slate-800 tracking-tight leading-none">{s.value}</p>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1.5 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── INTERACTIVE CONFIGURATION EDITOR CONSOLE ── */}
      {editMode && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
            <span className="bg-indigo-50 text-[#6366f1] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Profile Console
            </span>
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Modify Profile Matrix Parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Runtime Name</label>
              <input 
                type="text"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Objective Role</label>
              <div className="relative">
                <select 
                  value={form.targetRole} 
                  onChange={e => setForm({...form, targetRole: e.target.value})} 
                  className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none pr-8"
                >
                  <option value="">Select target domain matrix</option>
                  {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r border-b border-slate-400 rotate-45 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Academic Institute / College</label>
              <input 
                type="text"
                value={form.college} 
                onChange={e => setForm({...form, college: e.target.value})} 
                className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Professional Brief / Bio</label>
              <textarea 
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})} 
                rows={3} 
                className="w-full px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed" 
                placeholder="Describe your architectural experience baseline..."
              />
            </div>
          </div>

          {/* Action Execution Footprint */}
          <div className="flex gap-2.5 pt-4 border-t border-slate-100 justify-end">
            <button 
              onClick={() => setEditMode(false)} 
              className="inline-flex items-center justify-center text-xs font-bold px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={saveProfile} 
              disabled={saving} 
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5356e2] text-white transition-colors disabled:opacity-50"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={13} />
              )}
              <span>{saving ? "Saving Changes..." : "Commit Parameter Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;