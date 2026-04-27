import { Navigate, useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const stats = [
    { title: "Tests Taken", value: "12" },
    { title: "Coding Solved", value: "28" },
    { title: "Resume Score", value: "82%" },
    { title: "Mock Interviews", value: "3" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-8">PrepForge</h1>

        <ul className="space-y-4">
          <li className="hover:text-blue-400 cursor-pointer">Dashboard</li>
          <li className="hover:text-blue-400 cursor-pointer"><Link to="/quiz">Aptitude Quiz</Link></li>
          <li className="hover:text-blue-400 cursor-pointer">Coding</li>
          <li className="hover:text-blue-400 cursor-pointer">Resume</li>
          <li className="hover:text-blue-400 cursor-pointer">Mock Interview</li>
          <li className="hover:text-blue-400 cursor-pointer"><Link to="/notes">Notes</Link></li>
          <li className="hover:text-blue-400 cursor-pointer"><Link to="/questions">Interview Questions</Link></li>
          
        </ul>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 px-4 py-2 rounded w-full"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-2">Welcome Back 🚀</h2>
        <p className="text-gray-600 mb-8">
          Track your interview preparation progress.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h3 className="text-gray-500">{item.title}</h3>
              <p className="text-2xl font-bold mt-2">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>

          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Start Quiz
            </button>

            <button className="bg-green-600 text-white px-4 py-2 rounded">
              Practice Coding
            </button>

            <button className="bg-purple-600 text-white px-4 py-2 rounded">
              Build Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;