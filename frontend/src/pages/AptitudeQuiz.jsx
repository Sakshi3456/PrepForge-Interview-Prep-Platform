import { useEffect, useState } from "react";
import api from "../services/api";

function AptitudeQuiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await api.get("/aptitude");
    setQuestions(res.data);
  };

  const handleSelect = (id, option) => {
  setAnswers((prev) => ({
    ...prev,
    [id]: option
  }));
};

  const submitQuiz = () => {
  let total = 0;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      total++;
    }
  });

  setScore(total);
};



  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Aptitude Quiz 🧠</h1>

      {questions.map((q, index) => (
        <div key={q.id} className="bg-white p-5 rounded-xl shadow mb-5">
          <p className="text-sm text-blue-600">{q.category}</p>

          <h2 className="font-semibold mb-3">
            {index + 1}. {q.question}
          </h2>

          {["optionA", "optionB", "optionC", "optionD"].map((opt) => (
            <label key={opt} className="block mb-2 cursor-pointer">
              <input
                   type="radio"
                   name={`question-${q.id}`}
                   value={opt}
                   checked={answers[q.id] === opt}
                   onChange={() => handleSelect(q.id, opt)}
                   className="mr-2"
                   />
              {q[opt]}
            </label>
          ))}
        </div>
      ))}

      <button
  type="button"
  onClick={submitQuiz}
  className="bg-green-600 text-white px-6 py-3 rounded"
>
  Submit Quiz
</button>

      {score !== null && (
        <div className="mt-6 bg-white p-5 rounded-xl shadow">
          <h2 className="text-2xl font-bold">
            Your Score: {score} / {questions.length}
          </h2>
        </div>
      )}
    </div>
  );
}

export default AptitudeQuiz;