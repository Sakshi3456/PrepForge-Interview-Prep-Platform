import { useEffect, useState } from "react";
import { Search, X, CheckCircle2, ChevronDown, ChevronUp, Paperclip, UploadCloud } from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

const difficultyConfig = {
  Easy:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard:   "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const categoryIcons = {
  Java: "☕", React: "⚛️", Python: "🐍", DSA: "🌲",
  "System Design": "🏗️", DBMS: "🗄️", OS: "💻", "Spring Boot": "🍃",
};

const CATEGORIES   = ["All", "Java", "React", "Python", "DSA", "System Design", "DBMS", "OS", "Spring Boot"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition";
const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

function InputField({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        name={name} type={type} placeholder={placeholder}
        value={value} onChange={onChange}
        className={inputCls}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select name={name} value={value} onChange={onChange}
        className={inputCls + " appearance-none"}>
        {children}
      </select>
    </div>
  );
}

function AdminNotes() {
  const [notes, setNotes]           = useState([]);
  const [editId, setEditId]         = useState(null);
  const [activeTab, setActiveTab]   = useState("manual");
  const [toast, setToast]           = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [formOpen, setFormOpen]     = useState(true);

  const [form, setForm] = useState({
    title: "", category: "", difficulty: "", readTime: "", content: "",
  });

  const [file, setFile]         = useState(null);
  const [fileData, setFileData] = useState({
    title: "", category: "", difficulty: "", readTime: "",
  });

  useEffect(() => { fetchNotes(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotes = async () => {
    const res = await api.get("/notes");
    setNotes(res.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveNote = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/notes/${editId}`, form);
        showToast("Note updated successfully!");
      } else {
        await api.post("/notes", form);
        showToast("Note added successfully!");
      }
      setForm({ title: "", category: "", difficulty: "", readTime: "", content: "" });
      setEditId(null);
      fetchNotes();
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    setDeleteConfirm(null);
    showToast("Note deleted");
    fetchNotes();
  };

  const handleUpload = async () => {
    if (!file) return showToast("Please select a file first", "error");
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(fileData).forEach(([k, v]) => formData.append(k, v));
    const token = localStorage.getItem("token");
    try {
      await api.post("/notes/upload-file", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("File uploaded successfully!");
      setFile(null);
      setFileData({ title: "", category: "", difficulty: "", readTime: "" });
      fetchNotes();
    } catch {
      showToast("Upload failed", "error");
    }
  };

  const startEdit = (note) => {
    setForm({
      title: note.title, category: note.category,
      difficulty: note.difficulty, readTime: note.readTime, content: note.content,
    });
    setEditId(note.id);
    setActiveTab("manual");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ title: "", category: "", difficulty: "", readTime: "", content: "" });
  };

  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                         n.category.toLowerCase().includes(search.toLowerCase());
    const matchCat  = filterCat  === "All" || n.category   === filterCat;
    const matchDiff = filterDiff === "All" || n.difficulty === filterDiff;
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-[#0d0f28] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={20} className="text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Note?</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 rounded-xl hover:bg-white/[0.08] transition">
                Cancel
              </button>
              <button onClick={() => deleteNote(deleteConfirm)}
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
            <h2 className="text-2xl font-black text-white tracking-tight">Notes</h2>
            <p className="text-xs text-slate-500 mt-1">{notes.length} notes in the library</p>
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
                {editId ? `Editing Note #${editId}` : "Add New Note"}
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
            <div className="px-6 pb-6 border-t border-white/[0.05]">

              {/* Tabs */}
              <div className="flex gap-2 pt-5 mb-5">
                {[
                  { key: "manual", label: "✍️ Manual Entry" },
                  { key: "upload", label: "📎 Upload File" },
                ].map(tab => (
                  <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                      activeTab === tab.key
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Manual Form */}
              {activeTab === "manual" && (
                <form onSubmit={saveNote} className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InputField label="Title *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Java OOP Concepts" />
                    <InputField label="Category *" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Java, React, DSA" />
                    <SelectField label="Difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
                      <option value="" className="bg-[#0d0f28]">Select difficulty</option>
                      {["Easy", "Medium", "Hard"].map(d => <option key={d} className="bg-[#0d0f28]">{d}</option>)}
                    </SelectField>
                    <InputField label="Read Time (min)" name="readTime" type="number" value={form.readTime} onChange={handleChange} placeholder="5" />
                  </div>
                  <div>
                    <label className={labelCls}>Content</label>
                    <textarea name="content" placeholder="Write the note content here..." rows={4}
                      value={form.content} onChange={handleChange}
                      className={inputCls + " resize-none"} />
                  </div>
                  <button type="submit"
                    className={`px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg ${
                      editId
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20"
                        : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-indigo-500/20"
                    }`}>
                    {editId ? "✓ Update Note" : "+ Add Note"}
                  </button>
                </form>
              )}

              {/* Upload Form */}
              {activeTab === "upload" && (
                <div className="space-y-5">
                  <div
                    className="border-2 border-dashed border-white/[0.10] rounded-xl p-6 text-center hover:border-amber-500/40 transition cursor-pointer bg-white/[0.02]"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <input id="fileInput" type="file" accept=".csv,application/pdf"
                      className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    {file ? (
                      <div>
                        <Paperclip className="mx-auto mb-1 text-amber-400" size={22} />
                        <p className="text-sm font-semibold text-amber-300">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud className="mx-auto mb-2 text-slate-500" size={26} />
                        <p className="text-sm font-medium text-slate-400">Click to upload CSV or PDF</p>
                        <p className="text-xs text-slate-600 mt-1">Max 10MB</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InputField label="Title" value={fileData.title} onChange={e => setFileData({ ...fileData, title: e.target.value })} placeholder="Note title" />
                    <InputField label="Category" value={fileData.category} onChange={e => setFileData({ ...fileData, category: e.target.value })} placeholder="Category" />
                    <SelectField label="Difficulty" value={fileData.difficulty} onChange={e => setFileData({ ...fileData, difficulty: e.target.value })}>
                      <option value="" className="bg-[#0d0f28]">Select difficulty</option>
                      {["Easy", "Medium", "Hard"].map(d => <option key={d} className="bg-[#0d0f28]">{d}</option>)}
                    </SelectField>
                    <InputField label="Read Time" type="number" value={fileData.readTime} onChange={e => setFileData({ ...fileData, readTime: e.target.value })} placeholder="5" />
                  </div>
                  <button onClick={handleUpload} type="button"
                    className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 transition shadow-lg shadow-emerald-500/20">
                    ↑ Upload File
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── NOTES LIBRARY — full width ── */}
        <div className="space-y-4">

          {/* Header + search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-white">Notes Library</h3>
              <p className="text-xs text-slate-500 mt-0.5">{filteredNotes.length} of {notes.length} notes</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="text" placeholder="Search notes..."
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
                      :                     "bg-rose-500/20 border-rose-500/40 text-rose-300"
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

          {/* 2-per-row notes grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0f28] border border-dashed border-white/[0.06] rounded-2xl">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-slate-400 font-medium text-sm">No notes found</p>
              <p className="text-slate-600 text-xs mt-1">Try adjusting your filters or add a new note above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const diffCls = difficultyConfig[note.difficulty] || difficultyConfig.Easy;
                const isEditing = editId === note.id;
                return (
                  <div key={note.id}
                    className={`bg-[#0d0f28] rounded-2xl border transition-all duration-200 ${
                      isEditing
                        ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
                        : "border-white/[0.06] hover:border-white/[0.10]"
                    }`}>
                    <div className="p-4 space-y-2.5">

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl mt-0.5 shrink-0">{categoryIcons[note.category] || "📄"}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{note.category}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffCls}`}>
                                {note.difficulty}
                              </span>
                              {note.readTime && (
                                <span className="text-[10px] bg-white/[0.04] text-slate-500 border border-white/[0.07] px-2 py-0.5 rounded-full">
                                  {note.readTime} min
                                </span>
                              )}
                              {isEditing && (
                                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                                  Editing
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-200 leading-snug">{note.title}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEdit(note)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20 transition">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(note.id)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition">
                            Delete
                          </button>
                        </div>
                      </div>

                      {note.content && (
                        <p className="text-xs text-slate-500 leading-relaxed pl-9 line-clamp-2">
                          {note.content}
                        </p>
                      )}

                      {note.fileName && (
                        <div className="flex gap-3 pl-9">
                          <a href={`http://localhost:8080/api/notes/file/${note.fileName}`} target="_blank" rel="noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition">📄 View</a>
                          <a href={`http://localhost:8080/api/notes/file/download/${note.fileName}`}
                            className="text-xs text-slate-500 hover:text-slate-300 font-medium transition">⬇ Download</a>
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

export default AdminNotes;