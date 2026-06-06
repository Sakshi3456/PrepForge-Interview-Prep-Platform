import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const [searchParams]             = useSearchParams();
  const navigate                   = useNavigate();
  const token                      = searchParams.get("token");
  const [password,   setPassword]  = useState("");
  const [confirm,    setConfirm]   = useState("");
  const [msg,        setMsg]       = useState("");
  const [error,      setError]     = useState("");
  const [loading,    setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/reset-password",
        { token, password });
      setMsg(res.data);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b6e] to-[#4c2d8a] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-black text-slate-800">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your new password below
          </p>
        </div>

        {msg ? (
          <div className="text-center py-4">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-slate-600 text-sm">{msg}</p>
            <p className="text-slate-400 text-xs mt-2">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 8 chars, uppercase, number, symbol"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-60 text-sm">
              {loading ? "Resetting..." : "Reset Password →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;