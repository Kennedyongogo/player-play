import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  cancelRegistration,
  getMyRegistrations,
  getTournaments,
  registerTeamForTournament,
} from "../api";
import { formatCategory, formatDate, formatPrize } from "../constants";
import StatusBadge from "../components/StatusBadge";
import { colors } from "../theme";

export default function TournamentsPage() {
  const { teams, isCaptain } = useAuth();
  const [items, setItems] = useState([]);
  const [regs, setRegs] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState(null);
  const [teamId, setTeamId] = useState("");

  const load = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        getTournaments({ limit: 40 }),
        getMyRegistrations().catch(() => ({ data: { registrations: [] } })),
      ]);
      setItems(tRes.data?.tournaments || []);
      setRegs(rRes.data?.registrations || []);
    } catch (err) {
      setItems([]);
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const first = teams.find((m) => m.role === "captain") || teams[0];
    const id = first?.team?.id || first?.Team?.id;
    if (id) setTeamId(id);
  }, [teams]);

  const onRegister = async () => {
    setError("");
    if (!teamId) {
      setError("Select a team first");
      return;
    }
    try {
      await registerTeamForTournament(selected.id, teamId);
      setMsg("Registration submitted");
      setSelected(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const onCancel = async (id) => {
    try {
      await cancelRegistration(id);
      setMsg("Registration cancelled");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Tournaments
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse events and register your team (captains only).
      </Typography>

      {msg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg("")}>
          {msg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {items.map((t) => (
          <Grid item xs={12} md={6} lg={4} key={t.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <StatusBadge status={t.status} />
                  <Typography variant="caption" color="secondary.main">
                    {formatCategory(t.category)}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ mb: 1, fontFamily: "Orbitron, sans-serif", fontSize: "1rem" }}>
                  {t.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {Number(t.prizePool) > 0 ? formatPrize(t.prizePool, t.currency) : "Scrim"} · Starts{" "}
                  {formatDate(t.startsAt)}
                </Typography>
                {t.status === "open" && isCaptain && (
                  <Button variant="contained" size="small" onClick={() => setSelected(t)}>
                    Register team
                  </Button>
                )}
                {t.status === "open" && !isCaptain && (
                  <Typography variant="caption" color="text.secondary">
                    Only captains can register
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>
        My registrations
      </Typography>
      {regs.length === 0 ? (
        <Typography color="text.secondary">No registrations yet.</Typography>
      ) : (
        <Stack spacing={1}>
          {regs.map((r) => (
            <Box
              key={r.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.surface,
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700}>{r.Tournament?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {r.Team?.name} · {formatDate(r.createdAt)}
                </Typography>
              </Box>
              <StatusBadge status={r.status} />
              {["pending", "approved"].includes(r.status) && (
                <Button size="small" color="warning" onClick={() => onCancel(r.id)}>
                  Cancel
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        <DialogTitle>Register for {selected?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Team logo is required when the event enforces branding.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Team</InputLabel>
            <Select label="Team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((m) => {
                const t = m.team || m.Team;
                return (
                  <MenuItem key={t.id} value={t.id} disabled={m.role !== "captain"}>
                    {t.name} {m.role !== "captain" ? "(not captain)" : ""}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" onClick={onRegister}>
            Confirm registration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
