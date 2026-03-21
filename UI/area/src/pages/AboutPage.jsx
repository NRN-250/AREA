import React from "react";
import { FaLaptopCode, FaRocket, FaGlobe } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">About AREA</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            AREA (Action REAction) is a powerful, self-hosted automation platform designed to seamlessly bridge the gap between your favorite digital services.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <FaGlobe className="text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                In a world where digital tools are increasingly fragmented, we believe in radical connectivity. 
                AREA was built to empower individuals and businesses to create intelligent workflows without writing a single line of code. 
                By connecting disparate APIs into unified pipelines, we save you hours of manual, repetitive work every single week.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
              <FaLaptopCode className="text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">The Technology</h2>
              <p className="text-gray-600 leading-relaxed">
                Engineered with performance and security in mind, AREA features a robust Java Spring Boot backend paired with an 
                ultra-fast React frontend. It natively integrates with OAuth 2.0 protocols, allowing safe and seamless communication 
                with external giants like Google and GitHub without ever compromising your credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
              <FaRocket className="text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">The Creator</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                This platform was architected, designed, and developed entirely by <strong>Noah Nganji</strong> as a demonstration of full-stack 
                engineering capabilities, distributed systems architecture, and modern UX design principles.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
