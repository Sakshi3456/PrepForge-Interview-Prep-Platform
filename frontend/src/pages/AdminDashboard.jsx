import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    notes: 0,
  });

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "ADMIN") {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await api.get("/admin/stats");
    setStats(res.data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-black text-white p-5">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <ul className="space-y-4 mb-8">
          <li>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/notes">Manage Notes</Link>
          </li>
          <li>
             <Link to="/admin/questions">Interview Questions</Link>
          </li>
          <li>
            <Link to="/admin/users">Manage Users</Link>
          </li>
          <li>
            <Link to="/admin/aptitude">Aptitude Quiz</Link>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="bg-red-500 w-full py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard 👑</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500">Total Notes</h3>
            <p className="text-3xl font-bold">{stats.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;