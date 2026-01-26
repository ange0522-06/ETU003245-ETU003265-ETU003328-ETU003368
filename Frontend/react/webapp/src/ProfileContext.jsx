import React, { createContext, useContext, useState } from "react";

const ProfileContext = createContext();

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState("visiteur"); // visiteur, utilisateur, manager

  const login = (role) => setProfile(role);
  const logout = () => setProfile("visiteur");

  return (
    <ProfileContext.Provider value={{ profile, login, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}
