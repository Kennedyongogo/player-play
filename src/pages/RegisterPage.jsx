import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { register } from "../api";
import { useAuth } from "../context/AuthContext";
import { REGIONS } from "../constants";
import { colors } from "../theme";
import BrandLogo from "../components/BrandLogo";
import PasswordField from "../components/PasswordField";

const steps = ["Account", "Profile", "Confirm"];

export default function RegisterPage() {
  const { loginUser, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    preferredRegion: "",
    discordUsername: "",
    acceptTerms: false,
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const next = () => {
    setError("");
    if (step === 0) {
      if (!form.email || !form.username || !form.password) {
        setError("Fill in all account fields");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }
    if (step === 1 && !form.preferredRegion) {
      setError("Select your preferred region");
      return;
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setError("");
    if (!form.acceptTerms) {
      setError("Please accept the terms");
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        email: form.email,
        username: form.username,
        password: form.password,
        preferredRegion: form.preferredRegion,
        discordUsername: form.discordUsername || undefined,
      });
      loginUser({ token: res.data.token, user: res.data.user });
      await refreshUser().catch(() => null);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        py: 6,
        px: 2,
        background: `
          radial-gradient(ellipse at 80% 10%, rgba(124,58,237,0.22), transparent 50%),
          radial-gradient(ellipse at 10% 90%, rgba(0,194,255,0.1), transparent 40%)
        `,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderColor: "rgba(124,58,237,0.35)" }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <BrandLogo variant="full" height={72} link={false} sx={{ mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 3 }}>
              Create player account
            </Typography>
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {step === 0 && (
              <Stack spacing={2}>
                <TextField label="Email" type="email" required fullWidth value={form.email} onChange={set("email")} />
                <TextField label="Username" required fullWidth value={form.username} onChange={set("username")} />
                <PasswordField label="Password" required value={form.password} onChange={set("password")} autoComplete="new-password" />
                <PasswordField
                  label="Confirm password"
                  required
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  autoComplete="new-password"
                />
                <Button variant="contained" onClick={next}>
                  Continue
                </Button>
              </Stack>
            )}
            {step === 1 && (
              <Stack spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Preferred region</InputLabel>
                  <Select label="Preferred region" value={form.preferredRegion} onChange={set("preferredRegion")}>
                    {REGIONS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Discord (optional)" fullWidth value={form.discordUsername} onChange={set("discordUsername")} />
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={next} fullWidth>
                    Continue
                  </Button>
                </Stack>
              </Stack>
            )}
            {step === 2 && (
              <Stack spacing={2}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.elevated, border: `1px solid ${colors.border}` }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography fontWeight={600}>{form.email}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Username
                  </Typography>
                  <Typography fontWeight={600}>{form.username}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Region
                  </Typography>
                  <Typography fontWeight={600}>{form.preferredRegion}</Typography>
                </Box>
                <Button
                  variant={form.acceptTerms ? "contained" : "outlined"}
                  onClick={() => setForm((f) => ({ ...f, acceptTerms: !f.acceptTerms }))}
                >
                  {form.acceptTerms ? "✓ Terms accepted" : "Accept community terms"}
                </Button>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={submit} disabled={loading} fullWidth>
                    {loading ? "Creating..." : "Create account"}
                  </Button>
                </Stack>
              </Stack>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Already registered?{" "}
              <Link component={RouterLink} to="/login" sx={{ color: colors.primaryLight }}>
                Log in
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
