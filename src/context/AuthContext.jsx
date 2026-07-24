import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, getMe, getStoredUser, saveSession, updateStoredUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [teams, setTeams] = useState([]);
  const [booting, setBooting] = useState(!!localStorage.getItem("apac_south_token"));

  useEffect(() => {
    const token = localStorage.getItem("apac_south_token");
    if (!token) {
      setBooting(false);
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data.user);
        setTeams(res.data.teams || []);
        updateStoredUser(res.data.user);
      })
      .catch(() => {
        clearSession();
        setUser(null);
        setTeams([]);
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
    setTeams([]);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getMe();
    setUser(res.data.user);
    setTeams(res.data.teams || []);
    updateStoredUser(res.data.user);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      teams,
      booting,
      loginUser,
      logoutUser,
      refreshUser,
      isAuthenticated: !!user,
      isCaptain: teams.some((t) => t.role === "captain"),
    }),
    [user, teams, booting, loginUser, logoutUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
