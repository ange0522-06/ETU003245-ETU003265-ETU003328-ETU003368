import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Manager from "./Manager";
import Map from "./Map";
import Auth from "./Auth";
import Tana from "./Tana";
import { ProfileProvider } from "./ProfileContext";
import "./assets/ui.css";

import UnblockUsers from "./UnblockUsers";
import ManagerSignalement from "./ManagerSignalement";

import { useProfile } from "./ProfileContext";
import { useEffect, useState } from "react";
import axios from "axios";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);

  // Vérifier si un manager existe au chargement
  useEffect(() => {
    // Simuler un temps de chargement
    setTimeout(() => setLoading(false), 500);
  }, []);

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

  // Empêcher l'accès aux pages manager si l'utilisateur n'est pas manager
  if (
    (location.pathname === "/manager" || 
     location.pathname === "/unblock-users" || 
     location.pathname === "/manager-signalements") &&
    profile !== "manager"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Chargement de l'application...</p>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté et essaie d'accéder à /auth, rediriger
  if (location.pathname === "/auth") {
    const isCreatingUser = location.state?.fromManager === true;
    
    // Si c'est le manager qui crée un utilisateur, on l'autorise
    if (isCreatingUser && profile === "manager") {
      // On autorise l'accès, pas de redirection
    }
    // Sinon, si l'utilisateur est déjà connecté (non visiteur) et n'est pas manager en création d'utilisateur
    else if (profile !== "visiteur" && !isCreatingUser) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="app-container">
      {!isAuthPage && <Sidebar />}
      <div className="main-content-area">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Routes protégées manager */}
          <Route path="/manager" element={
            profile === "manager" ? <Manager /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/unblock-users" element={
            profile === "manager" ? <UnblockUsers /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/manager-signalements" element={
            profile === "manager" ? <ManagerSignalement /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/create-user" element={
            profile === "manager" ? <Navigate to="/auth" replace state={{ fromManager: true }} /> : <Navigate to="/dashboard" replace />
          } />
          
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