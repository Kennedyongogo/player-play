import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
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
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  createTeam,
  getTeam,
  invitePlayer,
  removeMember,
  updateTeam,
} from "../api";
import { REGIONS } from "../constants";
import { colors } from "../theme";

export default function TeamPage() {
  const { teams, refreshUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", region: "", logoUrl: "", motto: "" });
  const [invite, setInvite] = useState({ username: "", email: "" });
  const [createdInvite, setCreatedInvite] = useState(null);

  const load = async () => {
    const membership = teams[0];
    if (!membership) {
      setTeam(null);
      setRole(null);
      return;
    }
    setRole(membership.role);
    const id = membership.team?.id || membership.Team?.id;
    if (!id) return;
    try {
      const res = await getTeam(id);
      setTeam(res.data.team);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const onCreate = async () => {
    setError("");
    try {
      await createTeam(form);
      await refreshUser();
      setCreateOpen(false);
      setMsg("Team created");
    } catch (err) {
      setError(err.message);
    }
  };

  const onSave = async () => {
    if (!team) return;
    setError("");
    try {
      const res = await updateTeam(team.id, {
        name: team.name,
        tag: team.tag,
        logoUrl: team.logoUrl,
        motto: team.motto,
        region: team.region,
      });
      setTeam(res.data.team);
      setMsg("Team updated");
      await refreshUser();
    } catch (err) {
      setError(err.message);
    }
  };

  const onInvite = async () => {
    setError("");
    try {
      const res = await invitePlayer(team.id, invite);
      setCreatedInvite(res.data.invite);
      setMsg("Invite created");
      setInviteOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const onRemove = async (userId) => {
    try {
      await removeMember(team.id, userId);
      await load();
      setMsg("Member removed");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!teams.length) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          My Team
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Create a team to register for tournaments, or accept an invite from your captain.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Create team
        </Button>
        <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} form={form} setForm={setForm} onCreate={onCreate} />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" sx={{ mb: 3 }} spacing={2}>
        <Box>
          <Typography variant="h4">My Team</Typography>
          <Typography color="text.secondary">Roster, invites, and team branding</Typography>
        </Box>
        {role === "captain" && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setInviteOpen(true)}>
              Invite players
            </Button>
            <Button variant="contained" onClick={onSave}>
              Save changes
            </Button>
          </Stack>
        )}
      </Stack>

      {msg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg("")}>
          {msg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {createdInvite && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Invite code: <strong>{createdInvite.inviteCode}</strong> — share with your teammate
        </Alert>
      )}

      {team && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar
                    src={team.logoUrl || undefined}
                    sx={{ width: 64, height: 64, bgcolor: "primary.main", fontFamily: "Orbitron, sans-serif" }}
                  >
                    {(team.tag || team.name || "?").slice(0, 2)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{team.name}</Typography>
                    <Typography color="text.secondary">
                      {team.tag ? `[${team.tag}] · ` : ""}
                      {team.region}
                    </Typography>
                  </Box>
                </Stack>

                {role === "captain" ? (
                  <Stack spacing={2}>
                    <TextField
                      label="Team name"
                      value={team.name || ""}
                      onChange={(e) => setTeam({ ...team, name: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Tag"
                      value={team.tag || ""}
                      onChange={(e) => setTeam({ ...team, tag: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Logo URL"
                      value={team.logoUrl || ""}
                      onChange={(e) => setTeam({ ...team, logoUrl: e.target.value })}
                      fullWidth
                      helperText="Required before tournament registration"
                    />
                    <TextField
                      label="Motto"
                      value={team.motto || ""}
                      onChange={(e) => setTeam({ ...team, motto: e.target.value })}
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel>Region</InputLabel>
                      <Select
                        label="Region"
                        value={team.region || ""}
                        onChange={(e) => setTeam({ ...team, region: e.target.value })}
                      >
                        {REGIONS.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                ) : (
                  <Typography color="text.secondary">{team.motto || "No motto set."}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Roster
                </Typography>
                <Stack spacing={1}>
                  {(team.members || []).map((m) => (
                    <Box
                      key={m.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${colors.border}`,
                        bgcolor: colors.elevated,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {(m.user?.username || "?").slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>{m.user?.username}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.role} · {m.user?.preferredRegion || "—"}
                        </Typography>
                      </Box>
                      {role === "captain" && m.role !== "captain" && (
                        <Button size="small" color="error" onClick={() => onRemove(m.userId)}>
                          Remove
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        invite={invite}
        setInvite={setInvite}
        onInvite={onInvite}
      />
      <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} form={form} setForm={setForm} onCreate={onCreate} />
    </Box>
  );
}

function CreateDialog({ open, onClose, form, setForm, onCreate }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create team</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
          <TextField label="Tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} fullWidth />
          <FormControl fullWidth required>
            <InputLabel>Region</InputLabel>
            <Select label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              {REGIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InviteDialog({ open, onClose, invite, setInvite, onInvite }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Invite player</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            value={invite.username}
            onChange={(e) => setInvite({ ...invite, username: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            value={invite.email}
            onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            fullWidth
            helperText="Provide username or email"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onInvite}>
          Send invite
        </Button>
      </DialogActions>
    </Dialog>
  );
}
