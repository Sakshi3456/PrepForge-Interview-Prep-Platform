import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BookOpen, MessageSquare, Terminal, Award, FileText, 
  Video, ArrowRight, GraduationCap, CheckCircle2, Sparkles 
} from "lucide-react";

const modules = [
  { icon: <BookOpen size={22} />, title: "Study Notes", desc: "Curated reference logs for Java frameworks, React architectures, Python, and foundational core CS structures.", path: "/notes", color: "from-indigo-500 to-violet-500", glow: "indigo" },
  { icon: <MessageSquare size={22} />, title: "Interview Questions", desc: "Exhaustive HR vetting roadmaps and core technical question matrix sets featuring deep verification guidelines.", path: "/questions", color: "from-sky-500 to-cyan-500", glow: "sky" },
  { icon: <Terminal size={22} />, title: "Coding Practice", desc: "Algorithmic challenges mapped from fundamental layers to hard verification matrices, grouped by company tags.", path: "/coding", color: "from-emerald-500 to-teal-500", glow: "emerald" },
  { icon: <Award size={22} />, title: "Aptitude Quiz", desc: "Master Quant, logical reasoning models, and verbal diagnostic tracks utilizing precise built-in timer sequences.", path: "/quiz", color: "from-amber-500 to-orange-500", glow: "amber" },
  { icon: <FileText size={22} />, title: "Technical MCQ", desc: "Test structural comprehension across theoretical Java features, core DBMS dependencies, and OS threading models.", path: "/mcq", color: "from-rose-500 to-pink-500", glow: "rose" },
  { icon: <Video size={22} />, title: "Mock Interview", desc: "Automated real-time simulations running specific placement parameters for Indian tier-1 technology partners.", path: "/mock", color: "from-purple-500 to-indigo-500", glow: "purple" },
];

const stats = [
  { value: "6+", label: "Architectural Modules" },
  { value: "500+", label: "Verified Core Tasks" },
  { value: "50+", label: "Target Company Tags" },
  { value: "100%", label: "Open Access License" },
];

function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleModuleClick = (path) => {
    navigate(token ? path : "/login");
  };

  return (
    <div className="min-h-screen bg-[#030511] text-slate-100 antialiased flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-[500px] h-[500px] bg-purple-500/[0.02] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-indigo-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* ── LANDING NAVIGATION TOOLBAR ── */}
      <nav className="h-20 bg-[#030511]/70 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Terminal size={18} />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            PrepForge
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors tracking-wide uppercase">
            Sign In
          </Link>
          <Link to="/register" className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-500/10 transition-all tracking-wide uppercase">
            Create Account
          </Link>
        </div>
      </nav>

      {/* ── HERO BANNER SECTION ── */}
      <header className="relative py-24 md:py-28 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-2">
            <GraduationCap size={14} className="text-indigo-400" />
            <span>Optimized for Indian Placement Tracks</span>
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Crack Your Dream Job <br />
            with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent font-black">PrepForge</span>
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Consolidate your placement flow. Access core engineering reference notes, algorithmic debugging sets, logical aptitude diagnostics, and AI-driven mock loops within a single unified workspace.
          </p>
          
          <div className="flex gap-3.5 justify-center flex-wrap pt-4">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#030511] text-xs font-black rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} className="text-indigo-600" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-3.5 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white text-xs font-bold rounded-xl hover:scale-[1.02] transition-all"
            >
              Access Workspace
            </button>
          </div>
        </div>
      </header>

      {/* ── FLOATING METRICS DISPLAY BOARD ── */}
      <section className="px-6 relative z-20 -mt-8">
        <div className="max-w-5xl mx-auto bg-[#0a0d21] border border-white/5 rounded-2xl shadow-2xl shadow-black/40 p-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 text-center">
          {stats.map((s, i) => (
            <div 
              key={i} 
              className="relative space-y-1 md:border-r border-white/[0.04] last:border-0"
            >
              <p className="text-3xl font-black bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                {s.value}
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRACK WORKSPACE MODULES GRID ── */}
      <section className="max-w-[1300px] w-full mx-auto px-6 md:px-12 py-24 space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            End-to-End Preparation Engine
          </h2>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto font-medium leading-relaxed">
            Six integrated functional tracks designed to build candidate proficiency from fundamental algorithmic layers up to advanced system designs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <div
              key={i}
              onClick={() => handleModuleClick(mod.path)}
              className="bg-[#080b1c] border border-white/[0.04] p-6 rounded-2xl cursor-pointer hover:border-indigo-500/40 hover:bg-[#0c102b] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden min-h-[210px] shadow-lg shadow-black/20"
            >
              {/* Hover Top Colored Border Accent */}
              <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-md mb-4 transition-transform group-hover:scale-105`}>
                  {mod.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-200 tracking-tight group-hover:text-white transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mt-2.5">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 uppercase tracking-wider">
                <span>{token ? "Launch Module" : "Authenticate Entry"}</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION BOX CONTAINER ── */}
      <section className="max-w-[1300px] w-full mx-auto px-6 md:px-12 pb-24 relative z-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1231] via-[#161b47] to-[#2a1d58] p-8 md:p-12 text-center border border-white/5 shadow-2xl shadow-black/50">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Ready to Accelerate Your Preparation?
            </h3>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
              Consolidate workflows across TCS, Infosys, Wipro, and high-growth development modules today.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#030511] text-xs font-black rounded-xl hover:bg-slate-100 transition-all shadow-md hover:scale-[1.02]"
              >
                <span>Initialize Free Profile</span>
                <ArrowRight size={13} className="text-[#030511]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ATTRIBUTION FOOTER LAYER ── */}
      <footer className="border-t border-white/5 py-6 px-6 text-center bg-[#02040e]">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
          Engineered with precision for tech freshers · PrepForge 2026
        </p>
      </footer>

    </div>
  );
}

export default HomePage;