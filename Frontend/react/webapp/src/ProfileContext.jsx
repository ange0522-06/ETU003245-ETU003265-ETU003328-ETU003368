import React, { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext();

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  // Récupérer le profil depuis le localStorage au chargement
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    return savedProfile || "visiteur";
  });

  const login = (role) => {
    setProfile(role);
    localStorage.setItem("userProfile", role);
    console.log("Profile défini:", role);
  };
  
  const logout = () => {
    setProfile("visiteur");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("token");
  };

  return (
    <ProfileContext.Provider value={{ profile, login, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}
