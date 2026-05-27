import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const categoryConfig = {
  Quantitative:     { icon: "🔢", color: "bg-blue-50 text-blue-600 border-blue-200"     },
  Logical:          { icon: "🧠", color: "bg-violet-50 text-violet-600 border-violet-200"},
  Verbal:           { icon: "📝", color: "bg-emerald-50 text-emerald-600 border-emerald-200"},
  Puzzles:          { icon: "🧩", color: "bg-amber-50 text-amber-600 border-amber-200"   },
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  Medium: { color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-600",    bg: "bg-rose-50",    dot: "bg-rose-400"    },
};

const QUIZ_TIME = 600; // 10 minutes in seconds

function AptitudeQuiz() {
  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState({});
  const [score, setScore]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [category, setCategory]     = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [quizMode, setQuizMode]     = useState(false);  // timed quiz mode
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [timeLeft, setTimeLeft]     = useState(QUIZ_TIME);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [timeTaken, setTimeTaken]   = useState(0);

  useEffect(() => { fetchQuestions(); fetchHistory(); }, []);

  // Timer countdown
  useEffect(() => {
    if (!quizMode || score !== null) return;
    if (timeLeft <= 0) { submitQuiz(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [quizMode, timeLeft, score]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/aptitude");
      setQuestions(res.data);
    } catch {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/quiz/history/${userId}`);
      setHistory(res.data);
    } catch {
      console.error("History fetch failed");
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchCategory   = category   === "All" || q.category   === category;
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
    } catch {
      console.error("Quiz start failed");
    }
  };

  const handleSelect = (id, option) => {
    if (score !== null) return; // prevent change after submit
    setAnswers(prev => ({ ...prev, [id]: option }));
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
    setTimeTaken(QUIZ_TIME - timeLeft);

    // Save to DB
    try {
      const userId = localStorage.getItem("userId");
      await api.post("/quiz/save", {
        userId:    parseInt(userId),
        category:  category === "All" ? "Mixed" : category,
        score:     total,
        total:     activeQuestions.length,
        timeTaken: QUIZ_TIME - timeLeft,
      });
      await api.post(`/progress/streak/${userId}`);
      fetchHistory();
    } catch {
      console.error("Score save failed");
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 px-8 pt-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧠</span>
            <div>
              <p className="text-violet-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">Aptitude Quiz</h1>
            </div>
          </div>
          <p className="text-violet-300 text-sm mt-2 max-w-lg">
            Quantitative, Logical, Verbal and Puzzle questions for placement drives.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { label: "Total Qs",   value: questions.length,                                       color: "bg-white/10 text-white"              },
              { label: "Attempted",  value: history.length,                                         color: "bg-violet-500/20 text-violet-300"     },
              { label: "Best Score", value: history.length > 0 ? Math.max(...history.map(h => h.score)) + "/" + history[0]?.total : "—", color: "bg-emerald-500/20 text-emerald-300" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[100px]`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[11px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-8 -mt-6 mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3 items-center">
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition flex-1"
            value={category} onChange={e => setCategory(e.target.value)} disabled={quizMode}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition flex-1"
            value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={quizMode}>
            {["All","Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={startTimedQuiz} disabled={quizMode}
            className="px-6 py-2.5 text-sm font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition disabled:opacity-50 whitespace-nowrap">
            ⏱ Start Timed Quiz (10 Qs)
          </button>
          <button onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition whitespace-nowrap">
            📋 History
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="max-w-5xl mx-auto px-8 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">📋 Attempt History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No attempts yet</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{h.category}</p>
                      <p className="text-xs text-slate-400">{new Date(h.attemptedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-violet-600">{h.score}/{h.total}</p>
                      <p className="text-xs text-slate-400">{h.accuracy?.toFixed(0)}% accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-8 pb-16">

        {/* Timed Quiz Header */}
        {quizMode && score === null && (
          <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div>
              <p className="text-xs text-slate-400 font-medium">Timed Quiz</p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-1">
                <div className="h-1.5 bg-violet-500 rounded-full transition-all"
                  style={{ width: `${(Object.keys(answers).length / quizQuestions.length) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{Object.keys(answers).length} of {quizQuestions.length} answered</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${
              timeLeft < 120 ? "bg-rose-50 text-rose-600" : "bg-violet-50 text-violet-600"
            }`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Score Result */}
        {score !== null && (
          <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
            <div className="text-center mb-6">
              <p className="text-5xl mb-2">
                {score / activeQuestions.length >= 0.8 ? "🎉" :
                 score / activeQuestions.length >= 0.5 ? "👍" : "📚"}
              </p>
              <h2 className="text-3xl font-black text-slate-800">
                {score} / {activeQuestions.length}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {((score / activeQuestions.length) * 100).toFixed(0)}% Accuracy
                {quizMode && <span className="ml-2">• Time taken: {formatTime(timeTaken)}</span>}
              </p>
            </div>

            {/* Score bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full mb-6">
              <div
                className={`h-3 rounded-full transition-all ${
                  score / activeQuestions.length >= 0.8 ? "bg-emerald-500" :
                  score / activeQuestions.length >= 0.5 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${(score / activeQuestions.length) * 100}%` }}
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              {wrongAnswers.length > 0 && (
                <button onClick={() => setShowReview(!showReview)}
                  className="px-5 py-2.5 text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition">
                  📋 Review {wrongAnswers.length} Wrong Answers
                </button>
              )}
              <button onClick={resetQuiz}
                className="px-5 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition">
                🔄 Try Again
              </button>
            </div>

            {/* Wrong Answer Review */}
            {showReview && wrongAnswers.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">📋 Wrong Answers Review</h3>
                {wrongAnswers.map((q, i) => (
                  <div key={q.id} className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-800 mb-2">{i + 1}. {q.question}</p>
                    <p className="text-xs text-rose-600 font-semibold mb-1">
                      Your answer: {answers[q.id] ? q[answers[q.id].toLowerCase()] : "Not answered"}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold mb-2">
                      Correct: {q[q.correctAnswer.toLowerCase()]}
                    </p>
                    {q.explanation && (
                      <div className="bg-white rounded-lg p-3 mt-2">
                        <p className="text-xs text-slate-600 leading-relaxed">💡 {q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Questions */}
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse mb-4">
              <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-4" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => <div key={j} className="h-10 bg-slate-100 rounded-xl" />)}
              </div>
            </div>
          ))
        ) : activeQuestions.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-500 font-medium">No questions found</p>
            <p className="text-sm text-slate-400 mt-1">Try a different category or difficulty</p>
          </div>
        ) : (
          <div className="space-y-5">
            {activeQuestions.map((q, index) => {
              const submitted   = score !== null;
              const selected    = answers[q.id];
              const isCorrect   = selected === q.correctAnswer;
              const cat         = categoryConfig[q.category] || categoryConfig.Quantitative;
              const diff        = difficultyConfig[q.difficulty] || difficultyConfig.Easy;

              return (
                <div key={q.id} className={`bg-white rounded-2xl border transition-all ${
                  submitted
                    ? selected === q.correctAnswer
                      ? "border-emerald-200 shadow-emerald-50 shadow-lg"
                      : selected
                        ? "border-rose-200 shadow-rose-50 shadow-lg"
                        : "border-slate-100"
                    : "border-slate-100 hover:shadow-md"
                }`}>
                  <div className="p-5">

                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cat.color}`}>
                            {cat.icon} {q.category}
                          </span>
                          {q.difficulty && (
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                              {q.difficulty}
                            </span>
                          )}
                        </div>
                        <h2 className="text-sm font-bold text-slate-800">
                          {index + 1}. {q.question}
                        </h2>
                      </div>

                      {/* Result indicator */}
                      {submitted && selected && (
                        <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        }`}>
                          {isCorrect ? "✓" : "✗"}
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {["optionA","optionB","optionC","optionD"].map((opt, optIndex) => {
                        const label     = ["A","B","C","D"][optIndex];
                        const isSelected = selected === opt;
                        const isAnswer   = q.correctAnswer === opt;

                        let optClass = "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50";

                        if (submitted) {
                          if (isAnswer) {
                            optClass = "border-emerald-300 bg-emerald-50 text-emerald-700";
                          } else if (isSelected && !isAnswer) {
                            optClass = "border-rose-300 bg-rose-50 text-rose-700";
                          } else {
                            optClass = "border-slate-100 bg-slate-50 text-slate-400";
                          }
                        } else if (isSelected) {
                          optClass = "border-violet-400 bg-violet-50 text-violet-700";
                        }

                        return (
                          <label key={opt}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${optClass} ${submitted ? "cursor-default" : ""}`}>
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              submitted && isAnswer ? "bg-emerald-500 text-white" :
                              submitted && isSelected && !isAnswer ? "bg-rose-500 text-white" :
                              isSelected ? "bg-violet-500 text-white" : "bg-white border border-slate-200 text-slate-500"
                            }`}>
                              {label}
                            </span>
                            <input type="radio" name={`q-${q.id}`} value={opt}
                              checked={isSelected} onChange={() => handleSelect(q.id, opt)}
                              className="hidden" disabled={submitted} />
                            <span className="text-sm">{q[opt]}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Explanation — shown after submit */}
                    {submitted && q.explanation && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-amber-600 mb-1">💡 Explanation</p>
                        <p className="text-sm text-amber-800 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            {score === null && (
              <button onClick={submitQuiz}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-violet-700 hover:to-indigo-700 transition shadow-lg shadow-violet-200 text-sm">
                Submit Quiz →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AptitudeQuiz;