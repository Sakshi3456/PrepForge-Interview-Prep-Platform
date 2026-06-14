import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen, MessageSquare, Terminal, Award, FileText,
  Video, ArrowRight, GraduationCap, CheckCircle2, Users, Star
} from "lucide-react";


const stats = [
  { value: "500+", label: "Practice Questions" },
  { value: "50+",  label: "Company Tags" },
  { value: "6",    label: "Prep Modules" },
  { value: "Free", label: "Forever" },
];

const modules = [
  {
    icon: <BookOpen size={22} />,
    title: "Study Notes",
    desc: "Curated notes for Java, React, Python, DBMS, OS and core CS topics — organized by subject.",
    path: "/notes",
    color: "from-indigo-500 to-violet-500",
    tag: "Notes",
  },
  {
    icon: <MessageSquare size={22} />,
    title: "Interview Questions",
    desc: "HR and technical questions sorted by topic, difficulty, and company — with model answers.",
    path: "/questions",
    color: "from-sky-500 to-cyan-500",
    tag: "Questions",
  },
  {
    icon: <Terminal size={22} />,
    title: "Coding Practice",
    desc: "DSA problems from easy to hard, grouped by company tags like TCS, Infosys, and Wipro.",
    path: "/coding",
    color: "from-emerald-500 to-teal-500",
    tag: "DSA",
  },
  {
    icon: <Award size={22} />,
    title: "Aptitude Quiz",
    desc: "Timed quant, reasoning, and verbal quizzes that mirror real placement test formats.",
    path: "/quiz",
    color: "from-amber-500 to-orange-500",
    tag: "Quant",
  },
  {
    icon: <FileText size={22} />,
    title: "Technical MCQ",
    desc: "Topic-wise MCQs on Java, DBMS, OS, and networks — with explanations for every answer.",
    path: "/mcq",
    color: "from-rose-500 to-pink-500",
    tag: "MCQ",
  },
  {
    icon: <Video size={22} />,
    title: "Mock Interview",
    desc: "AI-powered mock interviews that simulate real placement rounds with instant feedback.",
    path: "/mock",
    color: "from-purple-500 to-indigo-500",
    tag: "AI Mock",
  },
];

const proof = [
  { icon: "🎯", title: "Targeted practice", desc: "Questions tagged by company — TCS, Infosys, Wipro, and more." },
  { icon: "📊", title: "Track your growth", desc: "See your progress across modules and know what to focus on." },
  { icon: "🤖", title: "AI mock interviews", desc: "Simulate real placement rounds with instant AI feedback." },
];

