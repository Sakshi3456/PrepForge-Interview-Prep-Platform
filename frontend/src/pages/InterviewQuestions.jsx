import { useEffect, useState } from "react";
import {
  MessageSquare, Search, Filter, Shuffle, HelpCircle,
  Flame, CheckCircle2, Bookmark, X, ChevronDown, ChevronUp
} from "lucide-react";
import api from "../services/api";

const categoryIcons = {
  HR:              <HelpCircle size={16} />,
  Java:            <MessageSquare size={16} />,
  React:           <MessageSquare size={16} />,
  Python:          <MessageSquare size={16} />,
  DSA:             <MessageSquare size={16} />,
  "System Design": <MessageSquare size={16} />,
  DBMS:            <MessageSquare size={16} />,
  OS:              <MessageSquare size={16} />,
  "Spring Boot":   <MessageSquare size={16} />,
};

const difficultyConfig = {
  Easy:   { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  Medium: { badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",       dot: "bg-amber-400"   },
  Hard:   { badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",           dot: "bg-rose-400"    },
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
);

function InterviewQuestions() {
  const [questions,      setQuestions]      = useState([]);
  const [search,         setSearch]         = useState("");
  const [category,       setCategory]       = useState("All");
  const [difficulty,     setDifficulty]     = useState("All");
  const [openId,         setOpenId]         = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [randomQuestion, setRandomQuestion] = useState(null);

  const [assessment, setAssessment] = useState(() => {
    const saved = localStorage.getItem("prepforge_self_assessments");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => { fetchQuestions(); }, []);

  useEffect(() => {
    localStorage.setItem("prepforge_self_assessments", JSON.stringify(assessment));
  }, [assessment]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(questions.map((q) => q.category))];

  const filteredQuestions = questions.filter((q) => {
    const matchSearch     = q.question.toLowerCase().includes(search.toLowerCase());
    const matchCategory   = category   === "All" || q.category   === category;
    const matchDifficulty = difficulty === "All" || q.difficulty  === difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const pickRandom = () => {
    if (filteredQuestions.length === 0) return;
    const idx = Math.floor(Math.random() * filteredQuestions.length);
    setRandomQuestion(filteredQuestions[idx]);
  };

  const markAssessment = (questionId, value) => {
    setAssessment(prev => ({ ...prev, [questionId]: value }));
  };

  const stats = {
    total:  questions.length,
    easy:   questions.filter(q => q.difficulty === "Easy").length,
    medium: questions.filter(q => q.difficulty === "Medium").length,
    hard:   questions.filter(q => q.difficulty === "Hard").length,
  };

  return (
    <div className="space-y-6 pb-16 relative min-w-0 overflow-x-hidden w-full">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0f2b] via-[#161a46] to-[#261b55] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Interview Prep</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Interview Questions</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-md font-medium leading-relaxed">
              HR, technical, DSA and system design questions — with answers and self-assessment.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Total",  value: stats.total,  cls: "border-white/10 text-white bg-white/[0.04]"                    },
              { label: "Easy",   value: stats.easy,   cls: "border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.06]"  },
              { label: "Medium", value: stats.medium, cls: "border-amber-500/20 text-amber-400 bg-amber-500/[0.06]"        },
              { label: "Hard",   value: stats.hard,   cls: "border-rose-500/20 text-rose-400 bg-rose-500/[0.06]"           },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[80px] ${s.cls}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
          <div className="relative flex-1">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none pr-8 min-w-[140px]"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map((cat, i) => <option key={i} value={cat}>Category: {cat}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none pr-8 min-w-[130px]"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              {["All","Easy","Medium","Hard"].map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>

          <button
            onClick={pickRandom}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Shuffle size={14} />
            <span>Random Question</span>
          </button>
        </div>
      </div>

      {/* ── Category pills ────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-150 ${
              category === cat
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                : "bg-white/[0.03] text-slate-500 border-white/[0.07] hover:bg-white/[0.07] hover:text-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-600">
          Showing <span className="font-bold text-slate-400">{filteredQuestions.length}</span> of {questions.length} questions
        </p>
        {(search || category !== "All" || difficulty !== "All") && (
          <button
            onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }}
            className="text-xs font-bold text-slate-600 hover:text-rose-400 transition-colors"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* ── Random Question Modal ─────────────────────────────────────────── */}
      {randomQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0f28] border border-white/[0.08] rounded-2xl p-6 max-w-xl w-full shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400 inline-flex items-center gap-1.5">
                <Shuffle size={14} /> Random Question
              </span>
              <button
                onClick={() => setRandomQuestion(null)}
                className="p-1 text-slate-600 hover:text-slate-300 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.07]">
                {randomQuestion.category}
              </span>
              <h3 className="text-base font-bold text-slate-200 mt-2 tracking-tight leading-snug">
                {randomQuestion.question}
              </h3>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 max-h-[240px] overflow-y-auto">
              <p className="text-xs font-medium text-slate-400 leading-relaxed">{randomQuestion.answer}</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={pickRandom}
                className="flex-1 py-2.5 text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl transition-colors"
              >
                Next Random
              </button>
              <button
                onClick={() => setRandomQuestion(null)}
                className="flex-1 py-2.5 text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-400 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Question list ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] p-6 space-y-3">
              <Skeleton className="h-3 w-1/5" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl bg-[#0d0f28]">
            <Search size={32} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-400">No questions found</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diff         = difficultyConfig[q.difficulty] || difficultyConfig.Easy;
            const isOpen       = openId === q.id;
            const userMark     = assessment[q.id];

            return (
              <div
                key={q.id}
                className={`bg-[#0d0f28] rounded-2xl border transition-all duration-200 overflow-hidden min-w-0 ${
                  isOpen
                    ? "border-indigo-500/30 bg-[#111438]"
                    : "border-white/[0.06] hover:border-indigo-500/20 hover:bg-[#0f1130]"
                }`}
              >
                <div className="p-5 space-y-3">

                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      {categoryIcons[q.category] || <HelpCircle size={16} />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                          {q.category}
                        </span>
                        {q.frequentlyAsked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                            <Flame size={10} />
                            <span>Frequently Asked</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-[15px] font-bold text-slate-200 tracking-tight leading-snug break-words">
                        {q.question}
                      </h2>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap pl-13">
                    {q.difficulty && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 border rounded-md ${diff.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                        {q.difficulty}
                      </span>
                    )}
                    {q.companyTag && q.companyTag.split(",").map(tag => (
                      <span key={tag} className="text-[11px] font-medium bg-white/[0.04] text-slate-500 border border-white/[0.07] px-2.5 py-1 rounded-md">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Toggle */}
                  <div className="pl-13">
                    <button
                      onClick={() => setOpenId(isOpen ? null : q.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>{isOpen ? "Hide Answer" : "Show Answer"}</span>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Answer + Self Assessment */}
                  {isOpen && (
                    <div className="pl-13 pt-2 space-y-4">
                      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-400 leading-relaxed whitespace-pre-line">
                          {q.answer}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/[0.05]">
                        {!userMark ? (
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Did you know this?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => markAssessment(q.id, "knew")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                              >
                                <CheckCircle2 size={13} />
                                <span>Yes, I knew it</span>
                              </button>
                              <button
                                onClick={() => markAssessment(q.id, "didnt")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all"
                              >
                                <Bookmark size={13} />
                                <span>Need to revise</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 border rounded-xl ${
                            userMark === "knew"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${userMark === "knew" ? "bg-emerald-400" : "bg-rose-400"}`} />
                            <span>{userMark === "knew" ? "Marked as known ✓" : "Added to revision list"}</span>
                          </div>
                        )}
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

export default InterviewQuestions;