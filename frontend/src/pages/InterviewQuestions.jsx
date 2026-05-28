import { useEffect, useState } from "react";
import { 
  MessageSquare, Search, Filter, Shuffle, HelpCircle, 
  Flame, CheckCircle2, Bookmark, X, ChevronDown, ChevronUp 
} from "lucide-react";
import api from "../services/api";

const categoryIcons = {
  HR: <HelpCircle size={16} />,
  Java: <MessageSquare size={16} />,
  React: <MessageSquare size={16} />,
  Python: <MessageSquare size={16} />,
  DSA: <MessageSquare size={16} />,
  "System Design": <MessageSquare size={16} />,
  DBMS: <MessageSquare size={16} />,
  OS: <MessageSquare size={16} />,
  "Spring Boot": <MessageSquare size={16} />,
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  Medium: { color: "text-amber-600 bg-amber-50 border-amber-100",   dot: "bg-amber-500" },
  Hard:   { color: "text-rose-600 bg-rose-50 border-rose-100",       dot: "bg-rose-500" },
};

function InterviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [randomQuestion, setRandomQuestion] = useState(null);

  // Persistent storage pattern for mock progress assessments
  const [assessment, setAssessment] = useState(() => {
    const saved = localStorage.getItem("prepforge_self_assessments");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Synchronize state mutations to local persistent storage blocks
  useEffect(() => {
    localStorage.setItem("prepforge_self_assessments", JSON.stringify(assessment));
  }, [assessment]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to load interview item indexes", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(questions.map((q) => q.category))];

  // Coordinated evaluation array matching all configuration elements
  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || q.category === category;
    const matchDifficulty = difficulty === "All" || q.difficulty === difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  // Hardened randomized selector matching precise active filters
  const pickRandomIntegratedQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setRandomQuestion(filteredQuestions[randomIndex]);
  };

  const commitSelfAssessmentState = (questionId, stateValue) => {
    setAssessment(prev => ({
      ...prev,
      [questionId]: stateValue
    }));
  };

  const stats = {
    total:  questions.length,
    easy:   questions.filter(q => q.difficulty === "Easy").length,
    medium: questions.filter(q => q.difficulty === "Medium").length,
    hard:   questions.filter(q => q.difficulty === "Hard").length,
  };

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto relative">
      
      {/* ── TOP SECTION: BRANDED CORE OVERLAY HERO ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0f2b] via-[#161a46] to-[#261b55] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              PrepForge Verification Matrix
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Interview Questions</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
              Master HR vetting workflows, runtime algorithmic complexities, and system design patterns curated by engineering leads.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Total Pool",  value: stats.total,  border: "border-white/10 text-white bg-white/[0.04]" },
              { label: "Easy Track",  value: stats.easy,  border: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
              { label: "Medium Core", value: stats.medium, border: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
              { label: "Hard Domain", value: stats.hard,   border: "border-rose-500/20 text-rose-400 bg-rose-500/5" },
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
            placeholder="Search questions by key concepts..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
          <div className="relative flex-1">
            <select 
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[140px]"
              value={category} 
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map((cat, i) => <option key={i} value={cat}>Category: {cat}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select 
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[130px]"
              value={difficulty} 
              onChange={e => setDifficulty(e.target.value)}
            >
              {["All","Easy","Medium","Hard"].map(d => <option key={d} value={d}>Complexity: {d}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={pickRandomIntegratedQuestion}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm shadow-indigo-100"
          >
            <Shuffle size={14} />
            <span>Random Selector</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL INTERACTIVE CATEGORY PILLS BAR */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
              category === cat
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CONTEXT RUNTIME COUNT LOGS CARD */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-400">
          Showing <span className="font-bold text-slate-700">{filteredQuestions.length}</span> of {questions.length} questions
        </p>
        {(search || category !== "All" || difficulty !== "All") && (
          <button 
            onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors focus:outline-none"
          >
            ✕ Clear Global Filters
          </button>
        )}
      </div>

      {/* ── OVERLAY DIALOG SYSTEM: RANDOM INTERACTIVE MODAL ── */}
      {randomQuestion && (
        <div className="fixed inset-0 bg-[#020617]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 animate-in scale-in duration-200 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 inline-flex items-center gap-1.5">
                <Shuffle size={14} /> Random Selection Evaluation
              </span>
              <button onClick={() => setRandomQuestion(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                {randomQuestion.category}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-2 tracking-tight leading-snug">
                {randomQuestion.question}
              </h3>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-4 max-h-[240px] overflow-y-auto">
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{randomQuestion.answer}</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={pickRandomIntegratedQuestion}
                className="flex-1 py-2.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
              >
                Draw Alternating Node
              </button>
              <button 
                onClick={() => setRandomQuestion(null)}
                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                Dismiss Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CORE RUNTIME ARCHITECTURE QUESTION SET LIST ── */}
      <section className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-3 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/5" />
              <div className="h-5 bg-slate-100 rounded w-4/5" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white p-8">
            <Search size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No matching questions encountered</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Readjust global dropdown configuration layers or clear character arrays.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const diff = difficultyConfig[q.difficulty] || difficultyConfig.Easy;
            const isOpen = openId === q.id;
            const userAssessment = assessment[q.id];

            return (
              <div 
                key={q.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-indigo-200 shadow-md shadow-slate-100" : "border-slate-200/60 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="p-5 md:p-6 space-y-4">
                  
                  {/* COMPONENT LAYOUT META WRAPPER HEADER */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                      {categoryIcons[q.category] || <HelpCircle size={16} />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                          {q.category}
                        </span>
                        {q.frequentlyAsked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-500 px-2 py-0.5 rounded-full">
                            <Flame size={10} />
                            <span>High Frequency</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                        {q.question}
                      </h2>
                    </div>
                  </div>

                  {/* SUBMETRICS BADGE ALLOCATION STRIP */}
                  <div className="flex items-center gap-2 flex-wrap pl-13">
                    {q.difficulty && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 border rounded-md ${diff.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                        {q.difficulty}
                      </span>
                    )}
                    {q.companyTag && q.companyTag.split(",").map(tag => (
                      <span key={tag} className="text-[11px] font-medium bg-slate-50 text-slate-400 border border-slate-200/40 px-2.5 py-1 rounded-md">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* SEPARATOR BUTTON TRIGGER TOGGLE ACTION */}
                  <div className="pl-13 pt-1">
                    <button 
                      onClick={() => setOpenId(isOpen ? null : q.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
                    >
                      <span>{isOpen ? "Conceal Verification Solution" : "Expose Verification Solution"}</span>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* COLLAPSIBLE DATA DRAWER VIEWPORT REGION */}
                  {isOpen && (
                    <div className="pl-13 pt-2 space-y-4 animate-in fade-in duration-200">
                      <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-4.5">
                        <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                          {q.answer}
                        </p>
                      </div>

                      {/* MEMORY SELF ASSESSMENT LOGIC CONTROLLER WINDOW */}
                      <div className="pt-2 border-t border-slate-100">
                        {!userAssessment ? (
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate Self Assessment Verification</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => commitSelfAssessmentState(q.id, "knew")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-700 rounded-xl transition-all"
                              >
                                <CheckCircle2 size={13} />
                                <span>Retained Successfully</span>
                              </button>
                              <button 
                                onClick={() => commitSelfAssessmentState(q.id, "didnt")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-700 rounded-xl transition-all"
                              >
                                <Bookmark size={13} />
                                <span>Flag for Core Revision</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 border rounded-xl shadow-inner ${
                            userAssessment === "knew"
                              ? "bg-emerald-50/60 border-emerald-200/60 text-emerald-700"
                              : "bg-rose-50/60 border-rose-200/60 text-rose-700"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${userAssessment === "knew" ? "bg-emerald-500" : "bg-rose-500"}`} />
                            <span>{userAssessment === "knew" ? "Candidate retained this structural layout successfully" : "Pinned inside localized compilation revision logs"}</span>
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