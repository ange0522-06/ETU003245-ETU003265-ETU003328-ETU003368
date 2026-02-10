import { useState, useEffect } from "react";
import { useProfile } from "./ProfileContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginApi, registerApi, checkManagerExistsApi } from "./api";
import roadLogo from "./assets/1.jpg";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [managerExists, setManagerExists] = useState(false);
  const [checkingManager, setCheckingManager] = useState(true);
  
  useEffect(() => {
    if (mode === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [mode]);

  // Fonction pour vérifier si un manager existe
  const checkManager = async () => {
    try {
      console.log("Vérification de l'existence du manager...");
      const result = await checkManagerExistsApi();
      console.log("Résultat de la vérification:", result);
      setManagerExists(result.exists);
      console.log("Manager existe:", result.exists);
    } catch (err) {
      console.error("Erreur lors de la vérification du manager:", err);
      setManagerExists(false);
    } finally {
      setCheckingManager(false);
    }
  };

  // Vérifier si un manager existe au chargement du composant
  useEffect(() => {
    checkManager();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role] = useState("manager");
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

    // Empêcher la création d'un manager si un existe déjà
    if (!isLogin && managerExists) {
      setError("Un manager existe déjà. Vous ne pouvez pas créer de nouveau compte manager.");
      return;
    }

    try {
      if (isLogin) {
        const response = await loginApi(email, password);
        if (response.token) localStorage.setItem("token", response.token);
        
        // Le rôle est dans response.user.role (structure AuthResponse)
        const userRole = response.user?.role || response.role;
        console.log("Rôle récupéré:", userRole);
        
        if (userRole && userRole.toLowerCase() === "manager") {
          login("manager");
        } else {
          login("utilisateur");
        }
        navigate("/dashboard");
      } else {
        const response = await registerApi(email, password, role);
        if (response.token) localStorage.setItem("token", response.token);
        
        // Le rôle est dans response.user.role ou response.role
        const userRole = response.user?.role || response.role;
        
        if (userRole && userRole.toLowerCase() === "manager") {
          login("manager");
        } else {
          login("utilisateur");
        }
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Erreur d'authentification:", err);
      // Re-vérifier l'existence du manager après une erreur d'inscription
      if (!isLogin) {
        await checkManager();
      }
      
      // Si le backend renvoie un message de blocage, on l'affiche
      if (err.message && err.message.toLowerCase().includes("locked")) {
        setBlocked(true);
        setError("Votre compte est bloqué après 3 tentatives. Contactez le manager pour le débloquer.");
      } else if (err.message && err.message.toLowerCase().includes("failed attempts")) {
        setFailedInfo(err.message);
        setError("Attention : " + err.message);
      } else if (isLogin && (err.message?.includes("not found") || err.message?.includes("Invalid credentials"))) {
        // Si tentative de connexion échoue, suggérer de créer un compte manager
        setError(err.message + " - Si aucun manager n'existe encore, veuillez créer un compte manager d'abord.");
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
              {isLogin ? "Bienvenue 👋" : "Créer un compte Manager 👨‍💼"}
            </h1>
            <p className="welcome-subtitle">
              {isLogin ? "Veuillez entrer vos informations." : "Créez votre compte administrateur pour gérer la plateforme."}
            </p>
          </div>

          {/* Afficher un message si un manager existe */}
          {!checkingManager && managerExists && isLogin && (
            <div className="manager-exists-message" style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '12px 16px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ✅ Connectez-vous en tant que Manager
            </div>
          )}

          {/* Empêcher la création si un manager existe déjà */}
          {!checkingManager && managerExists && !isLogin && (
            <div className="manager-exists-warning" style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '12px 16px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ⚠️ Un manager existe déjà. Vous ne pouvez pas créer de nouveau compte manager.
            </div>
          )}

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
              <label className="field-label">Mot de passe</label>
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
                <label className="field-label">Confirmer le mot de passe</label>
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

            {isLogin && (
              <div className="form-options">
                <label className="remember-checkbox">
                  <input type="checkbox" />
                  <span>Se souvenir pendant 30 jours</span>
                </label>
                <a href="#" className="forgot-link">Mot de passe oublié?</a>
              </div>
            )}
            
            <button type="submit" className="modern-submit-btn" disabled={!isLogin && managerExists}>
              {isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="footer-text">
              {isLogin ? (
                !managerExists ? (
                  <>
                    Aucun manager n'existe encore?{" "}
                    <button 
                      onClick={() => setIsLogin(!isLogin)} 
                      className="footer-link"
                      type="button"
                    >
                      Créer un compte Manager
                    </button>
                  </>
                ) : (
                  <span style={{color: '#6b7280'}}>Connectez-vous avec votre compte manager</span>
                )
              ) : (
                <>
                  Vous avez déjà un compte?{" "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="footer-link"
                    type="button"
                  >
                    Se connecter
                  </button>
                </>
              )}
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