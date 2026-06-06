import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token");
  const [msg,   setMsg]   = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      api.get(`/auth/verify-email?token=${token}`)
        .then(res => setMsg(res.data))
        .catch(err =>
          setError(err.response?.data || "Verification failed"));
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b6e] to-[#4c2d8a] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
        {msg ? (
          <>
            <p className="text-5xl mb-4">✅</p>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              Email Verified!
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{msg}</p>
            <button onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition">
              Go to Login →
            </button>
          </>
        ) : error ? (
          <>
            <p className="text-5xl mb-4">❌</p>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-rose-500 text-sm">{error}</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Verifying...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;