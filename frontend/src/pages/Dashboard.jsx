import { useEffect, useState} from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  BookOpen, MessageSquare, Award, FileText,
  Terminal, Video, Bookmark, Brain,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import api from "../services/api";

const modules = [
  { icon: <BookOpen size={20} />,      title: "Notes",          path: "/notes",     gradient: "from-indigo-500 to-violet-500"  },
  { icon: <MessageSquare size={20} />, title: "Interview Qs",   path: "/questions", gradient: "from-sky-500 to-cyan-500"       },
  { icon: <Award size={20} />,         title: "Aptitude Quiz",  path: "/quiz",      gradient: "from-amber-500 to-orange-500"   },
  { icon: <FileText size={20} />,      title: "Technical MCQ",  path: "/mcq",       gradient: "from-cyan-500 to-blue-500"      },
  { icon: <Terminal size={20} />,      title: "Coding",         path: "/coding",    gradient: "from-emerald-500 to-green-500"  },
  { icon: <Video size={20} />,         title: "Mock Interview", path: "/mock",      gradient: "from-violet-500 to-purple-500"  },
  { icon: <Bookmark size={20} />,      title: "Bookmarks",      path: "/bookmarks", gradient: "from-rose-500 to-pink-500"      },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning ☀️";
  if (h < 18) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
};


const toTitleCase = (str = "") =>
  str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

