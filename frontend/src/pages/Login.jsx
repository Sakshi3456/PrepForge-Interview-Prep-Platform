import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Terminal, Eye, EyeOff, ArrowRight,
  Code2, Mic, BookOpen, BarChart3, Star, CheckCircle2,
} from "lucide-react";
import api from "../services/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const features = [
  { icon: <Code2 size={15}/>,     label: "500+ DSA Problems",   sub: "Tagged by company & topic"    },
  { icon: <Mic size={15}/>,       label: "AI Mock Interviews",  sub: "Real-time scoring & feedback"  },
  { icon: <BookOpen size={15}/>,  label: "Curated Notes",       sub: "Java, React, DBMS, OS & more"  },
  { icon: <BarChart3 size={15}/>, label: "Progress Tracking",   sub: "Know exactly where you stand"  },
];

// ── Component ─────────────────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      const { token, id, name, email, role } = res.data;
      localStorage.setItem("token",  token);
      localStorage.setItem("userId", id);
      localStorage.setItem("name",   name);
      localStorage.setItem("email",  email);
      localStorage.setItem("role",   role);
      if (role === "ADMIN") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#030511] flex overflow-hidden">

      
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col">

        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e2e] via-[#111540] to-[#0a0820]" />
        <div className="absolute -top-32 -left-32  w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0   w-[400px] h-[400px] bg-violet-600/15 blur-[110px] rounded-full" />
        <div className="absolute top-1/2  left-1/2  w-[300px] h-[300px] bg-purple-500/10 blur-[90px]  rounded-full -translate-x-1/2 -translate-y-1/2" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Content */}
      
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10 min-h-0">

          {/* Top: logo */}
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-black text-base text-white tracking-tight">PrepForge</span>
          </Link>

          {/* Middle: headline + features */}
         
            <div className="space-y-8 overflow-y-auto min-h-0">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                <Star size={10} className="fill-indigo-400 text-indigo-400" />
                Built for Indian placements
              </span>
              <h2 className="text-3xl xl:text-[2.4rem] font-black text-white leading-[1.1] tracking-tight">
                Welcome back.{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                  Keep going.
                </span>
              </h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-sm">
                Your progress, notes, and mock interviews are waiting for you.
              </p>
            </div>

            {/* Feature rows */}
            <div className="space-y-2.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3.5 bg-white/[0.025] border border-white/[0.05] rounded-xl px-4 py-3 hover:bg-white/[0.05] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200">{f.label}</p>
                    <p className="text-[11px] text-slate-500">{f.sub}</p>
                  </div>
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-4">
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_,i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400"/>)}
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-2.5">
                "Cracked TCS NQT and Infosys InfyTQ back to back.
                The mock interview module is genuinely different."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">R</div>
                <p className="text-[11px] text-slate-400"><span className="text-slate-200 font-semibold">Rahul S.</span> · VIT Pune · Placed at TCS</p>
              </div>
            </div>
          </div>

          {/* Bottom: stat strip */}
        
            <div className="flex items-center gap-8 pt-6 border-t border-white/[0.05] shrink-0">
            {[["500+","Questions"],["50+","Companies"],["6","Modules"],["Free","Forever"]].map(([v,l],i) => (
              <div key={i}>
                <p className="text-base font-black text-white">{v}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT PANEL — Form
      ════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-5/12 flex flex-col bg-[#07091a] border-l border-white/[0.04] overflow-y-auto">

        <div className="flex flex-col justify-between min-h-full px-8 xl:px-12 py-8">

          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-6 w-fit">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Terminal size={13} className="text-white" />
            </div>
            <span className="font-black text-sm text-white">PrepForge</span>
          </Link>

          {/* Form block */}
          <div className="flex-1 flex flex-col justify-center max-w-xs w-full mx-auto py-4">

            <div className="mb-5">
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Welcome back</h1>
              <p className="text-slate-500 text-xs mt-1">Sign in to continue your prep journey</p>
            </div>

            {/* Google */}
            <button
              onClick={() => { window.location.href = "http://localhost:8080/oauth2/authorization/google"; }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:border-white/20 transition-all mb-4">
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">or email</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3 py-2 rounded-xl mb-3 leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-100 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 pr-9 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-100 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-400 hover:to-violet-500 transition-all disabled:opacity-60 text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-1">
                {loading
                  ? "Signing in…"
                  : <><span>Sign in</span><ArrowRight size={13}/></>}
              </button>

              {/* Terms */}
              <p className="text-center text-[10px] text-slate-700">
                By signing in you agree to our{" "}
                <Link to="/terms"   className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">Terms</Link>
                {" & "}
                <Link to="/privacy" className="text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">Privacy Policy</Link>.
              </p>
            </form>
          </div>

          {/* Bottom: register link */}
          <p className="text-center text-xs text-slate-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Create one</Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;