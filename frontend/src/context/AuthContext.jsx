import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi";
import { clearAuthStorage, storeTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setInitializing(false);
      return;
    }

    authApi
      .getMyProfile()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      })
      .catch(() => {
        clearAuthStorage();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  async function handleLogin(email, password) {
    const data = await authApi.login(email, password);
    storeTokens(data.token, data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function handleRegister(name, email, password) {
    const data = await authApi.register(name, email, password);
    storeTokens(data.token, data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {

    }
    clearAuthStorage();
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    initializing,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
