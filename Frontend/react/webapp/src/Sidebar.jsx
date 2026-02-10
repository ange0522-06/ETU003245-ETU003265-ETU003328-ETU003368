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
      { path: "/tana", icon: "🗺️", label: "TANA OFFLINE" }
    ];
  } else if (profile === "manager") {
    menuItems = [
      { path: "/", icon: "🏠", label: "HOME" },
      { path: "/map", icon: "🗺️", label: "MAP" },
      { path: "/manager", icon: "�", label: "SIGNALEMENT" },
      { path: "/create-user", icon: "➕", label: "CRÉER UTILISATEUR" },
      { path: "/unblock-users", icon: "🔓", label: "DEBLOQUER" },
      { path: "/stats", icon: "📊", label: "STATISTIQUES" },
    ];
  } else {
    menuItems = [
      { path: "/", icon: "🏠", label: "HOME" },
      { path: "/map", icon: "🗺️", label: "MAP" },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
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
      </div>
    </div>
  );
}