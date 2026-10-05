import { createContext, useContext, useState } from "react";
import { currentUser, landlordUser } from "../data/mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to tenant; switch to landlordUser to test landlord views
  const [user, setUser] = useState(currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // pre-authenticated for prototype

  function login(email, password, role) {
    // Mock login — replace with real API call when backend is ready
    const mockUser = role === "landlord" ? landlordUser : currentUser;
    setUser(mockUser);
    setIsAuthenticated(true);
  }

  function logout() {
    setUser(null);
    setIsAuthenticated(false);
  }

  function switchRole(role) {
    setUser(role === "landlord" ? landlordUser : currentUser);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
