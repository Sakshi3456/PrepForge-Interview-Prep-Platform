import { useEffect, useState } from "react";
import {
  FileCode, Clock, CheckCircle2, XCircle, HelpCircle,
  History, ChevronRight, Code, Sparkles, Trophy
} from "lucide-react";
import api from "../services/api";

const categoryConfig = {
  Java:          { color: "text-orange-400 bg-orange-500/10 border-orange-500/20"   },
  React:         { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"         },
  Python:        { color: "text-blue-400 bg-blue-500/10 border-blue-500/20"         },
  "Spring Boot": { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"},
  DBMS:          { color: "text-purple-400 bg-purple-500/10 border-purple-500/20"   },
  OS:            { color: "text-slate-400 bg-slate-500/10 border-slate-500/20"      },
  Networking:    { color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"   },
};
const difficultyConfig = {
  Easy:   { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  Medium: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20",       dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-400 bg-rose-500/10 border-rose-500/20",          dot: "bg-rose-400"    },
};

const TIMER_OPTIONS = [
  { label: "10 min", seconds: 600  },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
];

const categories = ["All", "Java", "React", "Python", "Spring Boot", "DBMS", "OS", "Networking"];

const getAnonName = (idStr) => {
  const num = parseInt(idStr) || 7;
  const names = ["AlphaCoder","DevByte","StackPilot","KernelCore","SyntaxForge","ByteNexus"];
  return `${names[num % names.length]}_${num * 11}`;
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
);

// ── Single question card ──────────────────────────────────────────────────────
function QuestionCard({ q, index, submitted, selected, answers, onSelect, fullWidth }) {
  const isCorrect = selected === q.correctAnswer;
  const cat  = categoryConfig[q.category]    || categoryConfig.Java;
  const diff = difficultyConfig[q.difficulty] || difficultyConfig.Easy;

  return (
    <div className={`bg-[#0d0f28] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
      submitted
        ? selected === q.correctAnswer ? "border-emerald-500/30"
          : selected ? "border-rose-500/30"
          : "border-white/[0.06]"
        : "border-white/[0.06] hover:border-indigo-500/20"
    }`}>
      <div className="p-4 md:p-5 flex flex-col flex-1 gap-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${cat.color}`}>
                {q.category}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 border rounded ${diff.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />{q.difficulty}
              </span>
              {q.questionType === "OUTPUT_BASED" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded">
                  <Code size={10} />Output Based
                </span>
              )}
              {q.frequentlyAsked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} />Frequently Asked
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-200 tracking-tight leading-snug">
              {index + 1}. {q.question}
            </h3>
          </div>
          {submitted && selected && (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
              isCorrect
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {isCorrect ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
            </div>
          )}
        </div>

        {/* Code snippet */}
        {q.codeSnippet && (
          <div className="bg-[#0a0d16] border border-white/[0.05] rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[9px] font-black tracking-widest uppercase text-slate-600 bg-white/[0.02] border-b border-l border-white/[0.05] px-2.5 py-1">
              Code
            </div>
            <pre className="text-xs text-indigo-300 font-mono leading-relaxed whitespace-pre overflow-x-auto pt-2">{q.codeSnippet}</pre>
          </div>
        )}

        {/* Options — 2 col inside card */}
        <div className="grid grid-cols-2 gap-2">
          {["optionA","optionB","optionC","optionD"].map((opt, optIndex) => {
            const label      = ["A","B","C","D"][optIndex];
            const isSelected = selected === opt;
            const isAnswer   = q.correctAnswer === opt;

            let boxCls   = "border-white/[0.07] bg-white/[0.03] text-slate-400 hover:border-indigo-500/40 hover:bg-indigo-500/[0.05]";
            let badgeCls = "bg-white/[0.05] border-white/[0.08] text-slate-600";

            if (submitted) {
              if (isAnswer)                    { boxCls = "border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-300"; badgeCls = "bg-emerald-500 text-white border-emerald-500"; }
              else if (isSelected && !isAnswer){ boxCls = "border-rose-500/30 bg-rose-500/[0.07] text-rose-300";         badgeCls = "bg-rose-500 text-white border-rose-500"; }
              else                             { boxCls = "border-white/[0.04] bg-white/[0.02] text-slate-600";           badgeCls = "bg-white/[0.03] border-white/[0.05] text-slate-700"; }
            } else if (isSelected) {
              boxCls   = "border-indigo-500/50 bg-indigo-500/10 text-slate-200";
              badgeCls = "bg-indigo-600 text-white border-indigo-600";
            }

            return (
              <label key={opt} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-150 ${boxCls} ${
                submitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
              }`}>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border transition-colors ${badgeCls}`}>
                  {label}
                </span>
                <input type="radio" name={`q-${q.id}`} value={opt} checked={isSelected}
                  onChange={() => onSelect(q.id, opt)} className="hidden" disabled={submitted} />
                <span className={`text-[11px] font-semibold leading-tight ${
                  q.questionType === "OUTPUT_BASED" && q[opt]?.length < 15
                    ? "font-mono bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]"
                    : ""
                }`}>
                  {q[opt]}
                </span>
              </label>
            );
          })}
        </div>

        {/* Explanation */}
        {submitted && q.explanation && (
          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-[10px] uppercase tracking-wide mb-1">
              <HelpCircle size={11} />Explanation
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function TechnicalMcq() {
  const [questions,        setQuestions]        = useState([]);
  const [answers,          setAnswers]          = useState({});
  const [score,            setScore]            = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [category,         setCategory]         = useState("All");
  const [difficulty,       setDifficulty]       = useState("All");
  const [questionType,     setQuestionType]     = useState("All");
  const [quizMode,         setQuizMode]         = useState(false);
  const [quizQuestions,    setQuizQuestions]    = useState([]);
  const [timeLeft,         setTimeLeft]         = useState(1200);
  const [wrongAnswers,     setWrongAnswers]     = useState([]);
  const [showReview,       setShowReview]       = useState(false);
  const [history,          setHistory]          = useState([]);
  const [showHistory,      setShowHistory]      = useState(false);
  const [timeTaken,        setTimeTaken]        = useState(0);
  const [leaderboard,      setLeaderboard]      = useState([]);
  const [showLeaderboard,  setShowLeaderboard]  = useState(false);
  const [leaderboardScope, setLeaderboardScope] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1200);

  useEffect(() => { fetchQuestions(); fetchHistory(); }, []);

  useEffect(() => {
    if (!quizMode || score !== null) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = "Quiz in progress."; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [quizMode, score]);

  useEffect(() => {
    if (!quizMode || score !== null) return;
    if (timeLeft <= 0) { submitQuiz(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [quizMode, timeLeft, score]);

  const fetchQuestions = async () => {
    setLoading(true);
    try { const res = await api.get("/mcq"); setQuestions(res.data); }
    catch (err) { console.error("Failed to load questions", err); }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/mcq-sessions/history/${userId}`);
      setHistory(res.data);
    } catch (err) { console.error("Failed to load history", err); }
  };

  const fetchLeaderboard = async () => {
    try {
      const scope    = category === "All" ? "Global" : category;
      const catParam = category === "All" ? "Java"   : category;
      setLeaderboardScope(scope);
      const res = await api.get(`/mcq-sessions/leaderboard/${catParam}`);
      setLeaderboard(res.data);
      setShowLeaderboard(true);
    } catch (err) { console.error("Failed to load leaderboard", err); }
  };

  const filteredQuestions = questions.filter(q => {
    const matchCat  = category     === "All" || q.category     === category;
    const matchDiff = difficulty   === "All" || q.difficulty   === difficulty;
    const matchType = questionType === "All" || q.questionType === questionType;
    return matchCat && matchDiff && matchType;
  });

  const activeQuestions = quizMode ? quizQuestions : filteredQuestions;

  const startQuiz = async () => {
    try {
      const params = category !== "All" ? `?category=${category}&count=20` : `?count=20`;
      const res = await api.get(`/mcq/quiz${params}`);
      setQuizQuestions(res.data);
      setAnswers({});
      setScore(null);
      setTimeLeft(selectedDuration);
      setShowReview(false);
      setQuizMode(true);
    } catch (err) { console.error("Failed to start quiz", err); }
  };

  const handleSelect = (id, option) => {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleSubmit = () => {
    const unanswered = activeQuestions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`)) return;
    }
    submitQuiz();
  };

  const submitQuiz = async () => {
    let total = 0; const wrong = [];
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) total++;
      else wrong.push(q);
    });
    setScore(total);
    setWrongAnswers(wrong);
    const taken = selectedDuration - timeLeft;
    setTimeTaken(taken);
    try {
      const userId = parseInt(localStorage.getItem("userId"), 10);
      await api.post("/mcq-sessions/save", {
        userId, category: category === "All" ? "Mixed" : category,
        score: total, total: activeQuestions.length, timeTaken: taken,
      });
      await api.post(`/progress/streak/${userId}`);
      fetchHistory();
    } catch (err) { console.error("Failed to save score", err); }
  };

  const resetQuiz = () => {
    setAnswers({}); setScore(null); setQuizMode(false);
    setQuizQuestions([]); setShowReview(false); setTimeLeft(selectedDuration);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Split questions: code-based go full width, theory go 2-per-row
  const renderQuestions = () => {
    const rows = [];
    let i = 0;
    while (i < activeQuestions.length) {
      const q = activeQuestions[i];
      const hasCode = !!q.codeSnippet || q.questionType === "OUTPUT_BASED";

      if (hasCode) {
        // Full width
        rows.push(
          <div key={q.id} className="col-span-1 lg:col-span-2">
            <QuestionCard q={q} index={i} submitted={score !== null}
              selected={answers[q.id]} answers={answers} onSelect={handleSelect} fullWidth />
          </div>
        );
        i++;
      } else {
        // Try to pair with next non-code question
        const next = activeQuestions[i + 1];
        const nextHasCode = next && (!!next.codeSnippet || next.questionType === "OUTPUT_BASED");

        rows.push(
          <div key={q.id}>
            <QuestionCard q={q} index={i} submitted={score !== null}
              selected={answers[q.id]} answers={answers} onSelect={handleSelect} />
          </div>
        );

        if (next && !nextHasCode) {
          rows.push(
            <div key={next.id}>
              <QuestionCard q={next} index={i + 1} submitted={score !== null}
                selected={answers[next.id]} answers={answers} onSelect={handleSelect} />
            </div>
          );
          i += 2;
        } else {
          // Odd theory question — make it full width too
          rows[rows.length - 1] = (
            <div key={q.id} className="col-span-1 lg:col-span-2">
              <QuestionCard q={q} index={i} submitted={score !== null}
                selected={answers[q.id]} answers={answers} onSelect={handleSelect} fullWidth />
            </div>
          );
          i++;
        }
      }
    }
    return rows;
  };

  return (
    <div className="space-y-6 pb-16 max-w-[1400px] mx-auto">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f142b] via-[#171c46] to-[#2b1e55] p-8">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Technical Practice</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Technical MCQ</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl font-medium leading-relaxed">
              Test your knowledge across Java, React, Python, DBMS, OS, and Networking — with output-based questions and explanations.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Questions",        value: questions.length,                                               cls: "border-white/10 text-white bg-white/[0.04]"             },
              { label: "Sessions",         value: history.length,                                                 cls: "border-blue-500/20 text-blue-400 bg-blue-500/[0.06]"    },
              { label: "Output Based",     value: questions.filter(q => q.questionType === "OUTPUT_BASED").length,cls: "border-amber-500/20 text-amber-400 bg-amber-500/[0.06]" },
              { label: "Frequently Asked", value: questions.filter(q => q.frequentlyAsked).length,               cls: "border-rose-500/20 text-rose-400 bg-rose-500/[0.06]"    },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[110px] ${s.cls}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 flex flex-col xl:flex-row gap-3 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full">
          <select className="px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition disabled:opacity-40"
            value={category} onChange={e => setCategory(e.target.value)} disabled={quizMode}>
            {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
          </select>
          <select className="px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition disabled:opacity-40"
            value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={quizMode}>
            {["All","Easy","Medium","Hard"].map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
          </select>
          <select className="px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition disabled:opacity-40"
            value={questionType} onChange={e => setQuestionType(e.target.value)} disabled={quizMode}>
            {["All","THEORY","OUTPUT_BASED"].map(t => (
              <option key={t} value={t}>
                Type: {t === "OUTPUT_BASED" ? "Output Based" : t === "THEORY" ? "Theory" : "All"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full xl:w-auto shrink-0 border-t xl:border-t-0 xl:border-l border-white/[0.05] pt-3 xl:pt-0 xl:pl-3 flex-wrap">
          {/* Timer selector */}
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 shrink-0">
            {TIMER_OPTIONS.map(opt => (
              <button key={opt.seconds}
                onClick={() => { setSelectedDuration(opt.seconds); setTimeLeft(opt.seconds); }}
                disabled={quizMode}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  selectedDuration === opt.seconds
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          <button onClick={startQuiz} disabled={quizMode}
            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20">
            <Clock size={14} />Start Quiz
          </button>

          <button onClick={() => setShowHistory(!showHistory)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold border rounded-xl transition-colors ${
              showHistory ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-white/[0.04] border-white/[0.07] text-slate-400 hover:bg-white/[0.08]"
            }`}>
            <History size={14} /><span>History</span>
          </button>

          <button onClick={fetchLeaderboard}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all">
            <Trophy size={14} /><span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* ── Category pills ──────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} disabled={quizMode}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-40 ${
              category === cat
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white/[0.03] text-slate-500 border-white/[0.07] hover:bg-white/[0.07] hover:text-slate-300"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── History ─────────────────────────────────────────────────────── */}
      {showHistory && (
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-1.5 border-b border-white/[0.05] pb-3 mb-4">
            <History size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Quiz History</h3>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">No sessions yet. Start your first quiz above!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {history.slice(0, 10).map(h => (
                <div key={h.id} className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-300">{h.category}</h4>
                    <p className="text-[10px] text-slate-600 mt-0.5">{new Date(h.attemptedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.05]">
                    <span className="text-sm font-black text-indigo-400">{h.score}/{h.total}</span>
                    <span className="text-[10px] font-bold text-slate-500">{h.accuracy?.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Leaderboard ─────────────────────────────────────────────────── */}
      {showLeaderboard && (
        <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-3 mb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <Trophy size={14} />Leaderboard — {leaderboardScope}
            </div>
            <button onClick={() => setShowLeaderboard(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-300 bg-white/[0.04] border border-white/[0.07] px-3 py-1 rounded-lg transition-colors">
              Close
            </button>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">No entries yet for this category.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {leaderboard.slice(0, 5).map((l, i) => (
                <div key={l.id} className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
                  {i < 3 && <div className="absolute top-0 right-0 text-[10px] font-black text-amber-400 bg-amber-500/10 border-b border-l border-amber-500/20 px-2 py-0.5 rounded-bl-xl">#{i+1}</div>}
                  <div>
                    <h4 className="font-bold text-xs text-slate-300">{getAnonName(l.userId)}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{l.accuracy?.toFixed(0)}% accuracy</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.05]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</span>
                    <span className="text-sm font-black text-amber-400">{l.score}/{l.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Quiz progress — sticky ───────────────────────────────────────── */}
      {quizMode && score === null && (
        <div className="flex items-center justify-between bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 sticky top-4 z-10 backdrop-blur-md">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Quiz in progress</p>
            <div className="w-48 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / quizQuestions.length) * 100}%` }} />
            </div>
            <p className="text-[11px] text-slate-600">{Object.keys(answers).length} of {quizQuestions.length} answered</p>
          </div>
          <div className={`px-4 py-2.5 rounded-xl text-sm font-black border ${
            timeLeft < 180
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          }`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* ── Score card ──────────────────────────────────────────────────── */}
      {score !== null && (
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-8 text-center space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">{score} / {activeQuestions.length}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Accuracy: {((score / activeQuestions.length) * 100).toFixed(0)}%
              {quizMode && <><span className="mx-2 text-slate-700">·</span>Time: {formatTime(timeTaken)}</>}
            </p>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${
              score / activeQuestions.length >= 0.8 ? "bg-emerald-500" :
              score / activeQuestions.length >= 0.5 ? "bg-amber-500" : "bg-rose-500"
            }`} style={{ width: `${(score / activeQuestions.length) * 100}%` }} />
          </div>
          <div className="flex gap-2.5 justify-center">
            {wrongAnswers.length > 0 && (
              <button onClick={() => setShowReview(!showReview)}
                className="px-4 py-2.5 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-colors">
                {showReview ? "Hide Review" : `Review ${wrongAnswers.length} Wrong Answer${wrongAnswers.length > 1 ? "s" : ""}`}
              </button>
            )}
            <button onClick={resetQuiz}
              className="px-4 py-2.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
              Try Again
            </button>
          </div>
          {showReview && wrongAnswers.length > 0 && (
            <div className="text-left pt-6 border-t border-white/[0.05] space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Wrong Answers</h3>
              {wrongAnswers.map((q, i) => (
                <div key={q.id} className="bg-rose-500/[0.05] border border-rose-500/20 p-4 rounded-xl space-y-2">
                  {q.codeSnippet && (
                    <div className="bg-[#0b0f19] border border-white/[0.05] rounded-xl p-3">
                      <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed whitespace-pre overflow-x-auto">{q.codeSnippet}</pre>
                    </div>
                  )}
                  <h4 className="font-bold text-xs text-slate-300 leading-snug">{i + 1}. {q.question}</h4>
                  <p className="text-[11px] font-bold text-rose-400">Your answer: {answers[q.id] ? q[answers[q.id]] : "Not answered"}</p>
                  <p className="text-[11px] font-bold text-emerald-400">Correct: {q[q.correctAnswer]}</p>
                  {q.explanation && (
                    <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-bold text-amber-400">Explanation: </span>{q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Filter count ────────────────────────────────────────────────── */}
      {!quizMode && (
        <div className="px-1 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-300">{filteredQuestions.length}</span> of {questions.length} questions
          </p>
          {(category !== "All" || difficulty !== "All" || questionType !== "All") && (
            <button onClick={() => { setCategory("All"); setDifficulty("All"); setQuestionType("All"); }}
              className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors">
              ✕ Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Questions — smart 2-per-row ──────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] p-4 space-y-3">
                <Skeleton className="h-3 w-1/4" /><Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-2">{[...Array(4)].map((_, j) => <Skeleton key={j} className="h-10 w-full" />)}</div>
              </div>
            ))}
          </div>
        ) : activeQuestions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl bg-[#0d0f28]">
            <FileCode size={32} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-400">No questions found</h3>
            <p className="text-xs text-slate-600 mt-1">Try changing the category, difficulty, or type filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderQuestions()}
            </div>
            {score === null && (
              <button onClick={handleSubmit}
                className="w-full inline-flex items-center justify-center gap-1.5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.995]">
                Submit Quiz <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default TechnicalMcq;