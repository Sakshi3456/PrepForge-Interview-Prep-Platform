import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, Send, Code2, MessageSquare, CheckSquare, AlertTriangle } from "lucide-react";
import api from "../services/api";

// ── Question type config ──────────────────────────────────────────────────────
const qTypeBadge = {
  MCQ:    { label: "MCQ",    cls: "text-blue-400 bg-blue-500/10 border-blue-500/20",     icon: <CheckSquare size={11}/> },
  CODING: { label: "Coding", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <Code2 size={11}/> },
  THEORY: { label: "Theory", cls: "text-violet-400 bg-violet-500/10 border-violet-500/20",   icon: <MessageSquare size={11}/> },
};

function MockInterview() {
  const { setId }  = useParams();
  const navigate   = useNavigate();

  const [set,        setSet]        = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started,    setStarted]    = useState(false);
  const [warnLeave,  setWarnLeave]  = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchSetAndQuestions();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchSetAndQuestions = async () => {
    setLoading(true);
    try {
      const [setRes, qRes] = await Promise.all([
        api.get(`/mock/sets/${setId}`),
        api.get(`/mock/sets/${setId}/questions`),
      ]);
      setSet(setRes.data);
      setQuestions(qRes.data);
      setTimeLeft(setRes.data.durationMinutes * 60);
    } catch { console.error("Failed to load interview"); }
    finally { setLoading(false); }
  };

  const startInterview = () => {
    setStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelect = (refId, value) => setAnswers(prev => ({ ...prev, [refId]: value }));

  const handleSubmit = async () => {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const userId    = localStorage.getItem("userId");
      const totalTime = set.durationMinutes * 60 - timeLeft;
      const answerList = questions.map(q => ({
        sourceQuestionId: q.sourceId,
        sourceTable:      q.sourceTable,
        questionText:     q.questionText,
        questionType:     q.questionType,
        userAnswer:       answers[q.refId] || "",
        correctAnswer:    null,
      }));
      const res = await api.post("/mock/submit", {
        userId: parseInt(userId), setId: parseInt(setId),
        timeTaken: totalTime, answers: answerList,
      });
      navigate(`/mock/result/${res.data.id}`);
    } catch { console.error("Submit failed"); setSubmitting(false); }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = Object.values(answers).filter(a => a?.trim() !== "").length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030511] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading interview…</p>
        </div>
      </div>
    );
  }

  // ── Pre-interview screen ──────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-[#030511] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="bg-[#080b1c] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/50 p-8 max-w-lg w-full text-center relative z-10">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/25">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">{set?.title}</h1>
          <p className="text-slate-500 text-sm mb-7">{set?.company}{set?.role ? ` · ${set.role}` : ""}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Questions", value: questions.length,            cls: "border-white/[0.06] text-white"          },
              { label: "Duration",  value: `${set?.durationMinutes}m`,  cls: "border-indigo-500/20 text-indigo-400"    },
              { label: "Difficulty",value: set?.difficulty || "—",      cls: "border-emerald-500/20 text-emerald-400"  },
            ].map(s => (
              <div key={s.label} className={`border ${s.cls} bg-white/[0.02] rounded-xl p-3.5`}>
                <p className={`text-xl font-black mb-1 ${s.cls.includes("text-") ? "" : "text-white"}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 mb-7 text-left">
            <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={12}/> Before you start
            </p>
            <ul className="text-xs text-amber-300/70 space-y-1 leading-relaxed">
              <li>· Timer starts immediately when you click Start</li>
              <li>· You can navigate between questions freely</li>
              <li>· Timer runs out → your answers are auto-submitted</li>
              <li>· For MCQ questions, select one option</li>
              <li>· For theory/coding, type your answer or approach</li>
            </ul>
          </div>

          <button onClick={startInterview}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.01] text-sm">
            Start Interview →
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  // ── Interview screen ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030511] flex flex-col text-slate-100">

      {/* ── Sticky top bar ── */}
      <div className="bg-[#06080f]/90 backdrop-blur-md border-b border-white/[0.05] px-6 py-3 flex items-center justify-between sticky top-0 z-20">

        {/* Left: title + progress bar */}
        <div className="flex items-center gap-5 min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider truncate">{set?.title}</p>
            <p className="text-xs font-bold text-slate-300">Q{current + 1} / {questions.length}</p>
          </div>
          <div className="hidden md:block w-40 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Right: answered count + timer + submit */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-600 hidden sm:block">
            {answeredCount}/{questions.length} answered
          </span>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-sm border ${
            timeLeft < 120
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
              : timeLeft < 300
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
          }`}>
            <Clock size={13}/>{formatTime(timeLeft)}
          </div>

          {/* Submit button */}
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl transition-all disabled:opacity-60 shadow-md shadow-indigo-500/20">
            <Send size={12}/>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>

      {/* ── Main layout: question panel + navigator sidebar ── */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full px-5 py-6 gap-5">

        {/* ── Question Panel ── */}
        <div className="flex-1 min-w-0">
          {q && (
            <div className="bg-[#080b1c] border border-white/[0.06] rounded-2xl p-6 shadow-xl">

              {/* Type badge + question number */}
              <div className="flex items-center gap-2 mb-4">
                {(() => {
                  const t = qTypeBadge[q.questionType] || qTypeBadge.THEORY;
                  return (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${t.cls}`}>
                      {t.icon}{t.label}
                    </span>
                  );
                })()}
                <span className="text-[10px] text-slate-600 font-bold">Question {current + 1}</span>
              </div>

              {/* Question text */}
              <h2 className="text-base font-bold text-slate-100 mb-5 leading-relaxed">
                {q.questionText}
              </h2>

              {/* Code snippet */}
              {q.codeSnippet && (
                <div className="bg-[#04060c] border border-white/[0.05] rounded-xl p-4 mb-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    <span className="text-[10px] text-slate-600 ml-1 font-mono">Code</span>
                  </div>
                  <pre className="text-xs text-indigo-300 font-mono whitespace-pre-wrap leading-relaxed">{q.codeSnippet}</pre>
                </div>
              )}

              {/* Input/output for coding */}
              {q.questionType === "CODING" && q.inputOutput && (
                <div className="bg-[#04060c] border border-emerald-500/10 rounded-xl p-4 mb-5">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-2">Example</p>
                  <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{q.inputOutput}</pre>
                </div>
              )}

              {/* ── MCQ options ── */}
              {q.questionType === "MCQ" && (
                <div className="space-y-2.5">
                  {["optionA","optionB","optionC","optionD"].map((opt, i) => {
                    const label      = ["A","B","C","D"][i];
                    const isSelected = answers[q.refId] === opt;
                    return (
                      <label key={opt}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all active:scale-[0.99] ${
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/10 text-slate-100"
                            : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-500/[0.05]"
                        }`}>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white/[0.04] border-white/[0.08] text-slate-600"
                        }`}>{label}</span>
                        <input type="radio" name={`q-${q.refId}`} value={opt}
                          checked={isSelected} onChange={() => handleSelect(q.refId, opt)} className="hidden" />
                        <span className="text-sm font-medium">{q[opt]}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* ── Theory answer ── */}
              {q.questionType === "THEORY" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Your Answer</label>
                  <textarea rows={8} placeholder="Type your answer here. Be as detailed as possible…"
                    value={answers[q.refId] || ""}
                    onChange={e => handleSelect(q.refId, e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition resize-none leading-relaxed" />
                </div>
              )}

              {/* ── Coding answer ── */}
              {q.questionType === "CODING" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Your Approach / Solution</label>
                  <textarea rows={10}
                    placeholder={"Write your solution or explain your approach…\n\n// Example:\n// 1. Start by...\n// 2. Then...\n// 3. Finally..."}
                    value={answers[q.refId] || ""}
                    onChange={e => handleSelect(q.refId, e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#04060c] text-emerald-300 font-mono border border-white/[0.07] placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition resize-none leading-relaxed" />
                </div>
              )}

              {/* Prev / Next navigation */}
              <div className="flex justify-between mt-6 pt-5 border-t border-white/[0.05]">
                <button onClick={() => setCurrent(p => p - 1)} disabled={current === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-white/[0.07] text-slate-400 rounded-xl hover:bg-white/[0.05] hover:text-slate-200 transition disabled:opacity-30">
                  <ChevronLeft size={14}/>Previous
                </button>
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(p => p + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-500/25 transition">
                    Next<ChevronRight size={14}/>
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl transition disabled:opacity-60 shadow-lg shadow-indigo-500/20">
                    <Send size={13}/>
                    {submitting ? "Submitting…" : "Submit Interview"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Question navigator sidebar ── */}
        <div className="w-44 shrink-0">
          <div className="bg-[#080b1c] border border-white/[0.06] rounded-2xl p-4 sticky top-20">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Questions</p>

            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((q, i) => {
                const isAnswered = answers[q.refId]?.trim() !== "" && answers[q.refId];
                const isCurrent  = current === i;
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                        : isAnswered
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          : "bg-white/[0.04] border border-white/[0.06] text-slate-600 hover:bg-white/[0.08] hover:text-slate-400"
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5">
              {[
                { cls: "bg-indigo-600",                                    label: "Current"  },
                { cls: "bg-emerald-500/15 border border-emerald-500/30",   label: "Answered" },
                { cls: "bg-white/[0.04] border border-white/[0.06]",       label: "Pending"  },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded ${l.cls}`} />
                  <span className="text-[10px] text-slate-600">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="flex justify-between mb-1.5">
                <p className="text-[10px] text-slate-600">Progress</p>
                <p className="text-[10px] font-bold text-slate-400">{answeredCount}/{questions.length}</p>
              </div>
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MockInterview;