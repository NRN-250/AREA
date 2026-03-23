import React, { useState } from "react";
import axios from "axios";
import { FaPaperPlane, FaUser, FaEnvelope, FaTag, FaCommentAlt } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await axios.post("/api/contact", formData);
      setStatus({ type: "success", message: response.data.message });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] pt-24 pb-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Have a question, feedback, or a security vulnerability to report? 
            Fill out the form below and we'll get back to you shortly.
          </p>
        </div>

        {/* Status Message */}
        {status.message && (
          <div className={`mb-8 p-4 rounded-lg flex items-center gap-3 ${
            status.type === "success" 
              ? "bg-green-100 text-green-800 border-l-4 border-green-500" 
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}>
            <p className="font-medium">{status.message}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FaUser className="text-indigo-500" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-indigo-500" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaTag className="text-indigo-500" /> Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaCommentAlt className="text-indigo-500" /> Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe your request in detail..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <FaPaperPlane className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                  Send Message
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
