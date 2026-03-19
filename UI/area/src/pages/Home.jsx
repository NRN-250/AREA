import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (localStorage.getItem("userToken")) {
      navigate("/area");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50">
      <section className="text-center py-24 px-6">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Automate Your Digital World
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Create, customize, and automate workflows that connect your favorite
          apps effortlessly.
        </p>

        <button
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition border border-gray-100">
          <h2 className="text-xl font-semibold text-indigo-600 mb-3">
            Connect Apps
          </h2>
          <p className="text-gray-600">
            Link services like Gmail, Discord, Slack, and more with ease.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition border border-gray-100">
          <h2 className="text-xl font-semibold text-sky-600 mb-3">
            Automate Actions
          </h2>
          <p className="text-gray-600">
            Build custom automation chains with triggers and reactions.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition border border-gray-100">
          <h2 className="text-xl font-semibold text-purple-600 mb-3">
            Manage Workflows
          </h2>
          <p className="text-gray-600">
            Visualize, edit, and track the performance of your automation.
          </p>
        </div>
      </section>
    </div>
  );
}
