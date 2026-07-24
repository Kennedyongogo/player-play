import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/AppLayout";
import WalletPage from "./pages/WalletPage";
import SettingsPage from "./pages/SettingsPage";
import PlayPage from "./pages/PlayPage";
import MatchPage from "./pages/MatchPage";
import JoinInviteGate from "./pages/JoinInviteGate";
import InstallPrompt from "./components/InstallPrompt";
import { peekPendingInvite } from "./utils/invite";

function BootScreen() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#050508" }}>
      <CircularProgress sx={{ color: "#F5C518" }} />
    </Box>
  );
}

function LoginRoute() {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (isAuthenticated) {
    const pending = peekPendingInvite();
    if (pending) return <Navigate to={`/join/${pending}`} replace />;
    return <Navigate to="/play" replace />;
  }
  return <AuthPage />;
}

function CatchAllRoute() {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (isAuthenticated) return <Navigate to="/play" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<LoginRoute />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/join/:inviteCode" element={<JoinInviteGate />} />
            <Route element={<AppLayout />}>
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/play" element={<PlayPage />} />
              <Route path="/play/:matchId" element={<MatchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<CatchAllRoute />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
