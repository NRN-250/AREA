import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: "", username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/user/profile");
      setProfile({
        name: res.data.name || "",
        username: res.data.username || "",
        email: res.data.email || "",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("userToken");
        navigate("/auth");
      } else {
        setError("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await api.put("/api/user/profile", profile);
      setMessage("Profile updated successfully!");

      // If the backend generated a new token (e.g., email changed), save it
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
      }
    } catch (err) {
      setError(err.response?.data || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 mb-2">
            Your Profile
          </h1>
          <p className="text-gray-500 mb-8">Manage your account details and personal information.</p>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-green-50/80 border border-green-200 text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50 transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="johndoe123"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50 transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={profile.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50 transition duration-200"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:ring-4 focus:ring-indigo-200 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
