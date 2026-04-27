import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNotes from "./pages/AdminNotes";
import AdminQuestions from "./pages/AdminQuestions";
import InterviewQuestions from "./pages/InterviewQuestions";
import AdminUsers from "./pages/AdminUsers";
import AdminAptitude from "./pages/AdminAptitude";
import AptitudeQuiz from "./pages/AptitudeQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/notes" element={<AdminNotes />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/questions" element={<InterviewQuestions />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/aptitude" element={<AdminAptitude />} />
        <Route path="/quiz" element={<AptitudeQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;