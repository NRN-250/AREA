import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-wide">
          AREA
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600 transition">
            Home
          </Link>

          {loggedIn && (
            <>
              <Link to="/services" className="text-gray-700 hover:text-indigo-600 transition">
                Services
              </Link>
              <Link to="/area" className="text-gray-700 hover:text-indigo-600 transition">
                Area
              </Link>
              <Link to="/applets" className="text-gray-700 hover:text-indigo-600 transition">
                My Applets
              </Link>
            </>
          )}

          {!loggedIn ? (
            <Link to="/auth" className="text-gray-700 hover:text-indigo-600 transition">
              Login
            </Link>
          ) : (
            <div className="relative">
              {/* Profile Icon */}
              <button
                className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <FaUserCircle size={22} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
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
