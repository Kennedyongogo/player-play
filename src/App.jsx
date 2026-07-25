import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { theme, colors } from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PlayerLayout from "./components/PlayerLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import DashboardPage from "./pages/DashboardPage";
import TeamPage from "./pages/TeamPage";
import TournamentsPage from "./pages/TournamentsPage";
import SchedulePage from "./pages/SchedulePage";
import StatsPage from "./pages/StatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import AcceptInvitePage from "./pages/AcceptInvitePage";

function BootScreen() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", bgcolor: colors.bg }}>
      <CircularProgress sx={{ color: colors.primary }} />
    </Box>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <BootScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { booting } = useAuth();
  if (booting) return <BootScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/invite/:code"
        element={
          <RequireAuth>
            <AcceptInvitePage />
          </RequireAuth>
        }
      />
      <Route
        path="/invite"
        element={
          <RequireAuth>
            <AcceptInvitePage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <PlayerLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
