import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const navItems = [
  { icon: "📊", label: "Dashboard",          path: "/admin"           },
  { icon: "📚", label: "Manage Notes",        path: "/admin/notes"     },
  { icon: "🎤", label: "Interview Questions", path: "/admin/questions" },
  { icon: "💻", label: "Coding Questions",    path: "/admin/coding"    },
  { icon: "👥", label: "Manage Users",        path: "/admin/users"     },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/admin/aptitude"  },
];

const emptyForm = {
  title: "", topic: "", difficulty: "", language: "",
  problemStatement: "", inputOutput: "", hint: "",
  approach: "", solution: "", timeComplexity: "",
  spaceComplexity: "", companyTags: "",
};

const diffColor = {
  Basic:        "text-emerald-600 bg-emerald-50",
  Intermediate: "text-amber-600 bg-amber-50",
  Hard:         "text-rose-600 bg-rose-50",
};

function AdminCoding() {
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
    const res = await api.get("/coding");
    setQuestions(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (!form.title || !form.problemStatement || !form.difficulty) {
      return showToast("Title, difficulty and problem statement are required", "error");
    }
    try {
      if (editId) {
        await api.put(`/coding/${editId}`, form);
        showToast("Problem updated!");
      } else {
        await api.post("/coding", form);
        showToast("Problem added!");
      }
      setForm(emptyForm);
      setEditId(null);
      fetchQuestions();
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/coding/${id}`);
    setDeleteConfirm(null);
    showToast("Problem deleted");
    fetchQuestions();
  };

  const startEdit = (q) => {
    setForm({
      title:            q.title            || "",
      topic:            q.topic            || "",
      difficulty:       q.difficulty       || "",
      language:         q.language         || "",
      problemStatement: q.problemStatement || "",
      inputOutput:      q.inputOutput      || "",
      hint:             q.hint             || "",
      approach:         q.approach         || "",
      solution:         q.solution         || "",
      timeComplexity:   q.timeComplexity   || "",
      spaceComplexity:  q.spaceComplexity  || "",
      companyTags:      q.companyTags      || "",
    });
    setEditId(q.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const filtered = questions.filter(q =>
    q.title.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    (q.topic && q.topic.toLowerCase().includes(searchAdmin.toLowerCase()))
  );

  // Reusable field components
  const Field = ({ label, name, placeholder, type = "text" }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input name={name} type={type} placeholder={placeholder}
        value={form[name]} onChange={handleChange}
        className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" />
    </div>
  );

  const TextArea = ({ label, name, placeholder, rows = 4 }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <textarea name={name} placeholder={placeholder} rows={rows}
        value={form[name]} onChange={handleChange}
        className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none font-mono" />
    </div>
  );

  const Select = ({ label, name, options }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <select name={name} value={form[name]} onChange={handleChange}
        className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">
        <option value="">Select</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
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
            <h3 className="text-lg font-bold text-slate-800 text-center">Delete Problem?</h3>
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
          <h2 className="text-xl font-black text-slate-800">Manage Coding Problems 💻</h2>
          <p className="text-slate-500 text-xs mt-0.5">{questions.length} problems in database</p>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-5 gap-8">

          {/* LEFT — Form */}
          <div className="xl:col-span-2 space-y-4">

            {editId && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-amber-700">✏️ Editing problem #{editId}</span>
                <button onClick={cancelEdit} className="text-xs text-amber-400 hover:text-amber-700">Cancel ✕</button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">
                {editId ? "✏️ Update Problem" : "+ Add New Problem"}
              </h3>

              <form onSubmit={saveQuestion} className="space-y-4">
                <Field label="Title *" name="title" placeholder="e.g. Two Sum" />

                <div className="grid grid-cols-2 gap-3">
                  <Select label="Difficulty *" name="difficulty"
                    options={["Basic","Intermediate","Hard"]} />
                  <Select label="Language" name="language"
                    options={["Java","Python","JavaScript"]} />
                </div>

                <Select label="Topic" name="topic"
                  options={["Arrays","Strings","Loops","Linked List","Trees","Recursion","DP","Graphs","Backtracking"]} />

                <TextArea label="Problem Statement *" name="problemStatement"
                  placeholder="Describe the problem..." rows={4} />

                <TextArea label="Input / Output Example" name="inputOutput"
                  placeholder={"Input: [2,7,11,15], target=9\nOutput: [0,1]"} rows={3} />

                <TextArea label="Hint" name="hint"
                  placeholder="Give a small nudge without revealing the answer..." rows={2} />

                <TextArea label="Approach (Step by step)" name="approach"
                  placeholder={"1. Start with...\n2. Then...\n3. Finally..."} rows={4} />

                <TextArea label="Solution Code" name="solution"
                  placeholder="Paste the solution code here..." rows={6} />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Time Complexity" name="timeComplexity" placeholder="O(n)" />
                  <Field label="Space Complexity" name="spaceComplexity" placeholder="O(1)" />
                </div>

                <Field label="Company Tags (comma separated)" name="companyTags"
                  placeholder="TCS, Amazon, Wipro" />

                <button type="submit"
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition ${
                    editId
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  }`}>
                  {editId ? "✓ Update Problem" : "+ Add Problem"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — Problems List */}
          <div className="xl:col-span-3 space-y-4">

            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search problems..."
                value={searchAdmin} onChange={e => setSearchAdmin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm" />
            </div>

            <p className="text-xs text-slate-400">{filtered.length} problems</p>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-slate-500 font-medium">No problems yet</p>
                  <p className="text-slate-400 text-sm mt-1">Add your first problem using the form</p>
                </div>
              ) : filtered.map(q => (
                <div key={q.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    editId === q.id ? "border-amber-400 shadow-lg" : "border-slate-100 hover:shadow-md"
                  }`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {q.difficulty && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${diffColor[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                          )}
                          {q.language && (
                            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              {q.language}
                            </span>
                          )}
                          {q.topic && (
                            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                              {q.topic}
                            </span>
                          )}
                          {editId === q.id && (
                            <span className="text-[10px] bg-amber-100 text-amber-600 font-semibold px-2 py-0.5 rounded-full">Editing</span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-800">{q.title}</p>
                        {q.companyTags && (
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {q.companyTags.split(",").map(tag => (
                              <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

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

                    <button
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="text-xs text-emerald-500 hover:text-emerald-700 font-medium mt-2 transition"
                    >
                      {expandedId === q.id ? "Hide preview ↑" : "Preview problem ↓"}
                    </button>

                    {expandedId === q.id && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                          {q.problemStatement}
                        </p>
                        {(q.timeComplexity || q.spaceComplexity) && (
                          <div className="flex gap-2 mt-2">
                            {q.timeComplexity && (
                              <span className="text-[11px] font-mono bg-violet-50 text-violet-600 px-2 py-0.5 rounded-lg">
                                T: {q.timeComplexity}
                              </span>
                            )}
                            {q.spaceComplexity && (
                              <span className="text-[11px] font-mono bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-lg">
                                S: {q.spaceComplexity}
                              </span>
                            )}
                          </div>
                        )}
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

export default AdminCoding;