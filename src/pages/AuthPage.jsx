import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Phone,
  Lock,
  Person,
  EmojiEvents,
  Bolt,
  Groups,
  Share,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { login, register, getMe } from "../api";
import { useAuth } from "../context/AuthContext";
import { peekPendingInvite } from "../utils/invite";
import PrismaVideoBackground from "../components/PrismaVideoBackground";

const swalTheme = {
  confirmButtonColor: "#F5C518",
  background: "#0E0E16",
  color: "#FAFAFA",
};

const FEATURES = [
  { icon: Bolt, text: "60-second blitz", sub: "5 questions, one shot" },
  { icon: EmojiEvents, text: "Real cash prizes", sub: "Win up to 80% of the pool" },
  { icon: Groups, text: "WhatsApp challenges", sub: "Invite friends instantly" },
];

const POOL_TIERS = [
  { fee: "10", pool: "80", players: "10" },
  { fee: "20", pool: "160", players: "10" },
  { fee: "50", pool: "400", players: "10" },
];

const TICKER_ITEMS = [
  "🔥 KSh 160 won in Nairobi",
  "⚡ 10-player match filled in 12s",
  "🏆 @Mwangi scored 5/5",
  "💰 KSh 400 prize pool live",
  "📲 New challenge from WhatsApp",
];

function normalizePhone(input) {
  const stripped = String(input || "").trim().replace(/[\s-]+/g, "");
  if (!stripped) return "";
  if (stripped.startsWith("+")) return stripped;
  if (stripped.startsWith("0")) return `+254${stripped.slice(1)}`;
  if (stripped.startsWith("254")) return `+${stripped}`;
  if (/^\d{9}$/.test(stripped)) return `+254${stripped}`;
  return stripped;
}

function AuthBackground() {
  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <PrismaVideoBackground />
    </Box>
  );
}

function LiveTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        py: 1,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "rgba(0,0,0,0.25)",
        mb: { xs: 2, md: 0 },
      }}
    >
      <Box sx={{ display: "flex", width: "max-content", animation: "ticker 28s linear infinite" }}>
        {items.map((item, i) => (
          <Typography
            key={i}
            component="span"
            sx={{
              px: 3,
              fontSize: { xs: "0.72rem", sm: "0.8rem" },
              fontWeight: 600,
              color: "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

function PoolCards() {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 1.5 }}
      sx={{ mt: { xs: 2.5, md: 3.5 }, justifyContent: { xs: "center", lg: "flex-start" } }}
    >
      {POOL_TIERS.map((tier) => (
        <Box
          key={tier.fee}
          sx={{
            flex: { xs: 1, sm: "none" },
            minWidth: { sm: 88 },
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: "14px",
            textAlign: "center",
            background: "linear-gradient(145deg, rgba(245,197,24,0.1) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(245,197,24,0.2)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(245,197,24,0.15)",
            },
          }}
        >
          <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", fontWeight: 600, mb: 0.25 }}>
            ENTRY
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: "0.95rem", sm: "1.1rem" }, color: "#F5C518" }}>
            KSh {tier.fee}
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#10F0A0", fontWeight: 600, mt: 0.5 }}>
            Win ~{tier.pool}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isShortScreen = useMediaQuery("(max-height: 820px)");

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const navigateAfterAuth = async () => {
    const pending = peekPendingInvite();
    if (pending) {
      navigate(`/join/${pending}`, { replace: true });
      return;
    }
    try {
      const meRes = await getMe();
      const matchId = meRes.data?.activeMatch?.matchId;
      navigate(matchId ? `/play/${matchId}` : "/play", { replace: true });
    } catch {
      navigate("/play", { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const normalized = normalizePhone(phone);
    if (!normalized || !password) {
      setError("Enter your phone number and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ phone: normalized, password });
      loginUser({ token: res.data.token, user: res.data.user });

      await Swal.fire({
        icon: "success",
        title: "Welcome back!",
        text: `Good luck, ${res.data.user.nickname}!`,
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        ...swalTheme,
      });

      await navigateAfterAuth();
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const normalized = normalizePhone(phone);
    if (!normalized || !nickname.trim() || !password) {
      setError("Phone, nickname, and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ phone: normalized, nickname: nickname.trim(), password });
      loginUser({ token: res.data.token, user: res.data.user });
      await navigateAfterAuth();
    } catch (err) {
      setError(err.message || "Registration failed. Try a different phone number.");
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = {
    fullWidth: true,
    margin: "dense",
    size: "small",
    sx: {
      "& .MuiFormHelperText-root": { mx: 0, mt: 0.5, minHeight: "1.25em" },
    },
  };

  const renderFields = (isRegister) => (
    <>
      <Box
        sx={{
          maxHeight: isRegister ? 64 : 0,
          overflow: "hidden",
          opacity: isRegister ? 1 : 0,
          transition: "max-height 0.25s ease, opacity 0.2s ease",
          pointerEvents: isRegister ? "auto" : "none",
        }}
      >
        <TextField
          {...fieldProps}
          label="Nickname"
          placeholder="e.g. QuizKing"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          autoComplete="nickname"
          tabIndex={isRegister ? 0 : -1}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person sx={{ color: "text.secondary", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TextField
        {...fieldProps}
        label="Phone number"
        placeholder="+254712345678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
        helperText={isRegister ? "Kenya: +2547XX XXX XXX" : " "}
        FormHelperTextProps={{ sx: { visibility: isRegister ? "visible" : "hidden" } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone sx={{ color: "text.secondary", fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...fieldProps}
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={isRegister ? "new-password" : "current-password"}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: "text.secondary", fontSize: 18 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                aria-label="toggle password"
                size="small"
                sx={{ color: "text.secondary" }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          maxHeight: isRegister ? 72 : 0,
          overflow: "hidden",
          opacity: isRegister ? 1 : 0,
          transition: "max-height 0.25s ease, opacity 0.2s ease",
          pointerEvents: isRegister ? "auto" : "none",
        }}
      >
        <TextField
          {...fieldProps}
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          tabIndex={isRegister ? 0 : -1}
          error={isRegister && confirmPassword.length > 0 && password !== confirmPassword}
          helperText={
            isRegister && confirmPassword.length > 0 && password !== confirmPassword
              ? "Passwords don't match"
              : " "
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: "text.secondary", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );

  return (
    <Box sx={pageSx}>
      <AuthBackground />

      {isMobile && <Box sx={{ position: "relative", zIndex: 2, width: "100%", flexShrink: 0 }}><LiveTicker /></Box>}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: { xs: 480, sm: 520, md: 1100, lg: 1200, xl: 1280 },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 3, lg: 4 },
          py: { xs: 2, sm: 2.5, md: 2, lg: 2.5 },
          flex: 1,
          minHeight: 0,
          maxHeight: { md: "calc(100dvh - 44px)" },
          overflow: { xs: "auto", md: "hidden" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1.05fr 0.95fr" },
          gap: { xs: 3, sm: 3, md: 4, lg: 6 },
          alignItems: "center",
        }}
      >
        {/* Brand panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent={{ xs: "center", md: "flex-start" }}
              sx={{ mb: 2 }}
            >
              <Box sx={logoSx}>CQ</Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  bgcolor: "rgba(16,240,160,0.12)",
                  border: "1px solid rgba(16,240,160,0.3)",
                }}
              >
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#10F0A0" }}>
                  LIVE MATCHES
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: {
                  xs: "2rem",
                  sm: "2.5rem",
                  md: isShortScreen ? "2.1rem" : "2.5rem",
                  lg: isShortScreen ? "2.35rem" : "2.85rem",
                },
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                mb: { xs: 1.5, md: isShortScreen ? 1 : 1.5 },
              }}
            >
              Play fast.
              <br />
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #F5C518 0%, #FFE566 40%, #10F0A0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Win cash.
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
                lineHeight: 1.65,
                maxWidth: 440,
                mx: { xs: "auto", md: 0 },
              }}
            >
              Join 5-question quiz battles, beat real players in 60 seconds, and pocket M-Pesa prizes.
            </Typography>

            <Box sx={{ display: isShortScreen && isDesktop ? "none" : "block" }}>
              <PoolCards />
            </Box>

            <Stack
              spacing={1.5}
              sx={{
                mt: { xs: 3, md: isShortScreen ? 2 : 3 },
                display: { xs: "none", sm: isShortScreen && isDesktop ? "none" : "flex" },
              }}
            >
              {FEATURES.map(({ icon: Icon, text, sub }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 40, md: 44 },
                        height: { xs: 40, md: 44 },
                        borderRadius: "13px",
                        background: "linear-gradient(135deg, rgba(16,240,160,0.15) 0%, rgba(124,58,237,0.1) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#10F0A0",
                      }}
                    >
                      <Icon sx={{ fontSize: { xs: 20, md: 22 } }} />
                    </Box>
                    <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{text}</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{sub}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Stack>

            {/* Mobile feature pills */}
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              justifyContent="center"
              sx={{ mt: 2, display: { xs: "flex", sm: "none" } }}
            >
              {FEATURES.map(({ icon: Icon, text }) => (
                <Box
                  key={text}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: "20px",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  <Icon sx={{ fontSize: 14, color: "#10F0A0" }} />
                  {text}
                </Box>
              ))}
            </Stack>
          </Box>
        </motion.div>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%" }}
        >
          <Box
            sx={{
              ...cardSx,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                padding: "1px",
                background: "linear-gradient(135deg, rgba(245,197,24,0.4), rgba(255,255,255,0.05), rgba(16,240,160,0.3))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                pointerEvents: "none",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.25rem", sm: "1.4rem" },
                mb: 0.5,
                textAlign: "center",
              }}
            >
              {mode === "login" ? "Welcome back" : "Join the arena"}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: "0.8rem", textAlign: "center", mb: { xs: 2, md: 1.5 } }}
            >
              {mode === "login"
                ? "Sign in to compete and win"
                : "Create your player account in seconds"}
            </Typography>

            <Box sx={tabRowSx}>
              {["login", "register"].map((tab) => (
                <Button
                  key={tab}
                  onClick={() => switchMode(tab)}
                  disableRipple
                  sx={{
                    flex: 1,
                    py: { xs: 1, md: 0.9 },
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: { xs: "0.85rem", sm: "0.875rem" },
                    color: mode === tab ? "#050508" : "text.secondary",
                    bgcolor: mode === tab ? "#F5C518" : "transparent",
                    boxShadow: mode === tab ? "0 4px 16px rgba(245,197,24,0.3)" : "none",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      bgcolor: mode === tab ? "#FFE566" : "rgba(255,255,255,0.05)",
                    },
                  }}
                >
                  {tab === "login" ? "Sign in" : "Register"}
                </Button>
              ))}
            </Box>

            <Box
              component="form"
              onSubmit={mode === "login" ? handleLogin : handleRegister}
              sx={{ mt: { xs: 1.5, md: 1.25 }, display: "flex", flexDirection: "column" }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 1.5, py: 0.25 }}>
                  {error}
                </Alert>
              )}

              {/* Fixed-height slot: register layout always reserves space on desktop */}
              <Box
                sx={{
                  position: "relative",
                  flex: "0 0 auto",
                  minHeight: { xs: "auto", md: 272 },
                  height: { md: 272 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: mode === "login" && isDesktop ? "center" : "flex-start",
                }}
              >
                {renderFields(mode === "register")}
              </Box>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="auth-shimmer-btn"
                sx={{
                  mt: { xs: 1.5, md: 1.25 },
                  py: { xs: 1.25, md: 1.2 },
                  flexShrink: 0,
                  color: "#050508 !important",
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  fontWeight: 800,
                  borderRadius: "14px",
                  "&:disabled": {
                    background: "rgba(245,197,24,0.35) !important",
                    animation: "none",
                    color: "rgba(0,0,0,0.45) !important",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#050508" }} />
                ) : mode === "login" ? (
                  "Sign in & play →"
                ) : (
                  "Create account →"
                )}
              </Button>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.75}
              sx={{ mt: { xs: 2, md: 1.5 }, flexShrink: 0 }}
            >
              <Share sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, textAlign: "center" }}>
                Share challenge links on WhatsApp after you join
              </Typography>
            </Stack>
          </Box>
        </motion.div>
      </Box>

      {!isMobile && (
        <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 2 }}>
          <LiveTicker />
        </Box>
      )}
    </Box>
  );
}

const pageSx = {
  height: "100dvh",
  maxHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: { xs: "flex-start", md: "center" },
  position: "relative",
  overflow: "hidden",
  bgcolor: "#050508",
};

const cardSx = {
  bgcolor: "rgba(12,12,20,0.94)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: { xs: "20px", sm: "24px" },
  p: { xs: 2.5, sm: 3, md: 2.5, lg: 3 },
  boxShadow: "0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
  maxHeight: { md: "calc(100dvh - 56px)" },
  overflow: { md: "hidden" },
  display: "flex",
  flexDirection: "column",
};

const logoSx = {
  width: { xs: 48, sm: 52, md: 56 },
  height: { xs: 48, sm: 52, md: 56 },
  borderRadius: "16px",
  background: "linear-gradient(135deg, #F5C518 0%, #FF9F1C 50%, #F5C518 100%)",
  backgroundSize: "200% 200%",
  animation: "gradient-shift 4s ease infinite",
  color: "#050508",
  fontWeight: 900,
  fontSize: { xs: "1.1rem", md: "1.25rem" },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 32px rgba(245,197,24,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset",
  flexShrink: 0,
};

const tabRowSx = {
  display: "flex",
  gap: 0.5,
  p: 0.5,
  bgcolor: "rgba(0,0,0,0.35)",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.06)",
};
