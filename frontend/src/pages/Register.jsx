import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await api.post("/auth/register", form);
    alert(res.data);
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow rounded w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          className="border p-2 w-full mb-3"
          onChange={handleChange}
        />

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

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Register
        </button>

        <p className="mt-3 text-sm">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;