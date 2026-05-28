import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, AlertCircle } from "lucide-react";
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

  if (loading) {
    return (
      <div className="space-y-8 pb-16 relative animate-pulse">
        <div className="h-48 bg-slate-100 rounded-[24px]" />
        <div className="h-96 bg-slate-50 rounded-2xl border border-slate-200/60" />
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="space-y-8 pb-16 relative">
      
      {/* ── TOP HEADER JUMBOTRON GRADIENT BANNER ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#121635] via-[#1b1e4b] to-[#2b1f5d] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              PrepForge Core Diagnostics
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Learning Analytics</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
              Analyze runtime algorithmic accuracy metrics, track processing streaks, and verify framework comprehension performance boundaries.
            </p>
          </div>

          {/* BALANCED STRUCTURAL DATA BADGES ROW */}
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { 
                label: "Total Attempts", 
                value: progress.totalAttempted || 0, 
                border: "border-white/10 text-white bg-white/[0.04]" 
              },
              { 
                label: "Accuracy Track",  
                value: `${Math.round(progress.overallAccuracy || 0)}%`,  
                border: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" 
              },
              { 
                label: "Active Streak", 
                value: `${progress.currentStreak || 0} 🔥`, 
                border: "border-amber-500/20 text-amber-400 bg-amber-500/5" 
              },
              { 
                label: "Coding Core", 
                value: progress.codeSolved || 0,   
                border: "border-rose-500/20 text-rose-400 bg-rose-500/5" 
              },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[100px] shadow-sm backdrop-blur-sm ${s.border}`}>
                <p className="text-lg font-black tracking-tight leading-none">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ANALYTICS DISPLAY PANEL MATCHING NOTES STRUCTURE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-8">
          <span className="bg-indigo-50 text-[#6366f1] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} /> Metrics Matrix
          </span>
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Topic Performance Evaluation</h3>
        </div>

        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
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
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                  padding: '10px 14px'
                }} 
                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px', fontSize: '12px' }}
                itemStyle={{ color: '#6366f1', fontWeight: 600, fontSize: '12px' }}
              />
              <Bar 
                dataKey="accuracy" 
                fill="#6366f1" 
                radius={[6, 6, 0, 0]} 
                barSize={45} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default Progress;