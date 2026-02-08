import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "./ProfileContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useProfile();

  // Menu selon le profil
  let menuItems;
  if (profile === "visiteur") {
    menuItems = [
      { path: "/dashboard", icon: "📊", label: "DASHBOARD" },
      { path: "/map", icon: "🗺️", label: "MAP" },
      { path: "/auth", icon: "🔐", label: "LOGIN" },
      { path: "/tana", icon: "🗺️", label: "TANA OFFLINE" }
    ];
    } else if (profile === "manager") {
    menuItems = [
      { path: "/dashboard", icon: "📊", label: "DASHBOARD" },
      { path: "/map", icon: "🗺️", label: "MAP" },
      { path: "/manager", icon: "👨‍💼", label: "MANAGER" },
      { path: "/manager-signalements", icon: "📝", label: "SIGNALEMENTS" },
      { path: "/auth", icon: "➕", label: "CRÉER USER", state: { fromManager: true } },
      { path: "/unblock-users", icon: "🔓", label: "DEBLOQUER" },
    ];
    } else {
    menuItems = [
      { path: "/dashboard", icon: "📊", label: "DASHBOARD" },
      { path: "/map", icon: "🗺️", label: "MAP" },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="sidebar">
      {/* Logo LALANA */}
      <div className="sidebar-logo">
        <h1>LALANA</h1>
      </div>

      {/* Menu principal - seulement les liens de navigation */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
              key={item.path}
              to={{
                pathname: item.path,
                state: item.state || {}
              }}
              className={`sidebar-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
        ))}
      </nav>

      {/* Section profil */}
      <div className="sidebar-profile">
        <div className="profile-info">
          <div className="profile-icon">
            {profile === "manager" ? "👨‍💼" : 
             profile === "utilisateur" ? "👤" : "👁️"}
          </div>
          <div className="profile-text">
            <div className="profile-name">
              {profile === "manager" ? "Manager" : 
               profile === "utilisateur" ? "Utilisateur" : "Visiteur"}
            </div>
            <div className="profile-status">
              {profile !== "visiteur" ? "Connecté" : "Non connecté"}
            </div>
          </div>
        </div>
        
        {/* Boutons d'action uniquement dans la section profil */}
        {profile !== "visiteur" ? (
          <button 
            onClick={handleLogout}
            className="logout-btn"
            style={{
              marginTop: "15px",
              width: "100%",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <span>🚪</span>
            Se déconnecter
          </button>
        ) : !isAuthPage && (
          <button 
            onClick={handleLogin}
            className="login-btn"
            style={{
              marginTop: "15px",
              width: "100%",
              background: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <span>🔐</span>
            Se connecter
          </button>
        )}
      </div>
    </div>
  );
}