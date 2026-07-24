import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import BrandLogo from "../components/BrandLogo";
import PasswordField from "../components/PasswordField";
import { showError, showSuccess } from "../utils/swal";

export default function LoginPage() {
  const { loginUser, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      await showSuccess("Welcome back", `Signed in as ${res.data.user?.username || email}`);
      loginUser({ token: res.data.token, user: res.data.user });
      await refreshUser().catch(() => null);
      navigate("/dashboard");
    } catch (err) {
      await showError("Login failed", err.message || "Check your email and password");
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
              Player login
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Access your team, schedule, and lobby codes.
            </Typography>
            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField label="Email" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
              <PasswordField
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              No account?{" "}
              <Link component={RouterLink} to="/register" sx={{ color: colors.primaryLight }}>
                Register
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
