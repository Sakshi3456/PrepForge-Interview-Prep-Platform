import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const navItems = [
  { icon: "📊", label: "Dashboard",          path: "/admin"            },
  { icon: "📚", label: "Manage Notes",        path: "/admin/notes"      },
  { icon: "🎤", label: "Interview Questions", path: "/admin/questions"  },
  { icon: "💻", label: "Coding Questions",    path: "/admin/coding"     },
  { icon: "📝", label: "Technical MCQ",       path: "/admin/mcq"        },
  { icon: "👥", label: "Manage Users",        path: "/admin/users"      },
  { icon: "🧮", label: "Aptitude Quiz",       path: "/admin/aptitude"   },
  { icon: "🎯", label: "Mock Interviews",     path: "/admin/mock"       },
];

const emptySetForm = {
  title: "", company: "", role: "", difficulty: "", durationMinutes: 30,
};

const emptyQForm = {
  sourceTable: "", sourceQuestionId: "",
};

function AdminMockSets() {
  const [sets, setSets]             = useState([]);
  const [setForm, setSetForm]       = useState(emptySetForm);
  const [editSetId, setEditSetId]   = useState(null);
  const [expandedSet, setExpandedSet] = useState(null);
  const [setQuestions, setSetQuestions] = useState({});
  const [qForm, setQForm]           = useState(emptyQForm);
  const [addingTo, setAddingTo]     = useState(null);
  const [toast, setToast]           = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Source question search
  const [sourceList, setSourceList]     = useState([]);
  const [sourceSearch, setSourceSearch] = useState("");

  useEffect(() => { fetchSets(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSets = async () => {
    const res = await api.get("/mock/sets");
    setSets(res.data);
  };

  const fetchSetQuestions = async (setId) => {
    const res = await api.get(`/mock/sets/${setId}/questions`);
    setSetQuestions(prev => ({ ...prev, [setId]: res.data }));
  };

  const saveSet = async (e) => {
    e.preventDefault();
    if (!setForm.title || !setForm.company) {
      return showToast("Title and company are required", "error");
    }
    try {
      if (editSetId) {
        await api.put(`/mock/sets/${editSetId}`, setForm);
        showToast("Set updated!");
        setEditSetId(null);
      } else {
        await api.post("/mock/sets", setForm);
        showToast("Set created!");
      }
      setSetForm(emptySetForm);
      fetchSets();
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  const deleteSet = async (id) => {
    await api.delete(`/mock/sets/${id}`);
    setDeleteConfirm(null);
    showToast("Set deleted");
    fetchSets();
  };

  const startEditSet = (set) => {
    setSetForm({
      title: set.title, company: set.company,
      role: set.role, difficulty: set.difficulty,
      durationMinutes: set.durationMinutes,
    });
    setEditSetId(set.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search existing questions from source table
  const searchSource = async (table, keyword) => {
    if (!table) return;
    try {
      let res;
      if (table === "INTERVIEW_QUESTION") {
        res = await api.get(`/questions/search?keyword=${keyword || ""}`);
        setSourceList(res.data.map(q => ({ id: q.id, text: q.question, type: "THEORY" })));
      } else if (table === "TECHNICAL_MCQ") {
        res = await api.get(`/mcq/search?keyword=${keyword || ""}`);
        setSourceList(res.data.map(q => ({ id: q.id, text: q.question, type: "MCQ" })));
      } else if (table === "APTITUDE") {
        res = await api.get("/aptitude");
        setSourceList(res.data
          .filter(q => !keyword || q.question.toLowerCase().includes(keyword.toLowerCase()))
          .map(q => ({ id: q.id, text: q.question, type: "MCQ" })));
      } else if (table === "CODING") {
        res = await api.get(`/coding/search?keyword=${keyword || ""}`);
        setSourceList(res.data.map(q => ({ id: q.id, text: q.title, type: "CODING" })));
      }
    } catch {
      console.error("Source search failed");
    }
  };

  const addQuestionToSet = async (setId, sourceId) => {
    try {
      await api.post(`/mock/sets/${setId}/questions`, {
        sourceTable:       qForm.sourceTable,
        sourceQuestionId:  sourceId,
      });
      showToast("Question added to set!");
      fetchSetQuestions(setId);
    } catch {
      showToast("Failed to add question", "error");
    }
  };

  const removeQuestionFromSet = async (setId, refId) => {
    await api.delete(`/mock/set-questions/${refId}`);
    showToast("Question removed");
    fetchSetQuestions(setId);
  };

  const toggleExpand = (setId) => {
    if (expandedSet === setId) {
      setExpandedSet(null);
    } else {
      setExpandedSet(setId);
      fetchSetQuestions(setId);
    }
  };

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
            <h3 className="text-lg font-bold text-slate-800 text-center">Delete Set?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-5">
              This will delete the set and all its questions.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => deleteSet(deleteConfirm)}
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
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
        <div className="bg-white border-b border-slate-100 px-8 py-4 shadow-sm">
          <h2 className="text-xl font-black text-slate-800">Manage Mock Interview Sets 🎯</h2>
          <p className="text-slate-500 text-xs mt-0.5">{sets.length} sets available</p>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-5 gap-8">

          {/* LEFT — Create/Edit Set Form */}
          <div className="xl:col-span-2 space-y-4">

            {editSetId && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-amber-700">✏️ Editing set #{editSetId}</span>
                <button onClick={() => { setEditSetId(null); setSetForm(emptySetForm); }}
                  className="text-xs text-amber-400 hover:text-amber-700">Cancel ✕</button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">
                {editSetId ? "✏️ Update Set" : "+ Create New Set"}
              </h3>
              <form onSubmit={saveSet} className="space-y-4">

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title *</label>
                  <input value={setForm.title}
                    onChange={e => setSetForm({ ...setForm, title: e.target.value })}
                    placeholder="e.g. TCS NQT Prep"
                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company *</label>
                    <select value={setForm.company}
                      onChange={e => setSetForm({ ...setForm, company: e.target.value })}
                      className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                      <option value="">Select</option>
                      {["TCS","Infosys","Wipro","Cognizant","Accenture","Amazon","Other"].map(c =>
                        <option key={c}>{c}</option>
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty</label>
                    <select value={setForm.difficulty}
                      onChange={e => setSetForm({ ...setForm, difficulty: e.target.value })}
                      className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                      <option value="">Select</option>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Role</label>
                  <select value={setForm.role}
                    onChange={e => setSetForm({ ...setForm, role: e.target.value })}
                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                    <option value="">Select</option>
                    {["Java Developer","React Developer","Full Stack","Python Developer","General"].map(r =>
                      <option key={r}>{r}</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration (minutes)</label>
                  <select value={setForm.durationMinutes}
                    onChange={e => setSetForm({ ...setForm, durationMinutes: parseInt(e.target.value) })}
                    className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <button type="submit"
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition ${
                    editSetId
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                  }`}>
                  {editSetId ? "✓ Update Set" : "+ Create Set"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — Sets List */}
          <div className="xl:col-span-3 space-y-4">
            <p className="text-xs text-slate-400">{sets.length} sets</p>

            {sets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-500 font-medium">No sets yet</p>
                <p className="text-slate-400 text-sm mt-1">Create your first interview set</p>
              </div>
            ) : (
              sets.map(set => (
                <div key={set.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                  {/* Set Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-indigo-600">{set.company}</span>
                          <span className="text-slate-200">•</span>
                          <span className="text-xs text-slate-400">{set.role}</span>
                          <span className="text-slate-200">•</span>
                          <span className="text-xs text-slate-400">⏱ {set.durationMinutes} min</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">{set.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{set.difficulty}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEditSet(set)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(set.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition border border-rose-100">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleExpand(set.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-600 font-medium mt-2 transition"
                    >
                      {expandedSet === set.id
                        ? `Hide questions ↑`
                        : `Manage questions ↓ ${setQuestions[set.id] ? `(${setQuestions[set.id].length})` : ""}`
                      }
                    </button>
                  </div>

                  {/* Expanded — Questions */}
                  {expandedSet === set.id && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">

                      {/* Existing questions */}
                      {setQuestions[set.id]?.length > 0 && (
                        <div className="space-y-2">
                          {setQuestions[set.id].map((q, i) => (
                            <div key={q.refId}
                              className="flex items-start justify-between gap-3 bg-white rounded-xl p-3 border border-slate-100">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                                  {i + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                      q.questionType === "MCQ"
                                        ? "bg-blue-50 text-blue-600"
                                        : q.questionType === "CODING"
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "bg-violet-50 text-violet-600"
                                    }`}>
                                      {q.questionType}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{q.sourceTable}</span>
                                  </div>
                                  <p className="text-xs text-slate-700 line-clamp-2">{q.questionText}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeQuestionFromSet(set.id, q.refId)}
                                className="text-xs text-rose-400 hover:text-rose-600 shrink-0 transition font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add question panel */}
                      {addingTo === set.id ? (
                        <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
                          <h4 className="text-xs font-bold text-slate-700">Add Question from Existing Bank</h4>

                          {/* Source table selector */}
                          <select
                            value={qForm.sourceTable}
                            onChange={e => {
                              setQForm({ ...qForm, sourceTable: e.target.value });
                              setSourceList([]);
                              setSourceSearch("");
                              searchSource(e.target.value, "");
                            }}
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                            <option value="">Select source module</option>
                            <option value="INTERVIEW_QUESTION">Interview Questions (Theory/HR)</option>
                            <option value="TECHNICAL_MCQ">Technical MCQ</option>
                            <option value="APTITUDE">Aptitude Questions</option>
                            <option value="CODING">Coding Questions</option>
                          </select>

                          {/* Search in source */}
                          {qForm.sourceTable && (
                            <input
                              type="text"
                              placeholder="Search questions..."
                              value={sourceSearch}
                              onChange={e => {
                                setSourceSearch(e.target.value);
                                searchSource(qForm.sourceTable, e.target.value);
                              }}
                              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                          )}

                          {/* Source results */}
                          {sourceList.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-2">
                              {sourceList.slice(0, 10).map(q => (
                                <div key={q.id}
                                  className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 transition">
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mr-1 ${
                                      q.type === "MCQ"
                                        ? "bg-blue-50 text-blue-600"
                                        : q.type === "CODING"
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "bg-violet-50 text-violet-600"
                                    }`}>
                                      {q.type}
                                    </span>
                                    <span className="text-xs text-slate-700 line-clamp-1">{q.text}</span>
                                  </div>
                                  <button
                                    onClick={() => addQuestionToSet(set.id, q.id)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 transition px-2 py-1 bg-indigo-50 rounded-lg"
                                  >
                                    + Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => { setAddingTo(null); setSourceList([]); setQForm(emptyQForm); }}
                            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingTo(set.id)}
                          className="w-full py-2.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition"
                        >
                          + Add Question from Question Bank
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMockSets;