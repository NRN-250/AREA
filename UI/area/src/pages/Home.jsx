import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGithub, FaEnvelope, FaClock, FaTwitch, FaDiscord, FaBolt, FaCogs, FaProjectDiagram, FaArrowRight } from "react-icons/fa";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6 shadow-sm border border-indigo-200">
            Welcome to the Future of Automation ⚡
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Connect your world.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
              Automate your life.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            AREA is the ultimate integration platform that lets you chain together your favorite digital tools. 
            If something happens here, automatically do something there. Zero coding required.
          </p>
          <button
            onClick={handleGetStarted}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-full overflow-hidden transition-all hover:scale-105 hover:bg-gray-800 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]"
          >
            Start Automating for Free
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AREA Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Building intelligent workflows takes less than a minute. Our visual interface makes complex integrations remarkably simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-8 rounded-3xl bg-indigo-50/50 border border-indigo-100 text-center hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 text-indigo-600 text-2xl">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect Services</h3>
              <p className="text-gray-600">Securely link your accounts like Google, GitHub, and Discord to the platform with a single click.</p>
            </div>

            <div className="p-8 rounded-3xl bg-sky-50/50 border border-sky-100 text-center hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 text-sky-600 text-2xl">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Choose an Action</h3>
              <p className="text-gray-600">Set up a trigger (the IF). For example: "If I receive a new issue on GitHub" or "If it is 8:00 AM".</p>
            </div>

            <div className="p-8 rounded-3xl bg-purple-50/50 border border-purple-100 text-center hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center mb-6 text-purple-600 text-2xl">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Assign a Reaction</h3>
              <p className="text-gray-600">Tell AREA what to do (the THEN). For example: "Send me a personalized Mail" or "Message Discord".</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Display */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-bold text-gray-900">Endless Possibilities. <br/>Infinite Combinations.</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Whether you are a developer pushing code, a marketer sending emails, or a power user automating daily tasks, we support the tools you love. 
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                <FaBolt className="text-yellow-500" /> Real-time event listening
              </li>
              <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                <FaCogs className="text-indigo-500" /> Highly customizable parameters
              </li>
              <li className="flex items-center gap-3 text-lg text-gray-700 font-medium">
                <FaProjectDiagram className="text-purple-500" /> Unlimited applet creation
              </li>
            </ul>
          </div>
          
          <div className="flex-1">
            <div className="bg-white/80 p-8 rounded-[3rem] shadow-2xl border border-gray-100 grid grid-cols-2 gap-6 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-[3rem] pointer-events-none" />
              
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                <FaGithub className="text-5xl text-gray-900 mb-3" />
                <span className="font-semibold text-gray-800">GitHub</span>
              </div>
              
              <div className="flex flex-col items-center p-6 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm translate-y-6">
                <FaEnvelope className="text-5xl text-rose-500 mb-3" />
                <span className="font-semibold text-gray-800">Mail</span>
              </div>
              
              <div className="flex flex-col items-center p-6 bg-indigo-50 rounded-3xl border border-indigo-100 shadow-sm -translate-y-6">
                <FaClock className="text-5xl text-indigo-600 mb-3" />
                <span className="font-semibold text-gray-800">Timer</span>
              </div>
              
              <div className="flex flex-col items-center p-6 bg-blue-50 rounded-3xl border border-blue-100 shadow-sm">
                <span className="text-5xl font-extrabold text-blue-500 mb-3">G</span>
                <span className="font-semibold text-gray-800">Google</span>
              </div>
            </div>

            <div className="mt-10 text-center">
              <span className="inline-block px-5 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm border border-indigo-100 shadow-sm">
                ✨ And many more services coming soon...
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to save hours every week?</h2>
        <p className="text-indigo-100 text-xl max-w-2xl mx-auto mb-10">
          Join thousands of users who have streamlined their digital workflow and stopped doing repetitive manual tasks forever.
        </p>
        <button
          onClick={handleGetStarted}
          className="px-10 py-4 text-lg font-bold text-indigo-900 bg-white rounded-full transition-transform hover:scale-105 shadow-xl"
        >
          Create Your First Applet
        </button>
      </section>

    </div>
  );
}
