import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import Dashboard         from "./pages/Dashboard";
import Notes             from "./pages/Notes";
import AdminDashboard    from "./pages/AdminDashboard";
import AdminNotes        from "./pages/AdminNotes";
import AdminQuestions    from "./pages/AdminQuestions";
import InterviewQuestions from "./pages/InterviewQuestions";
import AdminUsers        from "./pages/AdminUsers";
import AdminAptitude     from "./pages/AdminAptitude";
import AptitudeQuiz      from "./pages/AptitudeQuiz";
import Bookmarks         from "./pages/Bookmarks";
import HomePage          from "./pages/HomePage";
import ProtectedRoute    from "./components/ProtectedRoute";
import CodingQuestions   from "./pages/CodingQuestions";
import AdminCoding       from "./pages/AdminCoding";
import TechnicalMcq from "./pages/TechnicalMcq";
import AdminMcq     from "./pages/AdminMcq";
import MockHome      from "./pages/MockHome";
import MockInterview from "./pages/MockInterview";
import MockResult    from "./pages/MockResult";
import MockHistory   from "./pages/MockHistory";
import AdminMockSets from "./pages/AdminMockSets";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/notes"     element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute><InterviewQuestions /></ProtectedRoute>} />
        <Route path="/quiz"      element={<ProtectedRoute><AptitudeQuiz /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/coding"    element={<ProtectedRoute><CodingQuestions /></ProtectedRoute>} />
        <Route path="/mcq"       element={<ProtectedRoute><TechnicalMcq /></ProtectedRoute>} />
        <Route path="/mock"      element={<ProtectedRoute><MockHome /></ProtectedRoute>} />
        <Route path="/mock/interview/:setId"   element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/mock/result/:sessionId"  element={<ProtectedRoute><MockResult /></ProtectedRoute>} />
        <Route path="/mock/history"            element={<ProtectedRoute><MockHistory /></ProtectedRoute>} />
        <Route path="/progress"   element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Protected */}
        <Route path="/admin"            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/notes"      element={<ProtectedRoute adminOnly><AdminNotes /></ProtectedRoute>} />
        <Route path="/admin/questions"  element={<ProtectedRoute adminOnly><AdminQuestions /></ProtectedRoute>} />
        <Route path="/admin/users"      element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/aptitude"   element={<ProtectedRoute adminOnly><AdminAptitude /></ProtectedRoute>} />
        <Route path="/admin/coding"     element={<ProtectedRoute adminOnly><AdminCoding /></ProtectedRoute>} />
        <Route path="/admin/mcq" element={<ProtectedRoute adminOnly><AdminMcq /></ProtectedRoute>} />
        <Route path="/admin/mock" element={<ProtectedRoute adminOnly><AdminMockSets /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;