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
  } else {
    menuItems = [
      { path: "/", icon: "🏠", label: "HOME" },
      { path: "/map", icon: "🗺️", label: "MAP" },
      { path: "/dashboard", icon: "📊", label: "DASHBOARD" },
      { path: "/manager", icon: "👨‍💼", label: "MANAGER" },
      { path: "/auth", icon: "🔐", label: "LOGIN" },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="sidebar">
      {/* Logo LALANA */}
      <div className="sidebar-logo">
        <h1>LALANA</h1>
      </div>

      {/* Menu principal */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path || 
              (item.path === "/" && location.pathname === "/dashboard") ? "active" : ""
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
        
        {profile !== "visiteur" && (
          <button 
            onClick={handleLogout}
            className="logout-btn"
            style={{
              marginTop: "15px",
              width: "100%",
              background: "#e74c3c",
              padding: "8px 16px",
              fontSize: "12px"
            }}
          >
            <span>🚪</span>
            Déconnexion
          </button>
        )}
      </div>
    </div>
  );
}