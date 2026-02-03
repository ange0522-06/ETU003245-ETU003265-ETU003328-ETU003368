import { useState, useEffect } from "react";
import { useProfile } from "./ProfileContext";
import { useNavigate, useLocation } from "react-router-dom";
import { loginApi, registerApi } from "./api";
import axios from "axios";
import roadLogo from "./assets/1.jpg";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, login } = useProfile();
  
  const [isLogin, setIsLogin] = useState(true);
  const [hasManager, setHasManager] = useState(null); // null = pas encore vérifié
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("user");
  
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [failedInfo, setFailedInfo] = useState(null);

  // Vérifier si on vient de la page manager (pour créer un utilisateur)
  const isCreatingUser = location.state?.fromManager === true;
  
  // Vérification : si on essaie de créer un utilisateur mais qu'on n'est pas manager
  useEffect(() => {
    if (isCreatingUser && profile !== "manager") {
      alert("❌ Accès refusé : Seuls les managers peuvent créer des utilisateurs");
      navigate("/dashboard");
    }
  }, [isCreatingUser, profile, navigate]);

  // Initialisation du mode (login/signup) en fonction du contexte
  useEffect(() => {
    if (isCreatingUser) {
      // Mode création d'utilisateur par le manager
      setIsLogin(false);
      setHasManager(true); // On assume qu'un manager existe déjà
      setRole("user"); // Par défaut, créer un utilisateur standard
    } else {
      // Mode authentification normal
      // Vérifier s'il y a déjà un manager dans le système
      axios.get("/api/auth/has-manager")
        .then(res => {
          const managerExists = res.data.hasManager;
          setHasManager(managerExists);
          
          // Si aucun manager n'existe, on force l'inscription avec rôle manager
          if (!managerExists) {
            setIsLogin(false); // Mode inscription obligatoire
            setRole("manager"); // Rôle forcé à manager
          } else {
            // Si manager existe, on reste en mode login par défaut
            setIsLogin(true);
          }
        })
        .catch(() => {
          setHasManager(true); // En cas d'erreur, on assume qu'un manager existe
        });
    }
  }, [isCreatingUser]);

  // Afficher un loader pendant la vérification
  if (hasManager === null && !isCreatingUser) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Vérification du système...</p>
      </div>
    );
  }

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
        // Connexion normale
        const user = await loginApi(email, password);
        if (user.token) {
          // Toujours écraser l'ancien token, ne jamais concaténer
          localStorage.removeItem("token");
          localStorage.setItem("token", user.token);
        }
        if (user.role && user.role.toLowerCase() === "manager") {
          login("manager");
        } else {
          login("utilisateur");
        }
        navigate("/dashboard");
      } else {
        // Inscription
        const userRole = isCreatingUser ? role : (!hasManager ? "manager" : role);
        const user = await registerApi(email, password, userRole);
        
        if (isCreatingUser) {
          // Si c'est le manager qui crée un utilisateur
          alert(`✅ Utilisateur ${email} créé avec succès en tant que ${userRole === "manager" ? "Manager" : "Utilisateur"}`);
          // Réinitialiser le formulaire
          setEmail("");
          setPassword("");
          setConfirm("");
          setRole("user");
          // Ne pas rediriger, rester sur la page pour créer d'autres utilisateurs
        } else {
          // Si c'est une inscription normale, on connecte l'utilisateur
          if (user.token) {
            localStorage.removeItem("token");
            localStorage.setItem("token", user.token);
          }
          if (user.role && user.role.toLowerCase() === "manager") {
            login("manager");
          } else {
            login("utilisateur");
          }
          navigate("/dashboard");
        }
      }
    } catch (err) {
      // Gestion des erreurs spécifiques
      const errMsg = err.message || "Erreur lors de l'authentification";
      if (errMsg.toLowerCase().includes("locked") || errMsg.toLowerCase().includes("bloqué")) {
        setBlocked(true);
        setError("Votre compte est bloqué après 3 tentatives. Contactez le manager pour le débloquer.");
      } else if (errMsg.toLowerCase().includes("failed attempts") || errMsg.toLowerCase().includes("tentatives")) {
        setFailedInfo(errMsg);
        setError("Attention : " + errMsg);
      } else {
        setError(errMsg);
      }
    }
  };

  // Déterminer qui peut créer un compte
  const canSignUp = profile === "manager" || !hasManager; // Manager ou si aucun manager n'existe
  const isFirstManagerSignup = !hasManager && !isLogin && !isCreatingUser; // Premier manager en création
  const isNormalSignup = hasManager && !isLogin && !isCreatingUser; // Inscription normale (manager existe)

  // Si le manager veut créer un utilisateur, on cache le bouton de bascule
  const showToggleButton = canSignUp && !isCreatingUser;

  // Déterminer le titre et sous-titre en fonction du contexte
  let title = "";
  let subtitle = "";

  if (isCreatingUser) {
    title = "➕ Créer un utilisateur";
    subtitle = "En tant que manager, créez un nouvel utilisateur pour la plateforme.";
  } else if (isLogin) {
    title = "Welcome back 👋";
    subtitle = "Please enter your details.";
  } else if (isFirstManagerSignup) {
    title = "Créer un compte 🎉 (Premier Manager)";
    subtitle = "Créez le premier compte manager pour administrer la plateforme.";
  } else {
    title = "Créer un compte 🎉";
    subtitle = "Remplissez les informations ci-dessous.";
  }

  // Si c'est pour créer un utilisateur mais qu'on n'a pas encore vérifié hasManager
  if (isCreatingUser && hasManager === null) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Préparation du formulaire...</p>
      </div>
    );
  }

  return (
    <div className="auth-page-new">
      <div className="auth-wrapper">
        {/* Section gauche - Formulaire */}
        <div className="auth-form-container">
          <div className="auth-welcome">
            <h1 className="welcome-title">
              {title}
            </h1>
            <p className="welcome-subtitle">
              {subtitle}
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
                  autoFocus={!isCreatingUser}
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
              <>
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
                {/* Afficher le sélecteur de rôle seulement pour l'inscription normale ou création par manager */}
                {(isNormalSignup || isCreatingUser) && (
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
                    {isCreatingUser && (
                      <small style={{color: '#7f8c8d', fontSize: '0.85rem', marginTop: '5px', display: 'block'}}>
                        Sélectionnez le rôle pour le nouvel utilisateur.
                      </small>
                    )}
                  </div>
                )}
              </>
            )}
            {isLogin && !isCreatingUser && (
              <div className="form-options">
                <label className="remember-checkbox">
                  <input type="checkbox" />
                  <span>Remember for 30 days</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
            )}
            <button type="submit" className="modern-submit-btn">
              {isCreatingUser ? "Créer l'utilisateur" : 
               isLogin ? "Log in" : "Sign up"}
            </button>
          </form>
          
          {!isCreatingUser && (
            <div className="auth-footer">
              <p className="footer-text">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                {/* Afficher le bouton seulement si c'est autorisé */}
                {showToggleButton && (
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="footer-link"
                    type="button"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                )}
              </p>
              
              {!canSignUp && !isLogin && !isFirstManagerSignup && (
                <div style={{color:'#ff6b6b', marginTop:8, fontWeight:600}}>
                  Seul un manager peut créer un compte utilisateur.
                </div>
              )}
              
              {isFirstManagerSignup && (
                <div className="first-manager-info" style={{color:'#ff9900', marginTop:8, fontWeight:600}}>
                  ⚠️ Vous créez le premier compte manager du système.
                </div>
              )}
            </div>
          )}
          
          {isCreatingUser && (
            <div style={{marginTop: '20px', textAlign: 'center'}}>
              <button 
                onClick={() => navigate("/manager")}
                className="footer-link"
                type="button"
                style={{
                  background: 'transparent',
                  color: '#3498db',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #3498db'
                }}
              >
                ← Retour à l'espace Manager
              </button>
            </div>
          )}
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