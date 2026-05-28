import { useEffect, useState } from "react";
import { 
  FileCode, Terminal, Clock, ShieldCheck, Trophy, History, 
  HelpCircle, CheckCircle2, XCircle, AlertTriangle, Code, ChevronRight, Sparkles 
} from "lucide-react";
import api from "../services/api";

const categoryConfig = {
  Java:          { color: "text-orange-600 bg-orange-50/60 border-orange-100" },
  React:         { color: "text-cyan-600 bg-cyan-50/60 border-cyan-100" },
  Python:        { color: "text-blue-600 bg-blue-50/60 border-blue-100" },
  "Spring Boot": { color: "text-emerald-600 bg-emerald-50/60 border-emerald-100" },
  DBMS:          { color: "text-purple-600 bg-purple-50/60 border-purple-100" },
  OS:            { color: "text-slate-600 bg-slate-50/60 border-slate-100" },
  Networking:    { color: "text-indigo-600 bg-indigo-50/60 border-indigo-100" },
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  Medium: { color: "text-amber-600 bg-amber-50 border-amber-100",   dot: "bg-amber-500" },
  Hard:   { color: "text-rose-600 bg-rose-50 border-rose-100",       dot: "bg-rose-500" },
};

const QUIZ_TIME = 1200; // 20 minutes in seconds

