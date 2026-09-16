import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Terminal, Mail, ArrowRight, ArrowLeft,
  Code2, Mic, BookOpen, BarChart3, Star, CheckCircle2, KeyRound,
} from "lucide-react";
import api from "../services/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const features = [
  { icon: <Code2 size={15}/>,     label: "500+ DSA Problems",   sub: "Tagged by company & topic"    },
  { icon: <Mic size={15}/>,       label: "AI Mock Interviews",  sub: "Real-time scoring & feedback"  },
  { icon: <BookOpen size={15}/>,  label: "Curated Notes",       sub: "Java, React, DBMS, OS & more"  },
  { icon: <BarChart3 size={15}/>, label: "Progress Tracking",   sub: "Know exactly where you stand"  },
];

// ── Component ─────────────────────────────────────────────────────────────────
function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [msg,     setMsg]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data);
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#030511] flex overflow-hidden">

      {/* ════════════════════════════════════════════════════════════════
          LEFT PANEL — Branding (identical to Login)
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col">

        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e2e] via-[#111540] to-[#0a0820]" />
        <div className="absolute -top-32 -left-32  w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0   w-[400px] h-[400px] bg-violet-600/15 blur-[110px] rounded-full" />
        <div className="absolute top-1/2  left-1/2  w-[300px] h-[300px] bg-purple-500/10 blur-[90px]  rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10 min-h-0">

          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Terminal size={15} className="text-white" />
            </div>
            <span className="font-black text-base text-white tracking-tight">PrepForge</span>
          </Link>

          <div className="space-y-8 overflow-y-auto min-h-0">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                <Star size={10} className="fill-indigo-400 text-indigo-400" />
                Built for Indian placements
              </span>
              <h2 className="text-3xl xl:text-[2.4rem] font-black text-white leading-[1.1] tracking-tight">
                Forgot your password?{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                  No stress.
                </span>
              </h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-sm">
                We'll email you a link to get back into your account in seconds.
              </p>
            </div>

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

            {msg ? (
              // ── Success state ───────────────────────────────────────
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Mail size={22} className="text-indigo-400" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight leading-tight">Check your inbox</h1>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">{msg}</p>

                <Link
                  to="/login"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-400 hover:to-violet-500 transition-all text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99]">
                  Back to Login
                </Link>
              </div>
            ) : (
              // ── Request state ───────────────────────────────────────
              <>
                <div className="mb-5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <KeyRound size={18} className="text-indigo-400" />
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Forgot password?</h1>
                  <p className="text-slate-500 text-xs mt-1">Enter your email and we'll send a reset link</p>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3 py-2 rounded-xl mb-3 leading-relaxed">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white/[0.03] border border-white/[0.07] text-slate-100 placeholder-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-400 hover:to-violet-500 transition-all disabled:opacity-60 text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-1">
                    {loading
                      ? "Sending…"
                      : <><span>Send Reset Link</span><ArrowRight size={13}/></>}
                  </button>

                  <p className="text-center text-xs pt-1">
                    <Link to="/login" className="inline-flex items-center gap-1 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                      <ArrowLeft size={12}/> Back to Login
                    </Link>
                  </p>
                </form>
              </>
            )}
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

export default ForgotPassword;