const parseDate = (s) => {
  const raw = s.attemptedAt || s.attempted_at || s.createdAt || s.created_at || s.submittedAt;
  if (!raw) return new Date(0); // epoch — sorts to bottom, shows "Recently"
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

const formatDate = (date) => {
  if (!date || isNaN(date.getTime()) || date.getFullYear() < 2000) return "Recently";
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function Dashboard() {
  const userId   = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [progress,       setProgress]       = useState(null);
  const [profile,        setProfile]        = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading,        setLoading]        = useState(true);

  const location = useLocation();

  useEffect(() => {
  if (!userId) { navigate("/login"); return; }
  fetchDashboardData();
}, [userId, location.key]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [progressRes, profileRes, aptRes, mcqRes, mockRes] = await Promise.all([
        api.get(`/progress/${userId}`),
        api.get(`/profile/${userId}`),
        api.get(`/quiz/history/${userId}`),
        api.get(`/mcq-sessions/history/${userId}`),
        api.get(`/mock/history/${userId}`),
      ]);

      setProgress(progressRes.data);
      setProfile(profileRes.data);

      const blended = [
        ...aptRes.data.map((s) => ({
          label: `Aptitude — ${s.category || "Quiz"}`,
          score: `${s.score}/${s.total}`,
          date:  parseDate(s),          
          icon:  <Brain size={18} className="text-amber-400" />,
          path:  "/quiz",
        })),
        ...mcqRes.data.map((s) => ({
          label: `Technical MCQ — ${s.category || "MCQ"}`,
          score: `${s.score}/${s.total}`,
          date:  parseDate(s),          
          icon:  <FileText size={18} className="text-cyan-400" />,
          path:  "/mcq",
        })),
        ...mockRes.data.map((s) => ({
          label: `Mock Interview — ${s.company || s.setTitle || "Mock"}`,
          score: `${s.score}/${s.total}`,
          date:  parseDate(s),          
          icon:  <Video size={18} className="text-violet-400" />,
          path:  `/mock/result/${s.id}`,
        })),
      ]
        .filter(a => a.date.getTime() > 0)     
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

      setRecentActivity(blended);

    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const hasActivity     = progress?.totalAttempted > 0;
  const accuracyDisplay = hasActivity ? `${Math.round(progress.overallAccuracy)}%` : "—";
  const firstName       = toTitleCase(profile?.name?.split(" ")[0] || "User");

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
  );

  return (
    <div className="space-y-8 w-full pb-12 min-w-0 overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-400 mb-1">
            {getGreeting()}
          </p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back,
            <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent font-black"> {firstName}</span> 👋
          </h1>
        </div>

        <div onClick={() => navigate("/profile")}
          className="flex items-center gap-3.5 cursor-pointer group select-none">
          <div className="hidden sm:block text-right leading-tight">
            {loading ? <Skeleton className="h-4 w-28" /> : (
              <>
                <p className="font-bold text-sm text-slate-200 tracking-tight">{toTitleCase(profile?.name || "")}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 group-hover:text-indigo-400 transition-colors">View profile</p>
              </>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-lg group-hover:scale-[1.03] transition-transform">
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#12143a] to-[#281a54] p-8 md:p-10 shadow-lg shadow-indigo-950/20">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <span className="uppercase tracking-[0.15em] text-indigo-400 text-xs font-black bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full">
              Placement Prep
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Keep Your Streak Alive 🚀
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed font-medium">
              Stay consistent across coding, quizzes, and mock interviews — every day counts.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { label: "Accuracy",    value: accuracyDisplay                      },
                { label: "Day Streak",  value: `${progress?.currentStreak || 0} 🔥` },
                { label: "Code Solved", value: progress?.codeSolved || 0             },
              ].map((s) => (
                <div key={s.label}
                  className="bg-white/[0.06] border border-white/[0.08] backdrop-blur-md rounded-xl px-5 py-3 min-w-[120px]">
                  <p className="text-slate-400 text-[10px] font-bold tracking-[0.12em] uppercase">{s.label}</p>
                  <h3 className="text-xl font-bold text-white mt-1 tracking-tight">{loading ? "—" : s.value}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate("/quiz")}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-500/20">
              Start Timed Quiz
            </button>
            <button onClick={() => navigate("/coding")}
              className="px-6 py-3.5 rounded-xl border border-white/20 bg-white/[0.06] text-slate-200 font-bold text-sm hover:bg-white/[0.12] transition-colors">
              Solve Challenges
            </button>
          </div>
        </div>
      </section>

      {/* ── METRIC CARDS ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: "Overall Accuracy", value: accuracyDisplay,                       sub: `${progress?.totalAttempted || 0} total attempts`, color: "from-indigo-500 to-indigo-600", path: "/progress" },
          { label: "Current Streak",   value: `${progress?.currentStreak || 0} 🔥`,  sub: `Best: ${progress?.longestStreak || 0} days`,       color: "from-amber-500 to-orange-500",  path: null        },
          { label: "Code Problems",    value: progress?.codeSolved || 0,             sub: "Problems solved",                                   color: "from-emerald-500 to-teal-500",  path: "/coding"   },
          { label: "Mock Interviews",  value: progress?.mockInterviewsDone || 0,     sub: "Sessions completed",                                color: "from-purple-500 to-violet-500", path: "/mock"     },
        ].map((card, idx) => (
          <div key={idx}
            onClick={() => card.path && navigate(card.path)}
            className={`bg-[#0d0f28] border border-white/[0.06] p-5 rounded-2xl relative overflow-hidden transition-all duration-200 ${
              card.path ? "cursor-pointer hover:border-indigo-500/30 hover:bg-[#111438]" : ""
            }`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${card.color}`} />
            <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">{card.label}</p>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">{loading ? "—" : card.value}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5">{card.sub}</p>
          </div>
        ))}
      </section>

      {/* ── ACTIVITY + WEAK AREAS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">

        {/* Recent Activity */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6 h-full">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
            <button onClick={() => navigate("/progress")}
              className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
              View All →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center border border-white/[0.05] bg-white/[0.02] rounded-xl">
              <p className="text-slate-500 text-sm">No activity yet. Start a quiz to see results here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((a, i) => (
                <div key={i} onClick={() => navigate(a.path)}
                  className="group flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                      {a.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-200 truncate tracking-tight">{a.label}</h4>
                      {/* FIX: formatDate now correctly defined at module level */}
                      <p className="text-[10px] text-slate-600 font-medium mt-0.5">{formatDate(a.date)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md shrink-0 ml-2">
                    {a.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6 h-full">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">Weak Areas</h3>
            <button onClick={() => navigate("/progress")}
              className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
              Full Report →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !progress?.weakAreas?.length ? (
            <div className="py-10 text-center flex flex-col items-center justify-center border border-emerald-500/20 bg-emerald-500/[0.04] rounded-xl">
              <CheckCircle2 size={28} className="text-emerald-400" />
              <h4 className="text-sm font-bold text-emerald-300 mt-2">All clear!</h4>
              <p className="text-xs text-slate-500 mt-0.5">All modules are performing well.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {progress.weakAreas.slice(0, 4).map((w, idx) => (
                <div key={idx}
                  className="p-3.5 bg-rose-500/[0.05] border border-rose-500/20 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-rose-400 shrink-0" />
                      <h4 className="font-bold text-xs text-slate-200 truncate">{w.category}</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold tracking-wider uppercase mt-1">{w.module}</p>
                  </div>
                  <span className="text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md shrink-0 ml-2">
                    {Math.round(w.accuracy)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACCESS ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">Quick Access</h3>
          <p className="text-xs text-slate-500 font-medium">Jump straight into any module.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {modules.map((mod, idx) => (
            <Link key={idx} to={mod.path}
              className="group relative overflow-hidden bg-[#0d0f28] border border-white/[0.06] p-5 rounded-xl hover:border-indigo-500/30 hover:bg-[#111438] transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {mod.icon}
              </div>
              <h4 className="text-sm font-black text-slate-300 text-center leading-snug tracking-tight group-hover:text-white transition-colors">
                {mod.title}
              </h4>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Dashboard;