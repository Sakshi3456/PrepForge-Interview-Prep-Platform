import { useEffect, useState } from "react";
import {
  Search, Code2, CheckCircle2, Circle, Lightbulb,
  BrainCircuit, Terminal, Hash, Layers, Filter, X, ChevronDown, ChevronUp
} from "lucide-react";
import api from "../services/api";

const difficultyConfig = {
  Basic:        { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  Intermediate: { badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",       dot: "bg-amber-400"   },
  Hard:         { badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",           dot: "bg-rose-400"    },
};

const languageBadge = {
  Java:       "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Python:     "text-blue-400 bg-blue-500/10 border-blue-500/20",
  JavaScript: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "C++":      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
);

function CodingQuestions() {
  const [questions,   setQuestions]   = useState([]);
  const [search,      setSearch]      = useState("");
  const [difficulty,  setDifficulty]  = useState("All");
  const [language,    setLanguage]    = useState("All");
  const [topic,       setTopic]       = useState("All");
  const [loading,     setLoading]     = useState(true);
  const [showSolution,setShowSolution]= useState({});
  const [showHint,    setShowHint]    = useState({});
  const [solved,      setSolved]      = useState({});
  const [similar,     setSimilar]     = useState({});

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coding");
      setQuestions(res.data);
      res.data.forEach(q => fetchSimilar(q.id));
    } catch { console.error("Fetch failed"); }
    finally { setLoading(false); }
  };

  const fetchSimilar = async (id) => {
    try {
      const res = await api.get(`/coding/${id}/similar`);
      setSimilar(prev => ({ ...prev, [id]: res.data }));
    } catch {}
  };

  const handleSolved = async (id) => {
  try {
    const userId = localStorage.getItem("userId");
    await api.put(`/coding/${id}/solved?userId=${userId}`);
    setSolved(prev => ({ ...prev, [id]: !prev[id] }));
    fetchQuestions(); // ← ADD THIS
  } catch { console.error("Toggle failed"); }
};

  const filteredQuestions = questions.filter(q => {
    const matchSearch    = q.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff      = difficulty === "All" || q.difficulty === difficulty;
    const matchLang      = language   === "All" || q.language   === language;
    const matchTopic     = topic      === "All" || q.topic      === topic;
    return matchSearch && matchDiff && matchLang && matchTopic;
  });

  const stats = {
    total:        questions.length,
    solved: questions.filter(q => solved[q.id] ?? q.isSolved).length,
    basic:        questions.filter(q => q.difficulty === "Basic").length,
    intermediate: questions.filter(q => q.difficulty === "Intermediate").length,
    hard:         questions.filter(q => q.difficulty === "Hard").length,
  };

  const clearFilters = () => { setSearch(""); setDifficulty("All"); setLanguage("All"); setTopic("All"); };
  const hasFilters = search || difficulty !== "All" || language !== "All" || topic !== "All";

  return (
    <div className="space-y-6 pb-16 max-w-[1400px] mx-auto relative">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0f2b] via-[#161a46] to-[#261b55] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-indigo-400 mt-1 shrink-0">
              <Code2 size={26} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Coding Practice</span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">Coding Problems</h1>
              <p className="text-slate-400 text-sm mt-2 max-w-md font-medium leading-relaxed">
                Master DSA with structured approaches, complexity analysis, and complete solutions.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Total",        value: stats.total,        cls: "border-white/10 text-white bg-white/[0.04]"                    },
              { label: "Solved",       value: stats.solved,       cls: "border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.06]"  },
              { label: "Basic",        value: stats.basic,        cls: "border-teal-500/20 text-teal-400 bg-teal-500/[0.06]"           },
              { label: "Intermediate", value: stats.intermediate, cls: "border-amber-500/20 text-amber-400 bg-amber-500/[0.06]"        },
              { label: "Hard",         value: stats.hard,         cls: "border-rose-500/20 text-rose-400 bg-rose-500/[0.06]"           },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[90px] ${s.cls}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
          {[
            { value: difficulty, setter: setDifficulty, options: ["All","Basic","Intermediate","Hard"], prefix: "Difficulty" },
            { value: language,   setter: setLanguage,   options: ["All","Java","Python","JavaScript","C++"], prefix: "Lang" },
            { value: topic,      setter: setTopic,      options: ["All","Arrays","Strings","Loops","Linked List","Trees","Recursion","DP","Graphs","Backtracking"], prefix: "Topic" },
          ].map((f, i) => (
            <div key={i} className="relative flex-1">
              <select
                className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none pr-8 min-w-[130px]"
                value={f.value} onChange={e => f.setter(e.target.value)}
              >
                {f.options.map(o => <option key={o} value={o} className="bg-[#0d0f28]">{f.prefix}: {o}</option>)}
              </select>
              <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-600">
          Showing <span className="font-bold text-slate-400">{filteredQuestions.length}</span> of {questions.length} problems
        </p>
        {hasFilters && (
          <button onClick={clearFilters}
            className="text-xs font-bold text-slate-600 hover:text-rose-400 transition-colors flex items-center gap-1">
            <X size={12}/> Clear filters
          </button>
        )}
      </div>

      {/* ── Problems ──────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] p-6 space-y-4">
              <Skeleton className="h-3 w-1/5" />
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl bg-[#0d0f28]">
            <Code2 size={32} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-400">No problems found</h3>
            <p className="text-xs text-slate-600 mt-1">Try adjusting your filters or search.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diff    = difficultyConfig[q.difficulty] || difficultyConfig.Basic;
            const isSolved = solved[q.id] ?? q.isSolved;

            return (
              <div key={q.id}
                className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-200 overflow-hidden">
                <div className="p-6 space-y-4">

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${diff.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />{q.difficulty}
                        </span>
                        {q.language && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${languageBadge[q.language] || "bg-white/[0.04] text-slate-500 border-white/[0.07]"}`}>
                            {q.language}
                          </span>
                        )}
                        {q.topic && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-white/[0.04] text-slate-500 border border-white/[0.07] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                            <Layers size={10}/>{q.topic}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-200 tracking-tight leading-snug">{q.title}</h2>
                    </div>

                    <button
                      onClick={() => handleSolved(q.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border ${
                        isSolved
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-white/[0.04] text-slate-500 border-white/[0.07] hover:bg-white/[0.07] hover:text-slate-300"
                      }`}
                    >
                      {isSolved ? <CheckCircle2 size={14}/> : <Circle size={14}/>}
                      <span>{isSolved ? "Solved ✓" : "Mark as Solved"}</span>
                    </button>
                  </div>

                  {/* Problem statement */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Problem</p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed whitespace-pre-line">{q.problemStatement}</p>
                  </div>

                  {/* I/O */}
                  {q.inputOutput && (
                    <div className="bg-[#0a0d16] border border-white/[0.05] rounded-xl p-4">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Example I/O</p>
                      <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">{q.inputOutput}</pre>
                    </div>
                  )}

                  {/* Complexity + Company tags */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {q.companyTags ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Asked in:</span>
                        {q.companyTags.split(",").map(tag => (
                          <span key={tag} className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    ) : <div />}
                    {(q.timeComplexity || q.spaceComplexity) && (
                      <div className="flex gap-2 shrink-0">
                        {q.timeComplexity && (
                          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Time</span>
                            <span className="text-[11px] font-bold text-indigo-400 font-mono">{q.timeComplexity}</span>
                          </div>
                        )}
                        {q.spaceComplexity && (
                          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Space</span>
                            <span className="text-[11px] font-bold text-cyan-400 font-mono">{q.spaceComplexity}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2.5 flex-wrap border-t border-white/[0.05] pt-4">
                    {q.hint && (
                      <button
                        onClick={() => setShowHint(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          showHint[q.id]
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-white/[0.03] text-slate-500 border-white/[0.07] hover:bg-white/[0.06] hover:text-slate-300"
                        }`}
                      >
                        <Lightbulb size={13}/>
                        {showHint[q.id] ? "Hide Hint" : "Show Hint"}
                      </button>
                    )}
                    {q.approach && (
                      <button
                        onClick={() => setShowSolution(prev => ({ ...prev, [q.id]: prev[q.id] === "approach" ? null : "approach" }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          showSolution[q.id] === "approach"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-white/[0.03] text-slate-500 border-white/[0.07] hover:bg-white/[0.06] hover:text-slate-300"
                        }`}
                      >
                        <BrainCircuit size={13}/>
                        {showSolution[q.id] === "approach" ? "Hide Approach" : "Show Approach"}
                      </button>
                    )}
                    {q.solution && (
                      <button
                        onClick={() => setShowSolution(prev => ({ ...prev, [q.id]: prev[q.id] === "solution" ? null : "solution" }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          showSolution[q.id] === "solution"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-white/[0.03] text-slate-500 border-white/[0.07] hover:bg-white/[0.06] hover:text-slate-300"
                        }`}
                      >
                        <Terminal size={13}/>
                        {showSolution[q.id] === "solution" ? "Hide Code" : "Show Code"}
                      </button>
                    )}
                  </div>

                  {/* Drawers */}
                  <div className="space-y-3">
                    {showHint[q.id] && q.hint && (
                      <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Lightbulb size={11}/>Hint
                        </p>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">{q.hint}</p>
                      </div>
                    )}
                    {showSolution[q.id] === "approach" && q.approach && (
                      <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <BrainCircuit size={11}/>Approach
                        </p>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed whitespace-pre-wrap">{q.approach}</p>
                      </div>
                    )}
                    {showSolution[q.id] === "solution" && q.solution && (
                      <div className="bg-[#0a0d16] border border-white/[0.05] rounded-xl p-4">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Terminal size={11}/>Solution
                        </p>
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {q.solution}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Similar problems */}
                  {similar[q.id]?.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.05]">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Hash size={11}/>Similar Problems
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {similar[q.id].map(s => (
                          <button key={s.id}
                            className="text-[11px] font-bold bg-white/[0.04] text-slate-500 border border-white/[0.07] hover:border-indigo-500/30 hover:bg-indigo-500/[0.07] hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg">
                            {s.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default CodingQuestions;