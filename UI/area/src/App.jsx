import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import OAuthSuccess from "./pages/OAuthSuccess";
import AreaPage from "./pages/AreaPage";
import AppletsPage from "./pages/AppletsPage";
import TimerActionsPage from "./pages/TimerActionsPage";
import ServicesPage from "./pages/ServicesPage";

export default function App() {
  const token = localStorage.getItem("userToken");

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/auth"
          element={!token ? <AuthPage /> : <Navigate to="/" />}
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

