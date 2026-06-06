import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const strengthLevels = [
  { label: "Too short",  color: "bg-slate-200" },
  { label: "Weak",       color: "bg-rose-400"  },
  { label: "Fair",       color: "bg-amber-400" },
  { label: "Good",       color: "bg-blue-400"  },
  { label: "Strong",     color: "bg-emerald-500"},
];

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8)                          score++;
  if (/[A-Z]/.test(password))                        score++;
  if (/[0-9]/.test(password))                        score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  return score;
};

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: ""
  });
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href =
      "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b6e] to-[#4c2d8a] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚒️</div>
          <h1 className="text-2xl font-black text-slate-800">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Join PrepForge and start your placement prep
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Check your email!
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {success}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            {/* Google Button */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition mb-6"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">
                or register with email
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-4 leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Sakshi Sharma"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min 8 chars, uppercase, number, symbol"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Strength indicator */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            strength >= i
                              ? strengthLevels[strength].color
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold ${
                      strength <= 1 ? "text-rose-500" :
                      strength === 2 ? "text-amber-500" :
                      strength === 3 ? "text-blue-500" :
                      "text-emerald-500"
                    }`}>
                      {strengthLevels[strength]?.label}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {[
                    { label: "8+ characters",    pass: form.password.length >= 8              },
                    { label: "Uppercase letter",  pass: /[A-Z]/.test(form.password)            },
                    { label: "Number",            pass: /[0-9]/.test(form.password)            },
                    { label: "Special character", pass: /[!@#$%^&*]/.test(form.password)       },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`text-[10px] ${req.pass ? "text-emerald-500" : "text-slate-300"}`}>
                        {req.pass ? "✓" : "○"}
                      </span>
                      <span className={`text-[11px] ${req.pass ? "text-emerald-600" : "text-slate-400"}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  required
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className={`px-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                    form.confirm && form.confirm !== form.password
                      ? "border-rose-300 bg-rose-50"
                      : "border-slate-200"
                  }`}
                />
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-rose-500 font-medium">
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || strength < 3}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-60 text-sm mt-2"
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link to="/login"
                className="text-indigo-600 font-semibold hover:text-indigo-800 transition">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;