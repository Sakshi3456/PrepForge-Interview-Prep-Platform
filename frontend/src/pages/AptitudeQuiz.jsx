import { useEffect, useState } from "react";
import { 
  Brain, Calculator, Compass, Layers, Clock, CheckCircle2, 
  XCircle, RotateCcw, HelpCircle, History, AlertTriangle, ChevronRight 
} from "lucide-react";
import api from "../services/api";

const categoryConfig = {
  Quantitative: { icon: <Calculator size={13} />, color: "text-blue-600 bg-blue-50/60 border-blue-100" },
  Logical:      { icon: <Brain size={13} />,      color: "text-purple-600 bg-purple-50/60 border-purple-100" },
  Verbal:       { icon: <Compass size={13} />,    color: "text-emerald-600 bg-emerald-50/60 border-emerald-100" },
  Puzzles:      { icon: <Layers size={13} />,     color: "text-amber-600 bg-amber-50/60 border-amber-100" },
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  Medium: { color: "text-amber-600 bg-amber-50 border-amber-100",   dot: "bg-amber-500" },
  Hard:   { color: "text-rose-600 bg-rose-50 border-rose-100",       dot: "bg-rose-500" },
};

const QUIZ_TIME = 600; // 10 minutes in seconds

function AptitudeQuiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    fetchQuestions();
    fetchHistory();
  }, []);

  // Hardened window refresh prevention lock system
  useEffect(() => {
    if (!quizMode || score !== null) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Quiz progress will be lost if you leave this window context.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizMode, score]);

  // Timed Countdown Clock Engine
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
      const res = await api.get("/aptitude");
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
      const res = await api.get(`/quiz/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("History sync channels rejected", err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchCategory = category === "All" || q.category === category;
    const matchDifficulty = difficulty === "All" || q.difficulty === difficulty;
    return matchCategory && matchDifficulty;
  });

  const startTimedQuiz = async () => {
    try {
      const params = category !== "All" ? `?category=${category}&count=10` : `?count=10`;
      const res = await api.get(`/aptitude/quiz${params}`);
      setQuizQuestions(res.data);
      setAnswers({});
      setScore(null);
      setTimeLeft(QUIZ_TIME);
      setShowReview(false);
      setQuizMode(true);
    } catch (err) {
      console.error("Quiz routing block parsing failure", err);
    }
  };

  const handleSelect = (id, option) => {
    if (score !== null) return;
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleAutoSubmitQuiz = () => {
    submitQuiz(true);
  };

  const handleSubmitTrigger = () => {
    const activeQuestions = quizMode ? quizQuestions : filteredQuestions;
    const totalAnswered = Object.keys(answers).length;
    
    if (totalAnswered < activeQuestions.length) {
      const confirmLeave = window.confirm(`You left ${activeQuestions.length - totalAnswered} questions blank. Finalize anyway?`);
      if (!confirmLeave) return;
    }
    submitQuiz(false);
  };

  const submitQuiz = async (isForcedExpiry = false) => {
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
    const finalizedTimeTaken = QUIZ_TIME - timeLeft;
    setTimeTaken(finalizedTimeTaken);

    try {
      const userId = localStorage.getItem("userId");
      await api.post("/quiz/save", {
        userId: parseInt(userId),
        category: category === "All" ? "Mixed" : category,
        score: total,
        total: activeQuestions.length,
        timeTaken: finalizedTimeTaken,
      });
      await api.post(`/progress/streak/${userId}`);
      fetchHistory();
    } catch (err) {
      console.error("Database connection failure on metric write", err);
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

  const activeQuestions = quizMode ? quizQuestions : filteredQuestions;
  const categories = ["All", "Quantitative", "Logical", "Verbal", "Puzzles"];

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto relative">
      
      {/* ── TOP BANNER AREA ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#151239] via-[#201948] to-[#341d5d] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              PrepForge Diagnostic Core
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Aptitude Quiz</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
              Build functional speed and processing shortcuts across algorithmic logic blocks, quantitative equations, and verbal structures.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Available Pool", value: questions.length, border: "border-white/10 text-white bg-white/[0.04]" },
              { label: "Total Sessions", value: history.length,   border: "border-purple-500/20 text-purple-400 bg-purple-500/5" },
              { label: "Personal Best",  value: history.length > 0 ? `${Math.max(...history.map(h => h.score))}/${history[0]?.total}` : "—", border: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[100px] shadow-sm backdrop-blur-sm ${s.border}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CENTRAL ACTION MENU ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col md:flex-row gap-3 items-center">
        <select 
          className="w-full md:flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed"
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          disabled={quizMode}
        >
          {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
        </select>

        <select 
          className="w-full md:flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed"
          value={difficulty} 
          onChange={e => setDifficulty(e.target.value)} 
          disabled={quizMode}
        >
          {["All","Easy","Medium","Hard"].map(d => <option key={d} value={d}>Complexity: {d}</option>)}
        </select>

        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button 
            onClick={startTimedQuiz} 
            disabled={quizMode}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-100"
          >
            <Clock size={14} />
            <span>Start Exam Simulator</span>
          </button>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors"
          >
            <History size={14} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* ── PERSISTENT HISTORY SHEET ── */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
            <History size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Onboarding Diagnostic Logs</h3>
          </div>
          
          {history.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs font-medium text-slate-400">Zero entries encountered inside this account frame index.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 tracking-tight">{h.category}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(h.attemptedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/40">
                    <span className="text-sm font-black text-indigo-600">{h.score}/{h.total}</span>
                    <span className="text-[10px] font-bold text-slate-400">{h.accuracy?.toFixed(0)}% Accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ CONSOLE RUNTIME HEADER ── */}
      {quizMode && score === null && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Evaluation Stream</p>
            <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / quizQuestions.length) * 100}%` }} 
              />
            </div>
            <p className="text-[11px] font-medium text-slate-400">{Object.keys(answers).length} of {quizQuestions.length} units committed</p>
          </div>
          
          <div className={`px-4 py-2.5 rounded-xl text-sm font-black border tracking-wide ${
            timeLeft < 120 
              ? "bg-rose-50 border-rose-100 text-rose-600 animate-pulse" 
              : "bg-indigo-50 border-indigo-100 text-indigo-600"
          }`}>
            ⏱ Clock System: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* ── SCORE TERMINAL POST-EXAM BLOCK ── */}
      {score !== null && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-8 text-center space-y-6 max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Session Finalized: {score} / {activeQuestions.length}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Logged Accuracy Result: {((score / activeQuestions.length) * 100).toFixed(0)}% 
              {quizMode && <span className="text-slate-300 mx-2">|</span>}
              {quizMode && <span>Execution Time: {formatTime(timeTaken)}</span>}
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
                Audit {wrongAnswers.length} Vulnerabilities
              </button>
            )}
            <button 
              onClick={resetQuiz}
              className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-sm shadow-indigo-100"
            >
              Reset Vector Core
            </button>
          </div>

          {/* WRONG ANSWERS ERROR AUDIT TERMINAL */}
          {showReview && wrongAnswers.length > 0 && (
            <div className="text-left pt-6 border-t border-slate-100 space-y-4 max-h-[380px] overflow-y-auto pr-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Vulnerability Compilation Stream</h3>
              {wrongAnswers.map((q, i) => (
                <div key={q.id} className="bg-rose-50/40 border border-rose-100 p-4.5 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 leading-snug">{i + 1}. {q.question}</h4>
                  <div className="text-[11px] font-bold space-y-0.5">
                    <p className="text-rose-600">Committed Option: {answers[q.id] ? q[answers[q.id]] : "Blank string parameter"}</p>
                    <p className="text-emerald-600">Expected Output: {q[q.correctAnswer]}</p>
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

      {/* ── CORE COMPONENT QUEUE GRID ── */}
      <section className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/6" />
              <div className="h-5 bg-slate-100 rounded w-2/3" />
              <div className="space-y-2.5 pt-2">
                {[...Array(4)].map((_, j) => <div key={j} className="h-11 bg-slate-50 rounded-xl" />)}
              </div>
            </div>
          ))
        ) : activeQuestions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white p-8">
            <HelpCircle size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No matching tokens configured</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Readjust active filter matrix configurations or draw alternative parameters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeQuestions.map((q, index) => {
              const submitted = score !== null;
              const selected = answers[q.id];
              const isCorrect = selected === q.correctAnswer;
              const cat = categoryConfig[q.category] || categoryConfig.Quantitative;
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
                    
                    {/* CARD HEADER DETAILS */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${cat.color}`}>
                            {cat.icon}
                            <span>{q.category}</span>
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 border rounded ${diff.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                            <span>{q.difficulty}</span>
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                          {index + 1}. {q.question}
                        </h3>
                      </div>

                      {submitted && selected && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                          isCorrect ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
                        }`}>
                          {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        </div>
                      )}
                    </div>

                    {/* SELECTABLE OPTION NODES SYSTEM */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {["optionA", "optionB", "optionC", "optionD"].map((opt, optIndex) => {
                        const labelCharacter = ["A", "B", "C", "D"][optIndex];
                        const isOptionSelected = selected === opt;
                        const isTargetAnswer = q.correctAnswer === opt;

                        let interactiveBoxClass = "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/10";
                        let innerBadgeClass = "bg-white border border-slate-200 text-slate-400";

                        if (submitted) {
                          if (isTargetAnswer) {
                            interactiveBoxClass = "border-emerald-300 bg-emerald-50/50 text-emerald-800";
                            innerBadgeClass = "bg-emerald-500 text-white border-emerald-500";
                          } else if (isOptionSelected && !isTargetAnswer) {
                            interactiveBoxClass = "border-rose-300 bg-rose-50/50 text-rose-800";
                            innerBadgeClass = "bg-rose-500 text-white border-rose-500";
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
                              type="radio" 
                              name={`q-${q.id}`} 
                              value={opt}
                              checked={isOptionSelected} 
                              onChange={() => handleSelect(q.id, opt)}
                              className="hidden" 
                              disabled={submitted} 
                            />
                            <span className="text-xs font-semibold tracking-tight">{q[opt]}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* POST-SUBMISSION DETAILED BREAKDOWN VIEW */}
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

            {/* BLOCK CONFIRM SUBMIT BUTTON */}
            {score === null && (
              <button 
                onClick={handleSubmitTrigger}
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

export default AptitudeQuiz;