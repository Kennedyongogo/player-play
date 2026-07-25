import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { forgotPassword } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import BrandLogo from "../components/BrandLogo";
import { showError } from "../utils/swal";

export default function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setResult(res.data || null);
      setSubmitted(true);
    } catch (err) {
      await showError("Request failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
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
              Forgot password
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Enter your account email and we'll help you reset your password.
            </Typography>

            {!submitted ? (
              <Stack component="form" spacing={2} onSubmit={onSubmit}>
                <TextField
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Alert severity="success">
                  If that email exists, a reset link has been generated.
                </Alert>

                {result?.resetToken && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      bgcolor: colors.elevated,
                    }}
                  >
                    <Typography variant="caption" color="warning.main" sx={{ display: "block", mb: 1 }}>
                      Email delivery is not configured yet — use this link to complete your reset.
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        value={result.resetUrl || result.resetToken}
                        size="small"
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                      <IconButton onClick={() => copy(result.resetUrl || result.resetToken)} size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Button
                      component={RouterLink}
                      to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Continue to reset password
                    </Button>
                  </Box>
                )}

                <Button variant="outlined" onClick={() => setSubmitted(false)} fullWidth>
                  Try a different email
                </Button>
              </Stack>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Remembered your password?{" "}
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
