import { useEffect, useState } from "react";
import api from "../services/api";

const difficultyConfig = {
  Easy:   { color: "text-emerald-600", bg: "bg-emerald-50",   dot: "bg-emerald-400" },
  Medium: { color: "text-amber-600",   bg: "bg-amber-50",     dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-600",    bg: "bg-rose-50",      dot: "bg-rose-400"    },
};

const categoryIcons = {
  Java:          "☕",
  React:         "⚛️",
  Python:        "🐍",
  DSA:           "🌲",
  "System Design": "🏗️",
  DBMS:          "🗄️",
  OS:            "💻",
  "Spring Boot": "🍃",
};

function NoteCard({ note, onBookmark }) {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const diff = difficultyConfig[note.difficulty] || difficultyConfig.Easy;

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    await onBookmark(note.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${
        note.difficulty === "Hard"   ? "bg-gradient-to-r from-rose-400 to-rose-600" :
        note.difficulty === "Medium" ? "bg-gradient-to-r from-amber-400 to-orange-400" :
                                       "bg-gradient-to-r from-emerald-400 to-teal-400"
      }`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">
              {categoryIcons[note.category] || "📄"}
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                {note.category}
              </p>
              <h2 className="text-[15px] font-bold text-slate-800 leading-tight mt-0.5">
                {note.title}
              </h2>
            </div>
          </div>
          <button
            onClick={handleBookmark}
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              bookmarked
                ? "bg-yellow-100 text-yellow-500"
                : "bg-slate-50 text-slate-300 hover:bg-yellow-50 hover:text-yellow-400"
            }`}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {note.difficulty}
          </span>
          {note.readTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {note.readTime} min read
            </span>
          )}
        </div>

        {/* Content */}
        <p className={`text-sm text-slate-500 leading-relaxed flex-1 ${expanded ? "" : "line-clamp-3"}`}>
          {note.content}
        </p>

        {note.content && note.content.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-2 text-left transition"
          >
            {expanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}

        {/* File links */}
        {note.fileName && (
  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">

    <a
      href={`http://localhost:8080/api/notes/file/${note.fileName}`}
      target="_blank"
      rel="noreferrer"
    >
      <button className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
        👁 View
      </button>
    </a>

    <a
      href={`http://localhost:8080/api/notes/file/download/${note.fileName}`}
      download
    >
      <button className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
        ⬇ Download
      </button>
    </a>

  </div>
)}
      </div>
    </div>
  );
}

function Notes() {
  const [notes, setNotes]           = useState([]);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(notes.map((n) => n.category))];

  const filteredNotes = notes.filter((note) => {
    const matchSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    const matchCategory   = category === "All" || note.category === category;
    const matchDifficulty = difficulty === "All" || note.difficulty === difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const addBookmark = async (noteId) => {
    try {
      const userId = localStorage.getItem("userId");
      const token  = localStorage.getItem("token");
      const res = await api.post(
        "/bookmarks",
        { userId, noteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data);
    } catch {
      alert("Bookmark failed");
    }
  };

  const stats = {
    total:  notes.length,
    easy:   notes.filter(n => n.difficulty === "Easy").length,
    medium: notes.filter(n => n.difficulty === "Medium").length,
    hard:   notes.filter(n => n.difficulty === "Hard").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 px-8 pt-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📚</span>
            <div>
              <p className="text-indigo-300 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Study Notes</h1>
            </div>
          </div>
          <p className="text-indigo-300 text-sm mt-2 max-w-lg">
            Curated notes across languages, frameworks, and CS fundamentals.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mt-6 flex-wrap">
            {[
              { label: "Total Notes", value: stats.total,  color: "bg-white/10 text-white" },
              { label: "Easy",        value: stats.easy,   color: "bg-emerald-500/20 text-emerald-300" },
              { label: "Medium",      value: stats.medium, color: "bg-amber-500/20 text-amber-300" },
              { label: "Hard",        value: stats.hard,   color: "bg-rose-500/20 text-rose-300" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-4 py-2 text-center min-w-[80px]`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-[11px] font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filters — floats over hero */}
      <div className="max-w-6xl mx-auto px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or content..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-w-[140px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat, i) => <option key={i}>{cat}</option>)}
          </select>
          <select
            className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-w-[130px]"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {["All", "Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-8 mt-6 mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filteredNotes.length}</span> of {notes.length} notes
          {category !== "All" && <span className="ml-1">in <span className="font-semibold text-indigo-600">{category}</span></span>}
        </p>
        {(search || category !== "All" || difficulty !== "All") && (
          <button
            onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Notes Grid */}
      <div className="max-w-6xl mx-auto px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="h-1 w-full bg-slate-100 rounded mb-4" />
                <div className="flex gap-3 mb-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-2.5 bg-slate-100 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-2.5 bg-slate-100 rounded" />
                  <div className="h-2.5 bg-slate-100 rounded w-5/6" />
                  <div className="h-2.5 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-slate-700">No notes found</h3>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onBookmark={addBookmark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;