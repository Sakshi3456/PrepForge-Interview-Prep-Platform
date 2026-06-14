import { useEffect, useState } from "react";
import { Search, X, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

const emptyForm = {
  category: "", question: "", answer: "",
  difficulty: "", companyTag: "", frequentlyAsked: false,
};

const diffBadge = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const CATEGORIES  = ["All","HR","Java","React","Python","DSA","System Design","DBMS","OS","Spring Boot"];
const DIFFICULTIES = ["All","Easy","Medium","Hard"];

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition";
const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

function AdminQuestions() {
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

  useEffect(() => { fetchQuestions(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuestions = async () => {
    const res = await api.get("/questions");
    setQuestions(res.data);
  };

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (!form.category || !form.question || !form.answer)
      return showToast("Category, question and answer are required", "error");
    try {
      if (editId) {
        await api.put(`/questions/${editId}`, form);
        showToast("Question updated!");
      } else {
        await api.post("/questions", form);
        showToast("Question added!");
      }
      setForm(emptyForm); setEditId(null); fetchQuestions();
    } catch { showToast("Something went wrong", "error"); }
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/questions/${id}`);
    setDeleteConfirm(null);
    showToast("Question deleted");
    fetchQuestions();
  };

  const startEdit = (q) => {
    setForm({
      category: q.category || "", question: q.question || "",
      answer: q.answer || "", difficulty: q.difficulty || "",
      companyTag: q.companyTag || "", frequentlyAsked: q.frequentlyAsked || false,
    });
    setEditId(q.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const filtered = questions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
                        q.category.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat  === "All" || q.category  === filterCat;
    const matchDiff   = filterDiff === "All" || q.difficulty === filterDiff;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <AdminLayout>

      {/* Toast */}
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

      {/* Delete modal */}
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

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Interview Questions</h2>
            <p className="text-xs text-slate-500 mt-1">{questions.length} questions in the bank</p>
          </div>
        </div>

        {/* ── FORM — full width collapsible ── */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl overflow-hidden">

          {/* Form header — always visible, click to collapse */}
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition"
          >
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

          {/* Form body */}
          {formOpen && (
            <form onSubmit={saveQuestion} className="px-6 pb-6 space-y-5 border-t border-white/[0.05]">
              <div className="pt-5 grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Category */}
                <div>
                  <label className={labelCls}>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className={inputCls + " appearance-none"}>
                    <option value="" className="bg-[#0d0f28]">Select category</option>
                    {["HR","Java","React","Python","DSA","System Design","DBMS","OS","Spring Boot"].map(c =>
                      <option key={c} className="bg-[#0d0f28]">{c}</option>
                    )}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleChange}
                    className={inputCls + " appearance-none"}>
                    <option value="" className="bg-[#0d0f28]">Select difficulty</option>
                    {["Easy","Medium","Hard"].map(d =>
                      <option key={d} className="bg-[#0d0f28]">{d}</option>
                    )}
                  </select>
                </div>

                {/* Company tags */}
                <div>
                  <label className={labelCls}>Company Tags <span className="text-slate-600 normal-case font-normal">(comma separated)</span></label>
                  <input name="companyTag" value={form.companyTag} onChange={handleChange}
                    placeholder="TCS, Infosys, Wipro" className={inputCls} />
                </div>

                {/* Frequently asked */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-rose-500/[0.06] rounded-xl border border-rose-500/20 hover:bg-rose-500/10 transition h-[42px]">
                    <input type="checkbox" name="frequentlyAsked"
                      checked={form.frequentlyAsked} onChange={handleChange}
                      className="w-4 h-4 accent-rose-500 shrink-0" />
                    <span className="text-xs text-rose-400 font-semibold">🔥 Frequently Asked</span>
                  </label>
                </div>
              </div>

              {/* Question + Answer side by side on large screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Question *</label>
                  <input name="question" value={form.question} onChange={handleChange}
                    placeholder="e.g. What is polymorphism?"
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Answer *</label>
                  <textarea name="answer" value={form.answer} onChange={handleChange}
                    placeholder="Detailed answer..." rows={3}
                    className={inputCls + " resize-none"} />
                </div>
              </div>

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

        {/* ── QUESTION BANK — full width ── */}
        <div className="space-y-4">

          {/* Bank header + search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-white">Question Bank</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} of {questions.length} questions</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="text" placeholder="Search questions..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0d0f28] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition" />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
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

          {/* Difficulty filter pills */}
          <div className="flex gap-1.5">
            {DIFFICULTIES.map(diff => (
              <button key={diff} onClick={() => setFilterDiff(diff)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterDiff === diff
                    ? diff === "All"    ? "bg-slate-500/20 border-slate-500/40 text-slate-300"
                      : diff === "Easy"   ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : diff === "Medium" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      :                    "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                }`}>
                {diff}
              </button>
            ))}
            {(filterCat !== "All" || filterDiff !== "All" || search) && (
              <button onClick={() => { setFilterCat("All"); setFilterDiff("All"); setSearch(""); }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-white/[0.07] text-slate-600 hover:text-rose-400 transition ml-2">
                ✕ Clear
              </button>
            )}
          </div>

          {/* 2-per-row question grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0f28] border border-dashed border-white/[0.06] rounded-2xl">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-slate-400 font-medium text-sm">No questions found</p>
              <p className="text-slate-600 text-xs mt-1">Try adjusting your filters or add a new question above</p>
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

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{q.category}</span>
                          {q.difficulty && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge[q.difficulty]}`}>
                              {q.difficulty}
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
                        <p className="text-sm font-bold text-slate-200 leading-snug">{q.question}</p>
                        {q.companyTag && (
                          <div className="flex gap-1.5 flex-wrap mt-1.5">
                            {q.companyTag.split(",").map(tag => (
                              <span key={tag} className="text-[10px] bg-white/[0.04] text-slate-500 border border-white/[0.07] px-2 py-0.5 rounded-full">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
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

                    {/* Answer preview */}
                    <button
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1">
                      {expandedId === q.id ? <><ChevronUp size={12}/>Hide answer</> : <><ChevronDown size={12}/>Preview answer</>}
                    </button>

                    {expandedId === q.id && (
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                        <p className="text-xs text-slate-400 leading-relaxed">{q.answer}</p>
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

export default AdminQuestions;