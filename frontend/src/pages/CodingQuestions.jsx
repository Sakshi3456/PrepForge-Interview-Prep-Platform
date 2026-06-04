import { useEffect, useState } from "react";
import { 
  Search, Code2, CheckCircle2, Circle, Lightbulb, 
  BrainCircuit, Terminal, Hash, Target, Layers, Filter, X 
} from "lucide-react";
import api from "../services/api";

const difficultyConfig = {
  Basic:        { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  Intermediate: { color: "text-amber-600 bg-amber-50 border-amber-100",  dot: "bg-amber-500" },
  Hard:         { color: "text-rose-600 bg-rose-50 border-rose-100",     dot: "bg-rose-500" },
};

const languageColors = {
  Java:       "bg-orange-50 text-orange-600 border-orange-200/60",
  Python:     "bg-blue-50 text-blue-600 border-blue-200/60",
  JavaScript: "bg-yellow-50 text-yellow-700 border-yellow-200/60",
};

function CodingQuestions() {
  const [questions, setQuestions]   = useState([]);
  const [search, setSearch]         = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [language, setLanguage]     = useState("All");
  const [topic, setTopic]           = useState("All");
  const [loading, setLoading]       = useState(true);

  // Per-card state
  const [showSolution, setShowSolution] = useState({});
  const [showHint, setShowHint]         = useState({});
  const [solved, setSolved]             = useState({});
  const [similar, setSimilar]           = useState({});

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coding");
      setQuestions(res.data);
      res.data.forEach(q => fetchSimilar(q.id));
    } catch {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async (id) => {
    try {
      const res = await api.get(`/coding/${id}/similar`);
      setSimilar(prev => ({ ...prev, [id]: res.data }));
    } catch {
      console.error("Similar fetch failed");
    }
  };

  const handleSolved = async (id) => {
    try {
      await api.put(`/coding/${id}/solved`);
      setSolved(prev => ({ ...prev, [id]: !prev[id] }));
    } catch {
      console.error("Toggle failed");
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchSearch     = q.title.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "All" || q.difficulty === difficulty;
    const matchLanguage   = language   === "All" || q.language   === language;
    const matchTopic      = topic      === "All" || q.topic      === topic;
    return matchSearch && matchDifficulty && matchLanguage && matchTopic;
  });

  const stats = {
    total:        questions.length,
    solved:       Object.values(solved).filter(Boolean).length,
    basic:        questions.filter(q => q.difficulty === "Basic").length,
    intermediate: questions.filter(q => q.difficulty === "Intermediate").length,
    hard:         questions.filter(q => q.difficulty === "Hard").length,
  };

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto relative px-4 lg:px-0">
      
      {/* ── TOP SECTION: BRANDED CORE OVERLAY HERO ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0f2b] via-[#161a46] to-[#261b55] p-8 shadow-md mt-6">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-indigo-400 mt-1 shadow-sm backdrop-blur-sm">
              <Code2 size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                PrepForge Core Runtime
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">Coding Problems</h1>
              <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
                Master DSA with structured approaches, runtime algorithmic complexity analysis, and complete solutions.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Total Pool",   value: stats.total,        border: "border-white/10 text-white bg-white/[0.04]" },
              { label: "Solved",       value: stats.solved,       border: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
              { label: "Basic",        value: stats.basic,        border: "border-teal-500/20 text-teal-400 bg-teal-500/5" },
              { label: "Intermediate", value: stats.intermediate, border: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
              { label: "Hard",         value: stats.hard,         border: "border-rose-500/20 text-rose-400 bg-rose-500/5" },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[90px] shadow-sm backdrop-blur-sm ${s.border}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CENTRAL CONTROL DASHBOARD MANAGEMENT PANEL ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search problems by key concepts..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
          <div className="relative flex-1">
            <select 
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[130px]"
              value={difficulty} onChange={e => setDifficulty(e.target.value)}
            >
              {["All","Basic","Intermediate","Hard"].map(d => <option key={d} value={d}>Complexity: {d}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select 
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[130px]"
              value={language} onChange={e => setLanguage(e.target.value)}
            >
              {["All","Java","Python","JavaScript"].map(l => <option key={l} value={l}>Lang: {l}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select 
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[130px]"
              value={topic} onChange={e => setTopic(e.target.value)}
            >
              {["All","Arrays","Strings","Loops","Linked List","Trees","Recursion","DP","Graphs","Backtracking"].map(t => <option key={t} value={t}>Topic: {t}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* CONTEXT RUNTIME COUNT LOGS CARD */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-400">
          Showing <span className="font-bold text-slate-700">{filteredQuestions.length}</span> of {questions.length} problems
        </p>
        {(search || difficulty !== "All" || language !== "All" || topic !== "All") && (
          <button 
            onClick={() => { setSearch(""); setDifficulty("All"); setLanguage("All"); setTopic("All"); }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors focus:outline-none flex items-center gap-1"
          >
            <X size={12} /> Clear Global Filters
          </button>
        )}
      </div>

      {/* ── CORE RUNTIME ARCHITECTURE PROBLEM SET LIST ── */}
      <section className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/5" />
              <div className="h-5 bg-slate-100 rounded w-2/5" />
              <div className="h-16 bg-slate-50 rounded-xl w-full mt-4" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white p-8">
            <Target size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No matching algorithms encountered</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Readjust global dropdown configuration layers or clear search arrays.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diff = difficultyConfig[q.difficulty] || difficultyConfig.Basic;
            const isSolved = solved[q.id] ?? q.isSolved;

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all duration-200 overflow-hidden">
                <div className="p-6 space-y-4">
                  
                  {/* Header & Meta Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${diff.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                          {q.difficulty}
                        </span>
                        
                        {q.language && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${languageColors[q.language] || "bg-slate-50 text-slate-500 border-slate-200/40"}`}>
                            {q.language}
                          </span>
                        )}
                        
                        {q.topic && (
                          <span className="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-500 border border-slate-200/60 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                            <Layers size={10} /> {q.topic}
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                        {q.title}
                      </h2>
                    </div>
                    
                    <button 
                      onClick={() => handleSolved(q.id)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all border ${
                        isSolved 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100" 
                          : "bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      {isSolved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>{isSolved ? "Execution Verified" : "Mark Evaluated"}</span>
                    </button>
                  </div>

                  {/* Problem Statement Box */}
                  <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-4.5">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Problem Description</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                      {q.problemStatement}
                    </p>
                  </div>

                  {/* Input / Output Example */}
                  {q.inputOutput && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4.5 shadow-inner">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Expected I/O Buffer</p>
                      <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {q.inputOutput}
                      </pre>
                    </div>
                  )}

                  {/* Complexity & Company Tags Footer Meta */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                    {q.companyTags ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-1">Asked In:</span>
                        {q.companyTags.split(",").map(tag => (
                          <span key={tag} className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    {(q.timeComplexity || q.spaceComplexity) && (
                      <div className="flex gap-2">
                        {q.timeComplexity && (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Runtime</span>
                            <span className="text-[11px] font-bold text-indigo-600 font-mono">{q.timeComplexity}</span>
                          </div>
                        )}
                        {q.spaceComplexity && (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Memory</span>
                            <span className="text-[11px] font-bold text-cyan-600 font-mono">{q.spaceComplexity}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expandable Interaction Controls */}
                  <div className="flex gap-2.5 flex-wrap border-t border-slate-100 pt-4">
                    {q.hint && (
                      <button 
                        onClick={() => setShowHint(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          showHint[q.id] ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Lightbulb size={14} className={showHint[q.id] ? "text-amber-500" : "text-amber-400"} /> 
                        {showHint[q.id] ? "Conceal Hint" : "Expose Hint"}
                      </button>
                    )}
                    {q.approach && (
                      <button 
                        onClick={() => setShowSolution(prev => ({ ...prev, [q.id]: prev[q.id] === "approach" ? null : "approach" }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          showSolution[q.id] === "approach" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <BrainCircuit size={14} className={showSolution[q.id] === "approach" ? "text-blue-500" : "text-blue-400"} /> 
                        {showSolution[q.id] === "approach" ? "Conceal Approach" : "Analyze Approach"}
                      </button>
                    )}
                    {q.solution && (
                      <button 
                        onClick={() => setShowSolution(prev => ({ ...prev, [q.id]: prev[q.id] === "solution" ? null : "solution" }))}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
                          showSolution[q.id] === "solution" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Terminal size={14} className={showSolution[q.id] === "solution" ? "text-emerald-500" : "text-emerald-400"} /> 
                        {showSolution[q.id] === "solution" ? "Conceal Implementation" : "Expose Code"}
                      </button>
                    )}
                  </div>

                  {/* Drawers: Hint, Approach, Code */}
                  <div className="space-y-3">
                    {showHint[q.id] && q.hint && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4.5 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Lightbulb size={12}/> Analysis Hint
                        </p>
                        <p className="text-xs font-medium text-amber-800 leading-relaxed">{q.hint}</p>
                      </div>
                    )}

                    {showSolution[q.id] === "approach" && q.approach && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4.5 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <BrainCircuit size={12}/> Structural Breakdown
                        </p>
                        <p className="text-xs font-medium text-blue-800 leading-relaxed whitespace-pre-wrap">{q.approach}</p>
                      </div>
                    )}

                    {showSolution[q.id] === "solution" && q.solution && (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4.5 shadow-inner animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Terminal size={12}/> Compilation Code
                        </p>
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {q.solution}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Similar Problems Graph */}
                  {similar[q.id] && similar[q.id].length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Hash size={12}/> Related Topologies
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {similar[q.id].map(s => (
                          <button key={s.id} className="text-[11px] font-bold bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg shadow-sm">
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