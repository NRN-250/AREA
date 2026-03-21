import React, { useState } from "react";
import api from "../api/api";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("userToken", res.data.token);
        window.location.href = "/";
      } else {
        await api.post("/api/auth/register", { email, username, password });
        setMessage("Registered! Please log in.");
        setTimeout(() => setMode("login"), 1500);
      }
    } catch (err) {
      setMessage(err.response?.data || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-gray-700 text-sm">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="username" className="text-gray-700 text-sm">Username</label>
              <input
                id="username"
                type="text"
                className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="text-gray-700 text-sm">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white py-2 rounded-xl shadow-md hover:opacity-90 transition"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {message && <p className="text-center mt-4 text-red-500">{message}</p>}

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-500 text-sm">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google OAuth button with inline SVG */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-xl shadow-md bg-white border border-gray-300 hover:bg-gray-100 transition"
          onClick={() =>
            (window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`)
          }
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
            <path
              d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.5h146.9c-6.4 34.5-25.8 63.8-54.7 83.5v69.2h88.4c51.9-47.9 81.9-118.3 81.9-197.8z"
              fill="#4285F4"
            />
            <path
              d="M272 544.3c73.6 0 135.3-24.5 180.4-66.5l-88.4-69.2c-24.6 16.5-56 26.1-92 26.1-70.8 0-130.7-47.7-152.2-111.6H28.8v70.1c45.4 89.8 138.1 150.9 243.2 150.9z"
              fill="#34A853"
            />
            <path
              d="M119.8 323.1c-10.7-31.8-10.7-66.1 0-97.9v-70.1H28.8c-46.2 90.3-46.2 197.1 0 287.5l91-70.1z"
              fill="#FBBC05"
            />
            <path
              d="M272 107.9c38.7 0 73.5 13.3 100.9 39.3l75.5-75.5C407.3 24.7 345.6 0 272 0 166.9 0 74.2 61.1 28.8 150.9l91 70.1c21.5-63.9 81.4-111.6 152.2-111.6z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-gray-700 font-medium">Continue with Google</span>
        </button>

        {/* Switch Mode */}
        <p className="text-center text-sm mt-4 text-gray-600">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-indigo-500 font-medium hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-indigo-500 font-medium hover:underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
