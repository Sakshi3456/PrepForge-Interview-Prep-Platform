import { useEffect, useState } from "react";
import {
  Target, Activity, Edit3, X, Terminal, Video,
  GraduationCap, Check, BookOpen, Trophy, Flame,
  MessageSquare, Link2, ExternalLink, ChevronRight,
  Star, TrendingUp, Award
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const TARGET_ROLES = [
  "Java Developer", "React Developer", "Full Stack Developer",
  "Python Developer", "Data Analyst", "DevOps Engineer",
  "Android Developer", "General / Not decided",
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition";
const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

// ── Accuracy ring SVG ─────────────────────────────────────────────────────────
const AccuracyRing = ({ value }) => {
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - value / 100);
  const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#f43f5e";
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={15} fontWeight={800} fill="white">{value}%</text>
    </svg>
  );
};

// ── Streak flame bar ──────────────────────────────────────────────────────────
const StreakBar = ({ streak }) => {
  const days = ["M","T","W","T","F","S","S"];
  // Color the last `streak` days filled
  const filled = Math.min(streak, 7);
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
            i < filled
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : "bg-white/[0.04] border border-white/[0.06] text-slate-600"
          }`}>
            {i < filled ? "🔥" : d}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Quick links (shortcuts to modules) ───────────────────────────────────────
const shortcuts = [
  { icon: <BookOpen size={15}/>,    label: "Study Notes",       path: "/notes",     color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { icon: <Terminal size={15}/>,    label: "Coding Practice",   path: "/coding",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { icon: <MessageSquare size={15}/>,label:"Interview Q&A",     path: "/questions", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { icon: <Video size={15}/>,       label: "Mock Interview",    path: "/mock",      color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { icon: <Trophy size={15}/>,      label: "Aptitude Quiz",     path: "/quiz",      color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { icon: <Star size={15}/>,        label: "Saved Bookmarks",   path: "/bookmarks", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
];

// ── Achievement badges (unlocked based on stats) ─────────────────────────────
const getBadges = (profile) => [
  {
    icon: "🔥", label: "7-Day Streak",
    unlocked: (profile?.currentStreak || 0) >= 7,
    desc: "Practice 7 days in a row"
  },
  {
    icon: "💻", label: "Code Warrior",
    unlocked: (profile?.codeSolved || 0) >= 10,
    desc: "Solve 10 coding problems"
  },
  {
    icon: "🎯", label: "Sharp Shooter",
    unlocked: Math.round(profile?.overallAccuracy || 0) >= 80,
    desc: "Achieve 80%+ accuracy"
  },
  {
    icon: "🎤", label: "Interview Ready",
    unlocked: (profile?.mockInterviewsDone || 0) >= 3,
    desc: "Complete 3 mock interviews"
  },
  {
    icon: "⭐", label: "Star Student",
    unlocked: (profile?.codeSolved || 0) >= 5 && Math.round(profile?.overallAccuracy || 0) >= 60,
    desc: "Solve 5 problems with 60%+ accuracy"
  },
  {
    icon: "🏆", label: "PrepForge Elite",
    unlocked: (profile?.currentStreak || 0) >= 14 && Math.round(profile?.overallAccuracy || 0) >= 75,
    desc: "14-day streak + 75% accuracy"
  },
];

function Profile() {
  const userId = localStorage.getItem("userId");

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | edit | badges

  const [form, setForm] = useState({
    name: "", targetRole: "", college: "", bio: "",
    githubUrl: "", linkedinUrl: "",
  });

  useEffect(() => { fetchProfile(); }, []);

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
        githubUrl:   res.data.githubUrl   || "",
        linkedinUrl: res.data.linkedinUrl || "",
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/profile/${userId}`, form);
      setEditMode(false);
      setActiveTab("overview");
      fetchProfile();
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-16 animate-pulse">
        <div className="h-44 bg-white/[0.04] rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/[0.03] rounded-2xl border border-white/[0.05]" />)}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const accuracy = Math.round(profile.overallAccuracy || 0);
  const badges   = getBadges(profile);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  // Placement readiness score (simple formula)
  const readinessScore = Math.min(100, Math.round(
    (accuracy * 0.4) +
    (Math.min(profile.codeSolved || 0, 20) * 2) +
    (Math.min(profile.mockInterviewsDone || 0, 5) * 4) +
    (Math.min(profile.currentStreak || 0, 7) * 1.5)
  ));
  const readinessLabel = readinessScore >= 80 ? "Placement Ready 🚀" : readinessScore >= 50 ? "Making Progress 📈" : "Just Getting Started 💪";
  const readinessColor = readinessScore >= 80 ? "from-emerald-500 to-teal-500" : readinessScore >= 50 ? "from-amber-500 to-orange-500" : "from-indigo-500 to-violet-500";

  return (
    <div className="space-y-6 pb-16 relative max-w-[1200px] mx-auto">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1035] via-[#151848] to-[#1a1250] p-7 shadow-xl border border-white/[0.05]">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/8 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-500/30">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#0e1035] rounded-full" />
          </div>

          {/* Identity */}
          <div className="flex-1 space-y-1.5">
            {/* FIX: "Verified Candidate Matrix" → plain label */}
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
              Student Profile
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">{profile.name}</h1>
            <p className="text-slate-400 text-xs">{profile.email}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {profile.targetRole && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wide">
                  <Target size={10} className="text-indigo-400" />{profile.targetRole}
                </span>
              )}
              {profile.college && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wide">
                  <GraduationCap size={11} className="text-purple-400" />{profile.college}
                </span>
              )}
              {/* Badge count pill */}
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wide">
                <Trophy size={10} className="text-amber-400" />{unlockedCount}/{badges.length} Badges
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">{profile.bio}</p>
            )}

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                  <ExternalLink size={12}/> GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                  <ExternalLink size={12}/> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* FIX: "Modify Credentials" → "Edit Profile" */}
          <button onClick={() => { setActiveTab(activeTab === "edit" ? "overview" : "edit"); setEditMode(!editMode); }}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              editMode
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                : "bg-white/[0.05] border-white/10 text-white hover:bg-white/[0.10]"
            }`}>
            {editMode ? <X size={13}/> : <Edit3 size={13}/>}
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* ── STAT CARDS — dark theme ── */}
      {/* FIX: white bg-white cards → dark bg-[#0d0f28] matching app theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Accuracy ring card */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-emerald-500/20 transition-all">
          <AccuracyRing value={accuracy} />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Accuracy</p>
        </div>

        {/* Streak card */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5 hover:border-amber-500/20 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-amber-400" />
            <p className="text-2xl font-black text-white">{profile.currentStreak || 0}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Day Streak</p>
          <StreakBar streak={profile.currentStreak || 0} />
        </div>

        {/* Coding solved */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Terminal size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{profile.codeSolved || 0}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Problems Solved</p>
        </div>

        {/* Mock interviews */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5 hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Video size={16} className="text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{profile.mockInterviewsDone || 0}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Mock Interviews</p>
        </div>
      </div>

      {/* ── PLACEMENT READINESS METER (NEW) ── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placement Readiness</p>
            <p className="text-sm font-bold text-white mt-0.5">{readinessLabel}</p>
          </div>
          <span className="text-2xl font-black text-white">{readinessScore}%</span>
        </div>
        <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${readinessColor} rounded-full transition-all duration-700`}
            style={{ width: `${readinessScore}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-slate-600">Based on accuracy, problems solved, streaks & mock interviews</p>
          <Link to="/progress" className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-0.5">
            View analytics <ChevronRight size={10}/>
          </Link>
        </div>
      </div>

      {/* ── TABS ── */}
      {!editMode && (
        <div className="flex gap-1.5 border-b border-white/[0.05] pb-0">
          {[["overview","Overview"],["badges","Badges & Goals"],["shortcuts","Quick Access"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                activeTab === id
                  ? "text-white border-indigo-500"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === "overview" && !editMode && (
        <div className="space-y-4">

          {/* Recent activity feed (static based on data) */}
          <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={15} className="text-indigo-400"/>
              Recent Activity
            </h3>
            {(profile.codeSolved || 0) === 0 && (profile.mockInterviewsDone || 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No activity yet</p>
                <p className="text-slate-600 text-xs mt-1">Start practicing to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(profile.codeSolved || 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/[0.05] border border-emerald-500/10 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Terminal size={14} className="text-emerald-400"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Solved {profile.codeSolved} coding problems</p>
                      <p className="text-[10px] text-slate-500">Keep going! Target: 50 problems</p>
                    </div>
                    <div className="ml-auto text-[10px] text-emerald-400 font-bold">+XP</div>
                  </div>
                )}
                {(profile.mockInterviewsDone || 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-500/[0.05] border border-purple-500/10 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Video size={14} className="text-purple-400"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Completed {profile.mockInterviewsDone} mock interview{profile.mockInterviewsDone > 1 ? "s" : ""}</p>
                      <p className="text-[10px] text-slate-500">Target: 10 mock interviews</p>
                    </div>
                    <div className="ml-auto text-[10px] text-purple-400 font-bold">+XP</div>
                  </div>
                )}
                {(profile.currentStreak || 0) > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/[0.05] border border-amber-500/10 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Flame size={14} className="text-amber-400"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{profile.currentStreak}-day practice streak</p>
                      <p className="text-[10px] text-slate-500">
                        {profile.currentStreak >= 7 ? "🏆 Amazing! You're on fire!" : `${7 - profile.currentStreak} more days to unlock 7-day badge`}
                      </p>
                    </div>
                    <div className="ml-auto text-[10px] text-amber-400 font-bold">🔥</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Goals checklist */}
          <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-indigo-400"/>
              Your Goals
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Solve 10 coding problems",   done: (profile.codeSolved || 0) >= 10,   progress: Math.min(profile.codeSolved || 0, 10),  total: 10,  color: "bg-emerald-500" },
                { label: "Complete 5 mock interviews",  done: (profile.mockInterviewsDone || 0) >= 5, progress: Math.min(profile.mockInterviewsDone || 0, 5), total: 5, color: "bg-purple-500" },
                { label: "Reach 70% accuracy",         done: accuracy >= 70,                    progress: Math.min(accuracy, 70),                  total: 70,  color: "bg-indigo-500" },
                { label: "Maintain a 7-day streak",    done: (profile.currentStreak || 0) >= 7,  progress: Math.min(profile.currentStreak || 0, 7),  total: 7,   color: "bg-amber-500" },
              ].map((goal, i) => (
                <div key={i} className={`p-3 rounded-xl border transition-all ${goal.done ? "bg-emerald-500/[0.05] border-emerald-500/15" : "bg-white/[0.02] border-white/[0.05]"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${goal.done ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`}>
                        {goal.done && <Check size={9} className="text-white"/>}
                      </div>
                      <span className={`text-xs font-medium ${goal.done ? "text-emerald-300 line-through" : "text-slate-300"}`}>{goal.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{goal.progress}/{goal.total}</span>
                  </div>
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden ml-6">
                    <div className={`h-full ${goal.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(goal.progress / goal.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: BADGES ── */}
      {activeTab === "badges" && !editMode && (
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award size={15} className="text-amber-400"/>
              Badges & Achievements
            </h3>
            <span className="text-xs text-slate-500">{unlockedCount}/{badges.length} unlocked</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((badge, i) => (
              <div key={i} className={`p-4 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? "bg-amber-500/[0.07] border-amber-500/25 shadow-lg shadow-amber-500/5"
                  : "bg-white/[0.02] border-white/[0.05] opacity-50 grayscale"
              }`}>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className={`text-xs font-bold mb-1 ${badge.unlocked ? "text-amber-300" : "text-slate-500"}`}>
                  {badge.label}
                </p>
                <p className="text-[10px] text-slate-600">{badge.desc}</p>
                {badge.unlocked && (
                  <span className="inline-block mt-2 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    ✓ Unlocked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: QUICK ACCESS ── */}
      {activeTab === "shortcuts" && !editMode && (
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Link2 size={15} className="text-indigo-400"/>
            Quick Access
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {shortcuts.map((s, i) => (
              <Link key={i} to={s.path}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg ${s.color}`}>
                <div className="shrink-0">{s.icon}</div>
                <span className="text-xs font-bold">{s.label}</span>
                <ChevronRight size={12} className="ml-auto opacity-50"/>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE FORM ── */}
      {editMode && (
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.05]">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
            {/* FIX: "Profile Console / Modify Profile Matrix Parameters" → "Edit Profile" */}
            <h3 className="font-bold text-sm text-white">Edit Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* FIX: "Full Runtime Name" → "Full Name" */}
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Your full name"
                className={inputCls} />
            </div>

            <div>
              {/* FIX: "Target Objective Role" → "Target Role" */}
              <label className={labelCls}>Target Role</label>
              <select value={form.targetRole}
                onChange={e => setForm({...form, targetRole: e.target.value})}
                className={inputCls + " appearance-none"}>
                <option value="" className="bg-[#0d0f28]">Select your target role</option>
                {TARGET_ROLES.map(r => <option key={r} className="bg-[#0d0f28]">{r}</option>)}
              </select>
            </div>

            <div>
              {/* FIX: "Academic Institute / College" → "College" */}
              <label className={labelCls}>College</label>
              <input type="text" value={form.college}
                onChange={e => setForm({...form, college: e.target.value})}
                placeholder="Your college or university"
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>GitHub URL</label>
              <input type="url" value={form.githubUrl}
                onChange={e => setForm({...form, githubUrl: e.target.value})}
                placeholder="https://github.com/username"
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>LinkedIn URL</label>
              <input type="url" value={form.linkedinUrl}
                onChange={e => setForm({...form, linkedinUrl: e.target.value})}
                placeholder="https://linkedin.com/in/username"
                className={inputCls} />
            </div>

            <div className="md:col-span-2">
              {/* FIX: "Professional Brief / Bio" → "Bio" */}
              {/* FIX: placeholder "Describe your architectural experience baseline..." → human */}
              <label className={labelCls}>Bio <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
              <textarea value={form.bio}
                onChange={e => setForm({...form, bio: e.target.value})}
                rows={3} placeholder="Tell us a bit about yourself and your placement goals..."
                className={inputCls + " resize-none"} />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-white/[0.05] justify-end">
            <button onClick={() => { setEditMode(false); setActiveTab("overview"); }}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:bg-white/[0.08] transition-colors">
              Cancel
            </button>
            {/* FIX: "Commit Parameter Changes" → "Save changes" */}
            <button onClick={saveProfile} disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
              {saving
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <Check size={13}/>}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;