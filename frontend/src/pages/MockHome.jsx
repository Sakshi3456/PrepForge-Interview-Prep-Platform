import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trophy, Target, ChevronRight, Play, RotateCcw, ClipboardList } from "lucide-react";
import api from "../services/api";

const diffBadge = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

// Company gradient headers
const companyGradient = (company) => {
  const map = {
    TCS:        "from-cyan-600 to-blue-700",
    Infosys:    "from-blue-600 to-indigo-700",
    Wipro:      "from-violet-600 to-purple-700",
    Cognizant:  "from-blue-500 to-cyan-600",
    Accenture:  "from-purple-600 to-violet-700",
    Amazon:     "from-orange-500 to-amber-600",
  };
  return map[company] || "from-indigo-600 to-violet-700";
};

function MockHome() {
  const navigate = useNavigate();
  const userId   = localStorage.getItem("userId");

  const [sets,     setSets]     = useState([]);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/mock/sets"),
      api.get(`/mock/history/${userId}`).catch(() => ({ data: [] })),
    ]).then(([setsRes, histRes]) => {
      setSets(setsRes.data);
      setHistory(histRes.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  // Map last attempt per set
  const lastAttempt = {};
  history.forEach(h => {
    if (!lastAttempt[h.setId] || new Date(h.submittedAt) > new Date(lastAttempt[h.setId].submittedAt)) {
      lastAttempt[h.setId] = h;
    }
  });

  // Stats
  const bestScore = history.length > 0
    ? history.reduce((best, h) => {
        const pct = h.score / h.total;
        return pct > best.pct ? { pct, label: `${h.score}/${h.total}` } : best;
      }, { pct: 0, label: "—" }).label
    : "—";

  if (loading) {
    return (
      <div className="space-y-6 pb-16 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-44 bg-white/[0.04] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-white/[0.03] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1035] via-[#161848] to-[#2b1d58] p-8 border border-white/[0.05]">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/8 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">Placement Preparation</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Mock Interviews</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
              Simulate real placement drives. Pick a company set and experience the actual interview format.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Available Sets", value: sets.length,     cls: "border-white/[0.07] text-white bg-white/[0.03]"          },
              { label: "Attempted",      value: Object.keys(lastAttempt).length, cls: "border-indigo-500/20 text-indigo-400 bg-indigo-500/[0.05]" },
              { label: "Best Score",     value: bestScore,       cls: "border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.05]" },
            ].map(s => (
              <div key={s.label} className={`border rounded-xl px-5 py-3.5 text-center min-w-[100px] ${s.cls}`}>
                <p className="text-2xl font-black leading-none">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Available Sets ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-black text-white">Available Interview Sets</h2>
          <p className="text-xs text-slate-500 mt-0.5">Pick a company and start your simulation</p>
        </div>

        {sets.length === 0 ? (
          <div className="text-center py-16 bg-[#080b1c] border border-dashed border-white/[0.06] rounded-2xl">
            <ClipboardList size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium text-sm">No interview sets available yet</p>
            <p className="text-slate-600 text-xs mt-1">Check back soon — sets are added regularly</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sets.map(set => {
              const attempt = lastAttempt[set.id];
              const grad    = companyGradient(set.company);

              return (
                <div key={set.id}
                  className="bg-[#080b1c] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-indigo-500/25 transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40">

                  {/* Company header gradient */}
                  <div className={`bg-gradient-to-r ${grad} px-5 py-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{set.company}</p>
                        <h3 className="text-lg font-black text-white tracking-tight mt-0.5">{set.title}</h3>
                      </div>
                      {/* Company initial avatar */}
                      <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-black text-base border border-white/20 shrink-0">
                        {set.company?.charAt(0)}
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    {/* Role + badges */}
                    <p className="text-sm font-bold text-slate-300 mb-3">{set.role || "General"}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {set.difficulty && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge[set.difficulty]}`}>
                          · {set.difficulty}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                        <Clock size={9}/>{set.durationMinutes} min
                      </span>
                      {attempt && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          ✓ Attempted {history.filter(h => h.setId === set.id).length}×
                        </span>
                      )}
                    </div>

                    {/* Last attempt result */}
                    {attempt && (
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 mb-4">
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-1">Last attempt</p>
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-black text-slate-200">
                            {attempt.score}/{attempt.total} correct
                          </p>
                          <p className="text-[10px] text-slate-600">
                            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                          </p>
                        </div>
                        {/* Score bar */}
                        <div className="h-1 bg-white/[0.05] rounded-full mt-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            attempt.score / attempt.total >= 0.7 ? "bg-emerald-500" :
                            attempt.score / attempt.total >= 0.4 ? "bg-amber-500" : "bg-rose-500"
                          }`} style={{ width: `${(attempt.score / attempt.total) * 100}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/mock/interview/${set.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30">
                        {attempt ? <><RotateCcw size={12}/>Retry</> : <><Play size={12}/>Start</>}
                      </button>
                      {attempt && (
                        <button
                          onClick={() => navigate(`/mock/result/${attempt.id}`)}
                          className="px-3 py-2.5 text-xs font-bold bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 rounded-xl transition"
                          title="View last result">
                          <ClipboardList size={14}/>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Recent Attempts ── */}
      {history.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-white">Recent Attempts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your past mock interview sessions</p>
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1">
              View all <ChevronRight size={12}/>
            </button>
          </div>

          <div className="space-y-2.5">
            {history.slice(0, 5).map(h => (
              <div key={h.id}
                onClick={() => navigate(`/mock/result/${h.id}`)}
                className="bg-[#080b1c] border border-white/[0.06] hover:border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all group hover:-translate-y-px">

                {/* Company dot */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${companyGradient(h.company || h.setTitle)} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                  {(h.company || h.setTitle || "?").charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200">{h.setTitle || h.company}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {h.company || ""}{h.submittedAt ? ` · ${new Date(h.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
                  </p>
                </div>

                {/* Score + time */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black ${
                    h.score / h.total >= 0.7 ? "text-emerald-400" :
                    h.score / h.total >= 0.4 ? "text-amber-400" : "text-rose-400"
                  }`}>{h.score}/{h.total}</p>
                  <p className="text-[10px] text-slate-600">{Math.floor(h.timeTaken / 60)}m {h.timeTaken % 60}s</p>
                </div>

                <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default MockHome;