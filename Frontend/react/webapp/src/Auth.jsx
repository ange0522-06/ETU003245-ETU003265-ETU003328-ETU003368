import { useState } from "react";
import { useProfile } from "./ProfileContext";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "./api";
import roadLogo from "./assets/1.jpg";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("user");
  const { login } = useProfile();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  
  const [blocked, setBlocked] = useState(false);
  const [failedInfo, setFailedInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBlocked(false);
    setFailedInfo(null);

    if (!email || !password || (!isLogin && password !== confirm)) {
      setError("Veuillez remplir correctement le formulaire.");
      return;
    }

    try {
      if (isLogin) {
        const user = await loginApi(email, password);
        if (user.token) localStorage.setItem("token", user.token);
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
      // Si le backend renvoie un message de blocage, on l'affiche
      if (err.message && err.message.toLowerCase().includes("locked")) {
        setBlocked(true);
        setError("Votre compte est bloqué après 3 tentatives. Contactez le manager pour le débloquer.");
      } else if (err.message && err.message.toLowerCase().includes("failed attempts")) {
        setFailedInfo(err.message);
        setError("Attention : " + err.message);
      } else {
        setError(err.message || "Erreur lors de l'authentification");
      }
    }
  };

  return (
    <div className="auth-page-new">
      <div className="auth-wrapper">
        {/* Section gauche - Formulaire */}
        <div className="auth-form-container">
          <div className="auth-welcome">
            <h1 className="welcome-title">
              {isLogin ? "Welcome back 👋" : "Créer un compte 🎉"}
            </h1>
            <p className="welcome-subtitle">
              {isLogin ? "Please enter your details." : "Remplissez les informations ci-dessous."}
            </p>
          </div>

          {blocked ? (
            <div className="auth-blocked-message" style={{color:'#ff6b6b', marginTop:8, fontWeight:600}}>
              <span>⛔</span> Vous êtes bloqué après 3 tentatives échouées.<br/>
              Contactez un manager pour être débloqué.<br/>
              <span style={{fontSize:'0.95em', color:'#a0a0a0'}}>Colonne <b>failed_attempts</b> &gt; 0 dans la base tant que non débloqué.</span>
            </div>
          ) : error && (
            <div className="auth-error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-modern-form">
            <div className="form-field">
              <label className="field-label">Email</label>
              <div className="input-container">
                <span className="input-prefix-icon"></span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="modern-input"
                />
              </div>
            </div>
            
            <div className="form-field">
              <label className="field-label">Password</label>
              <div className="input-container">
                <span className="input-prefix-icon"></span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="modern-input"
                />
              </div>
            </div>
            
            {!isLogin && (
              <div className="form-field">
                <label className="field-label">Confirm Password</label>
                <div className="input-container">
                  <span className="input-prefix-icon"></span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="modern-input"
                  />
                </div>
              </div>
            )}
            
            {!isLogin && (
              <div className="form-field">
                <label className="field-label">Rôle</label>
                <div className="input-container">
                  <span className="input-prefix-icon">👤</span>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                    className="modern-input"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="form-options">
                <label className="remember-checkbox">
                  <input type="checkbox" />
                  <span>Remember for 30 days</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
            )}
            
            <button type="submit" className="modern-submit-btn">
              {isLogin ? "Log in" : "Sign up"}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="footer-text">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="footer-link"
                type="button"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
        
        {/* Section droite - Image du logo routier */}
        <div className="auth-image-container">
          <div className="road-logo-wrapper" style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
            <h2 className="overlay-title" style={{marginBottom: '18px', marginTop: 0, textAlign: 'center'}}>LALANA</h2>
            <img 
              src={roadLogo} 
              alt="Road Logo" 
              className="road-logo-image"
              style={{display: 'block', margin: '0 auto'}}
            />
            <p className="overlay-subtitle" style={{marginTop: '18px', textAlign: 'center'}}>Plateforme de suivi des travaux routiers</p>
          </div>
        </div>
      </div>
    </div>
  );
}