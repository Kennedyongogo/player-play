import { useEffect, useRef, useState } from "react";
import {
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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { useAuth } from "../context/AuthContext";
import {
  createTeam,
  getTeam,
  invitePlayer,
  removeMember,
  revokeInvite,
  transferCaptain,
  updateTeam,
  uploadFile,
} from "../api";
import { REGIONS } from "../constants";
import { colors } from "../theme";
import { showConfirm, showError, showInfo, showSuccess } from "../utils/swal";

export default function TeamPage() {
  const { teams, refreshUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [role, setRole] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", region: "", logoUrl: "", motto: "" });
  const [invite, setInvite] = useState({ username: "", email: "" });
  const logoInputRef = useRef(null);

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
      showError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const onCreate = async () => {
    try {
      await createTeam(form);
      await refreshUser();
      setCreateOpen(false);
      showSuccess("Team created");
    } catch (err) {
      showError(err.message);
    }
  };

  const onSave = async () => {
    if (!team) return;
    try {
      const res = await updateTeam(team.id, {
        name: team.name,
        tag: team.tag,
        logoUrl: team.logoUrl,
        motto: team.motto,
        region: team.region,
      });
      setTeam(res.data.team);
      showSuccess("Team updated");
      await refreshUser();
    } catch (err) {
      showError(err.message);
    }
  };

  const onInvite = async () => {
    try {
      const res = await invitePlayer(team.id, invite);
      const code = res.data.invite?.inviteCode;
      showInfo("Invite created", code ? `Invite code: ${code} — share with your teammate` : undefined);
      setInviteOpen(false);
      setInvite({ username: "", email: "" });
      await load();
    } catch (err) {
      showError(err.message);
    }
  };

  const onRemove = async (userId) => {
    const confirmed = await showConfirm(
      "Remove member?",
      "They will be removed from your team roster."
    );
    if (!confirmed) return;
    try {
      await removeMember(team.id, userId);
      await load();
      showSuccess("Member removed");
    } catch (err) {
      showError(err.message);
    }
  };

  const onLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !team) return;
    setLogoUploading(true);
    try {
      const uploadRes = await uploadFile("logo", file);
      const res = await updateTeam(team.id, { logoUrl: uploadRes.data.url });
      setTeam(res.data.team);
      await refreshUser();
      showSuccess("Team logo updated");
    } catch (err) {
      showError(err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const onRevokeInvite = async (inviteId) => {
    const confirmed = await showConfirm("Revoke invite?", "The invite link will stop working.");
    if (!confirmed) return;
    try {
      await revokeInvite(inviteId);
      await load();
      showSuccess("Invite revoked");
    } catch (err) {
      showError(err.message);
    }
  };

  const onTransferCaptain = async () => {
    if (!transferTo) {
      showError("Select a member to transfer captaincy to");
      return;
    }
    const target = (team.members || []).find((m) => m.userId === transferTo);
    const confirmed = await showConfirm(
      "Transfer captaincy?",
      `${target?.user?.username || "This member"} will become the new captain. You will lose captain privileges.`
    );
    if (!confirmed) return;
    try {
      await transferCaptain(team.id, transferTo);
      setTransferOpen(false);
      setTransferTo("");
      await refreshUser();
      await load();
      showSuccess("Captaincy transferred");
    } catch (err) {
      showError(err.message);
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
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          Create team
        </Button>
        <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} form={form} setForm={setForm} onCreate={onCreate} />
      </Box>
    );
  }

  const pendingInvites = (team?.invites || []).filter((i) => i.status === "pending");
  const otherMembers = (team?.members || []).filter((m) => m.role !== "captain");

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" sx={{ mb: 3 }} spacing={2}>
        <Box>
          <Typography variant="h4">My Team</Typography>
          <Typography color="text.secondary">Roster, invites, and team branding</Typography>
        </Box>
        {role === "captain" && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => setInviteOpen(true)}>
              Invite players
            </Button>
            {otherMembers.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<SwapHorizOutlinedIcon />}
                onClick={() => setTransferOpen(true)}
              >
                Transfer captain
              </Button>
            )}
            <Button variant="contained" onClick={onSave}>
              Save changes
            </Button>
          </Stack>
        )}
      </Stack>

      {team && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                    <Avatar
                      src={team.logoUrl || undefined}
                      sx={{ width: 64, height: 64, bgcolor: "primary.main", fontFamily: "Orbitron, sans-serif" }}
                    >
                      {(team.tag || team.name || "?").slice(0, 2)}
                    </Avatar>
                    {role === "captain" && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          ref={logoInputRef}
                          onChange={onLogoFileChange}
                        />
                        <IconButton
                          size="small"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                          title="Upload team logo"
                          sx={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            width: 26,
                            height: 26,
                            bgcolor: colors.primary,
                            color: "#fff",
                            border: `2px solid ${colors.surface}`,
                            "&:hover": { bgcolor: colors.primary },
                          }}
                        >
                          <PhotoCameraOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h5">{team.name}</Typography>
                    <Typography color="text.secondary">
                      {team.tag ? `[${team.tag}] · ` : ""}
                      {team.region}
                    </Typography>
                    {logoUploading && (
                      <Typography variant="caption" color="text.secondary">
                        Uploading logo...
                      </Typography>
                    )}
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
                      helperText="Upload a logo above, or paste a URL — required before tournament registration"
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

            {role === "captain" && pendingInvites.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Pending invites
                  </Typography>
                  <Stack spacing={1}>
                    {pendingInvites.map((inv) => (
                      <Box
                        key={inv.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${colors.border}`,
                          bgcolor: colors.elevated,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 160 }}>
                          <Typography fontWeight={600} noWrap>
                            {inv.inviteeEmail || "Invite code"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Code: {inv.inviteCode}
                            {inv.expiresAt ? ` · Expires ${new Date(inv.expiresAt).toLocaleDateString()}` : ""}
                          </Typography>
                        </Box>
                        <Button size="small" color="error" onClick={() => onRevokeInvite(inv.id)}>
                          Revoke
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
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
      <TransferCaptainDialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        members={otherMembers}
        value={transferTo}
        setValue={setTransferTo}
        onTransfer={onTransferCaptain}
      />
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

function TransferCaptainDialog({ open, onClose, members, value, setValue, onTransfer }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Transfer captaincy</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          Choose a teammate to become the new captain. You will become a regular member.
        </Typography>
        <FormControl fullWidth required>
          <InputLabel>New captain</InputLabel>
          <Select label="New captain" value={value} onChange={(e) => setValue(e.target.value)}>
            {members.map((m) => (
              <MenuItem key={m.userId} value={m.userId}>
                {m.user?.username || m.userId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={onTransfer}>
          Transfer
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
