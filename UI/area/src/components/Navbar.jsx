import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("userToken"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setLoggedIn(false);
    setMenuOpen(false);
    navigate("/auth");
  };

  return (
    <nav className="bg-white dark:bg-[#1A1A1A] shadow-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">
          AREA
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Home
          </Link>

          {loggedIn && (
            <>
              <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Services
              </Link>
              <Link to="/area" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Area
              </Link>
              <Link to="/applets" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                My Applets
              </Link>
            </>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>

          {!loggedIn ? (
            <Link to="/auth" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Login
            </Link>
          ) : (
            <div className="relative">
              {/* Profile Icon */}
              <button
                aria-label="Toggle Profile Menu"
                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition mt-1"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <FaUserCircle size={22} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
