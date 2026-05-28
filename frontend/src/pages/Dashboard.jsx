import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BookOpen, MessageSquare, Award, FileText, Terminal, 
  Video, Bookmark, Brain, CheckCircle2, AlertTriangle, ChevronRight 
} from "lucide-react";
import api from "../services/api";

const modules = [
  { icon: <BookOpen size={20} />, title: "Notes", path: "/notes", gradient: "from-indigo-500 to-violet-500", glow: "indigo" },
  { icon: <MessageSquare size={20} />, title: "Interview Qs", path: "/questions", gradient: "from-sky-500 to-cyan-500", glow: "sky" },
  { icon: <Award size={20} />, title: "Aptitude Quiz", path: "/quiz", gradient: "from-amber-500 to-orange-500", glow: "amber" },
  { icon: <FileText size={20} />, title: "Technical MCQ", path: "/mcq", gradient: "from-cyan-500 to-blue-500", glow: "cyan" },
  { icon: <Terminal size={20} />, title: "Coding", path: "/coding", gradient: "from-emerald-500 to-green-500", glow: "emerald" },
  { icon: <Video size={20} />, title: "Mock Interview", path: "/mock", gradient: "from-violet-500 to-purple-500", glow: "violet" },
  { icon: <Bookmark size={20} />, title: "Bookmarks", path: "/bookmarks", gradient: "from-rose-500 to-pink-500", glow: "rose" },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning ☀️";
  if (h < 18) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
};

const toTitleCase = (str = "") =>
  str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

