import { useEffect, useState } from "react";
import { Search, X, CheckCircle2, ChevronDown, ChevronUp, Code2 } from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

// ── Constants ─────────────────────────────────────────────────────────────────
const DIFFICULTIES = ["All", "Basic", "Intermediate", "Hard"];
const TOPICS       = ["All","Arrays","Strings","Loops","Linked List","Trees","Recursion","DP","Graphs","Backtracking"];
const LANGUAGES    = ["Java", "Python", "C++"];

const diffBadge = {
  Basic:        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard:         "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

// ── Shared input styles — dark theme matching AdminAptitude ───────────────────
const inputCls  = "w-full px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition";
const labelCls  = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
const selectCls = inputCls + " appearance-none";

const emptyForm = {
  title: "", topic: "", difficulty: "", language: "Java",
  problemStatement: "", inputOutput: "", hint: "",
  approach: "", timeComplexity: "", spaceComplexity: "", companyTags: "",
  // Multi-language solution fields
  solutionJava: "", solutionPython: "", solutionCpp: "",
};

// ── Field components ──────────────────────────────────────────────────────────
const Field = ({ label, name, placeholder, value, onChange }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <input name={name} placeholder={placeholder} value={value} onChange={onChange} className={inputCls} />
  </div>
);

const TextArea = ({ label, name, placeholder, rows = 3, value, onChange, mono = false }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <textarea name={name} placeholder={placeholder} rows={rows} value={value} onChange={onChange}
      className={`${inputCls} resize-none ${mono ? "font-mono text-xs" : ""}`} />
  </div>
);

const Select = ({ label, name, options, value, onChange }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <select name={name} value={value} onChange={onChange} className={selectCls}>
      <option value="" className="bg-[#0d0f28]">Select</option>
      {options.map(o => <option key={o} value={o} className="bg-[#0d0f28]">{o}</option>)}
    </select>
  </div>
);

// ── Code tab component ────────────────────────────────────────────────────────
const CodeTabs = ({ form, onChange }) => {
  const [activeTab, setActiveTab] = useState("Java");
  const fieldMap = { Java: "solutionJava", Python: "solutionPython", "C++": "solutionCpp" };
  const placeholders = {
    Java:   "// Java solution\npublic int[] twoSum(int[] nums, int target) {\n    // ...\n}",
    Python: "# Python solution\ndef two_sum(nums, target):\n    # ...",
    "C++":  "// C++ solution\nvector<int> twoSum(vector<int>& nums, int target) {\n    // ...\n}",
  };

  return (
    <div>
      <label className={labelCls}>Solution Code</label>
      {/* Language tabs */}
      <div className="flex gap-1 mb-2">
        {LANGUAGES.map(lang => (
          <button key={lang} type="button" onClick={() => setActiveTab(lang)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              activeTab === lang
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
            }`}>
            {lang}
          </button>
        ))}
        {/* Completeness indicators */}
        <div className="flex items-center gap-2 ml-3">
          {LANGUAGES.map(lang => {
            const hasCode = form[fieldMap[lang]]?.trim().length > 0;
            return (
              <div key={lang} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${hasCode ? "bg-emerald-400" : "bg-white/10"}`} />
                <span className="text-[10px] text-slate-600">{lang}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Code editor */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] border-b border-white/[0.05] rounded-t-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          <span className="text-[10px] text-slate-600 ml-2 font-mono">solution.{activeTab === "C++" ? "cpp" : activeTab === "Python" ? "py" : "java"}</span>
        </div>
        <textarea
          name={fieldMap[activeTab]}
          value={form[fieldMap[activeTab]]}
          onChange={onChange}
          placeholder={placeholders[activeTab]}
          rows={8}
          className="w-full pt-10 px-4 pb-4 text-xs font-mono bg-[#060810] border border-white/[0.07] text-indigo-300 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition resize-none leading-relaxed"
        />
      </div>
      <p className="text-[10px] text-slate-600 mt-1.5">
        Add solutions in any or all languages. Green dot = code added.
      </p>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
function AdminCoding() {
  const [questions,     setQuestions]     = useState([]);
  const [form,          setForm]          = useState(emptyForm);
  const [editId,        setEditId]        = useState(null);
  const [toast,         setToast]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search,        setSearch]        = useState("");
  const [expandedId,    setExpandedId]    = useState(null);
  const [filterDiff,    setFilterDiff]    = useState("All");
  const [filterTopic,   setFilterTopic]   = useState("All");
  const [formOpen,      setFormOpen]      = useState(true);
  const [activeSolTab,  setActiveSolTab]  = useState("Java");

  useEffect(() => { fetchQuestions(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/coding");
      setQuestions(res.data);
    } catch { showToast("Failed to load problems", "error"); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (!form.title || !form.problemStatement || !form.difficulty)
      return showToast("Title, difficulty and problem statement are required", "error");
    try {
      if (editId) {
        await api.put(`/coding/${editId}`, form);
        showToast("Problem updated!");
      } else {
        await api.post("/coding", form);
        showToast("Problem added!");
      }
      setForm(emptyForm); setEditId(null); fetchQuestions();
    } catch { showToast("Something went wrong", "error"); }
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
      language:         q.language         || "Java",
      problemStatement: q.problemStatement || "",
      inputOutput:      q.inputOutput      || "",
      hint:             q.hint             || "",
      approach:         q.approach         || "",
      timeComplexity:   q.timeComplexity   || "",
      spaceComplexity:  q.spaceComplexity  || "",
      companyTags:      q.companyTags      || "",
      solutionJava:     q.solutionJava     || "",
      solutionPython:   q.solutionPython   || "",
      solutionCpp:      q.solutionCpp      || "",
    });
    setEditId(q.id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const filtered = questions.filter(q => {
    const matchSearch = q.title?.toLowerCase().includes(search.toLowerCase()) ||
                        q.topic?.toLowerCase().includes(search.toLowerCase());
    const matchDiff   = filterDiff  === "All" || q.difficulty === filterDiff;
    const matchTopic  = filterTopic === "All" || q.topic      === filterTopic;
    return matchSearch && matchDiff && matchTopic;
  });

  // Which languages does a question have solutions for?
  const getSolLanguages = (q) => LANGUAGES.filter(l => {
    const key = `solution${l === "C++" ? "Cpp" : l}`;
    return q[key]?.trim().length > 0;
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
            <h3 className="text-base font-bold text-white text-center">Delete Problem?</h3>
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
          <h2 className="text-2xl font-black text-white tracking-tight">Coding Questions</h2>
          <p className="text-xs text-slate-500 mt-1">{questions.length} problems in the bank</p>
        </div>

        {/* ── FORM — collapsible, full width (matching AdminAptitude pattern) ── */}
        <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl overflow-hidden">

          {/* Form header toggle */}
          <button onClick={() => setFormOpen(!formOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${editId ? "bg-amber-400" : "bg-indigo-400"}`} />
              <span className="text-sm font-bold text-slate-200">
                {editId ? `Editing Problem #${editId}` : "Add New Problem"}
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
            <form onSubmit={saveQuestion} className="px-6 pb-6 border-t border-white/[0.05] space-y-5 pt-5">

              {/* Row 1: Title + Difficulty + Language + Topic */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Field label="Title *" name="title" placeholder="e.g. Two Sum"
                    value={form.title} onChange={handleChange} />
                </div>
                <Select label="Difficulty *" name="difficulty"
                  options={["Basic","Intermediate","Hard"]}
                  value={form.difficulty} onChange={handleChange} />
                <Select label="Topic" name="topic"
                  options={["Arrays","Strings","Loops","Linked List","Trees","Recursion","DP","Graphs","Backtracking"]}
                  value={form.topic} onChange={handleChange} />
              </div>

              {/* Row 2: Problem statement */}
              <TextArea label="Problem Statement *" name="problemStatement"
                placeholder="Describe the problem clearly..." rows={4}
                value={form.problemStatement} onChange={handleChange} />

              {/* Row 3: Input/Output + Hint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextArea label="Input / Output Example" name="inputOutput"
                  placeholder={"Input: [2,7,11,15], target=9\nOutput: [0,1]"} rows={3} mono
                  value={form.inputOutput} onChange={handleChange} />
                <TextArea label="Hint (optional)" name="hint"
                  placeholder="Give a small nudge without revealing the answer..." rows={3}
                  value={form.hint} onChange={handleChange} />
              </div>

              {/* Row 4: Approach */}
              <TextArea label="Approach (step by step)" name="approach"
                placeholder={"1. Start with...\n2. Then...\n3. Finally..."} rows={4}
                value={form.approach} onChange={handleChange} />

              {/* Row 5: Multi-language code editor */}
              <CodeTabs form={form} onChange={handleChange} />

              {/* Row 6: Complexity + Company tags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Time Complexity" name="timeComplexity" placeholder="O(n)"
                  value={form.timeComplexity} onChange={handleChange} />
                <Field label="Space Complexity" name="spaceComplexity" placeholder="O(1)"
                  value={form.spaceComplexity} onChange={handleChange} />
                <div className="md:col-span-2">
                  <Field label="Company Tags (comma separated)" name="companyTags" placeholder="TCS, Amazon, Wipro"
                    value={form.companyTags} onChange={handleChange} />
                </div>
              </div>

              {/* Submit */}
              <button type="submit"
                className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg ${
                  editId
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-500/20"
                }`}>
                {editId ? "✓ Update Problem" : "+ Add Problem"}
              </button>
            </form>
          )}
        </div>

        {/* ── QUESTION BANK ── */}
        <div className="space-y-4">

          {/* Bank header + search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-white">Problem Bank</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} of {questions.length} problems</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="text" placeholder="Search problems..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0d0f28] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition" />
            </div>
          </div>

          {/* Difficulty pills */}
          <div className="flex gap-1.5 flex-wrap">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setFilterDiff(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterDiff === d
                    ? d === "All"          ? "bg-slate-500/20 border-slate-500/40 text-slate-300"
                      : d === "Basic"        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : d === "Intermediate" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      :                       "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                }`}>
                {d}
              </button>
            ))}
          </div>

          {/* Topic pills */}
          <div className="flex gap-1.5 flex-wrap">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setFilterTopic(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterTopic === t
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                }`}>
                {t}
              </button>
            ))}
            {(filterDiff !== "All" || filterTopic !== "All" || search) && (
              <button onClick={() => { setFilterDiff("All"); setFilterTopic("All"); setSearch(""); }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-white/[0.07] text-slate-600 hover:text-rose-400 transition ml-1">
                ✕ Clear
              </button>
            )}
          </div>

          {/* Problem grid — 2 per row matching AdminAptitude */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0f28] border border-dashed border-white/[0.06] rounded-2xl">
              <Code2 size={32} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-medium text-sm">No problems found</p>
              <p className="text-slate-600 text-xs mt-1">Try adjusting filters or add a new problem above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map(q => {
                const solLangs = getSolLanguages(q);
                return (
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
                            {q.difficulty && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge[q.difficulty]}`}>
                                {q.difficulty}
                              </span>
                            )}
                            {q.topic && (
                              <span className="text-[10px] font-bold text-slate-500 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full">
                                {q.topic}
                              </span>
                            )}
                            {/* Language solution indicators */}
                            {solLangs.length > 0 && (
                              <div className="flex items-center gap-1">
                                {solLangs.map(lang => (
                                  <span key={lang} className="text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            )}
                            {editId === q.id && (
                              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                                Editing
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-200 leading-snug line-clamp-2">{q.title}</p>
                          {/* Company tags */}
                          {q.companyTags && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {q.companyTags.split(",").map(tag => (
                                <span key={tag} className="text-[9px] font-bold bg-white/[0.03] border border-white/[0.06] text-slate-500 px-2 py-0.5 rounded-full">
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

                      {/* Complexity badges */}
                      {(q.timeComplexity || q.spaceComplexity) && (
                        <div className="flex gap-2">
                          {q.timeComplexity && (
                            <span className="text-[10px] font-mono bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-lg">
                              T: {q.timeComplexity}
                            </span>
                          )}
                          {q.spaceComplexity && (
                            <span className="text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-lg">
                              S: {q.spaceComplexity}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Preview toggle */}
                      <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1">
                        {expandedId === q.id
                          ? <><ChevronUp size={12}/>Hide preview</>
                          : <><ChevronDown size={12}/>Preview</>}
                      </button>

                      {/* Expanded preview */}
                      {expandedId === q.id && (
                        <div className="space-y-3 pt-1">

                          {/* Problem statement */}
                          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Problem</p>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{q.problemStatement}</p>
                          </div>

                          {/* Input/Output */}
                          {q.inputOutput && (
                            <div className="bg-[#060810] border border-white/[0.05] rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Example</p>
                              <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed">{q.inputOutput}</pre>
                            </div>
                          )}

                          {/* Solution tabs — shown only if any solution exists */}
                          {getSolLanguages(q).length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Solutions</p>
                              <div className="flex gap-1 mb-2">
                                {getSolLanguages(q).map(lang => (
                                  <button key={lang} type="button" onClick={() => setActiveSolTab(lang)}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-all ${
                                      activeSolTab === lang
                                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                        : "bg-white/[0.03] border-white/[0.07] text-slate-500"
                                    }`}>
                                    {lang}
                                  </button>
                                ))}
                              </div>
                              {getSolLanguages(q).map(lang => {
                                const key = `solution${lang === "C++" ? "Cpp" : lang}`;
                                if (lang !== activeSolTab) return null;
                                return (
                                  <div key={lang} className="bg-[#060810] border border-white/[0.05] rounded-xl p-3 max-h-40 overflow-y-auto">
                                    <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed whitespace-pre">{q[key]}</pre>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCoding;