import { useEffect, useState, useMemo } from "react";
import { Bookmark, Search, Trash2, LibraryBig, Filter, X, BookOpen } from "lucide-react";
import api from "../services/api";

const categoryBadge = {
  Java:          "text-orange-400 bg-orange-500/10 border-orange-500/20",
  React:         "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Python:        "text-blue-400 bg-blue-500/10 border-blue-500/20",
  DSA:           "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  DBMS:          "text-purple-400 bg-purple-500/10 border-purple-500/20",
  OS:            "text-slate-400 bg-slate-500/10 border-slate-500/20",
  "Spring Boot": "text-green-400 bg-green-500/10 border-green-500/20",
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />
);

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [notes,     setNotes]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("All");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const [bRes, nRes] = await Promise.all([
        api.get(`/bookmarks/${userId}`),
        api.get("/notes"),
      ]);
      setBookmarks(bRes.data);
      setNotes(nRes.data);
    } catch { console.error("Failed to fetch data"); }
    finally { setLoading(false); }
  };

  const removeBookmark = async (noteId) => {
    try {
      const userId = localStorage.getItem("userId");
      await api.post("/bookmarks", { userId, noteId });
      fetchAll();
    } catch { console.error("Delete failed"); }
  };

  const filteredNotes = useMemo(() => {
    const bookmarked = bookmarks.map(b => notes.find(n => n.id === b.noteId)).filter(Boolean);
    return bookmarked.filter(n =>
      (filter === "All" || n.category === filter) &&
      n.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [bookmarks, notes, search, filter]);

  // All categories from bookmarked notes
  const categories = ["All", ...new Set(
    bookmarks.map(b => notes.find(n => n.id === b.noteId)).filter(Boolean).map(n => n.category)
  )];

  const hasFilters = search || filter !== "All";

  return (
    <div className="space-y-6 pb-16 max-w-[1400px] mx-auto relative">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0f2b] via-[#161a46] to-[#261b55] p-8 shadow-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-indigo-400 mt-1 shrink-0">
              <Bookmark size={26} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Saved Notes</span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">My Bookmarks</h1>
              <p className="text-slate-400 text-sm mt-2 max-w-md font-medium leading-relaxed">
                Your saved notes — quickly revisit anything you've bookmarked.
              </p>
            </div>
          </div>
          <div className="border border-white/10 text-white bg-white/[0.04] rounded-xl px-6 py-3 text-center min-w-[110px] shrink-0">
            <p className="text-2xl font-black tracking-tight leading-none">{loading ? "—" : bookmarks.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">Saved</p>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0f28] border border-white/[0.06] rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-white/[0.03] border border-white/[0.07] text-slate-200 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full lg:w-48 shrink-0">
          <select
            className="w-full px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none pr-8"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-[#0d0f28]">Category: {cat}</option>
            ))}
          </select>
          <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-600">
          Showing <span className="font-bold text-slate-400">{filteredNotes.length}</span> of {bookmarks.length} bookmarks
        </p>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilter("All"); }}
            className="text-xs font-bold text-slate-600 hover:text-rose-400 transition-colors flex items-center gap-1">
            <X size={12}/> Clear filters
          </button>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0d0f28] rounded-2xl border border-white/[0.06] p-6 space-y-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl bg-[#0d0f28]">
            <LibraryBig size={32} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-400">
              {bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks found"}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {bookmarks.length === 0
                ? "Head to the Notes page and bookmark some notes to see them here."
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const catCls = categoryBadge[note.category] || "text-slate-400 bg-white/[0.04] border-white/[0.07]";
              return (
                <div key={note.id}
                  className="group bg-[#0d0f28] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-[#111438] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200">

                  <div className="mb-4">
                    {/* Top bar */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catCls}`}>
                          {note.category}
                        </span>
                        {note.difficulty && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            note.difficulty === "Easy"   ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                            note.difficulty === "Medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                                           "text-rose-400 bg-rose-500/10 border-rose-500/20"
                          }`}>
                            {note.difficulty}
                          </span>
                        )}
                      </div>
                      {note.readTime && (
                        <span className="text-[10px] text-slate-600 shrink-0">{note.readTime} min read</span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-bold text-slate-200 leading-snug group-hover:text-white transition-colors">
                      {note.title}
                    </h2>

                    {/* Content preview */}
                    {note.content && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{note.content}</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    {note.fileName ? (
                      <a
                        href={`http://localhost:8080/api/notes/file/${note.fileName}`}
                        target="_blank" rel="noreferrer"
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                        <BookOpen size={12}/>View Note
                      </a>
                    ) : <div />}
                    <button
                      onClick={() => removeBookmark(note.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all">
                      <Trash2 size={13}/>Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Bookmarks;