import { useEffect, useState } from "react";
import api from "../services/api";

function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await api.get("/notes");
    setNotes(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addNote = async (e) => {
    e.preventDefault();
    await api.post("/notes", form);
    setForm({ title: "", category: "", content: "" });
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Notes 📝</h1>

      {/* Add Form */}
      <form onSubmit={addNote} className="bg-white p-5 rounded-xl shadow mb-8">
        <div className="grid gap-4">
          <input
            name="title"
            placeholder="Title"
            className="border p-2 rounded"
            value={form.title}
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="Category"
            className="border p-2 rounded"
            value={form.category}
            onChange={handleChange}
          />

          <textarea
            name="content"
            placeholder="Content"
            className="border p-2 rounded"
            rows="4"
            value={form.content}
            onChange={handleChange}
          ></textarea>

          <button className="bg-blue-600 text-white p-2 rounded">
            Add Note
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="grid gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold">{note.title}</h2>
            <p className="text-sm text-blue-600">{note.category}</p>
            <p className="my-2">{note.content}</p>

            <button
              onClick={() => deleteNote(note.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminNotes;