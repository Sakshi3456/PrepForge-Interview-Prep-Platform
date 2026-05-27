import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const companyColors = {
  TCS:       "from-blue-500 to-cyan-500",
  Infosys:   "from-indigo-500 to-blue-500",
  Wipro:     "from-violet-500 to-purple-500",
  Cognizant: "from-blue-600 to-indigo-600",
  Accenture: "from-purple-500 to-violet-500",
  Amazon:    "from-amber-500 to-orange-500",
  default:   "from-slate-500 to-slate-700",
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  Medium: { color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-600",    bg: "bg-rose-50",    dot: "bg-rose-400"    },
};

function MockHome() {
  const [sets, setSets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const navigate              = useNavigate();

  useEffect(() => { fetchSets(); fetchHistory(); }, []);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mock/sets");
      setSets(res.data);
    } catch {
      console.error("Failed to fetch sets");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res    = await api.get(`/mock/history/${userId}`);
      setHistory(res.data);
    } catch {
      console.error("History fetch failed");
    }
  };

  const formatTime = (sec) => {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 px-8 pt-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">Mock Interviews</h1>
            </div>
          </div>
          <p className="text-indigo-300 text-sm mt-2 max-w-lg">
            Simulate real placement drives. Pick a company set and experience the actual interview format.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { label: "Available Sets", value: sets.length,    color: "bg-white/10 text-white"             },
              { label: "Attempted",      value: history.length, color: "bg-indigo-500/20 text-indigo-300"   },
              { label: "Best Score",     value: history.length > 0
                  ? Math.max(...history.map(h => h.score)) + "/" + history[0]?.total
                  : "—",                                        color: "bg-emerald-500/20 text-emerald-300"  },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[110px]`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[11px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Interview Sets */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-800">Available Interview Sets</h2>
              <p className="text-slate-500 text-sm mt-0.5">Pick a company and start your simulation</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                  <div className="h-12 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : sets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <p className="text-5xl mb-4">📭</p>
              <h3 className="text-lg font-bold text-slate-700">No interview sets yet</h3>
              <p className="text-sm text-slate-400 mt-1">
                Ask your admin to create company-specific sets
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sets.map(set => {
                const gradient = companyColors[set.company] || companyColors.default;
                const diff     = difficultyConfig[set.difficulty] || difficultyConfig.Medium;
                const attempted = history.filter(h => h.setId === set.id);

                return (
                  <div key={set.id}
                    className="bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">

                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-r ${gradient} p-5`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            {set.company}
                          </p>
                          <h3 className="text-white font-black text-lg mt-0.5">{set.title}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                          🏢
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Role */}
                      <p className="text-sm font-semibold text-slate-700 mb-3">{set.role}</p>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                          {set.difficulty}
                        </span>
                        <span className="text-[11px] bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
                          ⏱ {set.durationMinutes} min
                        </span>
                        {attempted.length > 0 && (
                          <span className="text-[11px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                            ✓ Attempted {attempted.length}x
                          </span>
                        )}
                      </div>

                      {/* Last attempt */}
                      {attempted.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-3 mb-4">
                          <p className="text-[11px] text-slate-400 font-medium mb-1">Last attempt</p>
                          <p className="text-sm font-bold text-slate-700">
                            {attempted[0].score}/{attempted[0].total} correct
                          </p>
                          <p className="text-xs text-slate-400">{formatTime(attempted[0].timeTaken)}</p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/mock/interview/${set.id}`)}
                          className={`flex-1 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r ${gradient} hover:opacity-90 transition`}
                        >
                          {attempted.length > 0 ? "Retry →" : "Start →"}
                        </button>
                        {attempted.length > 0 && (
                          <button
                            onClick={() => navigate(`/mock/result/${attempted[0].id}`)}
                            className="px-3 py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-slate-800">Recent Attempts</h2>
                <p className="text-slate-500 text-sm mt-0.5">Your past mock interview sessions</p>
              </div>
              <button
                onClick={() => navigate("/mock/history")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {history.slice(0, 3).map(h => (
                <div key={h.id}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/mock/result/${h.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">
                      🎯
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{h.setTitle}</p>
                      <p className="text-xs text-slate-400">{h.company} • {new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{h.score}/{h.total}</p>
                    <p className="text-xs text-slate-400">{formatTime(h.timeTaken)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MockHome;