function TechnicalMcq() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [questionType, setQuestionType] = useState("All");
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardScope, setLeaderboardScope] = useState("");

  useEffect(() => {
    fetchQuestions();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!quizMode || score !== null) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "In-flight evaluation task modules will clear if you exit this canvas link.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizMode, score]);

  useEffect(() => {
    if (!quizMode || score !== null) return;
    if (timeLeft <= 0) {
      handleAutoSubmitQuiz();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [quizMode, timeLeft, score]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mcq");
      setQuestions(res.data);
    } catch (err) {
      console.error("Downstream dataset tracking failure", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/mcq-sessions/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("History data channel syncing error", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const activeScope = category === "All" ? "Global Pool" : category;
      const catParam = category === "All" ? "Java" : category; // Logic layer fallback parameter string
      setLeaderboardScope(activeScope);
      
      const res = await api.get(`/mcq-sessions/leaderboard/${catParam}`);
      setLeaderboard(res.data);
      setShowLeaderboard(true);
    } catch (err) {
      console.error("Leaderboard query handshake rejected", err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchCategory = category === "All" || q.category === category;
    const matchDifficulty = difficulty === "All" || q.difficulty === difficulty;
    const matchQuestionType = questionType === "All" || q.questionType === questionType;
    return matchCategory && matchDifficulty && matchQuestionType;
  });

  const startTimedQuiz = async () => {
    try {
      const params = category !== "All" ? `?category=${category}&count=20` : `?count=20`;
      const res = await api.get(`/mcq/quiz${params}`);
      setQuizQuestions(res.data);
      setAnswers({});
      setScore(null);
      setTimeLeft(QUIZ_TIME);
      setShowReview(false);
      setQuizMode(true);
    } catch (err) {
      console.error("Asynchronous exam initialization channel broken", err);
    }
  };

  const handleSelect = (id, option) => {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleAutoSubmitQuiz = () => {
    submitQuiz();
  };

  const handleManualSubmitAttempt = () => {
    const activeQuestions = quizMode ? quizQuestions : filteredQuestions;
    const totalCommitted = Object.keys(answers).length;

    if (totalCommitted < activeQuestions.length) {
      const confirmSubmit = window.confirm(`You left ${activeQuestions.length - totalCommitted} options unselected. Commit anyway?`);
      if (!confirmSubmit) return;
    }
    submitQuiz();
  };

  const submitQuiz = async () => {
    const activeQuestions = quizMode ? quizQuestions : filteredQuestions;
    let total = 0;
    const wrong = [];

    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        total++;
      } else {
        wrong.push(q);
      }
    });

    setScore(total);
    setWrongAnswers(wrong);
    const calculatedTimeTaken = QUIZ_TIME - timeLeft;
    setTimeTaken(calculatedTimeTaken);

    try {
      const userId = localStorage.getItem("userId");
      await api.post("/mcq-sessions/save", {
        userId: parseInt(userId),
        category: category === "All" ? "Mixed" : category,
        score: total,
        total: activeQuestions.length,
        timeTaken: calculatedTimeTaken,
      });
      await api.post(`/progress/streak/${userId}`);
      fetchHistory();
    } catch (err) {
      console.error("Failed to compile session tracking matrix updates", err);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setScore(null);
    setQuizMode(false);
    setQuizQuestions([]);
    setShowReview(false);
    setTimeLeft(QUIZ_TIME);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // High-fidelity user pseudonym mask generator
  const createBrandedPseudonym = (idStr) => {
    const num = parseInt(idStr) || 7;
    const structures = ["AlphaCoder", "DevByte", "StackPilot", "KernelCore", "SyntaxForge", "ByteNexus"];
    return `${structures[num % structures.length]}_#${num * 11}`;
  };

  const activeQuestions = quizMode ? quizQuestions : filteredQuestions;
  const categories = ["All", "Java", "React", "Python", "Spring Boot", "DBMS", "OS", "Networking"];

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto relative">
      
      {/* ── TOP BANNER JUMBOTRON ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0f142b] via-[#171c46] to-[#2b1e55] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              PrepForge Core Architecture Vetting
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Technical MCQ</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl font-medium leading-relaxed">
              Verify framework comprehension boundaries, lifecycle models, thread allocation scopes, and trace logical compilation outputs.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Index Matrix",     value: questions.length, border: "border-white/10 text-white bg-white/[0.04]" },
              { label: "Historical Runs",   value: history.length,   border: "border-blue-500/20 text-blue-400 bg-blue-500/5" },
              { label: "Output Track", value: questions.filter(q => q.questionType === "OUTPUT_BASED").length, border: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
              { label: "High Frequency",   value: questions.filter(q => q.frequentlyAsked).length, border: "border-rose-500/20 text-rose-400 bg-rose-500/5" },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[100px] shadow-sm backdrop-blur-sm ${s.border}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CORE CONTROL INTERFACE PANEL ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col xl:flex-row gap-3 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full">
          <select 
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={category} onChange={e => setCategory(e.target.value)} disabled={quizMode}
          >
            {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
          </select>
          
          <select 
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={quizMode}
          >
            {["All","Easy","Medium","Hard"].map(d => <option key={d} value={d}>Complexity: {d}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={questionType} onChange={e => setQuestionType(e.target.value)} disabled={quizMode}
          >
            {["All","THEORY","OUTPUT_BASED"].map(t => <option key={t} value={t}>Task Rule: {t === "OUTPUT_BASED" ? "Output Evaluation" : t}</option>)}
          </select>
        </div>

        <div className="flex gap-2 w-full xl:w-auto shrink-0 border-t xl:border-t-0 pt-3 xl:pt-0">
          <button 
            onClick={startTimedQuiz} 
            disabled={quizMode}
            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-100"
          >
            <Clock size={14} />
            <span>Launch Core Quiz Matrix</span>
          </button>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl transition-colors"
            title="Toggle Audit Logs"
          >
            <History size={14} />
          </button>

          <button 
            onClick={fetchLeaderboard}
            className="inline-flex items-center justify-center p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 rounded-xl transition-all shadow-inner"
            title="Query Leaderboards"
          >
            <Trophy size={14} />
          </button>
        </div>
      </div>

      {/* HORIZONTAL INTERACTIVE PILLS GRID STRIP */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            disabled={quizMode}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 disabled:opacity-40 ${
              category === cat
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── PERSISTENT SYSTEM HISTORY DATA BANNER ── */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <History size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Onboarding Diagnostic Logs</h3>
          </div>
          {history.length === 0 ? (
            <p className="text-xs font-medium text-slate-400 text-center py-4">No historical records saved within account logs.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 tracking-tight">{h.category}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(h.attemptedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/40">
                    <span className="text-sm font-black text-indigo-600">{h.score}/{h.total}</span>
                    <span className="text-[10px] font-bold text-slate-400">{h.accuracy?.toFixed(0)}% Acc</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LEADERBOARD PRESENTATION WINDOW modal ── */}
      {showLeaderboard && (
        <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/[0.02] to-transparent rounded-2xl border border-amber-200/60 shadow-sm p-6 animate-in fade-in duration-200 relative">
          <div className="flex items-center justify-between border-b border-amber-200/40 pb-3 mb-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs tracking-wide uppercase">
              <Trophy size={15} />
              <span>Rank Verification Framework — Scope: {leaderboardScope}</span>
            </div>
            <button onClick={() => setShowLeaderboard(false)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
              Conceal Interface
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-xs font-medium text-slate-400 py-4 text-center">No structural entries tracked within this technology segment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {leaderboard.slice(0, 5).map((l, i) => (
                <div key={l.id} className="p-4 bg-white border border-slate-200/80 rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden shadow-sm shadow-amber-500/[0.01]">
                  {i < 3 && <div className="absolute top-0 right-0 w-6 h-6 bg-amber-500/10 flex items-center justify-center text-[10px] font-black rounded-bl-xl text-amber-700">#0{i+1}</div>}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 tracking-tight">{createBrandedPseudonym(l.userId)}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{l.accuracy?.toFixed(0)}% Accuracy</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Score</span>
                    <span className="text-sm font-black text-amber-600">{l.score}/{l.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ EVALUATION RUNTIME CONTAINER BAR ── */}
      {quizMode && score === null && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluation Sequence In-Flight</p>
            <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / quizQuestions.length) * 100}%` }} 
              />
            </div>
            <p className="text-[11px] font-medium text-slate-400">{Object.keys(answers).length} of {quizQuestions.length} statements locked</p>
          </div>
          
          <div className={`px-4 py-2.5 rounded-xl text-sm font-black border tracking-wide ${
            timeLeft < 180 
              ? "bg-rose-50 border-rose-100 text-rose-600 prescribe-pulse animate-pulse" 
              : "bg-indigo-50 border-indigo-100 text-indigo-600"
          }`}>
            ⏱ Counter Frame: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* ── SCORE RESULT JUMBOTRON SUMMARY PANEL ── */}
      {score !== null && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-8 text-center space-y-6 max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Evaluation Finalized: {score} / {activeQuestions.length}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Logged Accuracy Score: {((score / activeQuestions.length) * 100).toFixed(0)}% 
              {quizMode && <span className="text-slate-300 mx-2">|</span>}
              {quizMode && <span>Verification Time: {formatTime(timeTaken)}</span>}
            </p>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                score / activeQuestions.length >= 0.8 ? "bg-emerald-500" :
                score / activeQuestions.length >= 0.5 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${(score / activeQuestions.length) * 100}%` }}
            />
          </div>

          <div className="flex gap-2.5 justify-center">
            {wrongAnswers.length > 0 && (
              <button 
                onClick={() => setShowReview(!showReview)}
                className="px-4 py-2.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-colors"
              >
                Audit {wrongAnswers.length} Technical Failures
              </button>
            )}
            <button 
              onClick={resetQuiz}
              className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm"
            >
              Re-Initialize Matrix
            </button>
          </div>

          {/* FAILED STATEMENT AUDIT SUBPANEL REGION */}
          {showReview && wrongAnswers.length > 0 && (
            <div className="text-left pt-6 border-t border-slate-100 space-y-4 max-h-[380px] overflow-y-auto pr-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Vulnerability Compilation Stream</h3>
              {wrongAnswers.map((q, i) => (
                <div key={q.id} className="bg-rose-50/40 border border-rose-100 p-4.5 rounded-xl space-y-2">
                  
                  {q.codeSnippet && (
                    <div className="bg-[#0b0f19] border border-white/5 rounded-xl p-3 shadow-inner">
                      <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed whitespace-pre overflow-x-auto">
                        {q.codeSnippet}
                      </pre>
                    </div>
                  )}

                  <h4 className="font-bold text-xs text-slate-800 leading-snug">{i + 1}. {q.question}</h4>
                  <div className="text-[11px] font-bold space-y-0.5">
                    <p className="text-rose-600">Committed Statement: {answers[q.id] ? q[answers[q.id]] : "No string parameter input recorded"}</p>
                    <p className="text-emerald-600">Expected Vector: {q[q.correctAnswer]}</p>
                  </div>
                  {q.explanation && (
                    <div className="bg-white rounded-lg p-3 border border-rose-100/50 mt-1">
                      <p className="text-xs font-medium text-slate-500 leading-relaxed"><span className="font-bold text-amber-600">Correction Logic:</span> {q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FILTER RUNTIME COUNT READOUT HEADER STATUS */}
      {!quizMode && (
        <div className="px-1 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">
            Showing <span className="font-bold text-slate-700">{filteredQuestions.length}</span> of {questions.length} entries matching criteria
          </p>
          {(category !== "All" || difficulty !== "All" || questionType !== "All") && (
            <button 
              onClick={() => { setCategory("All"); setDifficulty("All"); setQuestionType("All"); }}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors focus:outline-none"
            >
              ✕ Clear Active Configuration Matrices
            </button>
          )}
        </div>
      )}

      {/* ── CORE COMPONENT INTERFACE LIST QUEUE ── */}
      <section className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/5" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="space-y-2 pt-2">
                {[...Array(4)].map((_, j) => <div key={j} className="h-11 bg-slate-50 rounded-xl" />)}
              </div>
            </div>
          ))
        ) : activeQuestions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white p-8">
            <FileCode size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Zero active questions matching filters</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Readjust tracking drop-down layers or reset global parameter elements.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeQuestions.map((q, index) => {
              const submitted = score !== null;
              const selected = answers[q.id];
              const isCorrect = selected === q.correctAnswer;
              const cat = categoryConfig[q.category] || categoryConfig.Java;
              const diff = difficultyConfig[q.difficulty] || difficultyConfig.Easy;

              return (
                <div 
                  key={q.id} 
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    submitted
                      ? selected === q.correctAnswer
                        ? "border-emerald-300 shadow-md shadow-emerald-50"
                        : selected
                          ? "border-rose-300 shadow-md shadow-rose-50"
                          : "border-slate-200"
                      : "border-slate-200/60 hover:border-slate-300"
                  }`}
                >
                  <div className="p-5 md:p-6 space-y-4">
                    
                    {/* METADATA TAGS SUBSTRATE STRIP */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${cat.color}`}>
                            {q.category}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 border rounded ${diff.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                            <span>{q.difficulty}</span>
                          </span>
                          {q.questionType === "OUTPUT_BASED" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50/60 border border-amber-200/60 text-amber-700 px-2.5 py-0.5 rounded">
                              <Code size={10} />
                              <span>Compilation Analysis</span>
                            </span>
                          )}
                          {q.frequentlyAsked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-500 px-2 py-0.5 rounded-full">
                              <Sparkles size={10} />
                              <span>High Frequency</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                          {index + 1}. {q.question}
                        </h3>
                      </div>

                      {submitted && selected && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                          isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
                        }`}>
                          {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC CODE BLOCKS COMPILER VISUALIZER */}
                    {q.codeSnippet && (
                      <div className="bg-[#0a0d16] border border-white/5 rounded-xl p-4 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 text-[9px] font-black tracking-widest uppercase text-slate-600 bg-white/[0.02] border-b border-l border-white/5 px-2.5 py-1">Compiler Sandbox Output</div>
                        <pre className="text-xs text-indigo-300 font-mono leading-relaxed whitespace-pre overflow-x-auto pt-2">
                          {q.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* INTERACTIVE COMPONENT RADIO FIELDS SYSTEM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {["optionA","optionB","optionC","optionD"].map((opt, optIndex) => {
                        const labelCharacter = ["A","B","C","D"][optIndex];
                        const isOptionSelected = selected === opt;
                        const isTargetAnswer = q.correctAnswer === opt;

                        let interactiveBoxClass = "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/10";
                        let innerBadgeClass = "bg-white border border-slate-200 text-slate-400";

                        if (submitted) {
                          if (isTargetAnswer) {
                            interactiveBoxClass = "border-emerald-300 bg-emerald-50/50 text-emerald-800";
                            innerBadgeClass = "bg-emerald-500 text-white border-emerald-500 shadow-sm";
                          } else if (isOptionSelected && !isTargetAnswer) {
                            interactiveBoxClass = "border-rose-300 bg-rose-50/50 text-rose-800";
                            innerBadgeClass = "bg-rose-500 text-white border-rose-500 shadow-sm";
                          } else {
                            interactiveBoxClass = "border-slate-100 bg-slate-50/20 text-slate-400";
                            innerBadgeClass = "bg-slate-50 border-slate-100 text-slate-300";
                          }
                        } else if (isOptionSelected) {
                          interactiveBoxClass = "border-indigo-500 bg-indigo-50/30 text-indigo-900 shadow-sm";
                          innerBadgeClass = "bg-indigo-600 text-white border-indigo-600 shadow-md";
                        }

                        return (
                          <label 
                            key={opt}
                            className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden ${interactiveBoxClass} ${
                              submitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${innerBadgeClass}`}>
                              {labelCharacter}
                            </span>
                            <input 
                              type="radio" name={`q-${q.id}`} value={opt}
                              checked={isOptionSelected} onChange={() => handleSelect(q.id, opt)}
                              className="hidden" disabled={submitted} 
                            />
                            <span className={`text-xs font-semibold tracking-tight ${q.questionType === "OUTPUT_BASED" && opt.length < 15 ? "font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 border border-slate-200" : ""}`}>
                              {q[opt]}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* SOLUTION rationale DESCRIPTIVE POPUP BOX */}
                    {submitted && q.explanation && (
                      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px] uppercase tracking-wide mb-1">
                          <HelpCircle size={12} />
                          <span>Correction Rationale</span>
                        </div>
                        <p className="text-xs font-medium text-amber-800 leading-relaxed whitespace-pre-line">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* BLOCK SUBMIT CONTROLLER TARGET LINK */}
            {score === null && (
              <button 
                onClick={handleManualSubmitAttempt}
                className="w-full inline-flex items-center justify-center gap-1.5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-[0.995]"
              >
                <span>Commit Diagnostics Log</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </section>

    </div>
  );
}

export default TechnicalMcq;