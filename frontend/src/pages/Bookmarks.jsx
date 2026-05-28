import { useEffect, useState, useMemo } from "react";
import api from "../services/api";

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
      (n.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [bookmarks, notes, search, filter]);

  return (
    <div className="min-h-screen bg-[#06060c] text-slate-200">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#1e1e3f] to-[#111128] border-b border-slate-800 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">PREPFORGE CORE RESOURCE VAULT</p>
          <h1 className="text-3xl font-black text-white">My Bookmarks</h1>
          
          <div className="flex gap-4 mt-8">
            <div className="bg-[#1a1a33] border border-slate-700 rounded-xl px-6 py-4">
              <p className="text-2xl font-black text-white">{filteredNotes.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SAVED NOTES</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toolbar */}
      <div className="max-w-7xl mx-auto px-8 mt-6 flex gap-4">
        <input 
          placeholder="Search bookmarks..." 
          className="bg-[#111128] border border-slate-800 rounded-xl px-4 py-2 text-sm w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="bg-[#111128] border border-slate-800 rounded-xl px-4 py-2 text-sm"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          {["Java", "React", "Python", "DSA"].map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="animate-pulse bg-[#111128] h-32 rounded-2xl border border-slate-800" />
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-[#111128] border border-slate-800 rounded-2xl p-6 flex justify-between items-start hover:border-slate-600 transition">
                <div>
                  <div className="flex gap-2 mb-3">
                    <span className="bg-[#1a1a33] text-orange-300 text-[10px] font-bold px-2 py-1 rounded">{note.category}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{note.title}</h2>
                </div>
                <button 
                  onClick={() => removeBookmark(note.id)}
                  className="text-slate-500 hover:text-red-400 text-sm font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Bookmarks;