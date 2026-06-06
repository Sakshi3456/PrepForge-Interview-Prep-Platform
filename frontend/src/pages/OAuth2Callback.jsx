import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  useEffect(() => {
    const token  = searchParams.get("token");
    const userId = searchParams.get("userId");
    const name   = searchParams.get("name");
    const email  = searchParams.get("email");
    const role   = searchParams.get("role");

    if (token) {
      localStorage.setItem("token",  token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("name",   name);
      localStorage.setItem("email",  email);
      localStorage.setItem("role",   role);

      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b6e] to-[#4c2d8a] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold">Signing you in...</p>
      </div>
    </div>
  );
}

export default OAuth2Callback;