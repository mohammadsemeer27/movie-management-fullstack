import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

 async function handleSubmit(e) {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const data = await login(formData);

    console.log("Login successful:", data);

    toast.success("Login successful!");

    navigate("/");
  } catch (error) {
    console.error("Login error:", error);

    setError(error.message);
    toast.error(error.message || "Login failed");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600">
            <LogIn size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Login to your MovieHub account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <label className="text-sm text-zinc-300">
            Email
          </label>

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
          />

          <label className="mt-5 block text-sm text-zinc-300">
            Password
          </label>

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-red-600 py-3 font-medium transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-red-500 hover:text-red-400"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;