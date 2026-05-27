import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const categoryIcons = {
  HR: "🤝", Java: "☕", React: "⚛️", Python: "🐍",
  DSA: "🌲", "System Design": "🏗️", DBMS: "🗄️",
  OS: "💻", "Spring Boot": "🍃",
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  Medium: { color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-600",    bg: "bg-rose-50",    dot: "bg-rose-400"    },
};

function InterviewQuestions() {
  const [questions, setQuestions]   = useState([]);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [openId, setOpenId]         = useState(null);
  const [assessment, setAssessment] = useState({});
  const [loading, setLoading]       = useState(true);
  const [random, setRandom]         = useState(null);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/questions");
      setQuestions(res.data);
    } catch {
      console.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(questions.map((q) => q.category))];

  // ✅ BUG FIX — matchDifficulty now inside filter
  const filteredQuestions = questions.filter((q) => {
    const matchSearch     = q.question.toLowerCase().includes(search.toLowerCase());
    const matchCategory   = category === "All" || q.category === category;
    const matchDifficulty = difficulty === "All" || q.difficulty === difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const pickRandom = () => {
    const pool = category === "All"
      ? questions
      : questions.filter(q => q.category === category);
    if (pool.length === 0) return;
    setRandom(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-8 pt-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎤</span>
            <div>
              <p className="text-blue-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">Interview Questions</h1>
            </div>
          </div>
          <p className="text-blue-300 text-sm mt-2">
            HR, technical and DSA questions with answers. Practice and self-assess.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { label: "Total",  value: questions.length,                                        color: "bg-white/10 text-white"             },
              { label: "Easy",   value: questions.filter(q => q.difficulty === "Easy").length,   color: "bg-emerald-500/20 text-emerald-300" },
              { label: "Medium", value: questions.filter(q => q.difficulty === "Medium").length, color: "bg-amber-500/20 text-amber-300"     },
              { label: "Hard",   value: questions.filter(q => q.difficulty === "Hard").length,   color: "bg-rose-500/20 text-rose-300"       },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[80px]`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[11px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map((cat, i) => <option key={i}>{cat}</option>)}
          </select>
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {["All","Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={pickRandom}
            className="px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition whitespace-nowrap">
            🎲 Random
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-5xl mx-auto px-8 mt-5 flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
            }`}>
            {categoryIcons[cat] || ""} {cat}
          </button>
        ))}
      </div>

      {/* Results count + clear */}
      <div className="max-w-5xl mx-auto px-8 mt-5 mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredQuestions.length}</span> of {questions.length} questions
        </p>
        {(search || category !== "All" || difficulty !== "All") && (
          <button onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }}
            className="text-xs text-slate-400 hover:text-slate-700 transition">
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Random Modal */}
      {random && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-blue-600">🎲 Random Question</span>
              <button onClick={() => setRandom(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider mb-2">{random.category}</p>
            <h3 className="text-base font-bold text-slate-800 mb-4">{random.question}</h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 leading-relaxed">{random.answer}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={pickRandom}
                className="flex-1 py-2.5 text-sm font-semibold bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                🎲 Another One
              </button>
              <button onClick={() => setRandom(null)}
                className="flex-1 py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="max-w-5xl mx-auto px-8 pb-16 space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-500 font-medium">No questions found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diff  = difficultyConfig[q.difficulty] || difficultyConfig.Easy;
            const isOpen = openId === q.id;
            return (
              <div key={q.id}
                className={`bg-white rounded-2xl border transition-all duration-200 ${
                  isOpen ? "border-indigo-200 shadow-lg" : "border-slate-100 hover:shadow-md"
                }`}>
                <div className="p-5">

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xl shrink-0 mt-0.5">{categoryIcons[q.category] || "❓"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">{q.category}</p>
                        {q.frequentlyAsked && (
                          <span className="text-[10px] font-semibold bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.5 rounded-full">
                            🔥 Frequent
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-slate-800">{q.question}</h2>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3 pl-8">
                    {q.difficulty && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />{q.difficulty}
                      </span>
                    )}
                    {q.companyTag && q.companyTag.split(",").map(tag => (
                      <span key={tag} className="text-[11px] bg-slate-50 text-slate-400 border border-slate-100 px-2.5 py-1 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Toggle */}
                  <button onClick={() => setOpenId(isOpen ? null : q.id)}
                    className="ml-8 text-xs font-semibold text-blue-500 hover:text-blue-700 transition">
                    {isOpen ? "Hide Answer ↑" : "Show Answer ↓"}
                  </button>

                  {/* Answer + Self Assessment */}
                  {isOpen && (
                    <div className="mt-4 ml-8">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-sm text-slate-600 leading-relaxed">{q.answer}</p>
                      </div>

                      {!assessment[q.id] ? (
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 mb-2">Did you know this?</p>
                          <div className="flex gap-2">
                            <button onClick={() => setAssessment({ ...assessment, [q.id]: "knew" })}
                              className="px-4 py-2 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition">
                              ✓ Yes, I knew this
                            </button>
                            <button onClick={() => setAssessment({ ...assessment, [q.id]: "didnt" })}
                              className="px-4 py-2 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition">
                              ✗ Need to revise
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`mt-3 text-xs font-semibold px-4 py-2.5 rounded-xl w-fit ${
                          assessment[q.id] === "knew"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}>
                          {assessment[q.id] === "knew" ? "✓ Marked as known" : "📌 Added to revision list"}
                        </div>
                      )}
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

export default InterviewQuestions;