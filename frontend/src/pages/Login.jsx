import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/login", form);

    const { token, role } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }

  } catch (error) {
    alert("Invalid Credentials");
  }
};

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

        <button className="bg-green-600 text-white w-full p-2 rounded">
          Login
        </button>

        <p className="mt-3 text-sm">
          New user? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;