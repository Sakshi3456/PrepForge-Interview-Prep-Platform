import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">⚒️</span>
            <span className="text-2xl font-black text-white tracking-tight">PrepForge</span>
          </Link>
          <p className="text-indigo-300 text-sm mt-2">Create your free account today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/40 p-8">
          <h2 className="text-2xl font-black text-slate-800 mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm mb-6">Start your placement prep journey</p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span>✕</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Sakshi Sharma"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-indigo-400 text-xs mt-6">
          <Link to="/" className="hover:text-indigo-200 transition">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;