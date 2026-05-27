import { useEffect, useState } from "react";
import api from "../services/api";

const difficultyConfig = {
  Easy:   { color: "text-emerald-600", dot: "bg-emerald-400" },
  Medium: { color: "text-amber-600",   dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-600",    dot: "bg-rose-400"    },
};

const categoryIcons = {
  Java: "☕", React: "⚛️", Python: "🐍", DSA: "🌲",
  "System Design": "🏗️", DBMS: "🗄️", OS: "💻", "Spring Boot": "🍃",
};

function InputField({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        name={name} type={type} placeholder={placeholder}
        value={value} onChange={onChange}
        className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-slate-300"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
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
  const [searchAdmin, setSearchAdmin] = useState("");

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ title: "", category: "", difficulty: "", readTime: "", content: "" });
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    n.category.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === "error" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-rose-600 text-xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center">Delete Note?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={() => deleteNote(deleteConfirm)}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/30">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase">Admin Panel</p>
              <h1 className="text-2xl font-black text-white">Manage Notes</h1>
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Total",  value: notes.length, color: "bg-white/10 text-white" },
              { label: "Easy",   value: notes.filter(n => n.difficulty === "Easy").length,   color: "bg-emerald-500/20 text-emerald-300" },
              { label: "Medium", value: notes.filter(n => n.difficulty === "Medium").length, color: "bg-amber-500/20 text-amber-300" },
              { label: "Hard",   value: notes.filter(n => n.difficulty === "Hard").length,   color: "bg-rose-500/20 text-rose-300" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-3 py-1.5 text-center hidden md:block`}>
                <p className="text-lg font-black">{s.value}</p>
                <p className="text-[10px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* LEFT: Form Panel */}
        <div className="xl:col-span-2 space-y-4">

          {editId && (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
                <span>✏️</span> Editing note #{editId}
              </div>
              <button onClick={cancelEdit} className="text-xs text-indigo-400 hover:text-indigo-700 transition">
                Cancel ✕
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { key: "manual", label: "✍️ Manual Entry" },
                { key: "upload", label: "📎 Upload File" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Manual Form */}
              {activeTab === "manual" && (
                <form onSubmit={saveNote} className="space-y-4">
                  <InputField label="Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Java OOP Concepts" />
                  <InputField label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Java, React, DSA" />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Difficulty" name="difficulty" value={form.difficulty} onChange={handleChange}>
                      <option value="">Select</option>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </SelectField>
                    <InputField label="Read Time (min)" name="readTime" type="number" value={form.readTime} onChange={handleChange} placeholder="5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</label>
                    <textarea name="content" placeholder="Write the note content here..." rows={5}
                      value={form.content} onChange={handleChange}
                      className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-slate-300 resize-none" />
                  </div>
                  <button type="submit"
                    className={`w-full py-3 rounded-xl text-sm font-bold text-white transition shadow-sm ${
                      editId
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                    }`}>
                    {editId ? "✓ Update Note" : "+ Add Note"}
                  </button>
                </form>
              )}

              {/* Upload Form */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 transition cursor-pointer bg-slate-50"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <input id="fileInput" type="file" accept=".csv,application/pdf"
                      className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    {file ? (
                      <div>
                        <p className="text-2xl mb-1">📎</p>
                        <p className="text-sm font-semibold text-indigo-600">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl mb-2">☁️</p>
                        <p className="text-sm font-medium text-slate-500">Click to upload CSV or PDF</p>
                        <p className="text-xs text-slate-400 mt-1">Max 10MB</p>
                      </div>
                    )}
                  </div>
                  <InputField label="Title" value={fileData.title} onChange={e => setFileData({ ...fileData, title: e.target.value })} placeholder="Note title" />
                  <InputField label="Category" value={fileData.category} onChange={e => setFileData({ ...fileData, category: e.target.value })} placeholder="Category" />
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField label="Difficulty" value={fileData.difficulty} onChange={e => setFileData({ ...fileData, difficulty: e.target.value })}>
                      <option value="">Select</option>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </SelectField>
                    <InputField label="Read Time" type="number" value={fileData.readTime} onChange={e => setFileData({ ...fileData, readTime: e.target.value })} placeholder="5" />
                  </div>
                  <button onClick={handleUpload}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition shadow-sm">
                    ↑ Upload File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Notes List */}
        <div className="xl:col-span-3 space-y-4">

          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search notes by title or category..."
              value={searchAdmin} onChange={e => setSearchAdmin(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition shadow-sm" />
          </div>

          <p className="text-xs text-slate-400 font-medium">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
            {searchAdmin && ` matching "${searchAdmin}"`}
          </p>

          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-500 font-medium">No notes found</p>
                <p className="text-slate-400 text-sm mt-1">Add your first note using the form</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const diff = difficultyConfig[note.difficulty] || difficultyConfig.Easy;
                const isEditing = editId === note.id;
                return (
                  <div key={note.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 ${
                      isEditing
                        ? "border-indigo-400 shadow-lg shadow-indigo-100"
                        : "border-slate-100 hover:border-slate-200 hover:shadow-md"
                    }`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl mt-0.5 shrink-0">{categoryIcons[note.category] || "📄"}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-800 truncate">{note.title}</h3>
                              {isEditing && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">Editing</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[11px] text-slate-400 font-medium">{note.category}</span>
                              <span className="text-slate-200">•</span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${diff.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />{note.difficulty}
                              </span>
                              {note.readTime && (
                                <><span className="text-slate-200">•</span>
                                <span className="text-[11px] text-slate-400">{note.readTime} min</span></>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEdit(note)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(note.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition border border-rose-100">
                            Delete
                          </button>
                        </div>
                      </div>

                      {note.content && (
                        <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed pl-9">
                          {note.content}
                        </p>
                      )}

                      {note.fileName && (
                        <div className="flex gap-3 mt-2.5 pl-9">
                          <a href={`http://localhost:8080/api/notes/file/${note.fileName}`} target="_blank"
                            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition">📄 View</a>
                          <a href={`http://localhost:8080/api/notes/file/download/${note.fileName}`}
                            className="text-xs text-slate-400 hover:text-slate-700 font-medium transition">⬇ Download</a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNotes;