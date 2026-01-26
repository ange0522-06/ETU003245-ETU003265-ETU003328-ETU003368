import { useState } from "react";
import { useProfile } from "./ProfileContext";
import { loginApi, registerApi } from "./api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { profile, login, logout } = useProfile();

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
        login(user.role || "utilisateur");
        // Stocke le token si besoin : localStorage.setItem("token", user.token);
        alert("✅ Connecté !");
      } else {
        const user = await registerApi(email, password);
        login(user.role || "utilisateur");
        // Stocke le token si besoin : localStorage.setItem("token", user.token);
        alert("🎉 Inscription réussie !");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'authentification");
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">
          {isLogin ? "🔐 Connexion" : "📝 Inscription"}
        </h1>
        <p className="page-subtitle">
          {isLogin 
            ? "Accédez à votre espace personnel de suivi des travaux" 
            : "Rejoignez notre plateforme de gestion des travaux routiers"}
        </p>
      </div>
      
      <div className="content-container" style={{maxWidth: 500, margin: '0 auto'}}>
        {error && (
          <div style={{color: '#ff6b6b', marginBottom: 16, textAlign: 'center'}}>{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>📧</span> Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <span>🔒</span> Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <span>✅</span> Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}
          
          <button type="submit" style={{width: '100%', marginTop: '20px', justifyContent: 'center'}}>
            <span>{isLogin ? "→" : "📝"}</span>
            {isLogin ? "Se connecter" : "S'inscrire"}
          </button>
        </form>
        
        <div style={{textAlign: 'center', marginTop: '30px'}}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.1)'}}
          >
            <span>🔄</span>
            {isLogin ? "Créer un compte" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
        
        <div className="card" style={{marginTop: '40px'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            👤 Profil actuel
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{
                fontSize: '1.5rem',
                background: profile === 'manager' ? 'linear-gradient(135deg, #4a54e1, #8a2be2)' : 
                           profile === 'utilisateur' ? 'linear-gradient(135deg, #00b894, #00cec9)' : 
                           'linear-gradient(135deg, #636e72, #b2bec3)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {profile === 'manager' ? '👨‍💼' : profile === 'utilisateur' ? '👤' : '👁️'}
              </span>
              <div>
                <strong style={{display: 'block'}}>{profile}</strong>
                <small style={{color: '#a0a0e0'}}>
                  {profile === 'manager' ? 'Accès complet' : 
                   profile === 'utilisateur' ? 'Accès limité' : 'Visiteur'}
                </small>
              </div>
            </div>
            
            {profile !== "visiteur" && (
              <button onClick={logout} style={{background: 'rgba(255,107,107,0.2)', color: '#ff6b6b'}}>
                <span>🚪</span>
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}