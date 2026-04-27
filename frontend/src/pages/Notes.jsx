import { useEffect, useState } from "react";
import api from "../services/api";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (error) {
      console.error("Error fetching notes");
    }
  };

  const categories = ["All", ...new Set(notes.map((n) => n.category))];

  const filteredNotes = notes.filter((note) => {
    const matchSearch = note.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || note.category === category;

    return matchSearch && matchCategory;
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Notes 📚</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          className="border p-2 rounded w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat, index) => (
            <option key={index}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-blue-600 mb-2">{note.category}</p>
            <h2 className="text-xl font-bold mb-2">{note.title}</h2>
            <p className="text-gray-600">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;