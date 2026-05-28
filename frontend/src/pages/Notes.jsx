import { useEffect, useState } from "react";
import { 
  BookOpen, Search, Filter, BookMarked, Eye, Download, 
  Clock, Sparkles, ChevronDown, ChevronUp, AlertCircle 
} from "lucide-react";
import api from "../services/api";

const difficultyConfig = {
  Easy:   { color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  Medium: { color: "text-amber-600 bg-amber-50 border-amber-100",   dot: "bg-amber-500" },
  Hard:   { color: "text-rose-600 bg-rose-50 border-rose-100",       dot: "bg-rose-500" },
};

// Hardened vector mapping system replacing multi-device native emojis
const categoryIcons = {
  Java:   <BookOpen size={16} />,
  React:  <Sparkles size={16} />,
  Python: <BookOpen size={16} />,
  DSA:    <Sparkles size={16} />,
  "System Design": <Sparkles size={16} />,
  DBMS:   <BookOpen size={16} />,
  OS:     <BookOpen size={16} />,
  "Spring Boot":  <Sparkles size={16} />,
};

function NoteCard({ note, onBookmark }) {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(note.isBookmarked || false);
  const [bookmarking, setBookmarking] = useState(false);
  const diff = difficultyConfig[note.difficulty] || difficultyConfig.Easy;

  const handleBookmarkToggle = async () => {
    if (bookmarking) return; // Prevent user duplicate double-click request spam
    setBookmarking(true);
    
    // Optimistic UI state adjustment pattern
    const previousState = bookmarked;
    setBookmarked(!previousState);

    const success = await onBookmark(note.id, !previousState);
    if (!success) {
      // Revert state change safely if remote request runtime breaks down
      setBookmarked(previousState);
    }
    setBookmarking(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 hover:border-indigo-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Precision Structural Color Gradient Top Bar Accent Rule */}
      <div className={`h-1.5 w-full ${
        note.difficulty === "Hard"   ? "bg-gradient-to-r from-rose-500 to-pink-500" :
        note.difficulty === "Medium" ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                       "bg-gradient-to-r from-emerald-500 to-teal-500"
      }`} />

      <div className="p-6 flex flex-col flex-1 space-y-4">
        
        {/* UPPER SUMMARY REGION */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              {categoryIcons[note.category] || <BookOpen size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                {note.category}
              </p>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight truncate mt-0.5" title={note.title}>
                {note.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleBookmarkToggle}
            disabled={bookmarking}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 ${
              bookmarked
                ? "bg-amber-50 border-amber-200 text-amber-500 shadow-sm"
                : "bg-slate-50 border-slate-200/60 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50 hover:border-amber-200"
            }`}
          >
            <BookMarked size={14} className={bookmarking ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* METADATA TAG INDICATORS BAR */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 border rounded-md ${diff.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {note.difficulty}
          </span>
          {note.readTime && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/40 px-2.5 py-1 rounded-md">
              <Clock size={12} className="text-slate-400" />
              {note.readTime} Min Read
            </span>
          )}
        </div>

        {/* TEXT EXCLUSION DESCRIPTION WINDOW */}
        <div className="flex-1">
          <p className={`text-xs font-medium text-slate-500 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
            {note.content}
          </p>
          {note.content && note.content.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 mt-2 transition-colors focus:outline-none"
            >
              {expanded ? (
                <><span>Show Less</span><ChevronUp size={12} /></>
              ) : (
                <><span>Read Content</span><ChevronDown size={12} /></>
              )}
            </button>
          )}
        </div>

        {/* EXTERNAL CORE RESOURCE ASSET FILE ACTION LINK BUTTONS */}
        {note.fileName && (
          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <a
              href={`http://localhost:8080/api/notes/file/${note.fileName}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <button className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-600 transition-colors">
                <Eye size={13} />
                <span>View</span>
              </button>
            </a>

            <a
              href={`http://localhost:8080/api/notes/file/download/${note.fileName}`}
              download
              className="flex-1"
            >
              <button className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40 transition-colors">
                <Download size={13} />
                <span>Download</span>
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const triggerToastFeedback = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000); // Clear text after 3 seconds frame lifecycle
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Critical error parsing resources downstream", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(notes.map((n) => n.category))];

  const filteredNotes = notes.filter((note) => {
    const matchSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || note.category === category;
    const matchDifficulty = difficulty === "All" || note.difficulty === difficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const handleBookmarkActionCommit = async (noteId, nextState) => {
    try {
      const userId = localStorage.getItem("userId");
      const token  = localStorage.getItem("token");
      
      const res = await api.post(
        "/bookmarks",
        { userId, noteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      triggerToastFeedback(res.data || "Action registered successfully.");
      return true; // Commit operation verified
    } catch (err) {
      console.error("Bookmark execution channel fault", err);
      triggerToastFeedback("System connection error. Unable to save bookmark.");
      return false; // Error detected: trigger fallback recovery hook
    }
  };

  const stats = {
    total:  notes.length,
    easy:   notes.filter(n => n.difficulty === "Easy").length,
    medium: notes.filter(n => n.difficulty === "Medium").length,
    hard:   notes.filter(n => n.difficulty === "Hard").length,
  };

  return (
    <div className="space-y-8 pb-16 relative">
      
      {/* TOAST SYSTEM MESSAGING BANNER ELEMENT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl z-50 flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <AlertCircle size={14} className="text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER JUMBOTRON GRADIENT BANNER ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#121635] via-[#1b1e4b] to-[#2b1f5d] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
              PrepForge Central Archive
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1">Study Notes</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
              Access comprehensive reference definitions, architectural models, language foundations, and deployment guidelines.
            </p>
          </div>

          {/* BALANCED STRUCTURAL DATA BADGES ROW */}
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: "Total Files", value: stats.total, border: "border-white/10 text-white bg-white/[0.04]" },
              { label: "Easy Track",  value: stats.easy,  border: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" },
              { label: "Medium Core", value: stats.medium, border: "border-amber-500/20 text-amber-400 bg-amber-500/5" },
              { label: "Hard Domain", value: stats.hard,   border: "border-rose-500/20 text-rose-400 bg-rose-500/5" },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl px-4 py-2.5 text-center min-w-[90px] shadow-sm backdrop-blur-sm ${s.border}`}>
                <p className="text-lg font-black tracking-tight leading-none">{loading ? "—" : s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE CONTROLS CONSOLE FLOATING BAR ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter archive index by keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[140px]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat, i) => <option key={i} value={cat}>Category: {cat}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8 min-w-[140px]"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {["All", "Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>Complexity: {d}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* RESULT FOOTER RUNTIME CONTEXT META */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-400">
          Showing <span className="font-bold text-slate-700">{filteredNotes.length}</span> of {notes.length} logs
          {category !== "All" && <span className="ml-1">filtered inside <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{category}</span></span>}
        </p>
        {(search || category !== "All" || difficulty !== "All") && (
          <button
            onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 focus:outline-none"
          >
            ✕ Clear Global Filters
          </button>
        )}
      </div>

      {/* ── RENDER MATRIX GRID WINDOW ── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4 animate-pulse">
                <div className="h-1 w-1/4 bg-slate-100 rounded" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-2.5 bg-slate-100 rounded" />
                  <div className="h-2.5 bg-slate-100 rounded w-11/12" />
                  <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white p-8">
            <Search size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No matching indexes detected</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Refine your active filtering matrices above or reset strings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onBookmark={handleBookmarkActionCommit} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default Notes;