function Dashboard() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchDashboardRuntimeData();
  }, [userId]);

  const fetchDashboardRuntimeData = async () => {
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

      const blendedActivity = [
        ...aptRes.data.map(s => ({
          label: `Aptitude — ${s.category}`,
          score: `${s.score}/${s.total}`,
          date: new Date(s.attemptedAt),
          icon: <Brain size={18} className="text-amber-500" />,
          path: "/quiz",
        })),
        ...mcqRes.data.map(s => ({
          label: `Technical MCQ — ${s.category}`,
          score: `${s.score}/${s.total}`,
          date: new Date(s.attemptedAt),
          icon: <FileText size={18} className="text-cyan-500" />,
          path: "/mcq",
        })),
        ...mockRes.data.map(s => ({
          label: `Mock Interview — ${s.company}`,
          score: `${s.score}/${s.total}`,
          date: new Date(s.createdAt),
          icon: <Video size={18} className="text-violet-500" />,
          path: `/mock/result/${s.id}`,
        })),
      ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

      setRecentActivity(blendedActivity);
    } catch (err) {
      console.error("Dashboard multi-resource sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  const hasActivity = progress?.overallAccuracy !== undefined && progress?.overallAccuracy !== null && progress?.totalAttempted > 0;
  const accuracyDisplay = hasActivity ? `${Math.round(progress.overallAccuracy)}%` : "—";
  const firstName = toTitleCase(profile?.name?.split(" ")[0] || "User");

  return (
    // Explicit removal of sidebars wraps. Content dynamically covers 100% space provided by layout layout canvas.
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* ── TOP NAV HEADER STATUS BAR ── */}
      <header className="flex items-center justify-between border-b border-slate-200/60 pb-5">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-1">
            {getGreeting()}
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-black">{firstName}</span> 👋
          </h1>
        </div>

        <div onClick={() => navigate("/profile")} className="flex items-center gap-3.5 cursor-pointer group select-none">
          <div className="hidden sm:block text-right leading-tight">
            {loading ? (
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            ) : (
              <>
                <p className="font-bold text-sm text-slate-800 tracking-tight">{toTitleCase(profile?.name || "")}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5 group-hover:text-indigo-600 transition-colors">View performance profile</p>
              </>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-100 group-hover:scale-[1.03] transition-all">
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO METRIC BANNER ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#12143a] to-[#281a54] p-8 md:p-10 shadow-lg shadow-indigo-950/20">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <span className="uppercase tracking-[0.15em] text-indigo-400 text-xs font-black bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full">
              Placement Blueprint Engine
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Keep Your Streak Alive 🚀
            </h2>
            <p className="text-slate-300 text-[14px] max-w-xl leading-relaxed font-medium">
              Maintain daily incremental consistency across functional coding domains, logic blocks, and mock workflows to max out candidate hiring probability.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { label: "Accuracy", value: accuracyDisplay },
                { label: "Streak Metric", value: `${progress?.currentStreak || 0} Days` },
                { label: "Code Items Solved", value: progress?.codeSolved || 0 },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.04] border border-white/5 backdrop-blur-md rounded-xl px-5 py-3 min-w-[120px]">
                  <p className="text-slate-400 text-[10px] font-bold tracking-[0.12em] uppercase">{s.label}</p>
                  <h3 className="text-xl font-bold text-white mt-1 tracking-tight">{loading ? "—" : s.value}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col lg:flex-row gap-3.5 shrink-0">
            <button
              onClick={() => navigate("/quiz")}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-950/40 hover:scale-[1.02] transition-all"
            >
              Start Timed Quiz
            </button>
            <button
              onClick={() => navigate("/coding")}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-slate-700/60 bg-slate-900/40 hover:bg-slate-900/80 text-slate-200 hover:text-white font-bold text-sm hover:scale-[1.02] transition-all"
            >
              Solve Challenges
            </button>
          </div>
        </div>
      </div>

      {/* ── METRICS GRID OVERVIEW ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Overall System Accuracy", value: accuracyDisplay, sub: `${progress?.totalAttempted || 0} total attempts`, color: "from-indigo-500 to-indigo-600", path: "/progress" },
          { label: "Current System Streak", value: `${progress?.currentStreak || 0} 🔥`, sub: `Personal best: ${progress?.longestStreak || 0} days`, color: "from-amber-500 to-orange-500", path: null },
          { label: "Algorithmic Challenges", value: progress?.codeSolved || 0, sub: "Verified structural responses", color: "from-emerald-500 to-teal-500", path: "/coding" },
          { label: "Corporate Simulations", value: progress?.mockInterviewsDone || 0, sub: "Mock sessions finalized", color: "from-purple-500 to-violet-500", path: "/mock" },
        ].map((card, idx) => (
          <div
            key={idx}
            onClick={() => card.path && navigate(card.path)}
            className={`bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-200
              ${card.path ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""}`}
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${card.color}`} />
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{card.label}</p>
            <h2 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">{loading ? "—" : card.value}</h2>
            <p className="text-xs text-slate-400 font-medium mt-1.5">{card.sub}</p>
          </div>
        ))}
      </section>

      {/* ── DECOUPLED COLLATERAL ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RECENT FEEDBLOCK */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Execution Streams</h3>
            <button onClick={() => navigate("/progress")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
              Audit Logs →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-sm text-slate-400 font-medium">No activity items flagged in this frame cycle.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((a, i) => (
                <div key={i} onClick={() => navigate(a.path)} className="group flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-200/40 hover:border-indigo-200/80 hover:bg-indigo-50/20 rounded-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center shadow-sm shrink-0">
                      {a.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate tracking-tight">{a.label}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{a.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{a.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POLISHED WEAK AREAS PANEL */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Vulnerability Vector Analysis</h3>
            <button onClick={() => navigate("/progress")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
              Metrics Core →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !progress?.weakAreas?.length ? (
            <div className="py-10 text-center flex flex-col items-center justify-center border border-emerald-100 bg-emerald-50/20 rounded-xl">
              <CheckCircle2 size={28} className="text-emerald-500" />
              <h4 className="text-sm font-bold text-emerald-800 tracking-tight mt-2">Zero Platform Vulnerabilities</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">All structural modules trace output limits above 50%.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {progress.weakAreas.slice(0, 4).map((w, idx) => (
                <div key={idx} className="p-3.5 bg-rose-50/30 border border-rose-100/70 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      <h4 className="font-bold text-xs text-slate-800 truncate tracking-tight">{w.category}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">{w.module}</p>
                  </div>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-100/80 px-2.5 py-1 rounded-md">
                    {Math.round(w.accuracy)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── QUICK LINKED CARDS INTERACTION GRID ── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Direct Component Routing</h3>
          <p className="text-xs text-slate-400 font-medium">Instantly fast-forward your execution path context inside targeted preparation tracks.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {modules.map((mod, idx) => (
            <Link 
              key={idx} 
              to={mod.path}
              className="group relative overflow-hidden bg-white border border-slate-200/60 p-4.5 rounded-xl hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between min-h-[140px]"
            >
              {/* Reflow hover grid vectors */}
              <div className={`absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-br ${mod.gradient} opacity-[0.02] group-hover:opacity-[0.08] rounded-full transition-opacity duration-300`} />
              
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${mod.gradient} text-white flex items-center justify-center shadow-md shadow-${mod.glow}-500/20 group-hover:scale-105 transition-transform`}>
                {mod.icon}
              </div>
              
              <div className="mt-4">
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors truncate tracking-tight">
                  {mod.title}
                </h4>
                <div className="flex items-center gap-0.5 text-[11px] text-slate-400 font-bold mt-1 tracking-wide uppercase">
                  <span>Resume</span>
                  <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Dashboard;