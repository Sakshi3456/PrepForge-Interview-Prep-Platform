import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function MockInterview() {
  const { setId }    = useParams();
  const navigate     = useNavigate();

  const [set, setSet]               = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [current, setCurrent]       = useState(0);
  const [answers, setAnswers]       = useState({});
  const [timeLeft, setTimeLeft]     = useState(0);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted]       = useState(false);

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
    } catch {
      console.error("Failed to load interview");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    setStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelect = (questionRefId, value) => {
    setAnswers(prev => ({ ...prev, [questionRefId]: value }));
  };

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
        correctAnswer:    null, // backend fetches this
      }));

      const res = await api.post("/mock/submit", {
        userId:    parseInt(userId),
        setId:     parseInt(setId),
        timeTaken: totalTime,
        answers:   answerList,
      });

      navigate(`/mock/result/${res.data.id}`);
    } catch {
      console.error("Submit failed");
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = Object.values(answers)
    .filter(a => a && a.trim() !== "").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Pre-interview screen
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
            🎯
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">{set?.title}</h1>
          <p className="text-slate-500 text-sm mb-6">{set?.company} • {set?.role}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Questions", value: questions.length,       icon: "❓" },
              { label: "Duration",  value: `${set?.durationMinutes} min`, icon: "⏱" },
              { label: "Difficulty",value: set?.difficulty,        icon: "📊" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-base font-black text-slate-800">{s.value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-amber-700 mb-2">⚠️ Before you start</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Timer starts immediately when you click Start</li>
              <li>• You can navigate between questions freely</li>
              <li>• Timer runs out → auto submit</li>
              <li>• For theory and coding questions, type your approach</li>
              <li>• For MCQ, select one option</li>
            </ul>
          </div>

          <button
            onClick={startInterview}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-violet-700 transition shadow-lg text-sm"
          >
            Start Interview →
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">{set?.title}</p>
            <p className="text-sm font-bold text-slate-700">
              Question {current + 1} of {questions.length}
            </p>
          </div>
          {/* Progress bar */}
          <div className="hidden md:block w-48 h-2 bg-slate-100 rounded-full">
            <div className="h-2 bg-indigo-500 rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Answered count */}
          <span className="text-xs text-slate-400 hidden md:block">
            {answeredCount}/{questions.length} answered
          </span>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm ${
            timeLeft < 120
              ? "bg-rose-50 text-rose-600 animate-pulse"
              : timeLeft < 300
                ? "bg-amber-50 text-amber-600"
                : "bg-indigo-50 text-indigo-600"
          }`}>
            ⏱ {formatTime(timeLeft)}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Question + Navigation layout */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-6 py-6 gap-6">

        {/* Question Panel */}
        <div className="flex-1">
          {q && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

              {/* Question type badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  q.questionType === "MCQ"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : q.questionType === "CODING"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-violet-50 text-violet-600 border-violet-200"
                }`}>
                  {q.questionType === "MCQ" ? "🔘 MCQ" :
                   q.questionType === "CODING" ? "💻 Coding" : "✍️ Theory"}
                </span>
                <span className="text-xs text-slate-400">Q{current + 1}</span>
              </div>

              {/* Question text */}
              <h2 className="text-base font-bold text-slate-800 mb-5 leading-relaxed">
                {q.questionText}
              </h2>

              {/* Code snippet for output-based MCQ */}
              {q.codeSnippet && (
                <div className="bg-slate-900 rounded-xl p-4 mb-5">
                  <p className="text-xs text-slate-400 font-medium mb-2">{"</>"} Code</p>
                  <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                    {q.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Input/Output for coding */}
              {q.questionType === "CODING" && q.inputOutput && (
                <div className="bg-slate-900 rounded-xl p-4 mb-5">
                  <p className="text-xs text-slate-400 font-medium mb-2">Example</p>
                  <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                    {q.inputOutput}
                  </pre>
                </div>
              )}

              {/* MCQ Options */}
              {q.questionType === "MCQ" && (
                <div className="space-y-2">
                  {["optionA","optionB","optionC","optionD"].map((opt, i) => {
                    const label      = ["A","B","C","D"][i];
                    const isSelected = answers[q.refId] === opt;
                    return (
                      <label key={opt}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50"
                        }`}>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-white border border-slate-200 text-slate-500"
                        }`}>
                          {label}
                        </span>
                        <input type="radio" name={`q-${q.refId}`} value={opt}
                          checked={isSelected}
                          onChange={() => handleSelect(q.refId, opt)}
                          className="hidden" />
                        <span className="text-sm">{q[opt]}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Theory Answer */}
              {q.questionType === "THEORY" && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Your Answer
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Type your answer here. Be as detailed as possible..."
                    value={answers[q.refId] || ""}
                    onChange={e => handleSelect(q.refId, e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
                  />
                </div>
              )}

              {/* Coding Answer */}
              {q.questionType === "CODING" && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Write Your Approach / Solution
                  </label>
                  <textarea
                    rows={10}
                    placeholder={"Explain your approach or write your solution code here...\n\nExample:\n1. Start by...\n2. Then...\n3. Finally..."}
                    value={answers[q.refId] || ""}
                    onChange={e => handleSelect(q.refId, e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-slate-900 text-emerald-400 font-mono border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrent(prev => prev - 1)}
                  disabled={current === 0}
                  className="px-5 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
                >
                  ← Previous
                </button>
                {current < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrent(prev => prev + 1)}
                    className="px-5 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Interview →"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Question Navigator */}
        <div className="w-48 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-20">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Questions
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((q, i) => {
                const isAnswered = answers[q.refId] && answers[q.refId].trim() !== "";
                const isCurrent  = current === i;
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : isAnswered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5">
              {[
                { color: "bg-indigo-600", label: "Current"   },
                { color: "bg-emerald-100 border border-emerald-200", label: "Answered" },
                { color: "bg-slate-100",  label: "Pending"   },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${l.color}`} />
                  <span className="text-[11px] text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Progress</p>
              <div className="w-full h-2 bg-slate-100 rounded-full">
                <div className="h-2 bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {answeredCount}/{questions.length} done
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockInterview;