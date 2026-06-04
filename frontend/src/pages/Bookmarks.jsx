import { useEffect, useState, useMemo } from "react";
import { Bookmark, Search, Trash2, LibraryBig, Filter, X } from "lucide-react";
import api from "../services/api";

const categoryColors = {
  Java:   "bg-orange-50 text-orange-600 border-orange-200/60",
  React:  "bg-cyan-50 text-cyan-600 border-cyan-200/60",
  Python: "bg-blue-50 text-blue-600 border-blue-200/60",
  DSA:    "bg-emerald-50 text-emerald-600 border-emerald-200/60",
};

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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
    } catch { 
      console.error("Failed to fetch data"); 
    } finally { 
      setLoading(false); 
    }
  };

  const removeBookmark = async (noteId) => {
    try {
      const userId = localStorage.getItem("userId");
      await api.post("/bookmarks", { userId, noteId });
      fetchAll();
    } catch { 
      console.error("Delete failed"); 
    }
  };

  const filteredNotes = useMemo(() => {
    const bookmarked = bookmarks.map(b => notes.find(n => n.id === b.noteId)).filter(Boolean);
    return bookmarked.filter(n => 
      (filter === "All" || n.category === filter) &&
      (n.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [bookmarks, notes, search, filter]);

  return (
    <div className="space-y-8 pb-16 max-w-[1400px] mx-auto relative px-4 lg:px-0">
      
      {/* ── TOP SECTION: BRANDED CORE OVERLAY HERO ── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0f2b] via-[#161a46] to-[#261b55] p-8 shadow-md mt-6">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-indigo-400 mt-1 shadow-sm backdrop-blur-sm">
              <Bookmark size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                PrepForge Core Resource Vault
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">My Bookmarks</h1>
              <p className="text-slate-300 text-sm mt-2 max-w-md font-medium leading-relaxed">
                Access your curated collection of essential notes, frameworks, and algorithms.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap shrink-0">
            <div className="border border-white/10 text-white bg-white/[0.04] rounded-xl px-5 py-3 text-center min-w-[110px] shadow-sm backdrop-blur-sm">
              <p className="text-2xl font-black tracking-tight leading-none">{loading ? "—" : filteredNotes.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1.5">Saved Notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTRAL CONTROL DASHBOARD MANAGEMENT PANEL ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 lg:flex-none">
            <select 
              className="w-full lg:w-48 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none pr-8"
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
            >
              <option value="All">Category: All</option>
              {["Java", "React", "Python", "DSA"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* CONTEXT RUNTIME COUNT LOGS CARD */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-400">
          Viewing <span className="font-bold text-slate-700">{filteredNotes.length}</span> saved resources
        </p>
        {(search || filter !== "All") && (
          <button 
            onClick={() => { setSearch(""); setFilter("All"); }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors focus:outline-none flex items-center gap-1"
          >
            <X size={12} /> Clear Filters
          </button>
        )}
      </div>

      {/* ── CONTENT AREA ── */}
      <section className="space-y-4">
        {loading ? (
          [...Array(2)].map((_, i) => (
             <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-6 flex justify-between animate-pulse">
                <div className="space-y-3 w-1/2">
                   <div className="h-4 bg-slate-100 rounded w-1/4" />
                   <div className="h-6 bg-slate-100 rounded w-full" />
                </div>
                <div className="h-8 bg-slate-100 rounded w-24" />
             </div>
          ))
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-2xl bg-white p-8">
            <LibraryBig size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No bookmarks found</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Try adjusting your filters or head to the notes section to save some.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const catTheme = categoryColors[note.category] || "bg-slate-50 text-slate-600 border-slate-200/60";
              
              return (
                <div key={note.id} className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all duration-200 group">
                  <div className="mb-6">
                    <div className="flex gap-2 mb-3">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catTheme}`}>
                        {note.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                      {note.title}
                    </h2>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => removeBookmark(note.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={14} />
                      Remove
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