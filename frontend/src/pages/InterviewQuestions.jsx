import { useEffect, useState } from "react";
import api from "../services/api";

function InterviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await api.get("/questions");
    setQuestions(res.data);
  };

  const categories = ["All", ...new Set(questions.map((q) => q.category))];

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.question
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || q.category === category;

    return matchSearch && matchCategory;
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Interview Questions 🎤</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search questions..."
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

      {/* Question Cards */}
      <div className="grid gap-4">
        {filteredQuestions.map((q) => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-blue-600 mb-1">{q.category}</p>
            <h2 className="text-lg font-bold">{q.question}</h2>
            <p className="mt-2 text-gray-600">{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterviewQuestions;