import { useEffect, useState } from "react";
import api from "../services/api";

function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    category: "",
    question: "",
    answer: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await api.get("/questions");
    setQuestions(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    await api.post("/questions", form);
    setForm({ category: "", question: "", answer: "" });
    fetchQuestions();
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/questions/${id}`);
    fetchQuestions();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Interview Questions 🎤</h1>

      {/* Add Form */}
      <form onSubmit={addQuestion} className="bg-white p-5 rounded-xl shadow mb-8">
        <div className="grid gap-4">
          <input
            name="category"
            placeholder="Category (HR, Java, React...)"
            className="border p-2 rounded"
            value={form.category}
            onChange={handleChange}
          />

          <input
            name="question"
            placeholder="Question"
            className="border p-2 rounded"
            value={form.question}
            onChange={handleChange}
          />

          <textarea
            name="answer"
            placeholder="Answer"
            className="border p-2 rounded"
            rows="4"
            value={form.answer}
            onChange={handleChange}
          ></textarea>

          <button className="bg-blue-600 text-white p-2 rounded">
            Add Question
          </button>
        </div>
      </form>

      {/* Questions List */}
      <div className="grid gap-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-blue-600">{q.category}</p>
            <h2 className="font-bold">{q.question}</h2>
            <p className="my-2 text-gray-600">{q.answer}</p>

            <button
              onClick={() => deleteQuestion(q.id)}
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

export default AdminQuestions;