import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAptitude() {
  const [questions, setQuestions] = useState([]);

  const [form, setForm] = useState({
    category: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: ""
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await api.get("/aptitude");
    setQuestions(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addQuestion = async (e) => {
    e.preventDefault();

    await api.post("/aptitude", form);

    setForm({
      category: "",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: ""
    });

    fetchQuestions();
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/aptitude/${id}`);
    fetchQuestions();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Aptitude Quiz 🧠</h1>

      {/* Form */}
      <form
        onSubmit={addQuestion}
        className="bg-white p-6 rounded-xl shadow mb-8 grid gap-3"
      >
        <input
          name="category"
          placeholder="Category (Quant / Logical / Verbal)"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <textarea
          name="question"
          placeholder="Question"
          value={form.question}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="optionA"
          placeholder="Option A"
          value={form.optionA}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="optionB"
          placeholder="Option B"
          value={form.optionB}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="optionC"
          placeholder="Option C"
          value={form.optionC}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="optionD"
          placeholder="Option D"
          value={form.optionD}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="correctAnswer"
          placeholder="Correct Answer"
          value={form.correctAnswer}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button className="bg-blue-600 text-white p-2 rounded">
          Add Question
        </button>
      </form>

      {/* Question List */}
      <div className="grid gap-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-blue-600">{q.category}</p>
            <h2 className="font-semibold">{q.question}</h2>

            <ul className="mt-2 text-gray-700">
              <li>A. {q.optionA}</li>
              <li>B. {q.optionB}</li>
              <li>C. {q.optionC}</li>
              <li>D. {q.optionD}</li>
            </ul>

            <p className="mt-2 text-green-600">
              Answer: {q.correctAnswer}
            </p>

            <button
              onClick={() => deleteQuestion(q.id)}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAptitude;