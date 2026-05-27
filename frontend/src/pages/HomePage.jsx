import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const modules = [
  { icon: "📚", title: "Study Notes",        desc: "Curated notes for Java, React, Python, DSA and more",         path: "/notes",     color: "from-indigo-500 to-violet-500"  },
  { icon: "🎤", title: "Interview Questions", desc: "HR and technical questions with detailed answers",             path: "/questions", color: "from-blue-500 to-cyan-500"      },
  { icon: "💻", title: "Coding Practice",     desc: "DSA problems from Basic to Hard with company tags",           path: "/coding",    color: "from-emerald-500 to-teal-500"   },
  { icon: "🧮", title: "Aptitude Quiz",       desc: "Quant, Logical, Verbal practice with timed mode",             path: "/quiz",      color: "from-amber-500 to-orange-500"   },
  { icon: "📝", title: "Technical MCQ",       desc: "Java, React, DBMS, OS theory questions",                      path: "/mcq",       color: "from-rose-500 to-pink-500"      },
  { icon: "🤖", title: "Mock Interview",      desc: "AI-powered simulation with company-specific sets",            path: "/mock",      color: "from-purple-500 to-indigo-500"  },
];

const stats = [
  { value: "6+",   label: "Modules"          },
  { value: "500+", label: "Practice Questions"},
  { value: "50+",  label: "Company Tags"      },
  { value: "100%", label: "Free to Use"       },
];

function HomePage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const handleModuleClick = (path) => {
    navigate(token ? path : "/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 px-8 py-24 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-violet-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <span className="inline-block bg-indigo-700/60 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-indigo-500/40">
            🇮🇳 Built for Indian Placement Prep
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Crack Your Dream Job<br />
            with <span className="text-indigo-300">PrepForge</span>
          </h1>
          <p className="text-indigo-300 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Notes, quizzes, coding problems, and AI mock interviews —
            everything in one place. No more switching between 10 websites.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-xl shadow-indigo-900/30 text-sm"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 bg-indigo-700/40 text-white font-bold rounded-xl hover:bg-indigo-700/60 transition border border-indigo-500/50 text-sm"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-indigo-700">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modules Grid ── */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-800 mb-3">
            Everything You Need to Prepare
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            6 modules covering every aspect of Indian placement preparation —
            from aptitude to AI mock interviews
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.title}
              onClick={() => handleModuleClick(mod.path)}
              className="bg-white rounded-2xl border border-slate-100 p-6 cursor-pointer hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                {mod.icon}
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition">
                {mod.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {mod.desc}
              </p>
              <p className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-600 transition">
                {token ? "Open →" : "Login to access →"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="max-w-6xl mx-auto px-8 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-10 text-center shadow-xl">
          <h3 className="text-2xl font-black text-white mb-3">
            Ready to Start Preparing?
          </h3>
          <p className="text-indigo-200 text-sm mb-6">
            Join thousands of freshers preparing for TCS, Infosys, Wipro and more
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg text-sm"
          >
            Create Free Account →
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-slate-100 py-8 text-center">
        <p className="text-sm text-slate-400">
          Built with ❤️ for Indian freshers · PrepForge 2025
        </p>
      </div>
    </div>
  );
}

export default HomePage;