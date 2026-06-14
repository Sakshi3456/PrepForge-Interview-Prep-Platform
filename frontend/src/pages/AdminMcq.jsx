import { useEffect, useState } from "react";
import { Search, X, CheckCircle2, ChevronDown, ChevronUp, Upload, ClipboardList } from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES   = ["Java","React","Python","Spring Boot","DBMS","OS","Networking"];
const DIFFICULTIES = ["All","Easy","Medium","Hard"];
const FILTER_CATS  = ["All", ...CATEGORIES];

const diffBadge = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const inputCls  = "w-full px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition";
const labelCls  = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
const selectCls = inputCls + " appearance-none";

const emptyForm = {
  category: "", difficulty: "", questionType: "THEORY",
  question: "", codeSnippet: "",
  optionA: "", optionB: "", optionC: "", optionD: "",
  correctAnswer: "", explanation: "", frequentlyAsked: false,
};

function AdminMcq() {
  const [questions,     setQuestions]     = useState([]);
  const [form,          setForm]          = useState(emptyForm);
  const [editId,        setEditId]        = useState(null);
  const [toast,         setToast]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search,        setSearch]        = useState("");
  const [expandedId,    setExpandedId]    = useState(null);
  const [filterCat,     setFilterCat]     = useState("All");
  const [filterDiff,    setFilterDiff]    = useState("All");
  const [formOpen,      setFormOpen]      = useState(true);
  const [csvFile,       setCsvFile]       = useState(null);
  const [uploading,     setUploading]     = useState(false);

  useEffect(() => { fetchQuestions(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/mcq");
      setQuestions(res.data);
    } catch { showToast("Failed to load questions", "error"); }
  };

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (!form.category || !form.question || !form.correctAnswer)
      return showToast("Category, question and correct answer are required", "error");
    try {
      if (editId) {
        await api.put(`/mcq/${editId}`, form);
        showToast("Question updated!");
      } else {
        await api.post("/mcq", form);
        showToast("Question added!");
      }
      setForm(emptyForm); setEditId(null); fetchQuestions();
    } catch { showToast("Something went wrong", "error"); }
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/mcq/${id}`);
    setDeleteConfirm(null);
    showToast("Question deleted");
    fetchQuestions();
  };

  const startEdit = (q) => {
    setForm({
      category:        q.category        || "",
      difficulty:      q.difficulty      || "",
      questionType:    q.questionType    || "THEORY",
      question:        q.question        || "",
      codeSnippet:     q.codeSnippet     || "",
      optionA:         q.optionA         || "",
      optionB:         q.optionB         || "",
      optionC:         q.optionC         || "",
      optionD:         q.optionD         || "",
      correctAnswer:   q.correctAnswer   || "",
      explanation:     q.explanation     || "",
      frequentlyAsked: q.frequentlyAsked || false,
    });
    setEditId(q.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const handleCsvUpload = async () => {
    if (!csvFile) return showToast("Select a CSV file first", "error");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const token = localStorage.getItem("token");
      const res = await api.post("/mcq/upload-csv", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(res.data);
      setCsvFile(null);
      fetchQuestions();
    } catch { showToast("CSV upload failed", "error"); }
    finally { setUploading(false); }
  };

  const filtered = questions.filter(q => {
    const matchSearch = q.question?.toLowerCase().includes(search.toLowerCase()) ||
                        q.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat  = filterCat  === "All" || q.category  === filterCat;
    const matchDiff = filterDiff === "All" || q.difficulty === filterDiff;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <AdminLayout>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-bold border ${
          toast.type === "error"
            ? "bg-[#0d0f28] border-rose-500/30 text-rose-300"
            : "bg-[#0d0f28] border-emerald-500/30 text-emerald-300"
        }`}>
          {toast.type === "error" ? <X size={14}/> : <CheckCircle2 size={14}/>}
          {toast.msg}
        </div>
      )}

      {/* ── Delete modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-[#0d0f28] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={20} className="text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Question?</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
                Cancel
              </button>
              <button onClick={() => deleteQuestion(deleteConfirm)}
                className="flex-1 py-2.5 text-sm font-medium bg-rose-500 text-white rounded-xl hover:bg-rose-400 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 max-w-[1400px] mx-auto space-y-6">

        {/* ── Page header ── */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Technical MCQ</h2>
          <p className="text-xs text-slate-500 mt-1">{questions.length} questions in the bank</p>
        </div>

        {/* ── CSV Upload — compact banner ── */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Upload size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">Bulk CSV Upload</p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {csvFile ? `${csvFile.name} · ${(csvFile.size/1024).toFixed(1)} KB` : "category, difficulty, questionType, question, optionA-D, correctAnswer, explanation, frequentlyAsked"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => document.getElementById("csvInput").click()}
              className="px-4 py-2 text-xs font-bold bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 rounded-xl transition">
              {csvFile ? "Change file" : "Choose CSV"}
            </button>
            <input id="csvInput" type="file" accept=".csv" className="hidden"
              onChange={e => setCsvFile(e.target.files[0])} />
            <button onClick={handleCsvUpload} disabled={!csvFile || uploading}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl transition disabled:opacity-40">
              {uploading ? "Uploading..." : "↑ Upload"}
            </button>
          </div>
        </div>

        {/* ── FORM — collapsible ── */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl overflow-hidden">

          <button onClick={() => setFormOpen(!formOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${editId ? "bg-amber-400" : "bg-indigo-400"}`} />
              <span className="text-sm font-bold text-slate-200">
                {editId ? `Editing Question #${editId}` : "Add New Question"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {editId && (
                <span onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition">
                  Cancel Edit ✕
                </span>
              )}
              {formOpen ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
            </div>
          </button>

          {formOpen && (
            <form onSubmit={saveQuestion} className="px-6 pb-6 border-t border-white/[0.05] space-y-4 pt-5">

              {/* Row 1: Category + Difficulty + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className={selectCls}>
                    <option value="" className="bg-[#0d0f28]">Select category</option>
                    {CATEGORIES.map(c => <option key={c} className="bg-[#0d0f28]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleChange} className={selectCls}>
                    <option value="" className="bg-[#0d0f28]">Select difficulty</option>
                    {["Easy","Medium","Hard"].map(d => <option key={d} className="bg-[#0d0f28]">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Question Type</label>
                  <select name="questionType" value={form.questionType} onChange={handleChange} className={selectCls}>
                    <option value="THEORY" className="bg-[#0d0f28]">Theory</option>
                    <option value="OUTPUT_BASED" className="bg-[#0d0f28]">Output Based</option>
                  </select>
                </div>
              </div>

              {/* Question */}
              <div>
                <label className={labelCls}>Question *</label>
                <textarea name="question" value={form.question} onChange={handleChange}
                  placeholder="Write the question here..." rows={3} className={inputCls + " resize-none"} />
              </div>

              {/* Code snippet — only for OUTPUT_BASED */}
              {form.questionType === "OUTPUT_BASED" && (
                <div>
                  <label className={labelCls}>Code Snippet</label>
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] border-b border-white/[0.05] rounded-t-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                      <span className="text-[10px] text-slate-600 ml-2 font-mono">snippet.java</span>
                    </div>
                    <textarea name="codeSnippet" value={form.codeSnippet} onChange={handleChange}
                      placeholder={"public class Main {\n  public static void main(String[] args) {\n    System.out.println(1+2+3);\n  }\n}"}
                      rows={6}
                      className="w-full pt-10 px-4 pb-4 text-xs font-mono bg-[#060810] border border-white/[0.07] text-indigo-300 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition resize-none leading-relaxed" />
                  </div>
                </div>
              )}

              {/* Options 2x2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["A","B","C","D"].map(letter => (
                  <div key={letter}>
                    <label className={labelCls}>Option {letter}</label>
                    <input name={`option${letter}`} value={form[`option${letter}`]} onChange={handleChange}
                      placeholder={`Option ${letter}`}
                      className={`${inputCls} ${form.correctAnswer === `option${letter}` ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : ""}`} />
                  </div>
                ))}
              </div>

              {/* Correct answer */}
              <div>
                <label className={labelCls}>Correct Answer *</label>
                <select name="correctAnswer" value={form.correctAnswer} onChange={handleChange} className={selectCls}>
                  <option value="" className="bg-[#0d0f28]">Select correct option</option>
                  {["A","B","C","D"].map(l => (
                    <option key={l} value={`option${l}`} className="bg-[#0d0f28]">
                      {l} — {form[`option${l}`] || `Option ${l}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Explanation */}
              <div>
                <label className={labelCls}>Explanation <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
                <textarea name="explanation" value={form.explanation} onChange={handleChange}
                  placeholder="Why is this the correct answer..." rows={2}
                  className={inputCls + " resize-none"} />
              </div>

              {/* Frequently asked toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-rose-500/[0.05] rounded-xl border border-rose-500/15 hover:bg-rose-500/[0.08] transition w-fit">
                <input type="checkbox" name="frequentlyAsked"
                  checked={form.frequentlyAsked} onChange={handleChange}
                  className="w-4 h-4 accent-rose-500 rounded" />
                <span className="text-sm text-rose-400 font-semibold">🔥 Mark as Frequently Asked</span>
              </label>

              {/* Submit */}
              <button type="submit"
                className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg ${
                  editId
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-500/20"
                }`}>
                {editId ? "✓ Update Question" : "+ Add Question"}
              </button>
            </form>
          )}
        </div>

        {/* ── QUESTION BANK ── */}
        <div className="space-y-4">

          {/* Header + search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-white">Question Bank</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} of {questions.length} questions</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="text" placeholder="Search questions..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0d0f28] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition" />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_CATS.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterCat === cat
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty pills */}
          <div className="flex gap-1.5">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setFilterDiff(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterDiff === d
                    ? d === "All"    ? "bg-slate-500/20 border-slate-500/40 text-slate-300"
                      : d === "Easy"   ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : d === "Medium" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      :                  "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                }`}>
                {d}
              </button>
            ))}
            {(filterCat !== "All" || filterDiff !== "All" || search) && (
              <button onClick={() => { setFilterCat("All"); setFilterDiff("All"); setSearch(""); }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-white/[0.07] text-slate-600 hover:text-rose-400 transition ml-1">
                ✕ Clear
              </button>
            )}
          </div>

          {/* 2-per-row grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0f28] border border-dashed border-white/[0.06] rounded-2xl">
              <ClipboardList size={32} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium text-sm">No questions found</p>
              <p className="text-slate-600 text-xs mt-1">Try adjusting filters or add a new question above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map(q => (
                <div key={q.id}
                  className={`bg-[#0d0f28] rounded-2xl border transition-all duration-200 ${
                    editId === q.id
                      ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
                      : "border-white/[0.06] hover:border-white/[0.10]"
                  }`}>
                  <div className="p-4 space-y-2.5">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{q.category}</span>
                          {q.difficulty && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                          )}
                          {q.questionType === "OUTPUT_BASED" && (
                            <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                              &lt;/&gt; Output
                            </span>
                          )}
                          {q.frequentlyAsked && (
                            <span className="text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                              🔥 Frequent
                            </span>
                          )}
                          {editId === q.id && (
                            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                              Editing
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-snug line-clamp-2">{q.question}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(q)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20 transition">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(q.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Preview toggle */}
                    <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1">
                      {expandedId === q.id
                        ? <><ChevronUp size={12}/>Hide options</>
                        : <><ChevronDown size={12}/>Preview options</>}
                    </button>

                    {expandedId === q.id && (
                      <div className="space-y-1.5">
                        {q.codeSnippet && (
                          <div className="bg-[#060810] border border-white/[0.05] rounded-xl p-3 mb-2">
                            <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed overflow-x-auto">{q.codeSnippet}</pre>
                          </div>
                        )}
                        {["A","B","C","D"].map(letter => {
                          const isCorrect = q.correctAnswer === `option${letter}`;
                          return (
                            <div key={letter}
                              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border ${
                                isCorrect
                                  ? "bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-300 font-semibold"
                                  : "bg-white/[0.02] border-white/[0.05] text-slate-500"
                              }`}>
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isCorrect ? "bg-emerald-500 text-white" : "bg-white/[0.05] border border-white/[0.08] text-slate-600"
                              }`}>{letter}</span>
                              <span className="flex-1">{q[`option${letter}`]}</span>
                              {isCorrect && <span className="text-emerald-400 text-[10px] font-bold shrink-0">✓ Correct</span>}
                            </div>
                          );
                        })}
                        {q.explanation && (
                          <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-2.5">
                            <p className="text-xs text-amber-400">💡 {q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminMcq;