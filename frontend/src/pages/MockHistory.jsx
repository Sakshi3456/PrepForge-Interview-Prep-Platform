import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function MockHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res    = await api.get(`/mock/history/${userId}`);
      setHistory(res.data);
    } catch {
      console.error("History fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec) => {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (score, total) => {
    const pct = (score / total) * 100;
    if (pct >= 80) return "text-emerald-600 bg-emerald-50";
    if (pct >= 60) return "text-blue-600 bg-blue-50";
    if (pct >= 40) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 px-8 pt-10 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📋</span>
            <div>
              <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">Interview History</h1>
            </div>
          </div>
          <p className="text-indigo-300 text-sm mt-2">All your past mock interview attempts</p>

          {/* Stats */}
          {history.length > 0 && (
            <div className="flex gap-4 mt-6 flex-wrap">
              {[
                { label: "Total Attempts", value: history.length, color: "bg-white/10 text-white" },
                { label: "Best Score",
                  value: Math.max(...history.map(h => Math.round((h.score/h.total)*100))) + "%",
                  color: "bg-emerald-500/20 text-emerald-300" },
                { label: "Companies",
                  value: [...new Set(history.map(h => h.company))].length,
                  color: "bg-indigo-500/20 text-indigo-300" },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[110px]`}>
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="text-[11px] font-medium opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-6 pb-16">

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="w-16 h-8 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
            <p className="text-5xl mb-4">🎯</p>
            <h3 className="text-lg font-bold text-slate-700">No attempts yet</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Start your first mock interview to track progress
            </p>
            <button onClick={() => navigate("/mock")}
              className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              Browse Interview Sets →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => {
              const scoreColor = getScoreColor(h.score, h.total);
              const accuracy   = Math.round((h.score / h.total) * 100);
              return (
                <div key={h.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition cursor-pointer p-4"
                  onClick={() => navigate(`/mock/result/${h.id}`)}>
                  <div className="flex items-center gap-4">

                    {/* Number */}
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-sm font-black text-indigo-600 shrink-0">
                      #{history.length - i}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{h.setTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-slate-400">{h.company}</p>
                        <span className="text-slate-200">•</span>
                        <p className="text-xs text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </p>
                        <span className="text-slate-200">•</span>
                        <p className="text-xs text-slate-400">{formatTime(h.timeTaken)}</p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className={`px-4 py-2 rounded-xl text-center ${scoreColor}`}>
                      <p className="text-base font-black">{h.score}/{h.total}</p>
                      <p className="text-[10px] font-medium">{accuracy}%</p>
                    </div>

                    <span className="text-slate-300 text-lg">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MockHistory;