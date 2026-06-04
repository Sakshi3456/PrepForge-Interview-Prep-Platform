import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Sparkles, TrendingUp, Target, Flame, BrainCircuit, Activity } from "lucide-react";
import api from "../services/api";

function Progress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/progress/${userId}`);
      setProgress(res.data);
    } catch (err) {
      console.error("Progress fetch failed downstream", err);
    } finally {
      setLoading(false);
    }
  };

  const insights = useMemo(() => {
    if (!progress?.categoryStats || progress.categoryStats.length === 0) return null;
    const sorted = [...progress.categoryStats].sort((a, b) => b.accuracy - a.accuracy);
    return {
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1]
    };
  }, [progress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] p-6 lg:p-10 space-y-6 animate-pulse">
        <div className="h-48 bg-[#151b2b] rounded-2xl" />
        <div className="h-96 bg-white rounded-2xl" />
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-800 pb-16 font-sans">
      
      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6 space-y-6">

        {/* ── HEADER JUMBOTRON (Matches Interview Questions style) ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1a3a] to-[#15132b] p-8 shadow-lg">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            
            {/* Title Area */}
            <div>
              <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                PREPFORGE VERIFICATION MATRIX
              </p>
              <h1 className="text-3xl font-black text-white tracking-tight">Learning Analytics</h1>
              <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
                Master your runtime algorithmic complexities and verify your framework comprehension.
              </p>
            </div>

            {/* Stat Boxes (Matching the exact style from your screenshot) */}
            <div className="flex gap-4 flex-wrap shrink-0">
              <div className="border border-white/5 bg-[#1b1933] rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-black text-white leading-none">{progress.totalAttempted || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Total Pool</p>
              </div>
              
              <div className="border border-emerald-500/10 bg-[#1b1933] rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-black text-emerald-400 leading-none">{Math.round(progress.overallAccuracy || 0)}%</p>
                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mt-2">Accuracy</p>
              </div>

              <div className="border border-amber-500/10 bg-[#1b1933] rounded-xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-2xl font-black text-amber-400 leading-none">{progress.currentStreak || 0} 🔥</p>
                <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider mt-2">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── DYNAMIC INSIGHTS BANNER (White Cards) ── */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl flex items-start gap-4 shadow-sm border border-slate-100">
              <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0">
                <TrendingUp className="text-emerald-600" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Peak Performance: {insights.strongest.category}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  You're dominating this category with <span className="font-bold text-emerald-600">{insights.strongest.accuracy}% accuracy</span>.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl flex items-start gap-4 shadow-sm border border-slate-100">
              <div className="bg-rose-50 p-2.5 rounded-xl shrink-0">
                <Target className="text-rose-600" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Focus Area: {insights.weakest.category}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  Your accuracy here is <span className="font-bold text-rose-600">{insights.weakest.accuracy}%</span>. Consider revising core concepts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN DASHBOARD GRID (White Cards) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Analytics Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-8">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Activity size={12} /> Metrics Matrix
              </span>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Topic Evaluation</h3>
            </div>

            <div className="w-full h-[320px]" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={progress.categoryStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-5}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '10px 14px'
                    }} 
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px', fontSize: '12px' }}
                    itemStyle={{ color: '#6366f1', fontWeight: 600, fontSize: '12px' }}
                    formatter={(value) => [`${value}%`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} barSize={45}>
                    {(progress.categoryStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.accuracy >= 80 ? '#10b981' : entry.accuracy <= 40 ? '#f43f5e' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-6">Suggested Action Plan</h3>
            
            <div className="space-y-5 flex-1">
              <div className="border-l-2 border-indigo-500 pl-4 py-1">
                <h4 className="text-xs font-bold text-slate-800 mb-1">Review {insights?.weakest.category || "Basics"}</h4>
                <p className="text-[11px] font-medium text-slate-500">Read the top bookmarked notes for this topic to patch knowledge gaps.</p>
              </div>
              
              <div className="border-l-2 border-slate-200 pl-4 py-1">
                <h4 className="text-xs font-bold text-slate-800 mb-1">Maintain {progress.currentStreak || 0} Day Streak</h4>
                <p className="text-[11px] font-medium text-slate-500">Solve at least one coding question today to keep your fire lit.</p>
              </div>

              <div className="border-l-2 border-slate-200 pl-4 py-1">
                <h4 className="text-xs font-bold text-slate-800 mb-1">Challenge Phase</h4>
                <p className="text-[11px] font-medium text-slate-500">Attempt a hard-level question in {insights?.strongest.category || "your strongest topic"} to push your limits.</p>
              </div>
            </div>

            <button className="w-full mt-6 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold py-3.5 rounded-xl transition-colors shadow-sm">
              Generate Mock Test
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Progress;