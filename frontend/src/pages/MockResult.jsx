import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Target, Bot, BookOpen, RotateCcw, History, ChevronDown, ChevronUp } from "lucide-react";
import api from "../services/api";

function MockResult() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { fetchResult(); }, []);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/mock/result/${sessionId}`);
      setResult(res.data);
    } catch { console.error("Result fetch failed"); }
    finally { setLoading(false); }
  };

  const formatTime = (sec) => {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030511] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-sm">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { session, answers } = result;
  const accuracy    = ((session.score / session.total) * 100).toFixed(0);
  const theoryAnswers = answers.filter(a => a.questionType === "THEORY");
  const codingAnswers = answers.filter(a => a.questionType === "CODING");
  const mcqAnswers    = answers.filter(a => a.questionType === "MCQ");
  const wrongMcq      = mcqAnswers.filter(a => !a.isCorrect);

  const avgAiScore = () => {
    const scored = [...theoryAnswers, ...codingAnswers].filter(a => a.aiScore !== null && a.aiScore !== undefined);
    if (!scored.length) return null;
    return (scored.reduce((s, a) => s + a.aiScore, 0) / scored.length).toFixed(1);
  };

  const scoreEmoji = accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👍" : accuracy >= 40 ? "📚" : "💪";
  const scoreBg    = accuracy >= 80 ? "bg-emerald-500" : accuracy >= 60 ? "bg-blue-500" : accuracy >= 40 ? "bg-amber-500" : "bg-rose-500";

  const displayAnswers = showAll ? answers : answers.slice(0, 5);

  return (
    <div className="pb-16 max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1035] via-[#151848] to-[#1a1250] p-8 border border-white/[0.05]">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <button onClick={() => navigate("/mock")}
            className="text-indigo-400 text-xs font-bold hover:text-indigo-300 transition mb-4 flex items-center gap-1">
            ← Back to Mock Interviews
          </button>
          <h1 className="text-2xl font-black text-white">{session.setTitle}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {session.company} · {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* ── Score card ── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-8">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">{scoreEmoji}</p>
          <h2 className="text-4xl font-black text-white tracking-tight">{session.score}/{session.total}</h2>
          <p className="text-slate-400 text-sm mt-1">{accuracy}% overall accuracy</p>
        </div>

        {/* Score bar */}
        <div className="w-full h-2 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
          <div className={`h-2 rounded-full transition-all duration-700 ${scoreBg}`}
            style={{ width: `${accuracy}%` }} />
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Time Taken",   value: formatTime(session.timeTaken),                                         icon: <Clock size={16} className="text-slate-500"/> },
            { label: "MCQ Score",    value: session.mcqTotal > 0 ? `${session.mcqScore}/${session.mcqTotal}` : "—", icon: <Target size={16} className="text-slate-500"/> },
            { label: "Avg AI Score", value: avgAiScore() ? `${avgAiScore()}/10` : "—",                             icon: <Bot size={16} className="text-slate-500"/> },
            { label: "Theory Done",  value: `${theoryAnswers.filter(a => a.isAnswered).length}/${theoryAnswers.length}`, icon: <BookOpen size={16} className="text-slate-500"/> },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-xl font-black text-white leading-none">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate(`/mock/interview/${session.setId}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            <RotateCcw size={14}/>Retry
          </button>
          <button onClick={() => navigate("/mock")}
            className="px-5 py-2.5 text-sm font-bold bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
            All Sets
          </button>
          <button onClick={() => navigate("/mock/history")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
            <History size={14}/>History
          </button>
        </div>
      </div>

      {/* ── Wrong MCQ Review ── */}
      {wrongMcq.length > 0 && (
        <div className="bg-[#0d0f28] border border-rose-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <XCircle size={16} className="text-rose-400"/>
            Wrong MCQ Answers ({wrongMcq.length})
          </h3>
          <div className="space-y-3">
            {wrongMcq.map((a, i) => (
              <div key={a.id} className="bg-rose-500/[0.06] border border-rose-500/20 rounded-xl p-4">
                <p className="text-sm font-bold text-slate-200 mb-1.5 leading-relaxed">
                  {i + 1}. {a.questionText}
                </p>
                <p className="text-xs text-rose-400 font-semibold">
                  Your answer: {a.userAnswer || "Not answered"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Answer Review ── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-400"/>
          Answer Review
        </h3>

        <div className="space-y-4">
          {displayAnswers.map((a, i) => {
            const isMcqCorrect  = a.questionType === "MCQ" && a.isCorrect;
            const isMcqWrong    = a.questionType === "MCQ" && !a.isCorrect;
            const isAnswered    = a.questionType !== "MCQ" && a.isAnswered;

            let cardBorder = "border-white/[0.06]";
            if (isMcqCorrect) cardBorder = "border-emerald-500/25";
            if (isMcqWrong)   cardBorder = "border-rose-500/25";
            if (isAnswered)   cardBorder = "border-indigo-500/20";

            let cardBg = "bg-white/[0.02]";
            if (isMcqCorrect) cardBg = "bg-emerald-500/[0.04]";
            if (isMcqWrong)   cardBg = "bg-rose-500/[0.04]";
            if (isAnswered)   cardBg = "bg-indigo-500/[0.03]";

            const typeBadgeCls =
              a.questionType === "MCQ"    ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
              a.questionType === "CODING" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            "bg-violet-500/10 text-violet-400 border-violet-500/20";

            return (
              <div key={a.id} className={`rounded-2xl border p-5 ${cardBorder} ${cardBg}`}>

                {/* Header badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadgeCls}`}>
                    {a.questionType}
                  </span>
                  {a.questionType === "MCQ" ? (
                    <span className={`text-xs font-bold flex items-center gap-1 ${isMcqCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                      {isMcqCorrect ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                      {isMcqCorrect ? "Correct" : "Wrong"}
                    </span>
                  ) : (
                    <span className={`text-xs font-bold flex items-center gap-1 ${a.isAnswered ? "text-indigo-400" : "text-slate-600"}`}>
                      {a.isAnswered ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                      {a.isAnswered ? "Answered" : "Skipped"}
                    </span>
                  )}
                  {a.aiScore !== null && a.aiScore !== undefined && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      a.aiScore >= 8 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      a.aiScore >= 6 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      a.aiScore >= 4 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                       "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      🤖 {a.aiScore}/10
                    </span>
                  )}
                </div>

                {/* Question */}
                <p className="text-sm font-bold text-slate-200 mb-3 leading-relaxed">
                  {i + 1}. {a.questionText}
                </p>

                {/* Answer */}
                {a.userAnswer ? (
                  <div className={`rounded-xl p-3 mb-3 border ${
                    a.questionType === "CODING"
                      ? "bg-[#0a0d16] border-white/[0.05]"
                      : "bg-white/[0.03] border-white/[0.06]"
                  }`}>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Your Answer</p>
                    <p className={`text-sm leading-relaxed ${
                      a.questionType === "CODING" ? "text-emerald-400 font-mono" : "text-slate-300"
                    }`}>
                      {a.userAnswer}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic mb-3">No answer given</p>
                )}

                {/* AI Feedback */}
                {(a.questionType === "THEORY" || a.questionType === "CODING") && (
                  <div>
                    {a.aiFeedback ? (
                      <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bot size={14} className="text-indigo-400"/>
                            <p className="text-xs font-bold text-indigo-400">AI Feedback</p>
                          </div>
                          {a.aiScore !== null && a.aiScore !== undefined && (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                              a.aiScore >= 8 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              a.aiScore >= 6 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              a.aiScore >= 4 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                               "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                              {a.aiScore}/10
                            </span>
                          )}
                        </div>
                        {a.aiScore !== null && a.aiScore !== undefined && (
                          <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-3 overflow-hidden">
                            <div className={`h-1.5 rounded-full transition-all ${
                              a.aiScore >= 8 ? "bg-emerald-500" :
                              a.aiScore >= 6 ? "bg-blue-500" :
                              a.aiScore >= 4 ? "bg-amber-500" : "bg-rose-500"
                            }`} style={{ width: `${(a.aiScore / 10) * 100}%` }} />
                          </div>
                        )}
                        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{a.aiFeedback}</p>
                      </div>
                    ) : a.isAnswered ? (
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-indigo-500/40 border-t-transparent rounded-full animate-spin shrink-0" />
                        <p className="text-xs text-slate-500">AI feedback processing...</p>
                      </div>
                    ) : (
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                        <p className="text-xs text-slate-600 italic">Question was skipped — no AI feedback</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {answers.length > 5 && (
          <button onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 py-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-1.5">
            {showAll
              ? <><ChevronUp size={14}/>Show Less</>
              : <><ChevronDown size={14}/>Show All {answers.length} Answers</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default MockResult;