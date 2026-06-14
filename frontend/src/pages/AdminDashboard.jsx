import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Users, FileText, MessageSquare, Brain,
  Code2, ClipboardList, Trophy, Plus, ArrowRight,
  TrendingUp, RefreshCw
} from "lucide-react";
import api from "../services/api";
import AdminLayout from "../AdminLayout";

const quickActions = [
  { icon: <Plus size={16} />,  label: "Add Note",     path: "/admin/notes",     accent: "amber"   },
  { icon: <Plus size={16} />,  label: "Add Question", path: "/admin/questions", accent: "sky"     },
  { icon: <Plus size={16} />,  label: "Add Quiz Q",   path: "/admin/aptitude",  accent: "violet"  },
  { icon: <Users size={16} />, label: "View Users",   path: "/admin/users",     accent: "emerald" },
];

const accentMap = {
  amber:   { btn: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300 hover:border-amber-500/40",         dot: "bg-amber-400"   },
  sky:     { btn: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20 text-sky-300 hover:border-sky-500/40",                   dot: "bg-sky-400"     },
  violet:  { btn: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20 text-violet-300 hover:border-violet-500/40",    dot: "bg-violet-400"  },
  emerald: { btn: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40",dot: "bg-emerald-400" },
};

const statAccent = {
  amber:   { icon: "text-amber-400",   ring: "bg-amber-500/10 border-amber-500/20",   bar: "from-amber-400 to-orange-500",   glow: "hover:shadow-amber-500/10"   },
  sky:     { icon: "text-sky-400",     ring: "bg-sky-500/10 border-sky-500/20",       bar: "from-sky-400 to-blue-500",       glow: "hover:shadow-sky-500/10"     },
  violet:  { icon: "text-violet-400",  ring: "bg-violet-500/10 border-violet-500/20", bar: "from-violet-400 to-purple-500",  glow: "hover:shadow-violet-500/10"  },
  emerald: { icon: "text-emerald-400", ring: "bg-emerald-500/10 border-emerald-500/20",bar:"from-emerald-400 to-teal-500",   glow: "hover:shadow-emerald-500/10" },
  rose:    { icon: "text-rose-400",    ring: "bg-rose-500/10 border-rose-500/20",     bar: "from-rose-400 to-pink-500",      glow: "hover:shadow-rose-500/10"    },
  indigo:  { icon: "text-indigo-400",  ring: "bg-indigo-500/10 border-indigo-500/20", bar: "from-indigo-400 to-violet-500",  glow: "hover:shadow-indigo-500/10"  },
};

const modAccent = {
  amber:   { icon:"text-amber-400",   bg:"bg-amber-500/10 border-amber-500/20",    hover:"hover:border-amber-500/40 hover:bg-amber-500/5",   arrow:"text-amber-500/40 group-hover:text-amber-400",  badge:"bg-amber-500/10 text-amber-400 border-amber-500/15"   },
  sky:     { icon:"text-sky-400",     bg:"bg-sky-500/10 border-sky-500/20",        hover:"hover:border-sky-500/40 hover:bg-sky-500/5",       arrow:"text-sky-500/40 group-hover:text-sky-400",      badge:"bg-sky-500/10 text-sky-400 border-sky-500/15"         },
  violet:  { icon:"text-violet-400",  bg:"bg-violet-500/10 border-violet-500/20",  hover:"hover:border-violet-500/40 hover:bg-violet-500/5", arrow:"text-violet-500/40 group-hover:text-violet-400",badge:"bg-violet-500/10 text-violet-400 border-violet-500/15" },
  emerald: { icon:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20",hover:"hover:border-emerald-500/40 hover:bg-emerald-500/5",arrow:"text-emerald-500/40 group-hover:text-emerald-400",badge:"bg-emerald-500/10 text-emerald-400 border-emerald-500/15"},
  rose:    { icon:"text-rose-400",    bg:"bg-rose-500/10 border-rose-500/20",      hover:"hover:border-rose-500/40 hover:bg-rose-500/5",     arrow:"text-rose-500/40 group-hover:text-rose-400",    badge:"bg-rose-500/10 text-rose-400 border-rose-500/15"       },
  indigo:  { icon:"text-indigo-400",  bg:"bg-indigo-500/10 border-indigo-500/20",  hover:"hover:border-indigo-500/40 hover:bg-indigo-500/5", arrow:"text-indigo-500/40 group-hover:text-indigo-400",badge:"bg-indigo-500/10 text-indigo-400 border-indigo-500/15" },
};

// ── Stat card skeleton ────────────────────────────────────────────────────────
const StatSkeleton = () => (
  <div className="bg-[#0d1120] rounded-2xl border border-white/[0.06] p-6 animate-pulse">
    <div className="flex items-center justify-between mb-5">
      <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
      <div className="w-1.5 h-1.5 rounded-full bg-white/[0.05]" />
    </div>
    <div className="h-9 bg-white/[0.05] rounded-lg w-16 mb-2" />
    <div className="h-2.5 bg-white/[0.04] rounded w-24" />
  </div>
);

function AdminDashboard() {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  // ── FIX: Each stat has its own value + loading state ─────────────────────
  // Old: one /admin/stats call → field name mismatch → 0s everywhere
  // New: fetch each endpoint independently with Promise.allSettled
  // so if one fails, others still show correct data
  const [counts, setCounts] = useState({
    users: null, notes: null, questions: null,
    aptitude: null, coding: null, mcq: null,
  });
  const [fetchError, setFetchError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = Object.values(counts).some(v => v === null);

  const fetchAllStats = async () => {
    setRefreshing(true);
    setFetchError(false);

    // ── FIX: Promise.allSettled — each endpoint fetched independently ──────
    // If /aptitude was returning 0 before, it's because /admin/stats
    // had a different field name. Now each endpoint is fetched directly
    // and we just use .length on the array response.
    const [usersRes, notesRes, questionsRes, aptitudeRes, codingRes, mcqRes] =
      await Promise.allSettled([
        api.get("/admin/users"),
        api.get("/notes"),
        api.get("/questions"),
        api.get("/aptitude"),
        api.get("/coding"),
        api.get("/mcq"),
      ]);

    const safe = (res) => res.status === "fulfilled" ? res.value.data : null;

    const usersData     = safe(usersRes);
    const notesData     = safe(notesRes);
    const questionsData = safe(questionsRes);
    const aptitudeData  = safe(aptitudeRes);
    const codingData    = safe(codingRes);
    const mcqData       = safe(mcqRes);

    // ── FIX: Count from array length, not from a stats object field ────────
    // Before: stats.aptitude → was 0 because backend field name didn't match
    // Now: aptitudeData?.length → always accurate regardless of field names
    setCounts({
      users:     usersData     !== null ? (Array.isArray(usersData)     ? usersData.length     : usersData.totalUsers     ?? 0) : 0,
      notes:     notesData     !== null ? (Array.isArray(notesData)     ? notesData.length     : notesData.totalNotes     ?? 0) : 0,
      questions: questionsData !== null ? (Array.isArray(questionsData) ? questionsData.length : questionsData.totalQuestions ?? 0) : 0,
      aptitude:  aptitudeData  !== null ? (Array.isArray(aptitudeData)  ? aptitudeData.length  : aptitudeData.totalAptitude  ?? 0) : 0,
      coding:    codingData    !== null ? (Array.isArray(codingData)    ? codingData.length    : codingData.totalCoding    ?? 0) : 0,
      mcq:       mcqData       !== null ? (Array.isArray(mcqData)       ? mcqData.length       : mcqData.totalMcq         ?? 0) : 0,
    });

    // Flag error if ALL failed
    const allFailed = [usersRes, notesRes, questionsRes, aptitudeRes, codingRes, mcqRes]
      .every(r => r.status === "rejected");
    if (allFailed) setFetchError(true);

    setRefreshing(false);
  };

  useEffect(() => { fetchAllStats(); }, []);

  if (!token || role !== "ADMIN") return <Navigate to="/login" replace />;

  // ── Stat cards — now includes Coding + MCQ ────────────────────────────────
  const statCards = [
    { label: "Total Users",          value: counts.users,     icon: <Users size={20} />,        accent: "amber",   sub: "Registered accounts"    },
    { label: "Notes",                value: counts.notes,     icon: <FileText size={20} />,     accent: "sky",     sub: "Study notes published"   },
    { label: "Interview Questions",  value: counts.questions, icon: <MessageSquare size={20} />,accent: "violet",  sub: "In the question bank"    },
    { label: "Aptitude Questions",   value: counts.aptitude,  icon: <Brain size={20} />,        accent: "emerald", sub: "Quiz bank"               },
    { label: "Coding Problems",      value: counts.coding,    icon: <Code2 size={20} />,        accent: "rose",    sub: "DSA practice problems"   },
    { label: "Technical MCQ",        value: counts.mcq,       icon: <ClipboardList size={20} />,accent: "indigo",  sub: "MCQ bank"                },
  ];

  const modules = [
    { icon: <FileText size={22} />,     title: "Notes",               desc: "Create, edit, and delete study notes. Supports file uploads.",          path: "/admin/notes",     stat: `${counts.notes ?? "…"} notes`,     accent: "sky"     },
    { icon: <MessageSquare size={22} />,title: "Interview Questions",  desc: "Manage the interview question bank for all categories.",                path: "/admin/questions", stat: `${counts.questions ?? "…"} questions`, accent: "violet"  },
    { icon: <Brain size={22} />,        title: "Aptitude Quiz",        desc: "Add and manage aptitude questions used in practice quizzes.",           path: "/admin/aptitude",  stat: `${counts.aptitude ?? "…"} questions`,  accent: "amber"   },
    { icon: <Code2 size={22} />,        title: "Coding Questions",     desc: "Manage DSA and coding practice problems.",                              path: "/admin/coding",    stat: `${counts.coding ?? "…"} problems`,     accent: "emerald" },
    { icon: <ClipboardList size={22} />,title: "Technical MCQ",        desc: "Manage multiple-choice questions for technical topics.",                path: "/admin/mcq",       stat: `${counts.mcq ?? "…"} questions`,       accent: "indigo"  },
    { icon: <Trophy size={22} />,       title: "Mock Interviews",      desc: "Create and manage mock interview sets for users to practice.",          path: "/admin/mock",      stat: "Mock sets",                            accent: "rose"    },
    { icon: <Users size={22} />,        title: "Users",                desc: "View all registered users and manage roles.",                           path: "/admin/users",     stat: `${counts.users ?? "…"} users`,         accent: "amber"   },
  ];

  return (
    <AdminLayout>
      <div className="p-8 max-w-[1400px] mx-auto space-y-10">

        {/* ── Welcome banner ── */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/8 via-orange-500/5 to-transparent border border-amber-500/15 px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Welcome back, Admin</h1>
              <p className="text-xs text-slate-400 mt-0.5">Here's a live overview of PrepForge content and users.</p>
            </div>
          </div>
          {/* Manual refresh button */}
          <button onClick={fetchAllStats} disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all disabled:opacity-50">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* ── Error state ── */}
        {fetchError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-rose-300 font-medium flex items-center gap-2">
            <span className="text-rose-400">⚠</span>
            Failed to load stats. Check that your backend is running and the API endpoints are accessible.
            <button onClick={fetchAllStats} className="ml-auto text-rose-400 hover:text-rose-200 underline underline-offset-2 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* ── Stat cards ── */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overview</h2>
          {/* FIX: Now 6 stats — 2 rows of 3 — includes Coding + MCQ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoading
              ? [...Array(6)].map((_, i) => <StatSkeleton key={i} />)
              : statCards.map(card => {
                  const a = statAccent[card.accent];
                  return (
                    <div key={card.label}
                      className={`bg-[#0d1120] rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.10] transition-all duration-200 hover:shadow-xl ${a.glow}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${a.ring} ${a.icon}`}>
                          {card.icon}
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-b ${a.bar}`} />
                      </div>
                      <p className="text-2xl font-black text-white tracking-tight">
                        {/* FIX: null means still loading, 0 means loaded but empty */}
                        {card.value === null ? "…" : card.value}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wide leading-tight">{card.label}</p>
                    </div>
                  );
                })
            }
          </div>
        </section>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(action => {
              const a = accentMap[action.accent];
              return (
                <Link key={action.label} to={action.path}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl border font-semibold text-sm transition-all duration-150 hover:-translate-y-0.5 ${a.btn}`}>
                  <span className="opacity-80">{action.icon}</span>
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Manage modules ── */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Manage Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map(mod => {
              const a = modAccent[mod.accent];
              return (
                <Link key={mod.title} to={mod.path}
                  className={`group bg-[#0d1120] rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${a.hover}`}>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-200 ${a.bg} ${a.icon}`}>
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors duration-150">
                        {mod.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${a.badge}`}>
                        {/* FIX: shows "…" while loading, real count after fetch */}
                        {mod.stat}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">{mod.desc}</p>
                  </div>
                  <ArrowRight size={16} className={`shrink-0 transition-all duration-150 group-hover:translate-x-0.5 ${a.arrow}`} />
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;