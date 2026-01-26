import { Link, useLocation } from "react-router-dom";
import { useProfile } from "./ProfileContext";

export default function Navbar() {
  const location = useLocation();
  const { profile } = useProfile();
  
  const getProfileIcon = () => {
    switch(profile) {
      case 'manager': return '👨‍💼';
      case 'utilisateur': return '👤';
      default: return '👁️';
    }
  };
  
  const getProfileColor = () => {
    switch(profile) {
      case 'manager': return '#8a2be2';
      case 'utilisateur': return '#00b894';
      default: return '#b2bec3';
    }
  };

  return (
    <nav className="navbar">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        flex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginRight: '30px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #4a54e1, #8a2be2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🛣️
          </div>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffffff, #b3b3ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            RoadWorks
          </span>
        </div>
        
        <Link to="/" className={location.pathname === "/" || location.pathname === "/dashboard" ? "active" : ""}>
          <span>📊</span>
          Tableau de bord
        </Link>
        <Link to="/manager" className={location.pathname === "/manager" ? "active" : ""}>
          <span>👨‍💼</span>
          Espace Manager
        </Link>
        <Link to="/map" className={location.pathname === "/map" ? "active" : ""}>
          <span>🗺️</span>
          Carte
        </Link>
      </div>
      
      <div className="navbar-auth">
        {!profile || profile === "visiteur" ? (
          <Link to="/auth" title="Connexion" className="auth-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </Link>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.05)',
            padding: '8px 16px',
            borderRadius: '25px',
            border: `1px solid ${getProfileColor()}20`
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${getProfileColor()}, ${getProfileColor()}80)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {getProfileIcon()}
            </div>
            <div>
              <div style={{fontSize: '0.9rem', color: '#fff'}}>
                {profile === 'manager' ? 'Manager' : 'Utilisateur'}
              </div>
              <div style={{fontSize: '0.8rem', color: '#a0a0e0'}}>
                Connecté
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}