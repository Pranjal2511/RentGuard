import { createContext, useContext, useState } from "react";
import { users } from "../data/mockData";
import { storage } from "../services/storage";

export const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "rentguard_active_user";

export function AuthProvider({ children }) {
  // Application starts unauthenticated by default
  const [user, setUser] = useState(() => storage.get(AUTH_STORAGE_KEY, null));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(storage.get(AUTH_STORAGE_KEY, null)));

  async function login(email, password, role) {
    // Look up existing mock user by email
    const storedUsers = storage.get("rentguard_users", users);
    let matched = storedUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matched) {
      // If role specified or default to tenant
      const defaultName = email.split("@")[0].replace(/[._]/g, " ");
      const capitalized = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      matched = {
        id: Date.now(),
        name: capitalized,
        email: email.trim(),
        role: role || "tenant",
        avatar: null,
      };
      storage.set("rentguard_users", [...storedUsers, matched]);
    } else if (role && matched.role !== role) {
      // If user specified a role override for demo
      matched = { ...matched, role };
    }

    setUser(matched);
    setIsAuthenticated(true);
    storage.set(AUTH_STORAGE_KEY, matched);
    return matched;
  }

  async function signup(userData) {
    const storedUsers = storage.get("rentguard_users", users);
    const newUser = {
      id: Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role || "tenant",
      avatar: null,
    };
    storage.set("rentguard_users", [...storedUsers, newUser]);
    setUser(newUser);
    setIsAuthenticated(true);
    storage.set(AUTH_STORAGE_KEY, newUser);
    return newUser;
  }

  function logout() {
    setUser(null);
    setIsAuthenticated(false);
    storage.remove(AUTH_STORAGE_KEY);
  }

  function switchRole(role) {
    if (!user) return;
    const storedUsers = storage.get("rentguard_users", users);
    const existing = storedUsers.find((u) => u.role === role);
    const targetUser = existing || {
      ...user,
      role,
    };
    setUser(targetUser);
    setIsAuthenticated(true);
    storage.set(AUTH_STORAGE_KEY, targetUser);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
