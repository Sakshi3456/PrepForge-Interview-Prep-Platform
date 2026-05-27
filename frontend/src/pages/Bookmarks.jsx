import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const categoryIcons = {
  Java: "☕", React: "⚛️", Python: "🐍", DSA: "🌲",
  "System Design": "🏗️", DBMS: "🗄️", OS: "💻", "Spring Boot": "🍃",
};

const difficultyConfig = {
  Easy:   { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  Medium: { color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-400"   },
  Hard:   { color: "text-rose-600",    bg: "bg-rose-50",    dot: "bg-rose-400"    },
};

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const token  = localStorage.getItem("token");
      const [bookmarkRes, notesRes] = await Promise.all([
        api.get(`/bookmarks/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/notes"),
      ]);
      setBookmarks(bookmarkRes.data);
      setNotes(notesRes.data);
    } catch {
      console.error("Failed to fetch bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (noteId) => {
    try {
      const userId = localStorage.getItem("userId");
      const token  = localStorage.getItem("token");
      await api.post("/bookmarks", { userId, noteId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // refetch after toggle
      fetchAll();
    } catch {
      console.error("Remove failed");
    }
  };

  const bookmarkedNotes = bookmarks
    .map(b => notes.find(n => n.id === b.noteId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-600 px-8 pt-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⭐</span>
            <div>
              <p className="text-yellow-200 text-xs font-semibold tracking-widest uppercase">PrepForge</p>
              <h1 className="text-3xl font-black text-white">My Bookmarks</h1>
            </div>
          </div>
          <p className="text-yellow-200 text-sm mt-2">
            Notes you've saved for quick access and revision.
          </p>

          {/* Count badge */}
          <div className="mt-5">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white rounded-xl px-4 py-2">
              <span className="text-xl font-black">{bookmarkedNotes.length}</span>
              <span className="text-sm font-medium opacity-80">
                {bookmarkedNotes.length === 1 ? "Note saved" : "Notes saved"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 -mt-6 pb-16">

        {loading ? (
          // Skeleton
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
                <div className="h-5 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6 mt-2" />
              </div>
            ))}
          </div>

        ) : bookmarkedNotes.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
            <p className="text-5xl mb-4">⭐</p>
            <h3 className="text-lg font-bold text-slate-700">No bookmarks yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              While reading notes, click the ☆ button to save them here for quick revision.
            </p>
          </div>

        ) : (
          <div className="space-y-4">
            {bookmarkedNotes.map((note) => {
              const diff    = difficultyConfig[note.difficulty] || difficultyConfig.Easy;
              const isOpen  = expanded[note.id];
              return (
                <div key={note.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 ${
                    isOpen ? "border-amber-200 shadow-lg" : "border-slate-100 hover:shadow-md"
                  }`}>

                  {/* Difficulty top bar */}
                  <div className={`h-1 w-full rounded-t-2xl ${
                    note.difficulty === "Hard"   ? "bg-gradient-to-r from-rose-400 to-rose-600" :
                    note.difficulty === "Medium" ? "bg-gradient-to-r from-amber-400 to-orange-400" :
                                                   "bg-gradient-to-r from-emerald-400 to-teal-400"
                  }`} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl shrink-0 mt-0.5">
                          {categoryIcons[note.category] || "📄"}
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
                            {note.category}
                          </p>
                          <h2 className="text-base font-bold text-slate-800">{note.title}</h2>
                        </div>
                      </div>

                      {/* Remove bookmark */}
                      <button
                        onClick={() => removeBookmark(note.id)}
                        className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-500 hover:bg-rose-50 hover:text-rose-400 flex items-center justify-center transition shrink-0"
                        title="Remove bookmark"
                      >
                        ★
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3 pl-9">
                      {note.difficulty && (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                          {note.difficulty}
                        </span>
                      )}
                      {note.readTime && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                          ⏱ {note.readTime} min read
                        </span>
                      )}
                    </div>

                    {/* Content toggle */}
                    <button
                      onClick={() => setExpanded({ ...expanded, [note.id]: !isOpen })}
                      className="ml-9 text-xs font-semibold text-amber-500 hover:text-amber-700 transition"
                    >
                      {isOpen ? "Hide Content ↑" : "Read Content ↓"}
                    </button>

                    {isOpen && (
                      <div className="mt-3 ml-9 bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                      </div>
                    )}

                    {/* File links */}
                    {note.fileName && (
                      <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 pl-9">
                        <a href={`http://localhost:8080/api/notes/file/${note.fileName}`} target="_blank" rel="noreferrer">
                          <button className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
                            👁 View File
                          </button>
                        </a>
                        <a href={`http://localhost:8080/api/notes/file/download/${note.fileName}`} download>
                          <button className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition">
                            ⬇ Download
                          </button>
                        </a>
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
  );
}

export default Bookmarks;