import React, { useState } from "react";
import api from "../../api/api";

export default function TimerActionForm({ onCreated }) {
  const [time, setTime] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!time || !toEmail || !subject || !body) {
      alert("Please fill all fields");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      alert("Invalid time format (HH:mm)");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/timer/actions/time-at", {
        time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        email: { to: toEmail, subject, body },
      });

      alert("Timer action created successfully!");
      setTime("");
      setToEmail("");
      setSubject("");
      setBody("");
      if (onCreated) onCreated();
    } catch (err) {
      console.error("Failed to create timer action:", err);
      alert(err.response?.data?.message || "Failed to create timer action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto"
    >
      <h3 className="text-xl font-bold mb-4">Create Timer Email</h3>

      <label className="block mb-3">
        <span className="text-sm font-semibold">Time (HH:mm)</span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm font-semibold">Recipient Email</span>
        <input
          type="email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          className="mt-1 w-full p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm font-semibold">Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm font-semibold">Body</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full p-2 border rounded"
          rows={4}
          required
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 w-full text-white py-2 rounded transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"
        }`}
      >
        {loading ? "Creating..." : "Create Timer"}
      </button>
    </form>
  );
}
