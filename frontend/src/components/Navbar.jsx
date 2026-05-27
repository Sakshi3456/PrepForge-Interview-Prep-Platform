import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const role     = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl">⚒️</span>
        <span className="text-xl font-black text-indigo-700 tracking-tight group-hover:text-indigo-800 transition">
          PrepForge
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {!token ? (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm"
            >
              Get Started
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition px-3 py-2"
            >
              Dashboard
            </Link>
            {role === "ADMIN" && (
              <Link
                to="/admin"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition px-3 py-2"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="text-sm font-semibold px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition border border-rose-100"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;