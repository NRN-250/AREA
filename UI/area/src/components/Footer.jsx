import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link to="/" className="text-xl font-bold text-indigo-600 tracking-wide mb-1">
            AREA
          </Link>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AREA Platform. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/about" className="text-gray-600 font-medium hover:text-indigo-600 transition">
            About Us
          </Link>
        </div>

        {/* Credit */}
        <div className="flex items-center gap-1 text-gray-600 text-sm font-medium">
          Designed & built by 
          <a href="https://github.com/NRN-250/AREA" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition ml-1 font-bold">
            NRN-250
          </a>
        </div>

      </div>
    </footer>
  );
}
