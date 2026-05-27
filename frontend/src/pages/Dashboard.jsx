import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const modules = [
  { icon: "📚", title: "Notes",          path: "/notes",     gradient: "from-indigo-500 to-violet-500"  },
  { icon: "🎤", title: "Interview Qs",   path: "/questions", gradient: "from-sky-500 to-cyan-500"       },
  { icon: "🧮", title: "Aptitude Quiz",  path: "/quiz",      gradient: "from-amber-500 to-orange-500"   },
  { icon: "📝", title: "Technical MCQ",  path: "/mcq",       gradient: "from-cyan-500 to-blue-500"      },
  { icon: "💻", title: "Coding",         path: "/coding",    gradient: "from-emerald-500 to-green-500"  },
  { icon: "🎯", title: "Mock Interview", path: "/mock",      gradient: "from-violet-500 to-purple-500"  },
  { icon: "⭐", title: "Bookmarks",      path: "/bookmarks", gradient: "from-rose-500 to-pink-500"      },
];

// ── Greeting based on time of day ──
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning ☀️";
  if (h < 18) return "Good Afternoon 🌤️";
  return "Good Evening 🌙";
};

// ── Title-case a name ──
const toTitleCase = (str = "") =>
  str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

function Dashboard() {
  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [progress,       setProgress]       = useState(null);
  const [profile,        setProfile]        = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading,        setLoading]        = useState(true);

  if (!token) return <Navigate to="/login" />;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [progressRes, profileRes, aptRes, mcqRes, mockRes] =
        await Promise.all([
          api.get(`/progress/${userId}`),
          api.get(`/profile/${userId}`),
          api.get(`/quiz/history/${userId}`),
          api.get(`/mcq-sessions/history/${userId}`),
          api.get(`/mock/history/${userId}`),
        ]);

      setProgress(progressRes.data);
      setProfile(profileRes.data);

      const all = [
        ...aptRes.data.map(s => ({
          label: `Aptitude — ${s.category}`,
          score: `${s.score}/${s.total}`,
          date:  new Date(s.attemptedAt),
          icon:  "🧠",
          path:  "/quiz",
        })),
        ...mcqRes.data.map(s => ({
          label: `Technical MCQ — ${s.category}`,
          score: `${s.score}/${s.total}`,
          date:  new Date(s.attemptedAt),
          icon:  "📝",
          path:  "/mcq",
        })),
        ...mockRes.data.map(s => ({
          label: `Mock — ${s.company}`,
          score: `${s.score}/${s.total}`,
          date:  new Date(s.createdAt),
          icon:  "🎯",
          path:  `/mock/result/${s.id}`,
        })),
      ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

      setRecentActivity(all);
    } catch {
      console.error("Dashboard fetch failed");
    } finally {
      setLoading(false);
    }
  };

  // ── FIX: show "—" when no activity, not "0%" ──
  const hasActivity =
    progress?.overallAccuracy !== undefined &&
    progress?.overallAccuracy !== null &&
    progress?.totalAttempted > 0;

  const accuracyDisplay = hasActivity
    ? `${Math.round(progress.overallAccuracy)}%`
    : "—";

  const firstName = toTitleCase(profile?.name?.split(" ")[0] || "there");

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">

      {/* ── Sidebar — fixed 240px ── */}
      <div className="w-[240px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Main ── */}
      <div className="flex-1 overflow-auto">

        {/* ── Topbar — fixed 56px ── */}
        <div className="sticky top-0 h-[56px] z-30 backdrop-blur-xl bg-white/70 border-b border-white/40 shadow-sm flex items-center">
          <div className="w-full max-w-[1200px] mx-auto px-8 flex items-center justify-between">

            {/* ── FIX: greeting 15px / 500 weight ── */}
            <div>
              <p className="text-[15px] font-medium text-indigo-500 mb-0.5 leading-none">
                {greeting()}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                Welcome back,{" "}
                {/* ── FIX: title-case name ── */}
                <span className="capitalize bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {firstName}
                </span>{" "}
                👋
              </h1>
            </div>

            {/* Profile Avatar */}
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="hidden md:block text-right">
                <p className="font-semibold text-slate-700 leading-tight">
                  {toTitleCase(profile?.name || "")}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">View profile</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-30 rounded-full" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-md group-hover:scale-105 transition-all duration-300">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-[1200px] mx-auto p-8 space-y-8">

          {/* ── Hero Banner — brand gradient ── */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1e1b6e] to-[#4c2d8a] p-10 shadow-2xl">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

              <div>
                {/* ── FIX: eyebrow tracking 0.10em ── */}
                <p className="uppercase tracking-[0.10em] text-white/70 text-xs font-semibold">
                  Continue Learning
                </p>

                <h2 className="text-4xl font-bold text-white mt-3 leading-tight">
                  Keep Your Streak Alive 🚀
                </h2>

                {/* ── FIX: subtitle 14px / leading-relaxed 1.6 ── */}
                <p className="text-indigo-100/90 text-sm mt-3 max-w-2xl leading-relaxed">
                  Practice coding, aptitude, and interview preparation daily
                  to improve your placement readiness.
                </p>

                {/* Mini stats */}
                <div className="flex flex-wrap gap-4 mt-6">
                  {[
                    { label: "Accuracy", value: accuracyDisplay },
                    { label: "Streak",   value: `${progress?.currentStreak || 0} 🔥` },
                    { label: "Solved",   value: progress?.codeSolved || 0 },
                  ].map(s => (
                    <div key={s.label}
                      className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                      {/* ── FIX: label 12px opacity-75 tracking 0.10em ── */}
                      <p className="text-white/75 text-[12px] font-medium tracking-[0.10em] uppercase">
                        {s.label}
                      </p>
                      {/* ── FIX: stat number 24px font-semibold ── */}
                      <h3 className="text-[24px] font-semibold text-white mt-0.5 leading-none">
                        {s.value}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── FIX: primary filled vs secondary outlined buttons ── */}
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => navigate("/quiz")}
                  className="px-7 py-4 rounded-2xl bg-white text-[#1e1b6e] font-bold shadow-xl hover:bg-slate-50 hover:scale-105 transition-all duration-300"
                >
                  Start Quiz →
                </button>
                <button
                  onClick={() => navigate("/coding")}
                  className="px-7 py-4 rounded-2xl border-2 border-white/60 bg-transparent text-white font-bold hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  Solve Problems
                </button>
              </div>

            </div>
          </div>

          {/* ── Stat Cards — uniform padding 16px all sides ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                icon:  "🎯",
                bg:    "bg-indigo-50",
                glow:  "bg-indigo-100",
                color: "text-indigo-600",
                label: "Overall Accuracy",
                value: accuracyDisplay,
                sub:   `${progress?.totalAttempted || 0} attempts`,
                path:  "/progress",
              },
              {
                icon:  "🔥",
                bg:    "bg-amber-50",
                glow:  "bg-amber-100",
                color: "text-amber-600",
                label: "Day Streak",
                value: progress?.currentStreak || 0,
                sub:   `Best: ${progress?.longestStreak || 0} days`,
                path:  null,
              },
              {
                icon:  "💻",
                bg:    "bg-emerald-50",
                glow:  "bg-emerald-100",
                color: "text-emerald-600",
                label: "Coding Solved",
                value: progress?.codeSolved || 0,
                sub:   "Problems completed",
                path:  "/coding",
              },
              {
                icon:  "🎤",
                bg:    "bg-violet-50",
                glow:  "bg-violet-100",
                color: "text-violet-600",
                label: "Mock Interviews",
                value: progress?.mockInterviewsDone || 0,
                sub:   "Completed",
                path:  "/mock",
              },
            ].map(card => (
              <div
                key={card.label}
                onClick={() => card.path && navigate(card.path)}
                className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${card.path ? "cursor-pointer" : ""}`}
              >
                <div className={`absolute top-0 right-0 w-40 h-40 ${card.glow} blur-3xl opacity-40 pointer-events-none`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl mb-4`}>
                    {card.icon}
                  </div>
                  {/* ── FIX: label 12px tracking-wide uppercase ── */}
                  <p className="text-[12px] font-medium text-slate-500 tracking-wide uppercase">
                    {card.label}
                  </p>
                  {/* ── FIX: stat number 24px font-semibold ── */}
                  <h2 className="text-[24px] font-semibold text-slate-900 mt-1 leading-none">
                    {loading ? "—" : card.value}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Activity + Weak Areas ── */}
          {/* ── FIX: gap-8 between columns, border-t divider ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            {/* Recent Activity */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                <button
                  onClick={() => navigate("/progress")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-[0.08em]"
                >
                  View all →
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="text-5xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-slate-700">No activity yet</h3>
                  {/* ── FIX: body line-height 1.6 ── */}
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Start practicing to track your progress 🚀
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} onClick={() => navigate(a.path)}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-all duration-200 cursor-pointer hover:shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm border border-slate-100 shrink-0">
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* ── FIX: body line-height 1.6 ── */}
                        <h4 className="font-bold text-sm text-slate-800 truncate leading-relaxed">
                          {a.label}
                        </h4>
                        <p className="text-xs text-slate-400">{a.date.toLocaleDateString()}</p>
                      </div>
                      <div className="text-base font-bold text-indigo-600 whitespace-nowrap">
                        {a.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── FIX: left border divider between columns ── */}
            {/* Needs Attention */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7 xl:border-l-2 xl:border-slate-200/80">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">⚠ Needs Attention</h3>
                <button
                  onClick={() => navigate("/progress")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-[0.08em]"
                >
                  Full Report →
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : !progress?.weakAreas?.length ? (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl shadow-inner">
                    ✅
                  </div>
                  <h3 className="text-xl font-bold text-emerald-600 mt-4">No weak areas!</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    All categories are above 50%
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.weakAreas.slice(0, 4).map(w => (
                    <div key={w.category}
                      className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 truncate">{w.category}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{w.module}</p>
                      </div>
                      <div className="text-base font-bold text-rose-600 whitespace-nowrap ml-4">
                        {Math.round(w.accuracy)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Access Modules ── */}
          <div className="pt-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Quick Access</h3>
              <p className="text-slate-400 mt-1 text-sm leading-relaxed">
                Jump back into your preparation modules
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
              {modules.map(mod => (
                <Link key={mod.title} to={mod.path}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">

                  {/* ── FIX: hover background shift ── */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-all duration-300 bg-gradient-to-br ${mod.gradient}`} />

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.gradient} text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-105 transition-all duration-300`}>
                      {mod.icon}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition truncate">
                      {mod.title}
                    </h4>
                    {/* ── FIX: sub-label 12px ── */}
                    <p className="text-[12px] text-slate-400 mt-1 font-medium group-hover:translate-x-1 transition-transform duration-200">
                      Continue →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;