function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const handleModuleClick = (path) => navigate(token ? path : "/login");

  return (
    <div className="min-h-screen bg-[#030511] text-slate-100 antialiased flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">

      {/* Ambient glows — kept, they work well */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-indigo-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* ── NAV ── */}
      
      <nav className="h-16 bg-[#030511]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Terminal size={18} />
          </div>
          <span className="font-black text-lg tracking-tight text-white">PrepForge</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold border border-white/10 text-slate-300 hover:text-white hover:border-white/25 rounded-xl transition-all tracking-wide"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all tracking-wide"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      
      <header className="relative py-20 md:py-28 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Badge — simplified text */}
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
            <GraduationCap size={14} className="text-indigo-400" />
            
            Built for Indian placement prep
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-[3.75rem] font-black text-white tracking-tight leading-[1.08]">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              crack your placement
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
            Practice DSA, attempt mock interviews, take aptitude quizzes, and
            track your progress — all in one free platform.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#030511] text-sm font-black rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:scale-[1.02]"
            >
              Start for free
              <ArrowRight size={15} className="text-indigo-600" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-3.5 border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] text-white text-sm font-bold rounded-xl hover:scale-[1.02] transition-all"
            >
              Sign in
            </button>
          </div>

         
          <div className="mt-10 mx-auto max-w-2xl bg-[#080b1c] border border-white/[0.06] rounded-2xl p-4 text-left shadow-2xl shadow-black/60">
           
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-[11px] text-slate-500 ml-2 font-mono">prepforge.app/dashboard</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-16 flex-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-[11px] text-indigo-400 font-bold">📊 Progress Tracker</span>
                </div>
                <div className="h-16 flex-1 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <span className="text-[11px] text-purple-400 font-bold">🎯 Mock Interview</span>
                </div>
                <div className="h-16 flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-[11px] text-emerald-400 font-bold">💻 DSA Practice</span>
                </div>
              </div>
              <div className="h-10 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center px-3 gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[11px] text-slate-400">3 modules completed today · Keep going! 🔥</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── STATS ── */}
      <section className="px-6 relative z-20">
        <div className="max-w-4xl mx-auto bg-[#0a0d21] border border-white/5 rounded-2xl shadow-2xl shadow-black/40 p-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 text-center">
          {stats.map((s, i) => (
            <div key={i} className="relative space-y-1 md:border-r border-white/[0.04] last:border-0">
              <p className="text-3xl font-black bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                {s.value}
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      
      <section className="max-w-[1200px] w-full mx-auto px-6 md:px-12 py-24 space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            One platform, full prep
          </h2>
          
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
            Six focused modules covering every round of a typical campus placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <div
              key={i}
              onClick={() => handleModuleClick(mod.path)}
              className="bg-[#080b1c] border border-white/[0.05] p-6 rounded-2xl cursor-pointer hover:border-indigo-500/40 hover:bg-[#0c102b] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden min-h-[200px] shadow-lg shadow-black/20"
            >
              
              <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105`}>
                    {mod.icon}
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-500 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {mod.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 tracking-tight group-hover:text-white transition-colors">
                  {mod.title}
                </h3>
                
                <p className="text-xs font-medium text-slate-500 leading-relaxed mt-2">
                  {mod.desc}
                </p>
              </div>

              
              <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 uppercase tracking-wider">
                <span>{token ? "Start practicing" : "Sign in to access"}</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL PROOF (NEW SECTION) ── */}
      
      <section className="max-w-[1200px] w-full mx-auto px-6 md:px-12 pb-20 relative z-10">
        <div className="text-center mb-10 space-y-2">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Loved by students across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {proof.map((p, i) => (
            <div key={i} className="bg-[#080b1c] border border-white/[0.05] rounded-2xl p-5">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">"{p.quote}"</p>
              <div>
                <p className="text-xs font-bold text-slate-200">{p.name}</p>
                <p className="text-[11px] text-slate-500">{p.college}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      
      <section className="max-w-[1200px] w-full mx-auto px-6 md:px-12 pb-24 relative z-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1231] via-[#161b47] to-[#2a1d58] p-8 md:p-14 text-center border border-white/5 shadow-2xl shadow-black/50">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />

          <div className="max-w-lg mx-auto space-y-4 relative z-10">
            
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Your placement season starts here
            </h3>
            
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Join thousands of students already preparing with PrepForge.
              Free to use, no credit card required.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
              
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#030511] text-sm font-black rounded-xl hover:bg-slate-100 transition-all shadow-md hover:scale-[1.02]"
              >
                Create free account
                <ArrowRight size={14} />
              </button>
              
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                Already have an account? Sign in →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      
      <footer className="border-t border-white/5 py-8 px-6 bg-[#02040e]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Terminal size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-white">PrepForge</span>
            <span className="text-slate-600 text-xs ml-1">© 2026</span>
          </div>

          
          <div className="flex items-center gap-6">
            <Link to="/login"    className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Sign in</Link>
            <Link to="/register" className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Register</Link>
            <Link to="/notes"    className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Notes</Link>
            <Link to="/mock"     className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">Mock Interview</Link>
          </div>

          <p className="text-[11px] text-slate-600">
            Built for students preparing for Indian tech placements
          </p>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;