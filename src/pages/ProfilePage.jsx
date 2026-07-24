import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, updateMyProfile } from "../api";
import { REGIONS } from "../constants";
import { colors } from "../theme";
import PasswordField from "../components/PasswordField";

export default function ProfilePage() {
  const { user, refreshUser, logoutUser } = useAuth();
  const [form, setForm] = useState({
    username: "",
    preferredRegion: "",
    discordUsername: "",
    bio: "",
    avatarUrl: "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username || "",
      preferredRegion: user.preferredRegion || "",
      discordUsername: user.discordUsername || "",
      bio: user.bio || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  const saveProfile = async () => {
    setMsg("");
    setError("");
    try {
      await updateMyProfile(form);
      await refreshUser();
      setMsg("Profile updated");
    } catch (err) {
      setError(err.message);
    }
  };

  const savePassword = async () => {
    setMsg("");
    setError("");
    try {
      await changeMyPassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setMsg("Password updated");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Profile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        {user?.email}
      </Typography>

      {msg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        spacing={2}
        sx={{
          mx: { xs: -2, md: -3 },
          mb: 2,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 3,
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            width: "100%",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account details
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                label="Region"
                value={form.preferredRegion || ""}
                onChange={(e) => setForm({ ...form, preferredRegion: e.target.value })}
              >
                {REGIONS.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Discord"
              value={form.discordUsername}
              onChange={(e) => setForm({ ...form, discordUsername: e.target.value })}
              fullWidth
            />
            <TextField
              label="Avatar URL"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="Bio"
              multiline
              minRows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              fullWidth
            />
            <Button variant="contained" onClick={saveProfile} fullWidth>
              Save profile
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 3,
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.surface,
            width: "100%",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Change password
          </Typography>
          <Stack spacing={2}>
            <PasswordField
              label="Current password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              autoComplete="new-password"
            />
            <Button variant="outlined" onClick={savePassword} fullWidth>
              Update password
            </Button>
          </Stack>
        </Box>
      </Stack>

      <Button color="error" variant="outlined" onClick={logoutUser} fullWidth>
        Log out
      </Button>
    </Box>
  );
}
