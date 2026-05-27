import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart,
  Line, Legend
} from "recharts";

function Progress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();

  useEffect(() => { fetchProgress(); }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res    = await api.get(`/progress/${userId}`);
      setProgress(res.data);
    } catch {
      console.error("Progress fetch failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="h-8 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const {
    totalAttempted, totalCorrect, overallAccuracy,
    categoryStats, weakAreas,
    currentStreak, longestStreak,
    aptitudeAttempted, mcqAttempted,
    interviewQsAttempted, codeSolved,
    mockInterviewsDone, recommendations,
  } = progress;

  // Prepare chart data
  const barData = categoryStats?.map(s => ({
    name:     s.category.length > 8 ? s.category.slice(0, 8) + ".." : s.category,
    accuracy: Math.round(s.accuracy),
    attempted: s.attempted,
    module:   s.module,
  })) || [];

  const getBarColor = (accuracy) => {
    if (accuracy >= 80) return "#10b981";
    if (accuracy >= 60) return "#3b82f6";
    if (accuracy >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 px-8 pt-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">My Progress</h1>
            </div>
          </div>
          <p className="text-indigo-300 text-sm mt-2">
            Track your preparation across all modules
          </p>

          {/* Top Stats */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { label: "Total Attempted", value: totalAttempted || 0,        color: "bg-white/10 text-white"             },
              { label: "Overall Accuracy",value: `${Math.round(overallAccuracy || 0)}%`, color: "bg-emerald-500/20 text-emerald-300" },
              { label: "Current Streak",  value: `${currentStreak || 0} 🔥`,  color: "bg-amber-500/20 text-amber-300"     },
              { label: "Longest Streak",  value: `${longestStreak || 0} days`, color: "bg-violet-500/20 text-violet-300"   },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[120px]`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[11px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-6 pb-16 space-y-6">

        {/* Module Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Aptitude\nSessions",   value: aptitudeAttempted || 0,    icon: "🧠", color: "bg-violet-50 text-violet-600", path: "/quiz"      },
            { label: "Technical\nMCQ",        value: mcqAttempted || 0,          icon: "📝", color: "bg-blue-50 text-blue-600",    path: "/mcq"       },
            { label: "Interview\nQs",          value: interviewQsAttempted || 0, icon: "🎤", color: "bg-indigo-50 text-indigo-600", path: "/questions" },
            { label: "Coding\nSolved",         value: codeSolved || 0,           icon: "💻", color: "bg-emerald-50 text-emerald-600", path: "/coding"  },
            { label: "Mock\nInterviews",       value: mockInterviewsDone || 0,   icon: "🎯", color: "bg-amber-50 text-amber-600",  path: "/mock"      },
          ].map(s => (
            <div key={s.label}
              onClick={() => navigate(s.path)}
              className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md transition cursor-pointer">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mx-auto mb-2`}>
                {s.icon}
              </div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-400 font-medium whitespace-pre-line mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Weak Area Alert */}
        {weakAreas && weakAreas.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚠️</span>
              <h3 className="text-base font-black text-rose-700">Weak Areas Detected</h3>
            </div>
            <div className="space-y-2">
              {weakAreas.map(w => (
                <div key={w.category + w.module}
                  className="flex items-center justify-between bg-white rounded-xl p-3 border border-rose-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{w.category}</p>
                    <p className="text-xs text-slate-400">{w.module} • {w.attempted} attempted</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-rose-600">
                      {Math.round(w.accuracy)}%
                    </p>
                    <p className="text-[11px] text-rose-400">Below 50%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar Chart — Category Accuracy */}
        {barData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-black text-slate-800 mb-1">Category Accuracy</h3>
            <p className="text-slate-500 text-sm mb-5">How you're performing across different topics</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Accuracy"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}
                  fill="#6366f1"
                  label={{ position: "top", fontSize: 10, fill: "#94a3b8", formatter: v => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Overall Score Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-black text-slate-800 mb-4">Overall Performance</h3>
          <div className="space-y-4">
            {[
              { label: "Overall Accuracy", value: Math.round(overallAccuracy || 0), color: "bg-indigo-500" },
              ...(categoryStats || []).slice(0, 5).map(s => ({
                label: `${s.category} (${s.module})`,
                value: Math.round(s.accuracy),
                color: s.accuracy >= 80 ? "bg-emerald-500" :
                       s.accuracy >= 60 ? "bg-blue-500" :
                       s.accuracy >= 40 ? "bg-amber-500" : "bg-rose-500",
              }))
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                  <p className="text-xs font-black text-slate-700">{item.value}%</p>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full">
                  <div className={`h-2.5 rounded-full transition-all ${item.color}`}
                    style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black mb-1">🔥 Practice Streak</h3>
              <p className="text-amber-100 text-sm">Keep practicing daily to maintain your streak</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black">{currentStreak || 0}</p>
              <p className="text-amber-100 text-xs font-medium">day streak</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex gap-6">
            <div>
              <p className="text-2xl font-black">{longestStreak || 0}</p>
              <p className="text-amber-100 text-xs">Longest streak</p>
            </div>
            <div>
              <p className="text-2xl font-black">{totalAttempted || 0}</p>
              <p className="text-amber-100 text-xs">Total practiced</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎯</span>
              <div>
                <h3 className="text-base font-black text-slate-800">Recommended for You</h3>
                <p className="text-slate-500 text-xs">
                  Based on your weak areas — practice these next
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={r.id}
                  onClick={() => navigate(
                    r.type === "APTITUDE" ? "/quiz" :
                    r.type === "MCQ"      ? "/mcq"  : "/questions"
                  )}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition cursor-pointer">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 line-clamp-2">{r.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-medium">{r.category}</span>
                      <span className="text-slate-200">•</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        r.type === "APTITUDE"
                          ? "bg-violet-50 text-violet-600"
                          : r.type === "MCQ"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-indigo-50 text-indigo-600"
                      }`}>
                        {r.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-300 text-sm shrink-0">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalAttempted === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
            <p className="text-5xl mb-4">📊</p>
            <h3 className="text-lg font-bold text-slate-700">No data yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
              Start practicing in any module to see your progress here
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {[
                { label: "Take Aptitude Quiz", path: "/quiz",      color: "bg-violet-600" },
                { label: "Try Technical MCQ",  path: "/mcq",       color: "bg-blue-600"   },
                { label: "Mock Interview",      path: "/mock",      color: "bg-indigo-600" },
              ].map(b => (
                <button key={b.label} onClick={() => navigate(b.path)}
                  className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl ${b.color} hover:opacity-90 transition`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress;