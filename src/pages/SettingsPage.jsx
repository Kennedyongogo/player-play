import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Phone, Email } from "@mui/icons-material";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import PageShell from "../components/PageShell";
import { getMe, updateMyProfile, changeMyPassword, updateStoredUser } from "../api";
import { useAuth } from "../context/AuthContext";

const swalTheme = {
  confirmButtonColor: "#F5C518",
  background: "#0E0E16",
  color: "#FAFAFA",
};

const LOGOUT_DELAY_MS = 3000;

function normalizePhone(input) {
  const stripped = String(input || "").trim().replace(/[\s-]+/g, "");
  if (!stripped) return "";
  if (stripped.startsWith("+")) return stripped;
  if (stripped.startsWith("0")) return `+254${stripped.slice(1)}`;
  if (stripped.startsWith("254")) return `+${stripped}`;
  if (/^\d{9}$/.test(stripped)) return `+254${stripped}`;
  return stripped;
}

function PasswordField({ label, value, onChange, show, onToggle, autoComplete }) {
  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      fullWidth
      size="small"
      autoComplete={autoComplete}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onToggle}
              edge="end"
              aria-label={show ? "Hide password" : "Show password"}
              sx={{ color: "text.secondary" }}
            >
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

const cardSx = {
  borderRadius: 3,
  bgcolor: "rgba(12,12,20,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
  height: "100%",
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const applyUser = (u) => {
    setNickname(u.nickname || "");
    setPhone(u.phone || "");
    setEmail(u.email || "");
  };

  useEffect(() => {
    if (user) applyUser(user);
    setLoading(true);
    getMe()
      .then((res) => {
        if (res.data?.user) {
          applyUser(res.data.user);
          updateStoredUser(res.data.user);
        }
      })
      .catch(() => {
        if (user) applyUser(user);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    const normalizedPhone = normalizePhone(phone);
    if (!nickname.trim() || !normalizedPhone) {
      setProfileError("Nickname and phone are required.");
      return;
    }
    setProfileSaving(true);
    try {
      await updateMyProfile({
        nickname: nickname.trim(),
        phone: normalizedPhone,
        email: email.trim() || null,
      });
      await refreshUser();
      await Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your account details have been saved.",
        ...swalTheme,
      });
    } catch (err) {
      const message = err.message || "Failed to update profile";
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      const seconds = LOGOUT_DELAY_MS / 1000;
      await Swal.fire({
        icon: "success",
        title: "Password changed",
        text: `You will be logged out in ${seconds} seconds.`,
        timer: LOGOUT_DELAY_MS,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        ...swalTheme,
      });
      logoutUser();
      navigate("/", { replace: true });
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = (nickname || "P").slice(0, 2).toUpperCase();

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, mb: 0.5 }}>
          Profile & Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Update your player profile and password
        </Typography>

        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(245,197,24,0.1) 0%, rgba(16,240,160,0.06) 100%)",
            border: "1px solid rgba(245,197,24,0.2)",
          }}
        >
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "center", sm: "flex-start" }} spacing={2}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  bgcolor: "#F5C518",
                  color: "#050508",
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h6" fontWeight={800}>
                  {user?.nickname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.phone}
                </Typography>
                <Chip
                  label="Player"
                  size="small"
                  sx={{ mt: 1, bgcolor: "rgba(16,240,160,0.12)", color: "#10F0A0", fontWeight: 700 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#F5C518" }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr" },
              gap: { xs: 2, sm: 2.5 },
              alignItems: "stretch",
            }}
          >
            <Card sx={cardSx}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Person sx={{ color: "#F5C518", fontSize: 22 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Profile
                  </Typography>
                </Stack>
                <Box component="form" onSubmit={handleProfileSave}>
                  <Stack spacing={2}>
                    {profileError && <Alert severity="error">{profileError}</Alert>}
                    <TextField
                      label="Nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: "text.secondary", fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Phone"
                      placeholder="+254712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: "text.secondary", fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Email (optional)"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={profileSaving}
                      sx={{ bgcolor: "#F5C518", color: "#050508", fontWeight: 800, "&:hover": { bgcolor: "#FFE566" } }}
                    >
                      {profileSaving ? "Saving…" : "Save profile"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Change password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  After a successful change you will be logged out and must sign in again.
                </Typography>
                <Box component="form" onSubmit={handlePasswordSave}>
                  <Stack spacing={2}>
                    {passwordError && <Alert severity="error">{passwordError}</Alert>}
                    <PasswordField
                      label="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      show={showCurrent}
                      onToggle={() => setShowCurrent((v) => !v)}
                      autoComplete="current-password"
                    />
                    <PasswordField
                      label="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      show={showNew}
                      onToggle={() => setShowNew((v) => !v)}
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      show={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                      autoComplete="new-password"
                    />
                    <Button
                      type="submit"
                      variant="outlined"
                      disabled={passwordSaving}
                      sx={{
                        borderColor: "rgba(245,197,24,0.4)",
                        color: "#F5C518",
                        fontWeight: 700,
                        "&:hover": { borderColor: "#F5C518", bgcolor: "rgba(245,197,24,0.08)" },
                      }}
                    >
                      {passwordSaving ? "Updating…" : "Update password"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </motion.div>
    </PageShell>
  );
}
