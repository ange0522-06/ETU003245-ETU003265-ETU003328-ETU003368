import { useNavigate } from "react-router-dom";
import { useProfile } from "./ProfileContext";

export default function TopBar() {
  const navigate = useNavigate();
  const { profile, logout } = useProfile();

  const handleSignIn = () => {
    navigate("/auth?mode=login");
  };
  
  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        {profile === "visiteur" ? (
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-icon">👁️</span>
            </div>
            <span className="user-name">Bonjour Visiteur</span>
            <div className="auth-buttons">
              <button onClick={handleSignIn} className="icon-btn sign-in-icon" title="Se connecter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
              <button onClick={handleSignUp} className="icon-btn sign-up-icon" title="S'inscrire">
                <span className="signup-text">S'INSCRIRE</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-icon">
                {profile === "manager" ? "👨‍💼" : "👤"}
              </span>
            </div>
            <span className="user-name">
              Bonjour {profile === "manager" ? "Manager" : "Utilisateur"}
            </span>
            <button onClick={handleLogout} className="icon-btn logout-icon" title="Déconnexion">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
