import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getMe,
  getStoredUser,
  saveSession,
  updateStoredUser,
} from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [booting, setBooting] = useState(!!getStoredUser());

  useEffect(() => {
    if (!getStoredUser()) {
      setBooting(false);
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data.user);
        updateStoredUser(res.data.user);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, []);

  const loginUser = useCallback(({ token, user: nextUser }) => {
    saveSession({ token, user: nextUser });
    setUser(nextUser);
  }, []);

  const logoutUser = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getMe();
    setUser(res.data.user);
    updateStoredUser(res.data.user);
    return res.data.user;
  }, []);

  const value = useMemo(
    () => ({ user, booting, loginUser, logoutUser, refreshUser, isAuthenticated: !!user }),
    [user, booting, loginUser, logoutUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
