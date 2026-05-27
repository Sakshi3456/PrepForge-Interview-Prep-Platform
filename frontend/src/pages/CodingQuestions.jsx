import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const difficultyConfig = {
  Basic:        { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400", bar: "from-emerald-400 to-teal-400" },
  Intermediate: { color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-400",   bar: "from-amber-400 to-orange-400" },
  Hard:         { color: "text-rose-600",    bg: "bg-rose-50",    dot: "bg-rose-400",    bar: "from-rose-400 to-rose-600"    },
};

const topicIcons = {
  Arrays: "📊", Strings: "🔤", Loops: "🔁",
  "Linked List": "🔗", Trees: "🌲", Recursion: "🔄",
  DP: "🧩", Graphs: "🕸️", Backtracking: "↩️",
};

const languageColors = {
  Java:       "bg-orange-50 text-orange-600 border-orange-200",
  Python:     "bg-blue-50 text-blue-600 border-blue-200",
  JavaScript: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

function CodingQuestions() {
  const [questions, setQuestions]   = useState([]);
  const [search, setSearch]         = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [language, setLanguage]     = useState("All");
  const [topic, setTopic]           = useState("All");
  const [loading, setLoading]       = useState(true);

  // Per-card state stored as objects keyed by question id
  const [showSolution, setShowSolution] = useState({}); // { id: "approach" | "solution" | null }
  const [showHint, setShowHint]         = useState({}); // { id: true | false }
  const [solved, setSolved]             = useState({}); // { id: true | false }
  const [similar, setSimilar]           = useState({}); // { id: [...] }

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coding");
      setQuestions(res.data);
      // fetch similar for each question
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 px-8 pt-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💻</span>
            <div>
              <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">Coding Problems</h1>
            </div>
          </div>
          <p className="text-emerald-300 text-sm mt-2 max-w-lg">
            DSA problems with approach, solution, and complexity analysis.
          </p>
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { label: "Total",        value: stats.total,        color: "bg-white/10 text-white"             },
              { label: "Solved",       value: stats.solved,       color: "bg-emerald-500/20 text-emerald-300" },
              { label: "Basic",        value: stats.basic,        color: "bg-teal-500/20 text-teal-300"       },
              { label: "Intermediate", value: stats.intermediate, color: "bg-amber-500/20 text-amber-300"     },
              { label: "Hard",         value: stats.hard,         color: "bg-rose-500/20 text-rose-300"       },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[80px]`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[11px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search problems..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {["All","Basic","Intermediate","Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={language} onChange={e => setLanguage(e.target.value)}>
            {["All","Java","Python","JavaScript"].map(l => <option key={l}>{l}</option>)}
          </select>
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={topic} onChange={e => setTopic(e.target.value)}>
            {["All","Arrays","Strings","Loops","Linked List","Trees","Recursion","DP","Graphs","Backtracking"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Difficulty Tabs */}
      <div className="max-w-6xl mx-auto px-8 mt-5 flex gap-2">
        {["All","Basic","Intermediate","Hard"].map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              difficulty === d
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300"
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-8 mt-5 mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredQuestions.length}</span> of {questions.length} problems
        </p>
        {(search || difficulty !== "All" || language !== "All" || topic !== "All") && (
          <button onClick={() => { setSearch(""); setDifficulty("All"); setLanguage("All"); setTopic("All"); }}
            className="text-xs text-slate-400 hover:text-slate-700 transition">
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Problems List */}
      <div className="max-w-6xl mx-auto px-8 pb-16 space-y-5">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
              <div className="h-5 bg-slate-100 rounded w-2/3 mb-4" />
              <div className="h-16 bg-slate-100 rounded" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-500 font-medium">No problems found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diff    = difficultyConfig[q.difficulty] || difficultyConfig.Basic;
            const isSolved = solved[q.id] ?? q.isSolved;

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-200 overflow-hidden">

                {/* Difficulty bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${diff.bar}`} />

                <div className="p-6">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                          {q.difficulty}
                        </span>
                        {q.language && (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${languageColors[q.language] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                            {q.language}
                          </span>
                        )}
                        {q.topic && (
                          <span className="text-[11px] bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
                            {topicIcons[q.topic] || "📌"} {q.topic}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-black text-slate-800">{q.title}</h2>
                    </div>
                    <button onClick={() => handleSolved(q.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        isSolved
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                      }`}>
                      {isSolved ? "✓ Solved" : "Mark Solved"}
                    </button>
                  </div>

                  {/* Problem Statement */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Problem</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{q.problemStatement}</p>
                  </div>

                  {/* Input Output */}
                  {q.inputOutput && (
                    <div className="bg-slate-900 rounded-xl p-4 mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Example</p>
                      <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {q.inputOutput}
                      </pre>
                    </div>
                  )}

                  {/* Company Tags */}
                  {q.companyTags && (
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span className="text-xs text-slate-400 font-medium">Asked in:</span>
                      {q.companyTags.split(",").map(tag => (
                        <span key={tag} className="text-[11px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-semibold">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Complexity */}
                  {(q.timeComplexity || q.spaceComplexity) && (
                    <div className="flex gap-3 mb-4">
                      {q.timeComplexity && (
                        <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-xl">
                          <span className="text-xs text-violet-400">Time:</span>
                          <span className="text-xs font-bold text-violet-600 font-mono">{q.timeComplexity}</span>
                        </div>
                      )}
                      {q.spaceComplexity && (
                        <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-xl">
                          <span className="text-xs text-cyan-400">Space:</span>
                          <span className="text-xs font-bold text-cyan-600 font-mono">{q.spaceComplexity}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {q.hint && (
                      <button onClick={() => setShowHint(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition">
                        💡 {showHint[q.id] ? "Hide Hint" : "Show Hint"}
                      </button>
                    )}
                    {q.approach && (
                      <button onClick={() => setShowSolution(prev => ({ ...prev, [q.id]: prev[q.id] === "approach" ? null : "approach" }))}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition">
                        🧠 {showSolution[q.id] === "approach" ? "Hide Approach" : "View Approach"}
                      </button>
                    )}
                    {q.solution && (
                      <button onClick={() => setShowSolution(prev => ({ ...prev, [q.id]: prev[q.id] === "solution" ? null : "solution" }))}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition">
                        {"</>"} {showSolution[q.id] === "solution" ? "Hide Solution" : "View Solution"}
                      </button>
                    )}
                  </div>

                  {/* Hint */}
                  {showHint[q.id] && q.hint && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-600 mb-1">💡 Hint</p>
                      <p className="text-sm text-amber-800 leading-relaxed">{q.hint}</p>
                    </div>
                  )}

                  {/* Approach */}
                  {showSolution[q.id] === "approach" && q.approach && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-600 mb-2">🧠 Step-by-step Approach</p>
                      <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{q.approach}</p>
                    </div>
                  )}

                  {/* Solution */}
                  {showSolution[q.id] === "solution" && q.solution && (
                    <div className="mt-3 bg-slate-900 rounded-xl p-4">
                      <p className="text-xs font-semibold text-slate-400 mb-2">{"</>"} Solution</p>
                      <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                        {q.solution}
                      </pre>
                    </div>
                  )}

                  {/* Similar Problems */}
                  {similar[q.id] && similar[q.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Similar Problems</p>
                      <div className="flex gap-2 flex-wrap">
                        {similar[q.id].map(s => (
                          <span key={s.id} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
                            {s.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CodingQuestions;