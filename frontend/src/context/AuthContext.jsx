import { useState, useEffect } from "react";
import axios from "axios";
import { users } from "../data/mockData";
import { storage } from "../services/storage";

import { AuthContext } from './AuthContextValue';

const AUTH_STORAGE_KEY = "rentguard_active_user";
const TOKEN_STORAGE_KEY = "rentguard_token";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

// Apply the Authorization header immediately (not in an effect) so requests fired by
// child components right after login / page reload already carry the token.
function applyAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

applyAuthHeader(storage.get(TOKEN_STORAGE_KEY, null));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get(AUTH_STORAGE_KEY, null));
  const [token, setToken] = useState(() => storage.get(TOKEN_STORAGE_KEY, null));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(storage.get(AUTH_STORAGE_KEY, null)));
  const [loading, setLoading] = useState(false);

  // Set default axios header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  async function login(email, password, role) {
    setLoading(true);
    try {
      // Attempt backend API login first
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: email.trim(),
        password: password || "Password123!",
        role,
      });

      if (res.data?.success && res.data.data?.user) {
        const loggedUser = res.data.data.user;
        const authToken = res.data.data.token;

        applyAuthHeader(authToken);
        setUser(loggedUser);
        setToken(authToken);
        setIsAuthenticated(true);
        storage.set(AUTH_STORAGE_KEY, loggedUser);
        storage.set(TOKEN_STORAGE_KEY, authToken);
        return loggedUser;
      }
    } catch (err) {
      console.warn("Backend login failed or offline, falling back to local session store:", err.message);
    } finally {
      setLoading(false);
    }

    // Fallback: in-memory mock store for test runners or offline demo
    const storedUsers = storage.get("rentguard_users", users);
    let matched = storedUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matched) {
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
      matched = { ...matched, role };
    }

    const mockToken = `mock-token-${matched.id}`;
    applyAuthHeader(mockToken);
    setUser(matched);
    setToken(mockToken);
    setIsAuthenticated(true);
    storage.set(AUTH_STORAGE_KEY, matched);
    storage.set(TOKEN_STORAGE_KEY, mockToken);
    return matched;
  }

  async function signup(userData) {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password || "Password123!",
        role: userData.role || "tenant",
      });

      if (res.data?.success && res.data.data?.user) {
        const newUser = res.data.data.user;
        const authToken = res.data.data.token;

        applyAuthHeader(authToken);
        setUser(newUser);
        setToken(authToken);
        setIsAuthenticated(true);
        storage.set(AUTH_STORAGE_KEY, newUser);
        storage.set(TOKEN_STORAGE_KEY, authToken);
        return newUser;
      }
    } catch (err) {
      console.warn("Backend registration failed or offline, fallback to local:", err.message);
    } finally {
      setLoading(false);
    }

    // Fallback
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

  async function logout() {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    storage.remove(AUTH_STORAGE_KEY);
    storage.remove(TOKEN_STORAGE_KEY);
    applyAuthHeader(null);
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
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

