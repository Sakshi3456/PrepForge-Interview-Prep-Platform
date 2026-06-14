import { useEffect, useState } from "react";
import {
  BookOpen, Search, Filter, BookMarked, Eye, Download,
  Clock, Sparkles, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import api from "../services/api";

const difficultyConfig = {
  Easy:   { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  Medium: { badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",       dot: "bg-amber-400"   },
  Hard:   { badge: "text-rose-400 bg-rose-500/10 border-rose-500/20",           dot: "bg-rose-400"    },
};

const categoryIcons = {
  Java:            <BookOpen size={16} />,
  React:           <Sparkles size={16} />,
  Python:          <BookOpen size={16} />,
  DSA:             <Sparkles size={16} />,
  "System Design": <Sparkles size={16} />,
  DBMS:            <BookOpen size={16} />,
  OS:              <BookOpen size={16} />,
  "Spring Boot":   <Sparkles size={16} />,
};

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onBookmark }) {
  const [expanded,   setExpanded]   = useState(false);
  const [bookmarked, setBookmarked] = useState(note.isBookmarked || false);
  const [bookmarking,setBookmarking]= useState(false);
  const diff = difficultyConfig[note.difficulty] || difficultyConfig.Easy;

  const handleBookmarkToggle = async () => {
    if (bookmarking) return;
    setBookmarking(true);
    const prev = bookmarked;
    setBookmarked(!prev);
    const ok = await onBookmark(note.id, !prev);
    if (!ok) setBookmarked(prev);
    setBookmarking(false);
  };

  return (
    <div className="group relative bg-[#0d0f28] rounded-2xl border border-white/[0.06] hover:border-indigo-500/30 hover:bg-[#111438] transition-all duration-300 flex flex-col overflow-hidden min-w-0">

      {/* Difficulty top bar */}
      <div className={`h-1 w-full ${
        note.difficulty === "Hard"   ? "bg-gradient-to-r from-rose-500 to-pink-500" :
        note.difficulty === "Medium" ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                       "bg-gradient-to-r from-emerald-500 to-teal-500"
      }`} />

      <div className="p-5 flex flex-col flex-1 space-y-4">

        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-indigo-400 shrink-0">
              {categoryIcons[note.category] || <BookOpen size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{note.category}</p>
              <h3 className="text-sm font-bold text-slate-200 tracking-tight line-clamp-2 break-words mt-0.5" title={note.title}>
                {note.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleBookmarkToggle}
            disabled={bookmarking}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 ${
              bookmarked
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-white/[0.04] border-white/[0.08] text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
            }`}
          >
            <BookMarked size={14} className={bookmarking ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 border rounded-md ${diff.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {note.difficulty}
          </span>
          {note.readTime && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-md">
              <Clock size={12} className="text-slate-600" />
              {note.readTime} min read
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className={`text-xs font-medium text-slate-500 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {note.content}
          </p>
          {note.content && note.content.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
            >
              {expanded
                ? <><span>Show Less</span><ChevronUp size={12} /></>
                : <><span>Read More</span><ChevronDown size={12} /></>}
            </button>
          )}
        </div>

        {/* Action buttons */}
        {note.fileName && (
          <div className="flex gap-2.5 pt-4 border-t border-white/[0.05]">
            <a href={`http://localhost:8080/api/notes/file/${note.fileName}`} target="_blank" rel="noreferrer" className="flex-1">
              <button className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors">
                <Eye size={13} />View
              </button>
            </a>
            <a href={`http://localhost:8080/api/notes/file/download/${note.fileName}`} download className="flex-1">
              <button className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 border border-white/[0.08] transition-colors">
                <Download size={13} />Download
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function Notes() {
  const [notes,      setNotes]      = useState([]);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);

  useEffect(() => { fetchNotes(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (noteId, nextState) => {
    try {
      const userId = localStorage.getItem("userId");
      const token  = localStorage.getItem("token");
      const res = await api.post(
        "/bookmarks",
        { userId, noteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(res.data || "Bookmark saved.");
      return true;
    } catch (err) {
      console.error("Bookmark failed", err);
      showToast("Couldn't save bookmark. Try again.");
      return false;
    }
  };

  const categories     = ["All", ...new Set(notes.map((n) => n.category))];
  const filteredNotes  = notes.filter((note) => {
    const matchSearch     = note.title.toLowerCase().includes(search.toLowerCase()) ||
                            note.content.toLowerCase().includes(search.toLowerCase());
    const matchCategory   = category   === "All" || note.category   === category;
    const matchDifficulty = difficulty === "All" || note.difficulty  === difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const stats = {
    total:  notes.length,
    easy:   notes.filter(n => n.difficulty === "Easy").length,
    medium: notes.filter(n => n.difficulty === "Medium").length,
    hard:   notes.filter(n => n.difficulty === "Hard").length,
  };

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
  );

  return (
    <div className="space-y-6 pb-16 relative min-w-0 overflow-x-hidden w-full">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0d0f28] border border-white/[0.08] text-slate-200 text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2">
          <AlertCircle size={14} className="text-indigo-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#121635] via-[#1b1e4b] to-[#2b1f5d] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Study Material</span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Notes</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-md font-medium leading-relaxed">
              Curated notes on Java, React, DBMS, OS, DSA and more — all in one place.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Total",  value: stats.total,  cls: "border-white/10  text-white bg-white/[0.04]"         },
              { label: "Easy",   value: stats.easy,   cls: "border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.06]" },
              { label: "Medium", value: stats.medium, cls: "border-amber-500/20 text-amber-400 bg-amber-500/[0.06]"       },
              { label: "Hard",   value: stats.hard,   cls: "border-rose-500/20 text-rose-400 bg-rose-500/[0.06]"          },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[80px] ${s.cls}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none pr-8 min-w-[140px]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat, i) => <option key={i} value={cat}>Category: {cat}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none pr-8 min-w-[140px]"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {["All", "Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-600">
          Showing <span className="font-bold text-slate-400">{filteredNotes.length}</span> of {notes.length} notes
          {category !== "All" && <span className="ml-1">in <span className="font-bold text-indigo-400">{category}</span></span>}
        </p>
        {(search || category !== "All" || difficulty !== "All") && (
          <button
            onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }}
            className="text-xs font-bold text-slate-600 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] p-6 space-y-4">
                <Skeleton className="h-1 w-full rounded-none" />
                <div className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="h-2.5 w-11/12" />
                  <Skeleton className="h-2.5 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl bg-[#0d0f28]">
            <Search size={32} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-400">No notes found</h3>
            <p className="text-xs text-slate-600 font-medium mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onBookmark={handleBookmark} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notes;