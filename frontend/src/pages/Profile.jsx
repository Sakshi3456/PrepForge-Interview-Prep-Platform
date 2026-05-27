import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const TARGET_ROLES = [
  "Java Developer",
  "React Developer",
  "Full Stack Developer",
  "Python Developer",
  "Data Analyst",
  "DevOps Engineer",
  "Android Developer",
  "General / Not decided",
];

function Profile() {
  const userId   = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const [form, setForm] = useState({
    name: "", targetRole: "", college: "",
    bio: "", linkedinUrl: "", githubUrl: "",
  });

  useEffect(() => { fetchProfile(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/profile/${userId}`);
      setProfile(res.data);
      setForm({
        name:        res.data.name        || "",
        targetRole:  res.data.targetRole  || "",
        college:     res.data.college     || "",
        bio:         res.data.bio         || "",
        linkedinUrl: res.data.linkedinUrl || "",
        githubUrl:   res.data.githubUrl   || "",
      });
    } catch {
      console.error("Profile fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/profile/${userId}`, form);
      showToast("Profile updated!");
      setEditMode(false);
      fetchProfile();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const accuracy = Math.round(profile.overallAccuracy || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span> {toast.msg}
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 px-8 pt-10 pb-20">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black text-white border-2 border-white/30">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{profile.name}</h1>
              <p className="text-indigo-300 text-sm mt-0.5">{profile.email}</p>
              {profile.targetRole && (
                <span className="inline-block mt-2 text-[11px] font-semibold bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
                  🎯 {profile.targetRole}
                </span>
              )}
              {profile.college && (
                <p className="text-indigo-300 text-xs mt-1.5">🎓 {profile.college}</p>
              )}
              {profile.bio && (
                <p className="text-indigo-200 text-xs mt-1 max-w-md">{profile.bio}</p>
              )}
              <div className="flex gap-3 mt-2">
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                    className="text-indigo-300 hover:text-white text-xs font-medium transition">
                    LinkedIn →
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                    className="text-indigo-300 hover:text-white text-xs font-medium transition">
                    GitHub →
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 text-sm font-semibold bg-white/15 text-white border border-white/20 rounded-xl hover:bg-white/25 transition shrink-0"
          >
            {editMode ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-8 pb-16 space-y-6">

        {/* Edit Form */}
        {editMode && (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-6">
            <h3 className="text-base font-black text-slate-800 mb-5">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Role</label>
                <select value={form.targetRole}
                  onChange={e => setForm({ ...form, targetRole: e.target.value })}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                  <option value="">Select your target role</option>
                  {TARGET_ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">College</label>
                <input value={form.college}
                  onChange={e => setForm({ ...form, college: e.target.value })}
                  placeholder="e.g. VIT Pune"
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LinkedIn URL</label>
                <input value={form.linkedinUrl}
                  onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourname"
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GitHub URL</label>
                <input value={form.githubUrl}
                  onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/yourname"
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</label>
                <textarea value={form.bio} rows={3}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={saveProfile} disabled={saving}
                className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditMode(false)}
                className="px-6 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Overall Accuracy", value: `${accuracy}%`,                    icon: "🎯", color: "bg-indigo-50 text-indigo-600"   },
            { label: "Current Streak",   value: `${profile.currentStreak || 0} 🔥`, icon: "📅", color: "bg-amber-50 text-amber-600"    },
            { label: "Coding Solved",    value: profile.codeSolved || 0,            icon: "💻", color: "bg-emerald-50 text-emerald-600" },
            { label: "Mock Interviews",  value: profile.mockInterviewsDone || 0,    icon: "🎤", color: "bg-violet-50 text-violet-600"   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg mx-auto mb-2`}>
                {s.icon}
              </div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Accuracy Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-800">Overall Accuracy</h3>
            <span className={`text-sm font-black ${
              accuracy >= 80 ? "text-emerald-600" :
              accuracy >= 60 ? "text-blue-600"    :
              accuracy >= 40 ? "text-amber-600"   : "text-rose-600"
            }`}>{accuracy}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full">
            <div className={`h-3 rounded-full transition-all ${
              accuracy >= 80 ? "bg-emerald-500" :
              accuracy >= 60 ? "bg-blue-500"    :
              accuracy >= 40 ? "bg-amber-500"   : "bg-rose-500"
            }`} style={{ width: `${accuracy}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-[11px] text-slate-400">{profile.totalAttempted || 0} total attempted</p>
            <button onClick={() => navigate("/progress")}
              className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold transition">
              Full report →
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-base font-black text-slate-800 mb-1">Badges Earned</h3>
          <p className="text-xs text-slate-400 mb-4">
            {profile.badges?.length || 0} of 10 badges unlocked
          </p>

          {!profile.badges?.length ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-sm text-slate-500 font-medium">No badges yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Complete quizzes and mock interviews to earn badges
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {profile.badges.map((badge, i) => (
                <div key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${badge.color} bg-opacity-50`}>
                  <span className="text-2xl shrink-0">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-bold">{badge.title}</p>
                    <p className="text-[10px] opacity-70 leading-snug mt-0.5">{badge.description}</p>
                  </div>
                </div>
              ))}

              {/* Locked badges */}
              {Array.from({ length: Math.max(0, 4 - (profile.badges?.length || 0)) }).map((_, i) => (
                <div key={`locked-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-40">
                  <span className="text-2xl shrink-0">🔒</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500">Locked</p>
                    <p className="text-[10px] text-slate-400">Keep practicing</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">⭐ Bookmarks</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile.bookmarkedNotesCount || 0} notes saved
              </p>
            </div>
            <Link to="/bookmarks"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
              View all →
            </Link>
          </div>

          {profile.bookmarkedNotesCount === 0 ? (
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">⭐</p>
              <p className="text-xs text-slate-500">No bookmarks yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Save notes while reading to find them here
              </p>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-indigo-700">
                  {profile.bookmarkedNotesCount}
                </p>
                <p className="text-xs text-indigo-500 font-medium">Notes bookmarked</p>
              </div>
              <Link to="/bookmarks"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                Open Bookmarks →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-800">Recent Activity</h3>
            <button onClick={() => navigate("/progress")}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition">
              Full history →
            </button>
          </div>

          {!profile.recentActivity?.length ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-slate-500">No activity yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Start practicing to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.recentActivity.map((a, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition">
                  <span className="text-xl shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{a.label}</p>
                    <p className="text-xs text-slate-400">{a.date}</p>
                  </div>
                  <span className="text-sm font-black text-indigo-600 shrink-0">{a.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;