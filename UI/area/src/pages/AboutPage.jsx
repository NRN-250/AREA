import React from "react";
import { FaGlobe, FaLayerGroup } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-[#111111] dark:via-[#111111] dark:to-[#111111] py-16 px-6 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">About AREA</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            A simpler approach to open-source automation.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
          
          <div className="flex flex-col md:flex-row gap-6 items-start bg-white dark:bg-[#1A1A1A] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
              <FaGlobe className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We are trying to do more open source projects but in a significantly simpler way. 
                AREA (Action REAction) is built to strip away the complexity of integrating services, giving developers and users a clean, lightweight platform to connect the APIs they care about without the usual enterprise bloat.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start bg-white dark:bg-[#1A1A1A] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
              <FaLayerGroup className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Core Philosophy</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Open source shouldn't mean hard to structure. By utilizing straightforward OAuth flows and decoupled client-server architecture, we want to prove that powerful automation can remain accessible, adaptable, and easy to fork for everyone.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
