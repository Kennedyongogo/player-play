import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { getMe, login, saveSession, startDiscordAuth } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import BrandLogo from "../components/BrandLogo";
import PasswordField from "../components/PasswordField";
import { showError, showSuccess } from "../utils/swal";

const DISCORD_ERROR_MESSAGES = {
  discord_denied: "Discord sign-in was cancelled.",
  discord_not_configured: "Discord sign-in is not configured yet.",
  discord_failed: "Discord sign-in failed. Please try again.",
};

// Only compress on short viewports (e.g. landscape phones), never on normal screens.
const short = "@media (max-height: 640px)";
const veryShort = "@media (max-height: 480px)";

export default function LoginPage() {
  const { loginUser, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);

  useEffect(() => {
    const discordToken = searchParams.get("discord_token");
    const errorParam = searchParams.get("error");

    if (discordToken) {
      (async () => {
        try {
          saveSession({ token: discordToken, user: null });
          const res = await getMe();
          loginUser({ token: discordToken, user: res.data.user });
          await refreshUser().catch(() => null);
          navigate("/dashboard", { replace: true });
        } catch (err) {
          await showError("Discord sign-in failed", err.message);
          setSearchParams({}, { replace: true });
        }
      })();
    } else if (errorParam) {
      showError("Sign-in error", DISCORD_ERROR_MESSAGES[errorParam] || "Something went wrong signing in.");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onDiscord = async () => {
    setDiscordLoading(true);
    try {
      const res = await startDiscordAuth();
      window.location.href = res.data.url;
    } catch (err) {
      await showError("Discord sign-in unavailable", err.message);
      setDiscordLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 2, sm: 3 },
        px: 2,
        overflow: "hidden",
        boxSizing: "border-box",
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.25), transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(0,194,255,0.12), transparent 45%)
        `,
        [short]: { py: 1.5, alignItems: "flex-start", overflowY: "auto" },
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 0, sm: 3 } }}>
        <Card sx={{ borderColor: "rgba(124,58,237,0.35)" }}>
          <CardContent
            sx={{
              p: { xs: 3, md: 4 },
              "&:last-child": { pb: { xs: 3, md: 4 } },
              [short]: { p: 2.5, "&:last-child": { pb: 2.5 } },
            }}
          >
            <BrandLogo
              variant="full"
              height={72}
              link={false}
              sx={{ mb: 2, [short]: { height: 48, mb: 1.5 }, [veryShort]: { height: 40, mb: 1 } }}
            />
            <Typography variant="h4" sx={{ mb: 1, [short]: { fontSize: "1.5rem", mb: 0.5 } }}>
              Player login
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 3, [short]: { mb: 2, fontSize: "0.9rem" }, [veryShort]: { display: "none" } }}
            >
              Access your team, schedule, and lobby codes.
            </Typography>
            <Stack component="form" spacing={2} onSubmit={onSubmit} sx={{ [short]: { gap: 0.5 } }}>
              <TextField label="Email" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
              <PasswordField
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Box sx={{ textAlign: "right", mt: -1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ color: colors.primaryLight }}
                >
                  Forgot password?
                </Link>
              </Box>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>

            <Divider sx={{ my: 2.5, borderColor: colors.border, [short]: { my: 1.5 } }}>or</Divider>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={discordLoading}
              onClick={onDiscord}
              sx={{
                borderColor: "#5865F2",
                color: "#fff",
                bgcolor: "rgba(88,101,242,0.15)",
                "&:hover": { borderColor: "#5865F2", bgcolor: "rgba(88,101,242,0.25)" },
              }}
            >
              {discordLoading ? "Redirecting..." : "Continue with Discord"}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3, [short]: { mt: 1.5 } }}
            >
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
