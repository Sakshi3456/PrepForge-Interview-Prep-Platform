import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const navItems = [
  { icon: "📊", label: "Dashboard",          path: "/admin"           },
  { icon: "📚", label: "Manage Notes",        path: "/admin/notes"     },
  { icon: "🎤", label: "Interview Questions", path: "/admin/questions" },
  { icon: "👥", label: "Manage Users",        path: "/admin/users"     },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/admin/aptitude"  },
];

const emptyForm = {
  category: "", question: "", answer: "",
  difficulty: "", companyTag: "", frequentlyAsked: false,
};

const diffColor = {
  Easy:   "text-emerald-600 bg-emerald-50",
  Medium: "text-amber-600 bg-amber-50",
  Hard:   "text-rose-600 bg-rose-50",
};

function AdminQuestions() {
  const [questions, setQuestions]         = useState([]);
  const [form, setForm]                   = useState(emptyForm);
  const [editId, setEditId]               = useState(null);
  const [toast, setToast]                 = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchAdmin, setSearchAdmin]     = useState("");
  const [expandedId, setExpandedId]       = useState(null);

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
    if (!form.category || !form.question || !form.answer) {
      return showToast("Category, question and answer are required", "error");
    }
    try {
      if (editId) {
        await api.put(`/questions/${editId}`, form);
        showToast("Question updated!");
      } else {
        await api.post("/questions", form);
        showToast("Question added!");
      }
      setForm(emptyForm);
      setEditId(null);
      fetchQuestions();
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/questions/${id}`);
    setDeleteConfirm(null);
    showToast("Question deleted");
    fetchQuestions();
  };

  const startEdit = (q) => {
    setForm({
      category:       q.category       || "",
      question:       q.question       || "",
      answer:         q.answer         || "",
      difficulty:     q.difficulty     || "",
      companyTag:     q.companyTag     || "",
      frequentlyAsked: q.frequentlyAsked || false,
    });
    setEditId(q.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const filtered = questions.filter(q =>
    q.question.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    q.category.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span> {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Delete Question?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => deleteQuestion(deleteConfirm)}
                className="flex-1 py-2.5 text-sm font-medium bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shrink-0 h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚒️</span>
            <span className="text-xl font-black">PrepForge</span>
          </div>
          <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full tracking-wider uppercase">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition">
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-5 border-t border-white/10">
          <button onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">

        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 shadow-sm">
          <h2 className="text-xl font-black text-slate-800">Manage Interview Questions 🎤</h2>
          <p className="text-slate-500 text-xs mt-0.5">{questions.length} questions in database</p>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-5 gap-8">

          {/* LEFT — Form */}
          <div className="xl:col-span-2 space-y-4">

            {editId && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-amber-700">✏️ Editing question #{editId}</span>
                <button onClick={cancelEdit} className="text-xs text-amber-400 hover:text-amber-700">Cancel ✕</button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">
                {editId ? "✏️ Update Question" : "+ Add New Question"}
              </h3>
              <form onSubmit={saveQuestion} className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category *</label>
                    <select name="category" value={form.category} onChange={handleChange}
                      className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                      <option value="">Select</option>
                      {["HR","Java","React","Python","DSA","System Design","DBMS","OS","Spring Boot"].map(c =>
                        <option key={c}>{c}</option>
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty</label>
                    <select name="difficulty" value={form.difficulty} onChange={handleChange}
                      className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                      <option value="">Select</option>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question *</label>
                  <input name="question" value={form.question} onChange={handleChange}
                    placeholder="e.g. What is polymorphism?"
                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Answer *</label>
                  <textarea name="answer" value={form.answer} onChange={handleChange}
                    placeholder="Detailed answer..." rows={5}
                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Company Tags <span className="text-slate-400 normal-case font-normal">(comma separated)</span>
                  </label>
                  <input name="companyTag" value={form.companyTag} onChange={handleChange}
                    placeholder="TCS, Infosys, Wipro"
                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-100 transition">
                  <input type="checkbox" name="frequentlyAsked"
                    checked={form.frequentlyAsked} onChange={handleChange}
                    className="w-4 h-4 accent-rose-500" />
                  <span className="text-sm text-rose-600 font-semibold">🔥 Mark as Frequently Asked</span>
                </label>

                <button type="submit"
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition ${
                    editId
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  }`}>
                  {editId ? "✓ Update Question" : "+ Add Question"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — Questions List */}
          <div className="xl:col-span-3 space-y-4">

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search questions..."
                value={searchAdmin} onChange={e => setSearchAdmin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm" />
            </div>

            <p className="text-xs text-slate-400">{filtered.length} questions</p>

            {/* List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-slate-500 font-medium">No questions yet</p>
                  <p className="text-slate-400 text-sm mt-1">Add your first question using the form</p>
                </div>
              ) : filtered.map(q => (
                <div key={q.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    editId === q.id
                      ? "border-amber-400 shadow-lg"
                      : "border-slate-100 hover:shadow-md"
                  }`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{q.category}</span>
                          {q.difficulty && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${diffColor[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                          )}
                          {q.frequentlyAsked && (
                            <span className="text-[10px] font-semibold bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">🔥</span>
                          )}
                          {editId === q.id && (
                            <span className="text-[10px] bg-amber-100 text-amber-600 font-semibold px-2 py-0.5 rounded-full">Editing</span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-800">{q.question}</p>

                        {/* Company tags */}
                        {q.companyTag && (
                          <div className="flex gap-1.5 flex-wrap mt-1.5">
                            {q.companyTag.split(",").map(tag => (
                              <span key={tag} className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(q)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(q.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition border border-rose-100">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Answer preview toggle */}
                    <button
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-600 font-medium mt-2 transition"
                    >
                      {expandedId === q.id ? "Hide answer ↑" : "Preview answer ↓"}
                    </button>

                    {expandedId === q.id && (
                      <div className="mt-2 bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-600 leading-relaxed">{q.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminQuestions;