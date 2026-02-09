import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";
import Manager from "./Manager";
import Stats from "./Stats";
import Map from "./Map";
import Auth from "./Auth";
import Tana from "./Tana";
import { ProfileProvider } from "./ProfileContext";
import "./assets/ui.css";

import UnblockUsers from "./UnblockUsers";
import CreateUser from "./CreateUser";

import { useProfile } from "./ProfileContext";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const { profile } = useProfile();

  // Redirection visiteur : dashboard ou map autorisés, sinon redirige dashboard
  if (
    profile === "visiteur" &&
    location.pathname !== "/dashboard" &&
    location.pathname !== "/map" &&
    location.pathname !== "/auth" &&
    location.pathname !== "/tana"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      {!isAuthPage && <Sidebar />}
      <div className="main-content-area">
        {!isAuthPage && <TopBar />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/unblock-users" element={<UnblockUsers />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/map" element={<Map />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/tana" element={<Tana />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ProfileProvider>
  );
}

export default App;