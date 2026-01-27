import { useState } from "react";
import { useProfile } from "./ProfileContext";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "./api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("user");
  const { profile, login } = useProfile();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || (!isLogin && password !== confirm)) {
      setError("Veuillez remplir correctement le formulaire.");
      return;
    }
    
    try {
      if (isLogin) {
        const user = await loginApi(email, password);
        if (user.token) localStorage.setItem("token", user.token);
        // Correction : bien distinguer le rôle manager
        if (user.role && user.role.toLowerCase() === "manager") {
          login("manager");
        } else {
          login("utilisateur");
        }
        navigate("/dashboard");
      } else {
        const user = await registerApi(email, password, role);
        if (user.token) localStorage.setItem("token", user.token);
        if (user.role && user.role.toLowerCase() === "manager") {
          login("manager");
        } else {
          login("utilisateur");
        }
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'authentification");
    }
  };

  return (
    <div className="auth-page">
      {/* Header avec titre */}
      <div className="auth-header">
        <div className="auth-icon">🔐</div>
        <h1 className="auth-title">
          {isLogin ? "Connexion" : "Inscription"}
        </h1>
        <p className="auth-subtitle">
          Accédez à votre espace personnel de suivi des travaux
        </p>
      </div>
      
      <div className="auth-container">
        {/* Section formulaire */}
        <div className="auth-form-section">
          {error && (
            <div className="error-message">
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Adresse email
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="auth-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Mot de passe
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="auth-input"
                />
              </div>
            </div>
            
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">✅</span>
                  Confirmer le mot de passe
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="auth-input"
                  />
                </div>
              </div>
            )}
            
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Rôle
                </label>
                <div className="input-wrapper">
                  <select value={role} onChange={e => setRole(e.target.value)} className="auth-input">
                    <option value="user">Utilisateur</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
            )}
            <button type="submit" className="auth-submit-btn">
              {isLogin ? "→ Se connecter" : "🎉 S'inscrire"}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>ou</span>
          </div>
          
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="auth-toggle-btn"
          >
            {isLogin ? "📝 Créer un nouveau compte" : "🔓 Déjà inscrit ? Se connecter"}
          </button>
        </div>
        
        
      </div>
    </div>
  );
}