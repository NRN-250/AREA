import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import OAuthSuccess from "./pages/OAuthSuccess";
import AreaPage from "./pages/AreaPage";
import AppletsPage from "./pages/AppletsPage";
import TimerActionsPage from "./pages/TimerActionsPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Footer from "./components/Footer";
import { ThemeProvider } from "./ThemeContext";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("userToken"));

  // Listen for token changes (login / logout) from any component
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("userToken"));

    // Custom event dispatched by AuthPage and Navbar on login/logout
    window.addEventListener("authChange", syncToken);
    // Also catch storage changes from other tabs
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener("authChange", syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Navbar onAuthChange={() => setToken(localStorage.getItem("userToken"))} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/auth"
                element={!token ? <AuthPage onLogin={() => setToken(localStorage.getItem("userToken"))} /> : <Navigate to="/" />}
              />

              <Route path="/auth/success" element={<OAuthSuccess />} />

              <Route
                path="/services"
                element={token ? <ServicesPage /> : <Navigate to="/auth" />}
              />

              <Route
                path="/area"
                element={token ? <AreaPage /> : <Navigate to="/auth" />}
              />

              <Route
                path="/applets"
                element={token ? <AppletsPage /> : <Navigate to="/auth" />}
              />

              <Route
                path="/timer-actions"
                element={token ? <TimerActionsPage /> : <Navigate to="/auth" />}
              />

              <Route
                path="/profile"
                element={token ? <ProfilePage /> : <Navigate to="/auth" />}
              />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}
