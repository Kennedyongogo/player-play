import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import BrandLogo from "../components/BrandLogo";

export default function VerifyEmailPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState(token ? "loading" : "missing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let alive = true;
    verifyEmail({ token })
      .then((res) => {
        if (!alive) return;
        setStatus("success");
        setMessage(res.message || "Email verified successfully");
        refreshUser().catch(() => null);
      })
      .catch((err) => {
        if (!alive) return;
        setStatus("error");
        setMessage(err.message || "Invalid or expired verification token");
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (isAuthenticated && status === "success") return <Navigate to="/dashboard" replace />;

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
            <Typography variant="h4" sx={{ mb: 2 }}>
              Verify email
            </Typography>

            {status === "missing" && (
              <Alert severity="warning">No verification token found in the link.</Alert>
            )}
            {status === "loading" && (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={22} sx={{ color: colors.primary }} />
                <Typography color="text.secondary">Verifying your email...</Typography>
              </Stack>
            )}
            {status === "success" && <Alert severity="success">{message}</Alert>}
            {status === "error" && <Alert severity="error">{message}</Alert>}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              <Link component={RouterLink} to={isAuthenticated ? "/dashboard" : "/login"} sx={{ color: colors.primaryLight }}>
                {isAuthenticated ? "Go to dashboard" : "Back to login"}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
