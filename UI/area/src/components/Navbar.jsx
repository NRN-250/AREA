import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { FaUserCircle, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";
import api from "../api/api";

export default function Navbar({ onAuthChange }) {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { theme, toggleTheme } = useContext(ThemeContext);

  const syncAuth = () => {
    const token = localStorage.getItem("userToken");
    setLoggedIn(!!token);
    if (token) {
      api.get("/api/user/profile")
        .then(res => {
          setUsername(res.data.username || res.data.email || "");
          setAvatarUrl(res.data.avatarUrl || "");
        })
        .catch(() => { setUsername(""); setAvatarUrl(""); });
    } else {
      setUsername("");
      setAvatarUrl("");
    }
  };

  useEffect(() => {
    syncAuth();
    window.addEventListener("authChange", syncAuth);
    window.addEventListener("avatarChange", syncAuth);
    return () => {
      window.removeEventListener("authChange", syncAuth);
      window.removeEventListener("avatarChange", syncAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.dispatchEvent(new Event("authChange"));
    if (onAuthChange) onAuthChange();
    setLoggedIn(false);
    setMenuOpen(false);
    setMobileOpen(false);
    setUsername("");
    navigate("/auth");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-white dark:bg-[#1A1A1A] shadow-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-wide" onClick={closeMobile}>
          AREA
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
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

          {/* Theme Toggle */}
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
              {/* Profile Icon + Username */}
              <button
                aria-label="Toggle Profile Menu"
                className="flex flex-col items-center gap-0.5 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-xl object-cover border-2 border-indigo-300 dark:border-indigo-600" />
                ) : (
                  <FaUserCircle size={22} />
                )}
                {username && (
                  <span className="text-xs font-semibold leading-none max-w-[80px] truncate">
                    {username}
                  </span>
                )}
              </button>

              {/* Desktop dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  {username && (
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{username}</p>
                    </div>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => { setMenuOpen(false); navigate("/profile"); }}
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

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-3">
          <Link to="/" onClick={closeMobile} className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition">
            Home
          </Link>

          {loggedIn && (
            <>
              <Link to="/services" onClick={closeMobile} className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition">
                Services
              </Link>
              <Link to="/area" onClick={closeMobile} className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition">
                Area
              </Link>
              <Link to="/applets" onClick={closeMobile} className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition">
                My Applets
              </Link>
            </>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            {!loggedIn ? (
              <Link to="/auth" onClick={closeMobile} className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition">
                Login
              </Link>
            ) : (
              <>
                {username && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{username}</span></p>
                )}
                <Link to="/profile" onClick={closeMobile} className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 dark:text-red-500 hover:text-red-700 py-2 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
