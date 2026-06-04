import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import PageLayout from "../components/PageLayout";

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
    } catch {
      console.error("Result fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec) => {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading result...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!result) return null;

  const { session, answers } = result;
  const accuracy   = ((session.score / session.total) * 100).toFixed(0);
  const mcqAccuracy = session.mcqTotal > 0
    ? ((session.mcqScore / session.mcqTotal) * 100).toFixed(0)
    : null;

  const theoryAnswers = answers.filter(a => a.questionType === "THEORY");
  const codingAnswers = answers.filter(a => a.questionType === "CODING");
  const mcqAnswers    = answers.filter(a => a.questionType === "MCQ");
  const wrongMcq      = mcqAnswers.filter(a => !a.isCorrect);

  const avgAiScore = () => {
    const scored = [...theoryAnswers, ...codingAnswers]
      .filter(a => a.aiScore !== null && a.aiScore !== undefined);
    if (!scored.length) return null;
    return (scored.reduce((s, a) => s + a.aiScore, 0) / scored.length)
      .toFixed(1);
  };

  const displayAnswers = showAll ? answers : answers.slice(0, 5);

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1e1b6e] to-[#4c2d8a] px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/mock")}
              className="text-indigo-300 text-sm font-medium hover:text-white transition mb-4 flex items-center gap-1"
            >
              ← Back to Mock Interviews
            </button>
            <h1 className="text-2xl font-black text-white">
              {session.setTitle}
            </h1>
            <p className="text-indigo-300 text-sm mt-1 leading-relaxed">
              {session.company} •{" "}
              {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">

          {/* ── Score Card ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
            <div className="text-center mb-6">
              <p className="text-6xl mb-3">
                {accuracy >= 80 ? "🎉" :
                 accuracy >= 60 ? "👍" :
                 accuracy >= 40 ? "📚" : "💪"}
              </p>
              <h2 className="text-[24px] font-semibold text-slate-800">
                {session.score}/{session.total}
              </h2>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                {accuracy}% overall score
              </p>
            </div>

            {/* Score bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full mb-6">
              <div className={`h-3 rounded-full transition-all ${
                accuracy >= 80 ? "bg-emerald-500" :
                accuracy >= 60 ? "bg-blue-500"    :
                accuracy >= 40 ? "bg-amber-500"   : "bg-rose-500"
              }`} style={{ width: `${accuracy}%` }} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Time Taken",
                  value: formatTime(session.timeTaken),
                  icon:  "⏱",
                },
                {
                  label: "MCQ Score",
                  value: session.mcqTotal > 0
                    ? `${session.mcqScore}/${session.mcqTotal}`
                    : "—",
                  icon: "🔘",
                },
                {
                  label: "Avg AI Score",
                  value: avgAiScore() ? `${avgAiScore()}/10` : "—",
                  icon:  "🤖",
                },
                {
                  label: "Theory Done",
                  value: `${theoryAnswers.filter(a => a.isAnswered).length}/${theoryAnswers.length}`,
                  icon:  "✍️",
                },
              ].map(s => (
                <div key={s.label}
                  className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xl mb-1">{s.icon}</p>
                  {/* FIX: stat number 24px font-semibold */}
                  <p className="text-[24px] font-semibold text-slate-800 leading-none">
                    {s.value}
                  </p>
                  {/* FIX: label 12px */}
                  <p className="text-[12px] text-slate-400 font-medium mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 justify-center flex-wrap">
              <button
                onClick={() => navigate(`/mock/interview/${session.setId}`)}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#1e1b6e] to-[#4c2d8a] text-white rounded-full hover:opacity-90 transition"
              >
                🔄 Retry Interview
              </button>
              <button
                onClick={() => navigate("/mock")}
                className="px-6 py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition"
              >
                ← All Sets
              </button>
              <button
                onClick={() => navigate("/mock/history")}
                className="px-6 py-2.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition"
              >
                📋 History
              </button>
            </div>
          </div>

          {/* ── Wrong MCQ Review ── */}
          {wrongMcq.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-base font-black text-slate-800 mb-4">
                ❌ Wrong MCQ Answers ({wrongMcq.length})
              </h3>
              <div className="space-y-3">
                {wrongMcq.map((a, i) => (
                  <div key={a.id}
                    className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-800 mb-1 leading-relaxed">
                      {i + 1}. {a.questionText}
                    </p>
                    <p className="text-xs text-rose-600 font-semibold">
                      Your answer: {a.userAnswer || "Not answered"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Full Answer Review ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-base font-black text-slate-800 mb-4">
              📋 Answer Review
            </h3>

            <div className="space-y-4">
              {displayAnswers.map((a, i) => {
                const isOpen = true;
                return (
                  <div key={a.id}
                    className={`rounded-xl border p-4 ${
                      a.questionType === "MCQ"
                        ? a.isCorrect
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-rose-50 border-rose-200"
                        : a.isAnswered
                          ? "bg-blue-50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                    }`}>

                    {/* Question header */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.questionType === "MCQ"
                          ? "bg-blue-100 text-blue-600"
                          : a.questionType === "CODING"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-violet-100 text-violet-600"
                      }`}>
                        {a.questionType}
                      </span>

                      {a.questionType === "MCQ" ? (
                        <span className={`text-xs font-bold ${
                          a.isCorrect
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}>
                          {a.isCorrect ? "✓ Correct" : "✗ Wrong"}
                        </span>
                      ) : (
                        <span className={`text-xs font-bold ${
                          a.isAnswered
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}>
                          {a.isAnswered ? "✓ Answered" : "✗ Skipped"}
                        </span>
                      )}

                      {/* AI Score badge */}
                      {a.aiScore !== null &&
                       a.aiScore !== undefined && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          a.aiScore >= 8
                            ? "bg-emerald-100 text-emerald-700"
                            : a.aiScore >= 6
                              ? "bg-blue-100 text-blue-700"
                              : a.aiScore >= 4
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                        }`}>
                          🤖 {a.aiScore}/10
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                      {i + 1}. {a.questionText}
                    </p>

                    {/* User answer */}
                    {a.userAnswer ? (
                      <div className={`rounded-xl p-3 mb-3 ${
                        a.questionType === "CODING"
                          ? "bg-slate-900"
                          : "bg-white/70"
                      }`}>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-[0.08em]">
                          Your Answer
                        </p>
                        <p className={`text-sm leading-relaxed ${
                          a.questionType === "CODING"
                            ? "text-emerald-400 font-mono"
                            : "text-slate-600"
                        }`}>
                          {a.userAnswer}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mb-3">
                        No answer given
                      </p>
                    )}

                    {/* ── AI Feedback ── */}
                    {(a.questionType === "THEORY" ||
                      a.questionType === "CODING") && (
                      <div>
                        {a.aiFeedback ? (
                          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-4">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">🤖</span>
                                <p className="text-xs font-bold text-violet-700">
                                  AI Feedback
                                </p>
                              </div>
                              {a.aiScore !== null &&
                               a.aiScore !== undefined && (
                                <div className={`px-3 py-1 rounded-full text-xs font-black ${
                                  a.aiScore >= 8
                                    ? "bg-emerald-100 text-emerald-700"
                                    : a.aiScore >= 6
                                      ? "bg-blue-100 text-blue-700"
                                      : a.aiScore >= 4
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-rose-100 text-rose-700"
                                }`}>
                                  {a.aiScore}/10
                                </div>
                              )}
                            </div>

                            {/* Score bar */}
                            {a.aiScore !== null &&
                             a.aiScore !== undefined && (
                              <div className="w-full h-1.5 bg-violet-100 rounded-full mb-3">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    a.aiScore >= 8
                                      ? "bg-emerald-500"
                                      : a.aiScore >= 6
                                        ? "bg-blue-500"
                                        : a.aiScore >= 4
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                  }`}
                                  style={{
                                    width: `${(a.aiScore / 10) * 100}%`
                                  }}
                                />
                              </div>
                            )}

                            {/* Feedback text */}
                            <p className="text-sm text-violet-800 leading-relaxed whitespace-pre-line">
                              {a.aiFeedback}
                            </p>
                          </div>

                        ) : a.isAnswered ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin shrink-0" />
                            <p className="text-xs text-slate-400">
                              AI feedback processing...
                            </p>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <p className="text-xs text-slate-400 italic">
                              Question was skipped — no AI feedback
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {answers.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                {showAll
                  ? "Show Less ↑"
                  : `Show All ${answers.length} Answers ↓`}
              </button>
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export default MockResult;