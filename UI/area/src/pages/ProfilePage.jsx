import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaUserCircle, FaCheck, FaExclamationCircle, FaCalendarAlt, FaEnvelope, FaUser, FaIdCard, FaShieldAlt } from "react-icons/fa";

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: "", username: "", email: "", avatarUrl: "", provider: "local", createdAt: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
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
        avatarUrl: res.data.avatarUrl || "",
        provider: res.data.provider || "local",
        createdAt: res.data.createdAt || "",
      });
      if (res.data.avatarUrl) setAvatarPreview(res.data.avatarUrl);
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      setUploadingAvatar(true);
      setError("");
      setMessage("");
      try {
        await api.put("/api/user/profile/avatar", { avatarUrl: dataUrl });
        setMessage("Profile picture updated!");
        window.dispatchEvent(new Event("avatarChange"));
      } catch (err) {
        setError(err.response?.data || "Failed to upload picture.");
        setAvatarPreview(profile.avatarUrl || null);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await api.put("/api/user/profile", {
        name: profile.name,
        username: profile.username,
        email: profile.email,
      });
      setMessage("Profile updated successfully!");
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
        window.dispatchEvent(new Event("authChange"));
      }
    } catch (err) {
      setError(err.response?.data || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch { return "—"; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] py-12 px-6 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Avatar + Header Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500" />

          <div className="px-8 pb-8 -mt-14">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-[#1A1A1A] shadow-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle className="text-5xl text-indigo-400 dark:text-indigo-500" />
                )}
              </div>
              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change profile picture"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md transition disabled:opacity-60"
              >
                {uploadingAvatar
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FaCamera size={12} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.name || profile.username || "Your Profile"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">@{profile.username || "—"}</p>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 font-medium">
                <FaShieldAlt size={10} />
                {profile.provider === "google" ? "Google Account" : profile.provider === "github" ? "GitHub Account" : "Local Account"}
              </span>
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 font-medium">
                <FaCalendarAlt size={10} />
                Joined {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/40 text-green-700 dark:text-green-400">
            <FaCheck className="shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400">
            <FaExclamationCircle className="shrink-0" />
            {error}
          </div>
        )}

        {/* Edit Form Card */}
        <div className="bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Account Details</h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FaIdCard size={12} className="text-indigo-500" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 transition duration-200"
              />
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FaUser size={12} className="text-indigo-500" /> Username
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#222222] text-gray-500 dark:text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  placeholder="johndoe123"
                  className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 transition duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FaEnvelope size={12} className="text-indigo-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={profile.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 transition duration-200"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Changing your email will require logging in again.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
