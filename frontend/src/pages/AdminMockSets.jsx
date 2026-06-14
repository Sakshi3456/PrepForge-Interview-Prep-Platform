import { useEffect, useState } from "react";
import { X, CheckCircle2, ChevronDown, ChevronUp, Trophy, Clock, Search } from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

// ── Constants ─────────────────────────────────────────────────────────────────
const COMPANIES   = ["TCS","Infosys","Wipro","Cognizant","Accenture","Amazon","Other"];
const ROLES       = ["Java Developer","React Developer","Full Stack","Python Developer","General"];
const DURATIONS   = [15, 30, 45, 60];

const diffBadge = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const qTypeBadge = {
  MCQ:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CODING: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  THEORY: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

const inputCls  = "w-full px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition";
const labelCls  = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
const selectCls = inputCls + " appearance-none";

const emptySetForm = { title: "", company: "", role: "", difficulty: "", durationMinutes: 30 };
const emptyQForm   = { sourceTable: "", sourceQuestionId: "" };

function AdminMockSets() {
  const [sets,          setSets]          = useState([]);
  const [setForm,       setSetForm]       = useState(emptySetForm);
  const [editSetId,     setEditSetId]     = useState(null);
  const [expandedSet,   setExpandedSet]   = useState(null);
  const [setQuestions,  setSetQuestions]  = useState({});
  const [qForm,         setQForm]         = useState(emptyQForm);
  const [addingTo,      setAddingTo]      = useState(null);
  const [toast,         setToast]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sourceList,    setSourceList]    = useState([]);
  const [sourceSearch,  setSourceSearch]  = useState("");
  const [formOpen,      setFormOpen]      = useState(true);

  useEffect(() => { fetchSets(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSets = async () => {
    try {
      const res = await api.get("/mock/sets");
      setSets(res.data);
    } catch { showToast("Failed to load sets", "error"); }
  };

  const fetchSetQuestions = async (setId) => {
    const res = await api.get(`/mock/sets/${setId}/questions`);
    setSetQuestions(prev => ({ ...prev, [setId]: res.data }));
  };

  const saveSet = async (e) => {
    e.preventDefault();
    if (!setForm.title || !setForm.company)
      return showToast("Title and company are required", "error");
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
    } catch { showToast("Something went wrong", "error"); }
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
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditSetId(null); setSetForm(emptySetForm); };

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
    } catch { console.error("Source search failed"); }
  };

  const addQuestionToSet = async (setId, sourceId) => {
    try {
      await api.post(`/mock/sets/${setId}/questions`, {
        sourceTable: qForm.sourceTable, sourceQuestionId: sourceId,
      });
      showToast("Question added!");
      fetchSetQuestions(setId);
    } catch { showToast("Failed to add question", "error"); }
  };

  const removeQuestionFromSet = async (setId, refId) => {
    await api.delete(`/mock/set-questions/${refId}`);
    showToast("Question removed");
    fetchSetQuestions(setId);
  };

  const toggleExpand = (setId) => {
    if (expandedSet === setId) { setExpandedSet(null); }
    else { setExpandedSet(setId); fetchSetQuestions(setId); }
  };

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
            <h3 className="text-base font-bold text-white text-center">Delete Set?</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-5">
              This will delete the set and all its questions.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
                Cancel
              </button>
              <button onClick={() => deleteSet(deleteConfirm)}
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
          <h2 className="text-2xl font-black text-white tracking-tight">Mock Interview Sets</h2>
          <p className="text-xs text-slate-500 mt-1">{sets.length} sets available</p>
        </div>

        {/* ── FORM — collapsible, full width ── */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl overflow-hidden">

          <button onClick={() => setFormOpen(!formOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${editSetId ? "bg-amber-400" : "bg-indigo-400"}`} />
              <span className="text-sm font-bold text-slate-200">
                {editSetId ? `Editing Set #${editSetId}` : "Create New Set"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {editSetId && (
                <span onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 transition">
                  Cancel Edit ✕
                </span>
              )}
              {formOpen ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
            </div>
          </button>

          {formOpen && (
            <form onSubmit={saveSet} className="px-6 pb-6 border-t border-white/[0.05] space-y-4 pt-5">

              {/* Row 1: Title (full width) */}
              <div>
                <label className={labelCls}>Title *</label>
                <input value={setForm.title}
                  onChange={e => setSetForm({ ...setForm, title: e.target.value })}
                  placeholder="e.g. TCS NQT Full Prep Set"
                  className={inputCls} />
              </div>

              {/* Row 2: Company + Difficulty + Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Company *</label>
                  <select value={setForm.company}
                    onChange={e => setSetForm({ ...setForm, company: e.target.value })}
                    className={selectCls}>
                    <option value="" className="bg-[#0d0f28]">Select company</option>
                    {COMPANIES.map(c => <option key={c} className="bg-[#0d0f28]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select value={setForm.difficulty}
                    onChange={e => setSetForm({ ...setForm, difficulty: e.target.value })}
                    className={selectCls}>
                    <option value="" className="bg-[#0d0f28]">Select</option>
                    {["Easy","Medium","Hard"].map(d => <option key={d} className="bg-[#0d0f28]">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Duration</label>
                  <select value={setForm.durationMinutes}
                    onChange={e => setSetForm({ ...setForm, durationMinutes: parseInt(e.target.value) })}
                    className={selectCls}>
                    {DURATIONS.map(d => <option key={d} value={d} className="bg-[#0d0f28]">{d} minutes</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Target Role */}
              <div>
                <label className={labelCls}>Target Role</label>
                <select value={setForm.role}
                  onChange={e => setSetForm({ ...setForm, role: e.target.value })}
                  className={selectCls}>
                  <option value="" className="bg-[#0d0f28]">Select role</option>
                  {ROLES.map(r => <option key={r} className="bg-[#0d0f28]">{r}</option>)}
                </select>
              </div>

              <button type="submit"
                className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg ${
                  editSetId
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-500/20"
                }`}>
                {editSetId ? "✓ Update Set" : "+ Create Set"}
              </button>
            </form>
          )}
        </div>

        {/* ── SETS LIST ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">All Sets</h3>
            <p className="text-xs text-slate-500 mt-0.5">{sets.length} sets</p>
          </div>

          {sets.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0f28] border border-dashed border-white/[0.06] rounded-2xl">
              <Trophy size={32} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium text-sm">No sets yet</p>
              <p className="text-slate-600 text-xs mt-1">Create your first interview set above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sets.map(set => (
                <div key={set.id}
                  className={`bg-[#0d0f28] rounded-2xl border transition-all duration-200 overflow-hidden ${
                    editSetId === set.id
                      ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
                      : "border-white/[0.06] hover:border-white/[0.10]"
                  }`}>

                  {/* Set card header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Meta row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-xs font-bold text-indigo-400">{set.company}</span>
                          {set.role && (
                            <>
                              <span className="text-white/20">·</span>
                              <span className="text-[11px] text-slate-500">{set.role}</span>
                            </>
                          )}
                          <span className="text-white/20">·</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock size={10}/>{set.durationMinutes} min
                          </span>
                          {set.difficulty && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge[set.difficulty]}`}>
                              {set.difficulty}
                            </span>
                          )}
                          {editSetId === set.id && (
                            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                              Editing
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-200">{set.title}</h3>
                        {/* Question count */}
                        {setQuestions[set.id] && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {setQuestions[set.id].length} question{setQuestions[set.id].length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEditSet(set)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20 transition">
                          Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(set.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition">
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button onClick={() => toggleExpand(set.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-2.5 transition flex items-center gap-1">
                      {expandedSet === set.id
                        ? <><ChevronUp size={12}/>Hide questions</>
                        : <><ChevronDown size={12}/>Manage questions {setQuestions[set.id] ? `(${setQuestions[set.id].length})` : ""}</>}
                    </button>
                  </div>

                  {/* ── Expanded questions panel ── */}
                  {expandedSet === set.id && (
                    <div className="border-t border-white/[0.05] p-4 bg-white/[0.01] space-y-3">

                      {/* Existing questions list */}
                      {setQuestions[set.id]?.length > 0 && (
                        <div className="space-y-2">
                          {setQuestions[set.id].map((q, i) => (
                            <div key={q.refId}
                              className="flex items-start justify-between gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-slate-600 shrink-0 mt-0.5">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${qTypeBadge[q.questionType] || qTypeBadge.THEORY}`}>
                                      {q.questionType}
                                    </span>
                                    <span className="text-[9px] text-slate-600">{q.sourceTable}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-2">{q.questionText}</p>
                                </div>
                              </div>
                              <button onClick={() => removeQuestionFromSet(set.id, q.refId)}
                                className="text-xs text-rose-400 hover:text-rose-300 shrink-0 transition font-medium">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add question panel */}
                      {addingTo === set.id ? (
                        <div className="bg-white/[0.02] border border-indigo-500/20 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-bold text-slate-300">Add from Question Bank</h4>

                          {/* Source selector */}
                          <select value={qForm.sourceTable}
                            onChange={e => {
                              setQForm({ ...qForm, sourceTable: e.target.value });
                              setSourceList([]); setSourceSearch("");
                              searchSource(e.target.value, "");
                            }}
                            className={selectCls}>
                            <option value="" className="bg-[#0d0f28]">Select source module</option>
                            <option value="INTERVIEW_QUESTION" className="bg-[#0d0f28]">Interview Questions</option>
                            <option value="TECHNICAL_MCQ"      className="bg-[#0d0f28]">Technical MCQ</option>
                            <option value="APTITUDE"           className="bg-[#0d0f28]">Aptitude Questions</option>
                            <option value="CODING"             className="bg-[#0d0f28]">Coding Questions</option>
                          </select>

                          {/* Search */}
                          {qForm.sourceTable && (
                            <div className="relative">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                              <input type="text" placeholder="Search questions..."
                                value={sourceSearch}
                                onChange={e => { setSourceSearch(e.target.value); searchSource(qForm.sourceTable, e.target.value); }}
                                className={inputCls + " pl-9"} />
                            </div>
                          )}

                          {/* Results */}
                          {sourceList.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-white/[0.05] rounded-xl p-2">
                              {sourceList.slice(0, 10).map(q => (
                                <div key={q.id}
                                  className="flex items-center justify-between gap-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg hover:bg-white/[0.05] transition">
                                  <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${qTypeBadge[q.type] || qTypeBadge.THEORY}`}>
                                      {q.type}
                                    </span>
                                    <span className="text-xs text-slate-400 line-clamp-1">{q.text}</span>
                                  </div>
                                  <button onClick={() => addQuestionToSet(set.id, q.id)}
                                    className="text-xs font-bold text-indigo-400 hover:text-white shrink-0 transition px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 rounded-lg">
                                    + Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <button onClick={() => { setAddingTo(null); setSourceList([]); setQForm(emptyQForm); }}
                            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-400 transition">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingTo(set.id)}
                          className="w-full py-2.5 text-xs font-bold text-indigo-400 bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl hover:bg-indigo-500/10 transition">
                          + Add Question from Bank
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminMockSets;