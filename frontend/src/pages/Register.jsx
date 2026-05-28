import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Terminal, User, Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import api from "../services/api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Instantly clear error buffers upon key changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Hardened request gate blocking concurrent API runs

    // Lightweight client-side sanity validation check
    if (form.password.length < 6) {
      setError("Password security constraints require at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      console.error("Registration onboarding channel fault", err);
      setError(
        err.response?.data?.message || 
        "Registration could not be completed. Account might already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] grid grid-cols-1 lg:grid-cols-2 select-none antialiased text-slate-200">
      
      {/* ── LEFT PANEL: MATCHING OVERLAY BRANDING CANVAS ── */}
      {/* Automatically consumes 50% screen width to fill empty space elegantly on wide layouts */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0c0f24] via-[#141843] to-[#211947] relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_50%)]" />
        
        {/* Branding Title Core */}
        <Link to="/" className="flex items-center gap-2.5 w-fit relative z-10 focus:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Terminal size={18} />
          </div>
          <span className="text-xl font-black text-white tracking-tight">PrepForge</span>
        </Link>

        {/* Center Marketing Copy Block */}
        <div className="space-y-6 max-w-md relative z-10 my-auto">
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full">
              Onboarding Infrastructure
            </span>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Join the Placement Readiness Ecosystem
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            Initialize your persistent profile today to unlock unified performance evaluation graphs, custom algorithmic tracking sheets, and targeted revision matrices.
          </p>

          {/* Value Propositions Group */}
          <div className="space-y-3 pt-2">
            {[
              "100% Free Complete Placement Suite Access",
              "Dynamic Candidate Performance Audit Logs",
              "AI Simulation Core Matching Major Indian Tech Brands"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom System Footer */}
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide relative z-10">
          Engineered with precision for freshers · PrepForge 2026
        </p>
      </div>

      {/* ── RIGHT PANEL: THE REGISTRATION FORM INTERFACE ── */}
      {/* Keeps form components centered cleanly, scaling perfectly from mobile up to desktop grids */}
      <div className="flex flex-col justify-center items-center px-6 py-12 relative bg-[#060814]">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-500/[0.02] blur-[100px] rounded-full pointer-events-none" />
        
        {/* Mobile-Only Header Branding Navbar */}
        <div className="text-center space-y-2 mb-8 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2.5 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
              <Terminal size={18} />
            </div>
            <span className="text-xl font-black text-white tracking-tight">PrepForge</span>
          </Link>
        </div>

        <div className="w-full max-w-[400px] space-y-6 relative z-10">
          
          {/* Card Header Text */}
          <div className="space-y-1.5 text-center lg:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
            <p className="text-xs font-medium text-slate-400">Initialize your free entry details to start practicing modules.</p>
          </div>

          {/* Hardened Exception Alert Dialog */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-4 rounded-xl flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
              <AlertTriangle size={14} className="shrink-0 text-rose-500" />
              <p className="leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* FULL NAME NODE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Candidate Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="Sakshi Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-[#111322] border border-white/5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* EMAIL NODE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Communications Target
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@domain.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-[#111322] border border-white/5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* PASSWORD NODE WITH ACTIVE TOGGLE MASK */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Security Password String
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-11 py-3 text-xs font-bold bg-[#111322] border border-white/5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* SUBMIT ACTION HANDLING ELEMENT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-950/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wide uppercase transition-all mt-2 focus:outline-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Registering Profile Context...</span>
                </span>
              ) : (
                <>
                  <span>Initialize Account Credentials</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Inbound Route Toggles Footer */}
          <div className="space-y-4 pt-2 text-center">
            <p className="text-xs font-medium text-slate-500">
              Already possess active profile parameters?{" "}
              <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-all">
                Sign In Instead
              </Link>
            </p>
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 focus:outline-none">
              ← Abort and Return Home
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Register;