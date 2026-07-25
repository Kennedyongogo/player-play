import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import BrandLogo from "../components/BrandLogo";
import PasswordField from "../components/PasswordField";
import { showError } from "../utils/swal";

export default function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showError("Missing reset token", "Use the link from your reset email or the forgot password page.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setDone(true);
    } catch (err) {
      await showError("Reset failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        py: 6,
        px: 2,
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.25), transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(0,194,255,0.12), transparent 45%)
        `,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderColor: "rgba(124,58,237,0.35)" }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <BrandLogo variant="full" height={72} link={false} sx={{ mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1 }}>
              Reset password
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Choose a new password for your account.
            </Typography>

            {!token && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No reset token found in the link.{" "}
                <Link component={RouterLink} to="/forgot-password" sx={{ color: colors.primaryLight }}>
                  Request a new one
                </Link>
                .
              </Alert>
            )}

            {done ? (
              <Stack spacing={2}>
                <Alert severity="success">Password reset successful. You can now sign in.</Alert>
                <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
                  Go to login
                </Button>
              </Stack>
            ) : (
              <Stack component="form" spacing={2} onSubmit={onSubmit}>
                <PasswordField
                  label="New password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <Button type="submit" variant="contained" size="large" disabled={loading || !token}>
                  {loading ? "Resetting..." : "Reset password"}
                </Button>
              </Stack>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              <Link component={RouterLink} to="/login" sx={{ color: colors.primaryLight }}>
                Back to login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
