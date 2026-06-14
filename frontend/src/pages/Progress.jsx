import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { TrendingUp, Target, Flame, Activity, BookOpen, ChevronRight, Award } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

// ── Custom dark tooltip for charts ───────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0f28] border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-slate-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name === "Accuracy" ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

function Progress() {
  const [progress, setProgress] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchProgress(); }, []);

  const fetchProgress = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/progress/${userId}`);
      setProgress(res.data);
    } catch (err) {
      console.error("Failed to load progress", err);
    } finally {
      setLoading(false);
    }
  };

  const insights = useMemo(() => {
    if (!progress?.categoryStats?.length) return null;
    const sorted = [...progress.categoryStats].sort((a, b) => b.accuracy - a.accuracy);
    return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
  }, [progress]);

  if (loading) {
    return (
      <div className="space-y-6 pb-16 animate-pulse">
        <div className="h-44 bg-white/[0.04] rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/[0.03] rounded-2xl" />)}
        </div>
        <div className="h-80 bg-white/[0.03] rounded-2xl" />
      </div>
    );
  }

  if (!progress) return (
    <div className="text-center py-20">
      <p className="text-slate-400 text-sm">No progress data found.</p>
      <p className="text-slate-600 text-xs mt-1">Start practicing to see your analytics here.</p>
    </div>
  );

  const accuracy = Math.round(progress.overallAccuracy || 0);

  // Bar colors by accuracy
  const barColor = (val) => val >= 80 ? "#10b981" : val <= 40 ? "#f43f5e" : "#8b5cf6";

  // Weekly sessions mock data (replace with real backend data if available)
  const weekData = [
    { day: "Mon", sessions: progress.mondaySessions  || 0 },
    { day: "Tue", sessions: progress.tuesdaySessions || 0 },
    { day: "Wed", sessions: progress.wednesdaySessions || 0 },
    { day: "Thu", sessions: progress.thursdaySessions || 0 },
    { day: "Fri", sessions: progress.fridaySessions  || 0 },
    { day: "Sat", sessions: progress.saturdaySessions || 0 },
    { day: "Sun", sessions: progress.sundaySessions  || 0 },
  ];

  const hasWeekData = weekData.some(d => d.sessions > 0);

  return (
    <div className="space-y-6 pb-16 max-w-[1200px] mx-auto">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1035] via-[#151848] to-[#1a1250] p-7 border border-white/[0.05]">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            {/* FIX: "PrepForge Verification Matrix" → "Learning Analytics" */}
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">Your Progress</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Learning Analytics</h1>
            {/* FIX: Jargon description → plain English */}
            <p className="text-slate-400 text-sm mt-1.5 max-w-md leading-relaxed">
              Track your accuracy, streaks, and performance across every topic.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex gap-3 flex-wrap shrink-0">
            <div className="border border-white/[0.07] bg-white/[0.03] rounded-xl px-5 py-3.5 text-center min-w-[100px]">
              <p className="text-2xl font-black text-white leading-none">{progress.totalAttempted || 0}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">Questions</p>
            </div>
            <div className="border border-emerald-500/20 bg-emerald-500/[0.05] rounded-xl px-5 py-3.5 text-center min-w-[100px]">
              <p className="text-2xl font-black text-emerald-400 leading-none">{accuracy}%</p>
              <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider mt-1.5">Accuracy</p>
            </div>
            <div className="border border-amber-500/20 bg-amber-500/[0.05] rounded-xl px-5 py-3.5 text-center min-w-[100px]">
              <p className="text-2xl font-black text-amber-400 leading-none">{progress.currentStreak || 0} 🔥</p>
              <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider mt-1.5">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── INSIGHT CARDS — dark theme ── */}
      {/* FIX: "bg-white" → "bg-[#0d0f28]" dark cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0d0f28] border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl shrink-0">
              <TrendingUp className="text-emerald-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Strongest Topic</p>
              <h4 className="text-sm font-bold text-white">{insights.strongest.category}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {insights.strongest.accuracy}% accuracy — keep it up!
              </p>
            </div>
          </div>

          <div className="bg-[#0d0f28] border border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl shrink-0">
              <Target className="text-rose-400" size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Needs Work</p>
              <h4 className="text-sm font-bold text-white">{insights.weakest.category}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {insights.weakest.accuracy}% accuracy — review the notes for this topic.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Accuracy bar chart ── */}
        <div className="lg:col-span-2 bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
            {/* FIX: "Metrics Matrix / Topic Evaluation" → "Accuracy by Topic" */}
            <h3 className="font-bold text-sm text-white">Accuracy by Topic</h3>
          </div>

          {(!progress.categoryStats || progress.categoryStats.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Activity size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No data yet</p>
              <p className="text-slate-600 text-xs mt-1">Complete some quizzes to see your topic breakdown</p>
              <Link to="/quiz" className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Start practicing <ChevronRight size={12}/>
              </Link>
            </div>
          ) : (
            <div className="w-full" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={280}>
                <BarChart data={progress.categoryStats} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false}
                    tickLine={false} dx={-5} domain={[0, 100]} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="accuracy" name="Accuracy" radius={[6, 6, 0, 0]} barSize={40}>
                    {(progress.categoryStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColor(entry.accuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            {[["#10b981","≥ 80% (Strong)"],["#8b5cf6","41–79% (Good)"],["#f43f5e","≤ 40% (Review"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action plan ── */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Award size={15} className="text-amber-400" />
            {/* FIX: "Suggested Action Plan" — label kept, it's clear */}
            <h3 className="font-bold text-sm text-white">Action Plan</h3>
          </div>

          <div className="space-y-4 flex-1">
            {/* Weakest topic review */}
            <div className="border-l-2 border-rose-500/40 pl-4 py-1">
              <h4 className="text-xs font-bold text-slate-200 mb-1">
                Review {insights?.weakest.category || "weak topics"}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Read the study notes for this topic to fill in the gaps.
              </p>
              <Link to="/notes" className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-1.5 transition-colors">
                <BookOpen size={10}/>Open Notes
              </Link>
            </div>

            {/* Streak */}
            <div className="border-l-2 border-amber-500/40 pl-4 py-1">
              <h4 className="text-xs font-bold text-slate-200 mb-1">
                Keep your {progress.currentStreak || 0}-day streak
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Solve at least one question today to keep your streak alive.
              </p>
              <Link to="/coding" className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-1.5 transition-colors">
                <ChevronRight size={10}/>Practice Now
              </Link>
            </div>

            {/* Push limits */}
            <div className="border-l-2 border-indigo-500/40 pl-4 py-1">
              <h4 className="text-xs font-bold text-slate-200 mb-1">
                Push your limits in {insights?.strongest.category || "your best topic"}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Try a hard-level question in your strongest area.
              </p>
              <Link to="/quiz" className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-1.5 transition-colors">
                <ChevronRight size={10}/>Start Quiz
              </Link>
            </div>

            {/* Mock interview */}
            <div className="border-l-2 border-purple-500/40 pl-4 py-1">
              <h4 className="text-xs font-bold text-slate-200 mb-1">
                Try a mock interview
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Simulate a real placement round with instant feedback.
              </p>
              <Link to="/mock" className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 mt-1.5 transition-colors">
                <ChevronRight size={10}/>Go to Mock
              </Link>
            </div>
          </div>

          <Link to="/mock"
            className="w-full mt-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all text-center shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
            Start Mock Test
          </Link>
        </div>
      </div>

      {/* ── Weekly activity chart (if data available) ── */}
      {hasWeekData && (
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            <h3 className="font-bold text-sm text-white">This Week</h3>
          </div>
          <div>
              <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} dx={-5} />
                <Tooltip content={<DarkTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)" }} />
                <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#818cf8"
                  strokeWidth={2} dot={{ fill: "#818cf8", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Quick module links ── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Continue Practicing</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Study Notes",        path: "/notes",     color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",   icon: <BookOpen size={14}/> },
            { label: "Aptitude Quiz",      path: "/quiz",      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",     icon: <Target size={14}/> },
            { label: "Coding Problems",    path: "/coding",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",icon: <Activity size={14}/> },
            { label: "Mock Interview",     path: "/mock",      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",  icon: <Flame size={14}/> },
          ].map((m, i) => (
            <Link key={i} to={m.path}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all hover:-translate-y-0.5 ${m.color}`}>
              {m.icon}
              <span className="text-xs font-bold">{m.label}</span>
              <ChevronRight size={11} className="ml-auto opacity-50"/>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Progress;